'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, RetryOverlay, useLock, type DrillProps } from './drills';
import { TargetsDrill } from './drills2';
import AimTrainer from './AimTrainer';
import { GAUNTLET_SECONDS, PASS, gauntletScore } from './levelRules';

// Level 4 (Mastery): timed challenges you have to pass.

// ---------- gauntlet: 60 seconds of mixed actions ----------

type Action = 'click' | 'double' | 'right' | 'drag';
const ACTIONS: Action[] = ['click', 'double', 'right', 'drag'];
const ACTION_TEXT: Record<Action, string> = { click: 'Click', double: 'Double-click', right: 'Right-click', drag: 'Drag to the box' };

const nextAction = (prev: Action | null): Action => {
  const pool = ACTIONS.filter((a) => a !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
};

type Phase = 'idle' | 'running' | 'failed';

export function GauntletDrill({ onDone }: DrillProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [action, setAction] = useState<Action>('click');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAUNTLET_SECONDS);
  const [finalScore, setFinalScore] = useState(0);

  const running = useRef(false);
  const startedAt = useRef(0);
  const counts = useRef({ correct: 0, wrong: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const { locked, lock } = useLock();

  // drag state
  const zoneRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => clearInterval(timer.current), []);

  const finish = () => {
    clearInterval(timer.current);
    running.current = false;
    const score = gauntletScore(counts.current.correct, counts.current.wrong);
    setFinalScore(score);
    if (score >= PASS.gauntlet) {
      setPhase('idle');
      onDone();
    } else {
      setPhase('failed');
    }
  };

  const start = () => {
    counts.current = { correct: 0, wrong: 0 };
    setCorrect(0);
    setWrong(0);
    setSecondsLeft(GAUNTLET_SECONDS);
    setAction(nextAction(null));
    running.current = true;
    startedAt.current = performance.now();
    lock();
    setPhase('running');
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      const left = GAUNTLET_SECONDS - (performance.now() - startedAt.current) / 1000;
      if (left <= 0) {
        setSecondsLeft(0);
        finish();
      } else {
        setSecondsLeft(Math.ceil(left));
      }
    }, 100);
  };

  const attempt = (kind: Action) => {
    if (!running.current || locked()) return;
    // The first click of a double-click is not a mistake.
    if (kind === 'click' && action === 'double') return;
    if (kind === action) {
      counts.current.correct += 1;
      setCorrect(counts.current.correct);
      lock();
      setAction(nextAction(action));
    } else {
      counts.current.wrong += 1;
      setWrong(counts.current.wrong);
    }
  };

  const resetDrag = () => {
    dragStart.current = null;
    setDragging(false);
    setOff({ x: 0, y: 0 });
  };
  const dragDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !running.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const dragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current) setOff({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const dragUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const r = zoneRef.current?.getBoundingClientRect();
    const inside = !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    resetDrag();
    if (inside) attempt('drag');
  };

  return (
    <Box
      id="gauntlet"
      onContextMenu={(e) => {
        // Inside this box only the drill's own right-click is used.
        e.preventDefault();
        if (running.current && (e.target as HTMLElement).closest('[data-testid="gauntlet-target"]')) attempt('right');
      }}
    >
      {phase === 'running' && action !== 'drag' && (
        <div
          className="mp-target mp-target-wide"
          style={{ left: '50%', top: '50%' }}
          onClick={() => attempt('click')}
          onDoubleClick={() => attempt('double')}
          data-testid="gauntlet-target"
        >
          {ACTION_TEXT[action]}
        </div>
      )}
      {phase === 'running' && action === 'drag' && (
        <>
          <div ref={zoneRef} className="mp-zone" data-testid="gauntlet-zone">drop here</div>
          <div
            className={`mp-card${dragging ? ' mp-dragging' : ''}`}
            style={{ transform: `translate(${off.x}px, ${off.y}px)` }}
            onPointerDown={dragDown}
            onPointerMove={dragMove}
            onPointerUp={dragUp}
            onPointerCancel={resetDrag}
            data-testid="gauntlet-card"
          >
            drag me
          </div>
        </>
      )}
      {phase === 'idle' && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="mx-4 mb-3 text-sm text-text-dim">
              {GAUNTLET_SECONDS} seconds. Do the action on the circle. A wrong action costs a point. Score {PASS.gauntlet} or more to pass.
            </p>
            <button type="button" className="mp-btn" onClick={start} data-testid="gauntlet-start">
              Start
            </button>
          </div>
        </div>
      )}
      {phase === 'running' && (
        <p className="mp-count">
          {secondsLeft}s · {correct} right · {wrong} wrong
        </p>
      )}
      {phase === 'failed' && (
        <RetryOverlay text={`Your score was ${finalScore}. You need ${PASS.gauntlet}. Stay calm and aim for the right action each time.`} onRetry={start} />
      )}
    </Box>
  );
}

// ---------- shrinking aim and tiny targets ----------

export function ShrinkDrill({ onDone }: DrillProps) {
  return <AimTrainer lockedMode="shrinking" passScore={PASS.shrink} onPass={onDone} />;
}

export function TinyTargetsDrill(p: DrillProps) {
  return <TargetsDrill {...p} id="tiny" count={20} diameter={24} minAccuracy={PASS.tiny} />;
}
