'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Device } from './mouseData';
import MouseLevels from './MouseLevels';
import { useMouseProgress } from './useMouseProgress';

// The "Mouse lessons" page (/mouse-practice): the four-level path. The free-choice, non-stop practice
// lives on its own page (/mouse-practice-trainer, MouseTrainer.tsx).
export default function MousePractice() {
  const { progress, setDevice } = useMouseProgress();
  const [touchNote, setTouchNote] = useState(false);

  const devices: { id: Device; label: string }[] = [
    { id: 'mouse', label: 'Mouse' },
    { id: 'trackpad', label: 'Trackpad' },
  ];

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col items-center"
      onPointerDownCapture={(e) => {
        if (e.pointerType === 'touch') setTouchNote(true);
      }}
    >
      <p className="mb-4 text-center text-sm text-text-dim">
        Learn the mouse or your laptop trackpad one step at a time. Finish a step to open the next.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="mp-tabs" role="group" aria-label="I am using">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              className="mp-tab"
              aria-pressed={progress.device === d.id}
              onClick={() => setDevice(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <Link href="/mouse-practice-trainer" className="text-sm text-accent underline decoration-dotted underline-offset-2">
          Want non-stop practice? Open Mouse practice
        </Link>
      </div>

      {touchNote && (
        <p className="mt-4 max-w-xl rounded-lg border border-surface-border px-3 py-2 text-center text-xs text-text-dim" role="status">
          This page is built for a mouse or a laptop trackpad. It still works on a touchscreen.{' '}
          <button type="button" className="text-accent underline" onClick={() => setTouchNote(false)}>
            Dismiss
          </button>
        </p>
      )}

      <div className="mt-6 w-full">
        <MouseLevels />
      </div>
    </div>
  );
}
