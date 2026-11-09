import type { TypingSession } from './types';
import { LEVELS, levelIndex } from './levelLadder';
import { cleanCertificateName, durationWords, usesScriptFont } from './certificateRules';
import { cinzel, garamond, script } from './certificateFonts';

export const CERT_W = 1600;
export const CERT_H = 1131;

interface Palette {
  bg: string;
  ink: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  dim: string;
  sealText: string;
}

// A certificate is paper whatever the site theme is: ivory with navy ink and gold.
const PALETTE: Palette = {
  bg: '#fbf6e8',
  ink: '#1c2a4a',
  gold: '#b08a2e',
  goldLight: '#e6c872',
  goldDark: '#7d5f17',
  dim: '#5b5a52',
  sealText: '#3d2e08',
};

const FALLBACK = {
  display: "'Times New Roman', serif",
  body: 'Georgia, serif',
  script: "'Snell Roundhand', cursive",
};

function fonts() {
  return {
    display: `${cinzel.style.fontFamily}, ${FALLBACK.display}`,
    body: `${garamond.style.fontFamily}, ${FALLBACK.body}`,
    script: `${script.style.fontFamily}, ${FALLBACK.script}`,
  };
}

const spaced = (t: string) => t.split('').join(' ');

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number, font: (size: number) => string) {
  let size = start;
  do {
    ctx.font = font(size);
    size -= 2;
  } while (ctx.measureText(text).width > maxW && size > 40);
}

/** Letters laid along a circle. `top`: clockwise on the upper arc; otherwise left to right along the lower arc. */
function arcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  r: number,
  top: boolean,
  font: string,
  color: string,
  track: number,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width + track);
  const total = widths.reduce((a, b) => a + b, 0) / r;
  let th = top ? -Math.PI / 2 - total / 2 : Math.PI / 2 + total / 2;
  chars.forEach((ch, i) => {
    const half = widths[i] / 2 / r;
    th += top ? half : -half;
    ctx.save();
    ctx.translate(cx + r * Math.cos(th), cy + r * Math.sin(th));
    ctx.rotate(top ? th + Math.PI / 2 : th - Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    th += top ? half : -half;
  });
}

function drawBorder(ctx: CanvasRenderingContext2D, p: Palette) {
  const W = CERT_W;
  const H = CERT_H;
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = p.bg;
  ctx.fillRect(26, 26, W - 52, H - 52);

  // Scalloped gold pattern between the band and the frame.
  ctx.strokeStyle = p.gold;
  ctx.lineWidth = 2;
  for (let x = 82; x < W - 70; x += 20) {
    ctx.beginPath();
    ctx.arc(x, 46, 9, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, H - 46, 9, Math.PI, 2 * Math.PI);
    ctx.stroke();
  }
  for (let y = 82; y < H - 70; y += 20) {
    ctx.beginPath();
    ctx.arc(46, y, 9, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W - 46, y, 9, Math.PI / 2, 1.5 * Math.PI);
    ctx.stroke();
  }

  // Frame with concave corners.
  const frame = (inset: number, cr: number, lw: number, color: string) => {
    const a = inset;
    const b = W - inset;
    const c = inset;
    const d = H - inset;
    ctx.beginPath();
    ctx.moveTo(a + cr, c);
    ctx.lineTo(b - cr, c);
    ctx.arc(b, c, cr, Math.PI, Math.PI / 2, true);
    ctx.lineTo(b, d - cr);
    ctx.arc(b, d, cr, -Math.PI / 2, Math.PI, true);
    ctx.lineTo(a + cr, d);
    ctx.arc(a, d, cr, 0, -Math.PI / 2, true);
    ctx.lineTo(a, c + cr);
    ctx.arc(a, c, cr, Math.PI / 2, 0, true);
    ctx.closePath();
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
  frame(78, 42, 4, p.gold);
  frame(92, 34, 1.5, p.ink);

  ctx.fillStyle = p.gold;
  for (const [x, y] of [[78, 78], [W - 78, 78], [78, H - 78], [W - 78, H - 78]]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 11);
    ctx.lineTo(x + 11, y);
    ctx.lineTo(x, y + 11);
    ctx.lineTo(x - 11, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSeal(ctx: CanvasRenderingContext2D, p: Palette, cx: number, cy: number, R: number, wpm: number, level: string) {
  const f = fonts();
  // Ribbon tails.
  ctx.fillStyle = p.ink;
  for (const [s, lean] of [[-1, -0.35], [1, 0.35]]) {
    const y0 = cy + R * 0.55;
    const x0 = cx + s * 8;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + s * 62, y0 + 22);
    ctx.lineTo(x0 + s * 62 + lean * 30, y0 + 84);
    ctx.lineTo(x0 + s * 36 + lean * 30, y0 + 68);
    ctx.lineTo(x0 + lean * 30, y0 + 84);
    ctx.closePath();
    ctx.fill();
  }

  // Serrated disc.
  const teeth = 44;
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  g.addColorStop(0, p.goldLight);
  g.addColorStop(0.65, p.gold);
  g.addColorStop(1, p.goldDark);
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? R * 0.94 : R;
    if (i) ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = p.goldDark;
  ctx.stroke();
  for (const r of [R * 0.82, R * 0.55]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  arcText(ctx, spaced('FREETYPER'), cx, cy, R * 0.62, true, `700 15px ${f.display}`, p.sealText, 2);
  arcText(ctx, spaced(level.toUpperCase()), cx, cy, R * 0.62 + 15, false, `700 15px ${f.display}`, p.sealText, 2);
  ctx.fillStyle = p.sealText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${wpm >= 100 ? 40 : 46}px ${f.display}`;
  ctx.fillText(String(wpm), cx, cy + 12);
  ctx.font = `700 14px ${f.display}`;
  ctx.fillText('WPM', cx, cy + 32);
}

/** One centred line made of normal and bold runs. */
function richLine(ctx: CanvasRenderingContext2D, parts: Array<[string, boolean]>, y: number, size: number, p: Palette) {
  const body = fonts().body;
  const font = (strong: boolean) => `${strong ? 700 : 500} ${size}px ${body}`;
  const widths = parts.map(([t, strong]) => {
    ctx.font = font(strong);
    return ctx.measureText(t).width;
  });
  let x = CERT_W / 2 - widths.reduce((a, b) => a + b, 0) / 2;
  parts.forEach(([t, strong], i) => {
    ctx.font = font(strong);
    ctx.fillStyle = strong ? p.ink : p.dim;
    ctx.textAlign = 'left';
    ctx.fillText(t, x, y);
    x += widths[i];
  });
}

async function loadFonts() {
  const f = fonts();
  try {
    await Promise.all([
      document.fonts.load(`700 40px ${f.display}`),
      document.fonts.load(`500 40px ${f.display}`),
      document.fonts.load(`400 40px ${f.script}`),
      document.fonts.load(`500 40px ${f.body}`),
      document.fonts.load(`700 40px ${f.body}`),
      document.fonts.load(`italic 500 40px ${f.body}`),
    ]);
  } catch {
    /* draw with the fallback fonts */
  }
}

/**
 * Draw the certificate for one finished speed test. The name is drawn on the picture only; nothing is saved
 * or sent. The wording claims only what is true: the test ran in the browser and is not verified.
 */
export async function renderCertificate(run: TypingSession, rawName: string): Promise<Blob> {
  await loadFonts();
  const f = fonts();
  const p = PALETTE;
  const W = CERT_W;
  const H = CERT_H;
  const name = cleanCertificateName(rawName);
  const level = LEVELS[levelIndex(run.wpm)].name;
  const date = new Date(run.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  drawBorder(ctx, p);
  const glow = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 900);
  glow.addColorStop(0, 'rgba(255,255,255,0)');
  glow.addColorStop(1, 'rgba(150,110,30,0.10)');
  ctx.fillStyle = glow;
  ctx.fillRect(100, 100, W - 200, H - 200);

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center') => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };

  text(spaced('CERTIFICATE'), W / 2, 252, `700 112px ${f.display}`, p.ink);
  const sub = spaced('OF TYPING SPEED');
  ctx.font = `500 34px ${f.display}`;
  const subW = ctx.measureText(sub).width;
  text(sub, W / 2, 322, `500 34px ${f.display}`, p.gold);
  ctx.strokeStyle = p.gold;
  ctx.lineWidth = 2;
  for (const s of [-1, 1]) {
    const x0 = W / 2 + s * (subW / 2 + 28);
    const x1 = W / 2 + s * (subW / 2 + 28 + 200);
    ctx.beginPath();
    ctx.moveTo(x0, 310);
    ctx.lineTo(x1, 310);
    ctx.stroke();
    ctx.fillStyle = p.gold;
    ctx.beginPath();
    ctx.moveTo(x1 + s * 4, 310);
    ctx.lineTo(x1 + s * 14, 304);
    ctx.lineTo(x1 + s * 24, 310);
    ctx.lineTo(x1 + s * 14, 316);
    ctx.closePath();
    ctx.fill();
  }

  text('This certificate is proudly presented to', W / 2, 408, `italic 500 36px ${f.body}`, p.dim);
  fitFont(ctx, name, 1040, usesScriptFont(name) ? 150 : 96, (s) => `400 ${s}px ${f.script}`);
  ctx.fillStyle = p.ink;
  ctx.textAlign = 'center';
  ctx.fillText(name, W / 2, 542);
  const rule = ctx.createLinearGradient(W / 2 - 400, 0, W / 2 + 400, 0);
  rule.addColorStop(0, 'rgba(176,138,46,0)');
  rule.addColorStop(0.5, p.gold);
  rule.addColorStop(1, 'rgba(176,138,46,0)');
  ctx.fillStyle = rule;
  ctx.fillRect(W / 2 - 400, 568, 800, 3);

  richLine(ctx, [['for typing at a net speed of ', false], [String(run.wpm), true], [' words per minute', false]], 640, 40, p);
  richLine(ctx, [['with ', false], [`${run.accuracy}%`, true], [' accuracy in a ', false], [durationWords(run.duration), true], [' test,', false]], 692, 40, p);
  richLine(ctx, [['reaching the ', false], [level, true], [' level on the FreeTyper speed scale.', false]], 744, 40, p);

  drawSeal(ctx, p, W / 2, 866, 94, run.wpm, level);

  const lines: Array<[number, string, string, string]> = [
    [W / 2 - 430, date, 'DATE', `500 36px ${f.body}`],
    [W / 2 + 430, 'FreeTyper', 'ISSUED BY', `400 52px ${f.script}`],
  ];
  for (const [x, value, label, font] of lines) {
    text(value, x, 898, font, p.ink);
    ctx.fillStyle = p.gold;
    ctx.fillRect(x - 165, 912, 330, 2);
    text(spaced(label), x, 942, `500 16px ${f.display}`, p.dim);
  }

  text(
    "Timed in the browser on freetyper.com and not independently verified. Levels are FreeTyper's own labels.",
    W / 2,
    1022,
    `italic 500 21px ${f.body}`,
    p.dim,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
