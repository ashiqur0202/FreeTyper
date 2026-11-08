import type { TypingSession } from './types';
import { MIN_GRAPH_SECONDS } from './runStats';

export const SHARE_W = 1200;
export const SHARE_H = 630;

export type ShareSource = 'speed_test' | 'practice' | 'lessons';

export function shareSourceOf(mode: TypingSession['mode']): ShareSource {
  if (mode === 'lesson') return 'lessons';
  if (mode === 'practice') return 'practice';
  return 'speed_test';
}

/** The old one-line text, kept as the fallback when images are blocked. */
export function shareText(run: TypingSession): string {
  return `${run.wpm} WPM · ${run.accuracy}% accuracy — FreeTyper`;
}

function rankLabel(wpm: number) {
  if (wpm >= 100) return 'elite';
  if (wpm >= 80) return 'pro';
  if (wpm >= 60) return 'skilled';
  if (wpm >= 40) return 'average';
  return 'beginner';
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function modeTitle(run: TypingSession) {
  const day = /^daily · (\d{4}-\d{2}-\d{2})$/.exec(run.modeDetail ?? '');
  if (day) {
    const label = new Date(`${day[1]}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return `Daily challenge · ${label}`;
  }
  if (run.mode === 'speed-test') return run.modeDetail ? `Typing test · ${run.modeDetail}` : 'Typing test';
  if (run.mode === 'lesson') return run.modeDetail ? `Lesson · ${run.modeDetail}` : 'Typing lesson';
  return 'Typing practice';
}

interface Palette {
  bg: string;
  panel: string;
  border: string;
  text: string;
  dim: string;
  bright: string;
  accent: string;
  error: string;
  sans: string;
  mono: string;
}

/** Read the live theme so the picture matches what the visitor sees. */
function readPalette(): Palette {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const v = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback;
  const sans = body.fontFamily || 'system-ui, sans-serif';
  const monoVar = root.getPropertyValue('--font-mono').trim() || body.getPropertyValue('--font-mono').trim();
  return {
    bg: body.backgroundColor || v('--color-surface', '#323234'),
    panel: v('--color-surface-raised', '#3a3a3c'),
    border: v('--color-surface-border', '#4a4a4c'),
    text: v('--color-text', '#d4d4c8'),
    dim: v('--color-text-dim', '#a4a4a4'),
    bright: v('--color-text-bright', '#f0f0e8'),
    accent: v('--color-accent', '#e2b714'),
    error: v('--color-error', '#c44250'),
    sans,
    mono: `${monoVar ? `${monoVar}, ` : ''}ui-monospace, "JetBrains Mono", Consolas, monospace`,
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw a 1200x630 picture of one finished run. Only numbers are used: the
 * typed text never goes into the image. Nothing is uploaded.
 */
export async function renderResultImage(run: TypingSession): Promise<Blob> {
  const p = readPalette();
  try {
    await Promise.all([
      document.fonts.load(`300 120px ${p.mono}`),
      document.fonts.load(`500 28px ${p.sans}`),
    ]);
  } catch {
    /* fall back to whatever font the browser already has */
  }

  const canvas = document.createElement('canvas');
  canvas.width = SHARE_W;
  canvas.height = SHARE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  // Background and frame
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, 10, SHARE_H);

  const left = 72;
  ctx.textBaseline = 'alphabetic';

  // Header: brand and test name
  ctx.font = `600 30px ${p.sans}`;
  ctx.fillStyle = p.bright;
  ctx.fillText('Free', left, 82);
  const freeW = ctx.measureText('Free').width;
  ctx.fillStyle = p.accent;
  ctx.fillText('Typer', left + freeW, 82);

  ctx.font = `500 26px ${p.sans}`;
  ctx.fillStyle = p.dim;
  ctx.textAlign = 'right';
  ctx.fillText(modeTitle(run), SHARE_W - 72, 82);
  ctx.textAlign = 'left';

  // Big number
  const detailed = run.mode === 'speed-test';
  ctx.font = `300 190px ${p.mono}`;
  ctx.fillStyle = p.accent;
  ctx.fillText(String(run.wpm), left, 292);
  const wpmW = ctx.measureText(String(run.wpm)).width;
  ctx.font = `500 30px ${p.sans}`;
  ctx.fillStyle = p.dim;
  ctx.fillText(detailed ? 'NET WPM' : 'WPM', left + wpmW + 22, 292);

  // Secondary numbers
  const stats: Array<[string, string, string]> = [
    [`${run.accuracy}%`, 'ACCURACY', p.bright],
    [formatDuration(run.duration), 'TIME', p.bright],
    [String(run.incorrectChars), 'ERRORS', run.incorrectChars > 0 ? p.error : p.bright],
  ];
  if (run.run && run.run.seconds >= MIN_GRAPH_SECONDS) {
    stats.push([`${run.run.consistency}%`, 'CONSISTENCY', p.bright]);
  }
  let sx = left;
  for (const [value, label, color] of stats) {
    ctx.font = `400 54px ${p.mono}`;
    ctx.fillStyle = color;
    ctx.fillText(value, sx, 392);
    const w = ctx.measureText(value).width;
    ctx.font = `500 18px ${p.sans}`;
    ctx.fillStyle = p.dim;
    ctx.fillText(label, sx, 422);
    const lw = ctx.measureText(label).width;
    sx += Math.max(w, lw) + 56;
  }

  // Rank pill (speed test only, same bands as the result card)
  if (detailed) {
    const label = rankLabel(run.wpm).toUpperCase();
    ctx.font = `600 22px ${p.sans}`;
    const w = ctx.measureText(label).width + 40;
    ctx.fillStyle = p.panel;
    roundRect(ctx, SHARE_W - 72 - w, 150, w, 44, 22);
    ctx.fill();
    ctx.fillStyle = p.accent;
    ctx.textAlign = 'center';
    ctx.fillText(label, SHARE_W - 72 - w / 2, 181);
    ctx.textAlign = 'left';
  }

  // Speed graph
  const gx = left;
  const gy = 456;
  const gw = SHARE_W - 144;
  const gh = 84;
  const speed = run.run?.speed;
  if (speed && run.run && run.run.seconds >= MIN_GRAPH_SECONDS && speed.length >= 2) {
    const maxV = Math.max(20, Math.max(...speed, ...run.run.raw));
    const px = (i: number) => gx + (i / (speed.length - 1)) * gw;
    const py = (val: number) => gy + gh - (val / maxV) * gh;
    ctx.strokeStyle = p.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.stroke();
    ctx.beginPath();
    speed.forEach((val, i) => (i ? ctx.lineTo(px(i), py(val)) : ctx.moveTo(px(i), py(val))));
    ctx.lineTo(px(speed.length - 1), gy + gh);
    ctx.lineTo(px(0), gy + gh);
    ctx.closePath();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = p.accent;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    speed.forEach((val, i) => (i ? ctx.lineTo(px(i), py(val)) : ctx.moveTo(px(i), py(val))));
    ctx.stroke();
    ctx.fillStyle = p.error;
    run.run.errors.forEach((e, i) => {
      if (e > 0 && i < speed.length) {
        ctx.beginPath();
        ctx.arc(px(i), gy + gh + 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Footer
  const date = new Date(run.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  ctx.font = `500 24px ${p.sans}`;
  ctx.fillStyle = p.dim;
  ctx.fillText(date, left, 590);
  ctx.textAlign = 'right';
  ctx.fillStyle = p.accent;
  ctx.font = `600 28px ${p.sans}`;
  ctx.fillText('freetyper.com', SHARE_W - 72, 590);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export type ShareOutcome = 'shared' | 'image-copied' | 'downloaded' | 'text-copied' | 'failed';

/**
 * Phones: system share sheet with the picture attached. Desktop: copy the
 * picture. If that is blocked: download it and copy the old text line.
 */
export async function shareResult(run: TypingSession): Promise<ShareOutcome> {
  let blob: Blob;
  try {
    blob = await renderResultImage(run);
  } catch {
    return (await copyText(run)) ? 'text-copied' : 'failed';
  }

  const file = new File([blob], `freetyper-${run.wpm}wpm.png`, { type: 'image/png' });
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

  if (coarse && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: shareText(run), url: 'https://freetyper.com' });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'failed';
    }
  }

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'image-copied';
    }
  } catch {
    /* blocked or unsupported: fall through to the download */
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    void copyText(run);
    return 'downloaded';
  } catch {
    return (await copyText(run)) ? 'text-copied' : 'failed';
  }
}

async function copyText(run: TypingSession): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareText(run));
    return true;
  } catch {
    return false;
  }
}
