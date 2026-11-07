'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, RetryOverlay, useLock, type DrillProps } from './drills';
import { randomTarget } from './aimScoring';
import { PASS, densify, insideRatio, stepTarget, type Mover, type Pt } from './levelRules';

// Level 3 (Skilled): speed and smooth movement. Each drill calls onDone once, only when it passes.

// ---------- moving targets ----------

const MOVING_HITS = 8;
const MOVING_D = 56;
const SPEED = 140; // px per second

export function MovingDrill({ onDone }: DrillProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const mover = useRef<Mover>({ x: 40, y: 40, vx: SPEED, vy: SPEED * 0.6 });
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [hits, setHits] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const r = areaRef.current?.getBoundingClientRect();
      if (r && !finished.current) {
        mover.current = stepTarget(mover.current, Math.min(0.05, (now - last) / 1000), r.width, r.height, MOVING_D);
        setPos({ x: mover.current.x, y: mover.current.y });
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hit = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (finished.current) return;
    const h = hits + 1;
    setHits(h);
    if (h >= MOVING_HITS) {
      finished.current = true;
      onDone();
      return;
    }
    const r = areaRef.current?.getBoundingClientRect();
    const p = randomTarget(r?.width ?? 600, r?.height ?? 240, MOVING_D);
    const angle = Math.random() * Math.PI * 2;
    mover.current = { x: p.x, y: p.y, vx: Math.cos(angle) * SPEED, vy: Math.sin(angle) * SPEED };
  };

  return (
    <Box id="moving">
      <div ref={areaRef} className="absolute inset-0">
        <button
          type="button"
          className="mp-aim-target"
          style={{ width: MOVING_D, height: MOVING_D, left: pos.x, top: pos.y }}
          onPointerDown={hit}
          tabIndex={-1}
          aria-label="Moving target"
          data-testid="moving-target"
        />
      </div>
      <p className="mp-count">{hits} of {MOVING_HITS}</p>
    </Box>
  );
}

// ---------- steer along a path ----------

const VB_W = 600;
const VB_H = 240;
const PATH: Pt[] = [
  { x: 60, y: 170 },
  { x: 230, y: 170 },
  { x: 300, y: 70 },
  { x: 470, y: 70 },
  { x: 540, y: 170 },
];
const HALF_WIDTH = 22;

export function SteerDrill({ onDone }: DrillProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const samples = useRef<Pt[]>([]);
  const [steering, setSteering] = useState(false);
  const [msg, setMsg] = useState('');
  const [failed, setFailed] = useState<number | null>(null);

  const toViewBox = (e: { clientX: number; clientY: number }): Pt | null => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: ((e.clientX - r.left) / r.width) * VB_W, y: ((e.clientY - r.top) / r.height) * VB_H };
  };

  const begin = () => {
    if (failed !== null) return;
    // Seed with the start dot so even a fast flick is judged from where the pointer began.
    samples.current = [PATH[0]];
    setSteering(true);
    setMsg('');
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!steering) return;
    const p = toViewBox(e);
    if (!p) return;
    const last = samples.current[samples.current.length - 1];
    if (last) samples.current.push(...densify(last, p, 8));
    samples.current.push(p);
  };
  const finish = () => {
    if (!steering) return;
    setSteering(false);
    const pct = insideRatio(samples.current, PATH, HALF_WIDTH);
    if (pct >= PASS.steer) onDone();
    else setFailed(pct);
  };
  const leave = () => {
    if (!steering) return;
    setSteering(false);
    setMsg('You left the box. Start again from the start dot.');
  };
  const retry = () => {
    setFailed(null);
    setMsg('');
  };

  const pct = (p: Pt) => ({ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` });
  const start = PATH[0];
  const end = PATH[PATH.length - 1];

  return (
    <div className="mp-box mp-box-auto" data-testid="drill-steer" onPointerMove={move} onPointerLeave={leave}>
      <div ref={stageRef} style={{ position: 'relative', width: '100%', aspectRatio: `${VB_W} / ${VB_H}` }}>
        <svg className="mp-corridor" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
          <polyline
            points={PATH.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--color-surface-border)"
            strokeWidth={HALF_WIDTH * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mp-dot-end" style={pct(start)} onPointerEnter={begin} data-testid="steer-start">
          start
        </div>
        <div className="mp-dot-end" style={pct(end)} onPointerEnter={finish} data-testid="steer-end">
          end
        </div>
        {failed !== null && (
          <RetryOverlay text={`You stayed inside the path ${failed}% of the time. You need ${PASS.steer}%. Go a little slower.`} onRetry={retry} />
        )}
      </div>
      <p className="mp-msg mp-msg-flow">{msg || `Move along the path from start to end. Stay inside it (${PASS.steer}% needed).`}</p>
    </div>
  );
}

// ---------- five quick double-clicks ----------

const QUICK_COUNT = 5;
const QUICK_MS = 20000;

export function QuickDrill({ onDone }: DrillProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { locked } = useLock();
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState({ x: 200, y: 90 });
  const [failed, setFailed] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const arm = () => {
    if (timer.current) return;
    timer.current = setTimeout(() => setFailed(true), QUICK_MS);
  };

  const dbl = () => {
    if (locked() || failed) return;
    arm();
    const c = count + 1;
    setCount(c);
    if (c >= QUICK_COUNT) {
      clearTimeout(timer.current);
      onDone();
      return;
    }
    const r = areaRef.current?.getBoundingClientRect();
    setPos(randomTarget(r?.width ?? 600, r?.height ?? 240, 64));
  };

  const retry = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setCount(0);
    setFailed(false);
  };

  return (
    <Box id="quick">
      <div ref={areaRef} className="absolute inset-0">
        <div
          className="mp-target"
          style={{ left: pos.x + 32, top: pos.y + 32 }}
          onPointerDown={arm}
          onDoubleClick={dbl}
          data-testid="quick-target"
        >
          ×2
        </div>
      </div>
      <p className="mp-count">{count} of {QUICK_COUNT} · {QUICK_MS / 1000} seconds from your first click</p>
      {failed && <RetryOverlay text="Time ran out. Try to double-click each circle in one smooth motion." onRetry={retry} />}
    </Box>
  );
}

// ---------- right-click menu ----------

const MENU_ITEMS = ['Copy', 'Paste', 'Rename', 'Delete'];
const MENU_PROMPTS = ['Rename', 'Delete', 'Copy'];

export function MenuDrill({ onDone }: DrillProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [msg, setMsg] = useState('');
  const { locked } = useLock();

  const choose = (label: string) => {
    if (label !== MENU_PROMPTS[round]) {
      setMsg(`That was ${label}. Choose ${MENU_PROMPTS[round]}.`);
      return;
    }
    setMenu(null);
    setMsg('');
    if (round + 1 >= MENU_PROMPTS.length) onDone();
    else setRound(round + 1);
  };

  return (
    <div
      ref={boxRef}
      className="mp-box"
      data-testid="drill-menu"
      onContextMenu={(e) => {
        // The browser menu is blocked inside this box only; ours opens on the circle.
        e.preventDefault();
        if (locked()) return;
        const r = boxRef.current?.getBoundingClientRect();
        const onCircle = (e.target as HTMLElement).closest('[data-testid="menu-target"]');
        if (!r || !onCircle) {
          setMsg('Right-click the circle.');
          return;
        }
        setMenu({ x: Math.min(e.clientX - r.left, r.width - 140), y: Math.min(e.clientY - r.top, r.height - 150) });
        setMsg('');
      }}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest('.mp-menu')) setMenu(null);
      }}
    >
      <div className="mp-target mp-target-wide" style={{ left: '30%', top: '50%' }} data-testid="menu-target">
        right-click
      </div>
      <p className="mp-count">{round + 1} of {MENU_PROMPTS.length}: right-click the circle, then choose {MENU_PROMPTS[Math.min(round, MENU_PROMPTS.length - 1)]}</p>
      {menu && (
        <div className="mp-menu" style={{ left: menu.x, top: menu.y }} role="menu" data-testid="menu-popup">
          {MENU_ITEMS.map((label) => (
            <button key={label} type="button" role="menuitem" onClick={() => choose(label)}>
              {label}
            </button>
          ))}
        </div>
      )}
      <p className="mp-msg">{msg}</p>
    </div>
  );
}

// ---------- drag cards into order ----------

const SORT_START: { n: number; left: string; top: string }[] = [
  { n: 3, left: '8%', top: '14%' },
  { n: 1, left: '32%', top: '30%' },
  { n: 4, left: '56%', top: '12%' },
  { n: 2, left: '76%', top: '32%' },
];
const SLOT_LEFT = ['20%', '40%', '60%', '80%'];

function SortChip({
  n,
  left,
  top,
  slots,
  onPlace,
  onMiss,
}: {
  n: number;
  left: string;
  top: string;
  slots: React.RefObject<(HTMLDivElement | null)[]>;
  onPlace: (n: number) => void;
  onMiss: (msg: string) => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const reset = () => {
    start.current = null;
    setDragging(false);
    setOff({ x: 0, y: 0 });
  };
  return (
    <div
      className={`mp-chip${dragging ? ' mp-dragging' : ''}`}
      style={{ left, top, transform: `translate(${off.x}px, ${off.y}px)` }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        setDragging(true);
      }}
      onPointerMove={(e) => start.current && setOff({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })}
      onPointerUp={(e) => {
        if (!start.current) return;
        const idx = (slots.current ?? []).findIndex((s) => {
          const r = s?.getBoundingClientRect();
          return !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        reset();
        if (idx === n - 1) onPlace(n);
        else onMiss(idx === -1 ? 'Drop the card on a slot.' : `Card ${n} goes in slot ${n}.`);
      }}
      onPointerCancel={reset}
      data-testid={`sort-chip-${n}`}
    >
      {n}
    </div>
  );
}

export function SortDrill({ onDone }: DrillProps) {
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  const place = (n: number) => {
    const next = [...placed, n];
    setPlaced(next);
    setMsg('');
    if (next.length >= SORT_START.length) onDone();
  };

  return (
    <Box id="sort">
      {SORT_START.filter((c) => !placed.includes(c.n)).map((c) => (
        <SortChip key={c.n} n={c.n} left={c.left} top={c.top} slots={slots} onPlace={place} onMiss={setMsg} />
      ))}
      {SLOT_LEFT.map((left, i) => (
        <div
          key={i}
          ref={(el) => {
            slots.current[i] = el;
          }}
          className={`mp-slot${placed.includes(i + 1) ? ' mp-slot-ok' : ''}`}
          style={{ left, transform: 'translateX(-50%)' }}
          data-testid={`sort-slot-${i + 1}`}
        >
          {i + 1}
        </div>
      ))}
      <p className="mp-msg" style={{ bottom: '5rem' }}>{msg || `${placed.length} of ${SORT_START.length}: drag each card to the slot with its number`}</p>
    </Box>
  );
}
