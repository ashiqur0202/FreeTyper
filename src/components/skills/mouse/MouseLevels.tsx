'use client';

import { useEffect, useRef, useState } from 'react';
import { HINT_AFTER_MS, type Device } from './mouseData';
import { COURSE } from './course';
import {
  LEVEL_IDS,
  LEVEL_NAMES,
  firstOpenIndex,
  isLevelPassed,
  isLevelUnlocked,
  rankOf,
  type LevelId,
} from './levelRules';
import { useMouseProgress } from './useMouseProgress';
import { trackEvent } from '@/lib/analytics';

// A trackpad drill still open after HINT_AFTER_MS shows the settings hint. Keyed by device + drill,
// so it starts over for every drill.
function TrackpadHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), HINT_AFTER_MS);
    return () => clearTimeout(t);
  }, []);
  if (!show) return <p className="mp-hint" aria-hidden="true" />;
  return (
    <p className="mp-hint mp-hint-on" role="status">
      If nothing happens, check your laptop&apos;s touchpad settings.
    </p>
  );
}

export default function MouseLevels() {
  const { progress, completeStep } = useMouseProgress();
  const device: Device = progress.device;
  const done = progress.done[device];

  // The level on screen: the first one not passed yet, unless the user picked another (or just passed one).
  const [levelView, setLevelView] = useState<LevelId | null>(null);
  const [view, setView] = useState<number | null>(null);
  const [justPassed, setJustPassed] = useState<LevelId | null>(null);

  const level: LevelId = levelView ?? LEVEL_IDS.find((l) => !isLevelPassed(l, done)) ?? 4;
  const items = COURSE[level];
  const open = firstOpenIndex(level, done);
  const index = view ?? (open === -1 ? items.length - 1 : open);
  const item = items[index];
  const Drill = item.Drill;
  const rank = rankOf(done);
  const nextLocked = LEVEL_IDS.find((l) => !isLevelUnlocked(l, done));

  // One start event per drill attempt: the Drill below is remounted (new key) for every attempt, so the ref is keyed the same way.
  const startedKey = useRef<string | null>(null);
  const finishedAt = useRef(0);
  const markStarted = (viaMove: boolean) => {
    const key = `${device}-${item.id}`;
    if (startedKey.current === key) return;
    // The pointer is still moving when a drill ends: that tail must not count as the next drill starting.
    if (Date.now() - finishedAt.current < 700) return;
    // Only the "Move the pointer" drill needs no click, so only there does moving count as starting.
    if (viaMove && item.id !== 'move') return;
    startedKey.current = key;
    trackEvent('mouse_step_start', { step: item.id, device, level });
  };

  const pickLevel = (l: LevelId) => {
    setLevelView(l);
    setView(null);
    setJustPassed(null);
  };

  const finish = (id: string) => {
    const wasPassed = isLevelPassed(level, done);
    // Every finished drill is an event, replays included. first_time lets a report split repeats from new drills.
    const firstTime = !done.includes(id);
    startedKey.current = null;
    finishedAt.current = Date.now();
    completeStep(device, id);
    trackEvent('mouse_step_complete', { step: id, device, level, first_time: firstTime });
    if (!wasPassed && isLevelPassed(level, [...done, id])) {
      trackEvent('level_pass', { level, device });
      setLevelView(level);
      setJustPassed(level);
    }
    setView(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="text-center text-sm text-text-dim">
        {rank ? (
          <>
            Your rank: <span className="mp-rank">{rank}</span>
          </>
        ) : (
          'Not ranked yet. Pass Level 1 to earn your first rank.'
        )}
      </p>

      <div className="mp-levels mt-3" role="group" aria-label="Levels">
        {LEVEL_IDS.map((l) => {
          const unlocked = isLevelUnlocked(l, done);
          const passed = isLevelPassed(l, done);
          return (
            <button
              key={l}
              type="button"
              className="mp-level"
              disabled={!unlocked}
              aria-current={l === level ? 'true' : undefined}
              onClick={() => pickLevel(l)}
              title={unlocked ? undefined : `Pass Level ${l - 1} to open this`}
            >
              {l}. {LEVEL_NAMES[l].level}
              {passed ? ' ✓' : unlocked ? '' : ' 🔒'}
            </button>
          );
        })}
      </div>
      {nextLocked && <p className="mt-2 text-center text-xs text-text-dim">Pass Level {nextLocked - 1} to open Level {nextLocked}.</p>}

      <ol className="mp-dots mt-5" aria-label={`Level ${level} drills`}>
        {items.map((it, i) => {
          const isDone = done.includes(it.id);
          return (
            <li key={it.id}>
              <button
                type="button"
                className={`mp-dot${isDone ? ' mp-dot-done' : ''}${i === index ? ' mp-dot-now' : ''}`}
                onClick={() => {
                  setView(i);
                  setJustPassed(null);
                }}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Drill ${i + 1}: ${it.title}${isDone ? ' (done)' : ''}`}
              >
                {isDone ? '✓' : i + 1}
              </button>
            </li>
          );
        })}
      </ol>

      {justPassed === level && (
        <div className="mt-4 text-center text-sm text-accent" role="status">
          Level {level} passed. You are now {LEVEL_NAMES[level].rank}.
          {level < 4 ? (
            <>
              {' '}
              <button type="button" className="mp-btn ml-2" onClick={() => pickLevel((level + 1) as LevelId)}>
                Go to Level {level + 1}
              </button>
            </>
          ) : (
            ' You have finished every level.'
          )}
        </div>
      )}

      <h2 className="mt-5 text-center text-lg font-medium text-text-bright">
        Level {level}, drill {index + 1} of {items.length}: {item.title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-text-dim" aria-live="polite">
        {item.text[device]}
      </p>

      <div className="mt-5" onPointerDownCapture={() => markStarted(false)} onPointerMove={() => markStarted(true)}>
        <Drill key={`${device}-${item.id}`} device={device} onDone={() => finish(item.id)} />
      </div>

      {device === 'trackpad' && level <= 2 ? (
        <TrackpadHint key={`${device}-${item.id}`} />
      ) : (
        <p className="mp-hint" aria-hidden="true" />
      )}
    </div>
  );
}
