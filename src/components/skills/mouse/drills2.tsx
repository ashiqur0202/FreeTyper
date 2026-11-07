'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, RetryOverlay, type DrillProps } from './drills';
import { randomTarget } from './aimScoring';
import { PASS, meetsAccuracy } from './levelRules';

// Level 2 (Comfortable): accuracy and control. Each drill calls onDone once, only when it passes.

// ---------- small targets (also used for the Level 4 "tiny" drill) ----------

type TargetsProps = DrillProps & { id: string; count: number; diameter: number; minAccuracy: number };

export function TargetsDrill({ onDone, id, count, diameter, minAccuracy }: TargetsProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [failed, setFailed] = useState<number | null>(null);

  const place = () => {
    const r = areaRef.current?.getBoundingClientRect();
    setPos(randomTarget(r?.width ?? 600, r?.height ?? 240, diameter));
  };

  const hit = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (failed !== null) return;
    const h = hits + 1;
    setHits(h);
    if (h >= count) {
      if (meetsAccuracy(h, misses, minAccuracy)) onDone();
      else setFailed(Math.round((h / (h + misses)) * 100));
    } else {
      place();
    }
  };

  const retry = () => {
    setHits(0);
    setMisses(0);
    setFailed(null);
    setPos({ x: 40, y: 40 });
  };

  return (
    <Box id={id} onPointerDown={() => failed === null && setMisses((m) => m + 1)}>
      <div ref={areaRef} className="absolute inset-0">
        <button
          type="button"
          className="mp-aim-target"
          style={{ width: diameter, height: diameter, left: pos.x, top: pos.y }}
          onPointerDown={hit}
          tabIndex={-1}
          aria-label="Target"
          data-testid={`${id}-target`}
        />
      </div>
      <p className="mp-count">
        {hits} of {count} · {misses} {misses === 1 ? 'miss' : 'misses'} · need {minAccuracy}% accuracy
      </p>
      {failed !== null && <RetryOverlay text={`Accuracy was ${failed}%. You need ${minAccuracy}%. Slow down a little and aim for the middle.`} onRetry={retry} />}
    </Box>
  );
}

export function SmallTargetsDrill(p: DrillProps) {
  return <TargetsDrill {...p} id="small" count={10} diameter={36} minAccuracy={PASS.small} />;
}

// ---------- precise drag ----------

const SPOT = 44;
const ROUNDS = 3;

export function PreciseDragDrill({ onDone }: DrillProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [round, setRound] = useState(0);
  const [spot, setSpot] = useState({ x: 300, y: 90 });
  const [msg, setMsg] = useState('');

  const reset = () => {
    start.current = null;
    setDragging(false);
    setPos({ x: 0, y: 0 });
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    setMsg('');
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (start.current) setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const r = spotRef.current?.getBoundingClientRect();
    const inside = !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) {
      setMsg('Just missed. Let go with the pointer on the dashed circle.');
      reset();
      return;
    }
    reset();
    const next = round + 1;
    if (next >= ROUNDS) {
      onDone();
      return;
    }
    setRound(next);
    const a = areaRef.current?.getBoundingClientRect();
    const p = randomTarget(Math.max(0, (a?.width ?? 600) - 160), a?.height ?? 240, SPOT);
    setSpot({ x: p.x + 160, y: p.y });
  };

  return (
    <Box id="precise">
      <div ref={areaRef} className="absolute inset-0">
        <div ref={spotRef} className="mp-spot" style={{ width: SPOT, height: SPOT, left: spot.x, top: spot.y }} data-testid="precise-spot">
          here
        </div>
        <div
          className={`mp-card${dragging ? ' mp-dragging' : ''}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={reset}
          data-testid="precise-card"
        >
          drag me
        </div>
      </div>
      <p className="mp-msg">{msg || `${round} of ${ROUNDS}`}</p>
    </Box>
  );
}

// ---------- click and hold ----------

const HOLD_MS = 1000;

export function HoldDrill({ onDone }: DrillProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [holding, setHolding] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => () => clearTimeout(timer.current), []);

  const begin = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setHolding(true);
    setMsg('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setHolding(false);
      onDone();
    }, HOLD_MS);
  };
  const end = () => {
    if (!holding) return;
    clearTimeout(timer.current);
    setHolding(false);
    setMsg('Let go too early. Keep it pressed for a full second.');
  };

  return (
    <Box id="hold">
      <div
        className={`mp-target${holding ? ' mp-holding' : ''}`}
        style={{ left: '50%', top: '50%', overflow: 'hidden', touchAction: 'none' }}
        onPointerDown={begin}
        onPointerUp={end}
        onPointerCancel={end}
        data-testid="hold-target"
      >
        <span className="mp-fill" />
        <span style={{ position: 'relative' }}>hold</span>
      </div>
      <p className="mp-msg">{msg}</p>
    </Box>
  );
}

// ---------- select text ----------

const BEFORE = 'The pointer does more than click. ';
const TARGET = 'Drag across this whole sentence to select it.';
const AFTER = ' Let go when the last word is selected.';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/\.$/, '');

export function SelectDrill({ onDone }: DrillProps) {
  const [msg, setMsg] = useState('');
  const done = useRef(false);

  const check = () => {
    // Wait a tick so the browser has finished updating the selection.
    setTimeout(() => {
      if (done.current) return;
      const got = norm(window.getSelection()?.toString() ?? '');
      if (!got) return;
      if (got === norm(TARGET)) {
        done.current = true;
        onDone();
      } else {
        // Clear it: pressing inside an old selection would start dragging that text instead.
        window.getSelection()?.removeAllRanges();
        setMsg('That selected something else. Select only the highlighted sentence.');
      }
    }, 0);
  };

  return (
    <Box id="select" className="mp-box-text">
      <p className="mp-prose" onPointerUp={check} data-testid="select-text">
        {BEFORE}
        <mark data-testid="select-target">{TARGET}</mark>
        {AFTER}
      </p>
      <p className="mp-msg">{msg}</p>
    </Box>
  );
}

// ---------- scroll to find ----------

const FIND_ITEM = 47;

export function FindDrill({ onDone }: DrillProps) {
  const [msg, setMsg] = useState('');
  return (
    <Box id="find">
      <p
        className="mp-count"
        style={{ zIndex: 2, left: 0, right: 0, top: 0, padding: '0.45rem 0.8rem', background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-surface-border)' }}
      >
        Find Item {FIND_ITEM} and click it
      </p>
      <div className="mp-list" style={{ paddingTop: '2.2rem' }} data-testid="find-list">
        {Array.from({ length: 60 }, (_, n) => (
          <div
            key={n}
            className="mp-row mp-find"
            onClick={() => {
              if (n + 1 === FIND_ITEM) onDone();
              else setMsg(`That is Item ${n + 1}. Keep scrolling.`);
            }}
          >
            Item {n + 1}
          </div>
        ))}
      </div>
      <p className="mp-msg" style={{ background: 'var(--color-surface-raised)', bottom: 0, padding: '0.3rem 0' }}>{msg}</p>
    </Box>
  );
}
