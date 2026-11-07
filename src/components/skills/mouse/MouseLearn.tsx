'use client';

import { useEffect, useState } from 'react';
import { HINT_AFTER_MS, STEPS, type Device, type StepId } from './mouseData';
import { DRILLS } from './drills';
import { useMouseProgress } from './useMouseProgress';
import { trackEvent } from '@/lib/analytics';

// A trackpad step still open after HINT_AFTER_MS shows the settings hint. Keyed by device + step,
// so it starts over for every step.
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

export default function MouseLearn() {
  const { progress, completeStep } = useMouseProgress();
  const device: Device = progress.device;
  const done = progress.done[device];

  // Which step is shown: the first unfinished one, unless the user tapped a dot to revisit one.
  const [view, setView] = useState<number | null>(null);
  const firstOpen = STEPS.findIndex((s) => !done.includes(s.id));
  const allDone = firstOpen === -1;
  const index = view ?? (allDone ? STEPS.length - 1 : firstOpen);
  const step = STEPS[index];
  const Drill = DRILLS[step.id];

  const finish = (id: StepId) => {
    completeStep(device, id);
    trackEvent('mouse_step_complete', { step: id, device });
    setView(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="mp-dots" aria-label="Steps">
        {STEPS.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`mp-dot${isDone ? ' mp-dot-done' : ''}${i === index ? ' mp-dot-now' : ''}`}
                onClick={() => setView(i)}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${s.title}${isDone ? ' (done)' : ''}`}
              >
                {isDone ? '✓' : i + 1}
              </button>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-5 text-center text-lg font-medium text-text-bright">
        Step {index + 1} of {STEPS.length}: {step.title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-text-dim" aria-live="polite">
        {step.text[device]}
      </p>
      {allDone && view === null && (
        <p className="mt-3 text-center text-sm text-accent">All steps done. Tap a number to practise any step again.</p>
      )}

      <div className="mt-5">
        <Drill key={`${device}-${step.id}`} device={device} onDone={() => finish(step.id)} />
      </div>

      {device === 'trackpad' ? <TrackpadHint key={`${device}-${step.id}`} /> : <p className="mp-hint" aria-hidden="true" />}
    </div>
  );
}
