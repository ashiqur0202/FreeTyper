// The eight skills of the Mouse practice page, drawn straight into the arena with the DOM. React (MouseTrainer.tsx)
// only starts one for a round and calls the stop function it returns; everything a skill needs (timers, frames,
// listeners) is cleaned up there. The numbers (sizes, speeds, rows) come from practiceRules.ts.
import { followSpeed, movingSpeed, scrollRowPx, scrollRows, shrinkMs, sizeFor, zoneOf, type SkillId } from './practiceRules';

export type SkillCtx = {
  /** The play area: measured for size, and where the pointer is read for Follow. */
  arena: HTMLElement;
  /** Everything a skill draws goes in here. React empties it after the round. */
  layer: HTMLElement;
  level: number;
  /** Seconds since the round began (Follow gives a short grace at the start). */
  elapsed: () => number;
  hit: (ms: number, zone: number) => void;
  miss: (zone: number) => void;
  /** Follow: `dt` seconds spent on or off the dot. */
  follow: (dt: number, on: boolean) => void;
  /** Follow: about ten samples a second, for the weak-spot map. */
  sample: (on: boolean, zone: number) => void;
};

export type Stop = () => void;
type Pt = { x: number; y: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const size = (ctx: SkillCtx) => ({ w: ctx.arena.clientWidth, h: ctx.arena.clientHeight });

function pick(ctx: SkillCtx, d: number, avoid?: Pt[], minD = 0): Pt {
  const { w, h } = size(ctx);
  let p: Pt = { x: w / 2, y: h / 2 };
  for (let t = 0; t < 60; t++) {
    p = { x: rnd(d / 2 + 8, Math.max(d / 2 + 8, w - d / 2 - 8)), y: rnd(d / 2 + 8, Math.max(d / 2 + 8, h - d / 2 - 8)) };
    if (!avoid || !avoid.some((a) => Math.hypot(a.x - p.x, a.y - p.y) < minD)) break;
  }
  return p;
}

function place(el: HTMLElement, p: Pt, d: number) {
  el.style.width = `${d}px`;
  el.style.height = `${d}px`;
  el.style.left = `${p.x - d / 2}px`;
  el.style.top = `${p.y - d / 2}px`;
}

function disc(ctx: SkillCtx, d: number, p: Pt, label: string, cls = ''): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `mt-tg${cls ? ` ${cls}` : ''}`;
  el.setAttribute('aria-label', label);
  place(el, p, d);
  ctx.layer.appendChild(el);
  return el;
}

function flash(ctx: SkillCtx, p: Pt, text: string) {
  const f = document.createElement('div');
  f.className = 'mt-flash';
  f.textContent = text;
  f.style.left = `${p.x - 6}px`;
  f.style.top = `${p.y - 8}px`;
  ctx.layer.appendChild(f);
  window.setTimeout(() => f.remove(), 650);
}

const zoneAt = (ctx: SkillCtx, p: Pt) => {
  const { w, h } = size(ctx);
  return zoneOf(p.x, p.y, w, h);
};

const local = (ctx: SkillCtx, e: PointerEvent): Pt => {
  const r = ctx.layer.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};

/** A click on empty arena costs a miss against the target that is showing. */
function backgroundMiss(ctx: SkillCtx, current: () => { zone: number } | null): () => void {
  const on = (e: PointerEvent) => {
    const cur = current();
    if (!cur) return;
    ctx.miss(cur.zone);
    flash(ctx, local(ctx, e), 'miss');
  };
  ctx.layer.addEventListener('pointerdown', on);
  return () => ctx.layer.removeEventListener('pointerdown', on);
}

/* ---------- Click ---------- */
function click(ctx: SkillCtx): Stop {
  const d = sizeFor('click', ctx.level);
  let cur: { p: Pt; born: number; zone: number } | null = null;
  const spawn = () => {
    const p = pick(ctx, d, cur ? [cur.p] : undefined, 90);
    const el = disc(ctx, d, p, 'Target');
    cur = { p, born: performance.now(), zone: zoneAt(ctx, p) };
    const mine = cur;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      ctx.hit(performance.now() - mine.born, mine.zone);
      el.remove();
      spawn();
    });
  };
  const off = backgroundMiss(ctx, () => cur);
  spawn();
  return off;
}

/* ---------- Double-click ---------- */
function dbl(ctx: SkillCtx): Stop {
  const d = sizeFor('dbl', ctx.level);
  let cur: { p: Pt; born: number; zone: number } | null = null;
  let timer = 0;
  const spawn = () => {
    const p = pick(ctx, d, cur ? [cur.p] : undefined, 90);
    const el = disc(ctx, d, p, 'Target');
    const mine = { p, born: performance.now(), zone: zoneAt(ctx, p), first: 0 };
    cur = mine;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const now = performance.now();
      if (mine.first && now - mine.first <= 500) {
        window.clearTimeout(timer);
        ctx.hit(now - mine.born, mine.zone);
        el.remove();
        spawn();
      } else {
        mine.first = now;
        window.clearTimeout(timer);
        // One click alone is a miss once the second click is too late.
        timer = window.setTimeout(() => {
          if (cur === mine) {
            ctx.miss(mine.zone);
            mine.first = 0;
            flash(ctx, mine.p, 'twice');
          }
        }, 520);
      }
    });
  };
  const off = backgroundMiss(ctx, () => cur);
  spawn();
  return () => {
    off();
    window.clearTimeout(timer);
  };
}

/* ---------- Moving ---------- */
function moving(ctx: SkillCtx): Stop {
  const d = sizeFor('moving', ctx.level);
  const speed = movingSpeed(ctx.level);
  let cur: { p: Pt; zone: number; el: HTMLElement; born: number; ang: number; last: number } | null = null;
  let raf = 0;
  const spawn = () => {
    const p = pick(ctx, d);
    const el = disc(ctx, d, p, 'Moving target');
    const mine = { p, zone: zoneAt(ctx, p), el, born: performance.now(), ang: rnd(0, Math.PI * 2), last: performance.now() };
    cur = mine;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      ctx.hit(performance.now() - mine.born, zoneAt(ctx, mine.p));
      el.remove();
      spawn();
    });
  };
  const loop = (now: number) => {
    const t = cur;
    if (t) {
      const dt = Math.min(0.05, (now - t.last) / 1000);
      t.last = now;
      const { w, h } = size(ctx);
      const m = d / 2 + 2;
      t.p.x += Math.cos(t.ang) * speed * dt;
      t.p.y += Math.sin(t.ang) * speed * dt;
      if (t.p.x < m) { t.p.x = m; t.ang = Math.PI - t.ang; }
      if (t.p.x > w - m) { t.p.x = w - m; t.ang = Math.PI - t.ang; }
      if (t.p.y < m) { t.p.y = m; t.ang = -t.ang; }
      if (t.p.y > h - m) { t.p.y = h - m; t.ang = -t.ang; }
      t.zone = zoneAt(ctx, t.p);
      place(t.el, t.p, d);
    }
    raf = requestAnimationFrame(loop);
  };
  const off = backgroundMiss(ctx, () => cur);
  spawn();
  raf = requestAnimationFrame(loop);
  return () => {
    off();
    cancelAnimationFrame(raf);
  };
}

/* ---------- Shrinking ---------- */
function shrink(ctx: SkillCtx): Stop {
  const d = sizeFor('shrink', ctx.level);
  const life = shrinkMs(ctx.level);
  let cur: { p: Pt; born: number; zone: number } | null = null;
  let timer = 0;
  const spawn = () => {
    const p = pick(ctx, d, cur ? [cur.p] : undefined, 90);
    const el = disc(ctx, d, p, 'Shrinking target');
    el.style.transition = `transform ${life}ms linear`;
    el.style.transform = 'scale(1)';
    const mine = { p, born: performance.now(), zone: zoneAt(ctx, p) };
    cur = mine;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = 'scale(0.18)'; }));
    timer = window.setTimeout(() => {
      if (cur === mine) {
        ctx.miss(mine.zone);
        flash(ctx, mine.p, 'late');
        el.remove();
        spawn();
      }
    }, life);
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.clearTimeout(timer);
      ctx.hit(performance.now() - mine.born, mine.zone);
      el.remove();
      spawn();
    });
  };
  const off = backgroundMiss(ctx, () => cur);
  spawn();
  return () => {
    off();
    window.clearTimeout(timer);
  };
}

/* ---------- Switch ---------- */
function switchTo(ctx: SkillCtx): Stop {
  const d = sizeFor('switch', ctx.level);
  const pts: Pt[] = [];
  const circles: { el: HTMLElement; p: Pt; zone: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const p = pick(ctx, d, pts, d * 2.2);
    pts.push(p);
    const el = disc(ctx, d, p, `Circle ${i + 1}`, 'off');
    circles.push({ el, p, zone: zoneAt(ctx, p) });
  }
  let lit = -1;
  let born = performance.now();
  const light = () => {
    let n = 0;
    do { n = Math.floor(Math.random() * circles.length); } while (n === lit);
    if (lit >= 0) circles[lit].el.classList.add('off');
    lit = n;
    circles[n].el.classList.remove('off');
    born = performance.now();
  };
  circles.forEach((c, i) => {
    c.el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const target = circles[lit];
      if (i === lit) {
        ctx.hit(performance.now() - born, target.zone);
        light();
      } else {
        ctx.miss(target.zone);
        flash(ctx, c.p, 'miss');
      }
    });
  });
  light();
  return () => {};
}

/* ---------- Drag ---------- */
function drag(ctx: SkillCtx): Stop {
  const ball = sizeFor('drag', ctx.level);
  const ringD = Math.round(ball * 1.9);
  let stopped = false;
  const spawn = () => {
    if (stopped) return;
    const ringP = pick(ctx, ringD);
    const ballP = pick(ctx, ball, [ringP], 130);
    const ring = document.createElement('div');
    ring.className = 'mt-ring';
    place(ring, ringP, ringD);
    const el = document.createElement('div');
    el.className = 'mt-ball';
    place(el, ballP, ball);
    ctx.layer.appendChild(ring);
    ctx.layer.appendChild(el);
    const born = performance.now();
    const zone = zoneAt(ctx, ringP);
    let off: Pt | null = null;
    let cur: Pt = { ...ballP };
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const q = local(ctx, e);
      off = { x: q.x - cur.x, y: q.y - cur.y };
      el.classList.add('drag');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!off) return;
      const q = local(ctx, e);
      cur = { x: q.x - off.x, y: q.y - off.y };
      place(el, cur, ball);
    });
    const up = () => {
      if (!off) return;
      off = null;
      el.classList.remove('drag');
      if (Math.hypot(cur.x - ringP.x, cur.y - ringP.y) <= ringD * 0.35) {
        ctx.hit(performance.now() - born, zone);
        ring.remove();
        el.remove();
        spawn();
      } else {
        ctx.miss(zone);
        flash(ctx, cur, 'miss');
        cur = { ...ballP };
        place(el, cur, ball);
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };
  spawn();
  return () => { stopped = true; };
}

/* ---------- Follow ---------- */
function follow(ctx: SkillCtx): Stop {
  const d = sizeFor('follow', ctx.level);
  const speed = followSpeed(ctx.level);
  const el = document.createElement('div');
  el.className = 'mt-dot';
  const p0 = pick(ctx, d);
  place(el, p0, d);
  ctx.layer.appendChild(el);
  const dot = { x: p0.x, y: p0.y, ang: rnd(0, Math.PI * 2), turn: 0, samp: 0, last: performance.now() };
  let ptr: Pt | null = null;
  const move = (e: PointerEvent) => {
    const r = ctx.layer.getBoundingClientRect();
    ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  ctx.arena.addEventListener('pointermove', move);
  ctx.arena.addEventListener('pointerdown', move);
  let raf = 0;
  const loop = (now: number) => {
    // Time on or off the dot is counted in real time (a long gap, such as a hidden tab, is capped at a quarter
    // of a second); only the movement step is capped, so a slow screen still counts seconds correctly.
    const real = Math.min(0.25, (now - dot.last) / 1000);
    const dt = Math.min(0.05, real);
    dot.last = now;
    dot.turn -= dt;
    if (dot.turn <= 0) { dot.ang += rnd(-1.6, 1.6); dot.turn = rnd(0.6, 1.4); }
    dot.x += Math.cos(dot.ang) * speed * dt;
    dot.y += Math.sin(dot.ang) * speed * dt;
    const { w, h } = size(ctx);
    const m = d / 2 + 4;
    if (dot.x < m) { dot.x = m; dot.ang = Math.PI - dot.ang; }
    if (dot.x > w - m) { dot.x = w - m; dot.ang = Math.PI - dot.ang; }
    if (dot.y < m) { dot.y = m; dot.ang = -dot.ang; }
    if (dot.y > h - m) { dot.y = h - m; dot.ang = -dot.ang; }
    place(el, dot, d);
    const on = !!ptr && Math.hypot(ptr.x - dot.x, ptr.y - dot.y) <= d / 2;
    el.classList.toggle('on', on);
    // A short grace at the start gives time to find the dot.
    if (ctx.elapsed() > 1.5) {
      ctx.follow(real, on);
      dot.samp += real;
      if (dot.samp >= 0.1) {
        dot.samp = 0;
        ctx.sample(on, zoneAt(ctx, dot));
      }
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    ctx.arena.removeEventListener('pointermove', move);
    ctx.arena.removeEventListener('pointerdown', move);
  };
}

/* ---------- Scroll ---------- */
function scroll(ctx: SkillCtx): Stop {
  const rows = scrollRows(ctx.level);
  const rowPx = scrollRowPx(ctx.level);
  const bar = document.createElement('div');
  bar.className = 'mt-find';
  const box = document.createElement('div');
  box.className = 'mt-list';
  for (let i = 1; i <= rows; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mt-row';
    b.style.height = `${rowPx}px`;
    b.textContent = `Item ${i}`;
    b.dataset.i = String(i);
    box.appendChild(b);
  }
  ctx.layer.appendChild(bar);
  ctx.layer.appendChild(box);
  // This is the one skill that needs the page's own scrolling, so touch scrolling is allowed inside it.
  ctx.arena.style.touchAction = 'auto';
  let target = 0;
  let born = performance.now();
  const next = () => {
    const view = Math.ceil(box.clientHeight / rowPx);
    const here = Math.round(box.scrollTop / rowPx);
    let idx = 1;
    for (let t = 0; t < 40; t++) {
      idx = 1 + Math.floor(Math.random() * rows);
      if (Math.abs(idx - 1 - here) >= view * 1.5) break;
    }
    target = idx;
    bar.textContent = `Find and click: Item ${idx}`;
    born = performance.now();
  };
  const down = (e: PointerEvent) => {
    const b = (e.target as HTMLElement).closest?.('.mt-row') as HTMLElement | null;
    if (!b) return;
    const q = local(ctx, e);
    const zone = zoneAt(ctx, q);
    if (Number(b.dataset.i) === target) {
      ctx.hit(performance.now() - born, zone);
      next();
    } else {
      ctx.miss(zone);
      flash(ctx, q, 'miss');
    }
  };
  box.addEventListener('pointerdown', down);
  next();
  return () => {
    box.removeEventListener('pointerdown', down);
    ctx.arena.style.touchAction = 'none';
  };
}

const ENGINES: Record<SkillId, (ctx: SkillCtx) => Stop> = { click, dbl, scroll, drag, switch: switchTo, moving, follow, shrink };

/** Start one skill in the arena. Call the returned function to stop it. */
export function startSkill(skill: SkillId, ctx: SkillCtx): Stop {
  return ENGINES[skill](ctx);
}
