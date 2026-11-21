'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HINT_AFTER_MS, type Device } from './mouseData';
import { COURSE } from './course';
import {
  LEVEL_IDS,
  LEVEL_ITEMS,
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

  const firstUnpassed = LEVEL_IDS.find((l) => !isLevelPassed(l, done));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mp-sum">
        {rank && (
          <p className="text-sm text-text-dim">
            Your rank: <span className="mp-rank">{rank}</span>
          </p>
        )}
        <ol className="mp-hs mp-hs-rank" aria-label="Levels">
          {LEVEL_IDS.map((l, n) => {
            const passed = isLevelPassed(l, done);
            const unlocked = isLevelUnlocked(l, done);
            const state = passed ? 'done' : l === firstUnpassed ? 'cur' : 'locked';
            const count = LEVEL_ITEMS[l].filter((id) => done.includes(id)).length;
            return (
              <li
                key={l}
                data-state={state}
                data-sel={l === level}
                className={n > 0 && isLevelPassed((l - 1) as LevelId, done) ? 'mp-lk' : undefined}
              >
                <button
                  type="button"
                  className="mp-hn"
                  disabled={!unlocked}
                  aria-current={l === level ? 'true' : undefined}
                  aria-label={`Level ${l}: ${LEVEL_NAMES[l].level}${passed ? ', passed' : unlocked ? '' : ', locked'}`}
                  title={unlocked ? undefined : `Pass Level ${l - 1} to open this`}
                  onClick={() => pickLevel(l)}
                >
                  {passed ? <CheckIcon /> : unlocked ? l : <LockIcon />}
                </button>
                <div className="mp-hl">
                  {LEVEL_NAMES[l].level}
                  <small>{passed ? 'Passed' : unlocked ? `${count} of ${LEVEL_ITEMS[l].length}` : 'Locked'}</small>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <h2 className="sr-only">
        Level {level}: {LEVEL_NAMES[level].level}
      </h2>

      <ol className="mp-hs mt-6" aria-label={`Level ${level} drills`}>
        {items.map((it, i) => {
          const isDone = done.includes(it.id);
          const reachable = isDone || open === -1 || i <= open;
          const state = isDone ? 'done' : reachable ? 'cur' : 'locked';
          return (
            <li
              key={it.id}
              data-state={state}
              data-sel={i === index}
              className={i > 0 && done.includes(items[i - 1].id) ? 'mp-lk' : undefined}
            >
              <button
                type="button"
                className="mp-hn"
                disabled={!reachable}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Drill ${i + 1}: ${it.title}${isDone ? ' (done)' : reachable ? '' : ' (locked)'}`}
                title={reachable ? undefined : 'Finish the step before this one to open it'}
                onClick={() => {
                  setView(i);
                  setJustPassed(null);
                }}
              >
                {isDone ? <CheckIcon /> : reachable ? i + 1 : <LockIcon />}
              </button>
              <div className="mp-hl">{it.title}</div>
            </li>
          );
        })}
      </ol>

      {justPassed === level && (
        <div className="mt-4 rounded-xl border border-accent-dim px-4 py-3 text-center text-sm text-accent" role="status">
          Level {level} passed. You are now {LEVEL_NAMES[level].rank}.{' '}
          {level < 4 ? (
            <button type="button" className="mp-btn ml-2" onClick={() => pickLevel((level + 1) as LevelId)}>
              Go to Level {level + 1}
            </button>
          ) : (
            'You have finished every level. '
          )}
          <Link href="/mouse-practice-trainer" className="ml-2 underline decoration-dotted underline-offset-2">
            Practise this on Mouse practice
          </Link>
        </div>
      )}

      <div className="mp-lesson mt-4">
        <h3 className="text-base font-semibold text-text-bright">
          {item.title}
          <span className="ml-2 text-xs font-normal text-text-dim">
            Drill {index + 1} of {items.length}
          </span>
        </h3>
        <p className="mt-1 text-sm text-text-dim" aria-live="polite">
          {item.text[device]}
        </p>

        <div className="mt-4" onPointerDownCapture={() => markStarted(false)} onPointerMove={() => markStarted(true)}>
          <Drill key={`${device}-${item.id}`} device={device} onDone={() => finish(item.id)} />
        </div>

        {device === 'trackpad' && level <= 2 ? (
          <TrackpadHint key={`${device}-${item.id}`} />
        ) : (
          <p className="mp-hint" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
      <path d="M5.5 7V5.2a2.5 2.5 0 015 0V7" />
    </svg>
  );
}
