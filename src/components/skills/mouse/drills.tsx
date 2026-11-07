'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { Device, StepId } from './mouseData';

// One small practice box per Learn step. Each calls onDone once when its check passes.
// `device` only changes wording; the checks use the same DOM events for mouse and trackpad.

export type DrillProps = { onDone: () => void; device: Device };

/** After a drill (or a prompt) finishes, the tail of a quick double-click must not finish the next one. */
const LOCK_MS = 600;

export function useLock(ms = LOCK_MS) {
  const until = useRef(0);
  useEffect(() => {
    until.current = performance.now() + ms;
  }, [ms]);
  return {
    locked: () => performance.now() < until.current,
    lock: () => {
      until.current = performance.now() + ms;
    },
  };
}

export function Box({
  id,
  children,
  onContextMenu,
  onPointerDown,
  className = '',
}: {
  id: string;
  children: ReactNode;
  onContextMenu?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  className?: string;
}) {
  return (
    <div className={`mp-box ${className}`} data-testid={`drill-${id}`} onContextMenu={onContextMenu} onPointerDown={onPointerDown}>
      {children}
    </div>
  );
}

/** Shown over a drill when its pass mark was missed; nothing is saved until it passes. */
export function RetryOverlay({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="mp-retry" role="status" onPointerDown={(e) => e.stopPropagation()}>
      <p>{text}</p>
      <button type="button" onClick={onRetry} className="mp-btn">
        Try again
      </button>
    </div>
  );
}

const SPOTS = [
  { left: '18%', top: '30%' },
  { left: '52%', top: '68%' },
  { left: '82%', top: '34%' },
];

export function MoveDrill({ onDone }: DrillProps) {
  const [i, setI] = useState(0);
  const advance = (n: number) => {
    if (n !== i) return;
    if (n === SPOTS.length - 1) onDone();
    setI(n + 1);
  };
  return (
    <Box id="move">
      {SPOTS.map((s, n) => (
        <div
          key={n}
          className={`mp-target${n === i ? '' : ' dim'}`}
          style={s}
          onPointerEnter={() => advance(n)}
          data-testid={`move-target-${n}`}
        >
          {n < i ? '✓' : n + 1}
        </div>
      ))}
    </Box>
  );
}

export function ClickDrill({ onDone }: DrillProps) {
  return (
    <Box id="click">
      <div className="mp-target" style={{ left: '50%', top: '50%' }} onClick={onDone} data-testid="click-target">
        click
      </div>
    </Box>
  );
}

export function DoubleClickDrill({ onDone }: DrillProps) {
  const [msg, setMsg] = useState('');
  const { locked } = useLock();
  return (
    <Box id="double">
      <div
        className="mp-target"
        style={{ left: '50%', top: '50%' }}
        onClick={() => setMsg('That was one. Again, quicker.')}
        onDoubleClick={() => {
          if (!locked()) onDone();
        }}
        data-testid="double-target"
      >
        ×2
      </div>
      <p className="mp-msg">{msg}</p>
    </Box>
  );
}

export function RightClickDrill({ onDone }: DrillProps) {
  const { locked } = useLock();
  return (
    <Box
      id="right"
      onContextMenu={(e) => {
        // The browser menu is blocked inside this box only.
        e.preventDefault();
        if (!locked()) onDone();
      }}
    >
      <div className="mp-target" style={{ left: '50%', top: '50%' }}>
        right
      </div>
    </Box>
  );
}

export function DragDrill({ onDone }: DrillProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

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
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const r = zoneRef.current?.getBoundingClientRect();
    const inside = !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (inside) {
      start.current = null;
      setDragging(false);
      onDone();
    } else {
      reset();
    }
  };

  return (
    <Box id="drag">
      <div ref={zoneRef} className="mp-zone" data-testid="drag-zone">
        drop here
      </div>
      <div
        className={`mp-card${dragging ? ' mp-dragging' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={reset}
        data-testid="drag-card"
      >
        drag me
      </div>
    </Box>
  );
}

export function ScrollDrill({ onDone }: DrillProps) {
  const done = useRef(false);
  return (
    <Box id="scroll">
      <div
        className="mp-list"
        data-testid="scroll-list"
        onScroll={(e) => {
          if (!done.current && e.currentTarget.scrollTop >= 120) {
            done.current = true;
            onDone();
          }
        }}
      >
        {Array.from({ length: 14 }, (_, n) => (
          <div key={n} className="mp-row">
            Item {n + 1}
          </div>
        ))}
      </div>
    </Box>
  );
}

type Prompt = 'click' | 'double' | 'right';
// Fixed order, not random: the first render must match between server and client.
const PROMPTS: Prompt[] = ['click', 'right', 'double'];
const PROMPT_TEXT: Record<Device, Record<Prompt, string>> = {
  mouse: { click: 'Click', double: 'Double-click', right: 'Right-click' },
  trackpad: { click: 'Tap or press', double: 'Double-tap', right: 'Two-finger tap' },
};

export function MixedDrill({ onDone, device }: DrillProps) {
  const [n, setN] = useState(0);
  const { locked, lock } = useLock();
  const prompt = PROMPTS[Math.min(n, PROMPTS.length - 1)];

  const hit = (kind: Prompt) => {
    if (locked() || kind !== prompt) return;
    lock();
    if (n === PROMPTS.length - 1) onDone();
    setN(n + 1);
  };

  return (
    <Box
      id="mixed"
      onContextMenu={(e) => {
        e.preventDefault();
        hit('right');
      }}
    >
      <div
        className="mp-target mp-target-wide"
        style={{ left: '50%', top: '50%' }}
        onClick={() => hit('click')}
        onDoubleClick={() => hit('double')}
        data-testid="mixed-target"
      >
        {PROMPT_TEXT[device][prompt]}
      </div>
      <p className="mp-msg">{Math.min(n + 1, PROMPTS.length)} of {PROMPTS.length}</p>
    </Box>
  );
}

export const DRILLS: Record<StepId, (p: DrillProps) => React.JSX.Element> = {
  move: MoveDrill,
  click: ClickDrill,
  double: DoubleClickDrill,
  right: RightClickDrill,
  drag: DragDrill,
  scroll: ScrollDrill,
  mixed: MixedDrill,
};
