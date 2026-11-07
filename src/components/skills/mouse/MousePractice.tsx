'use client';

import { useState } from 'react';
import type { Device } from './mouseData';
import MouseLearn from './MouseLearn';
import AimTrainer from './AimTrainer';
import { useMouseProgress } from './useMouseProgress';

type Tab = 'learn' | 'aim';

export default function MousePractice() {
  const { progress, setDevice } = useMouseProgress();
  const [tab, setTab] = useState<Tab>('learn');
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
        Practise the mouse or your laptop trackpad. Pick what you use, then follow the steps.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="mp-tabs" role="tablist" aria-label="Mode">
          {(['learn', 'aim'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className="mp-tab"
              onClick={() => setTab(t)}
            >
              {t === 'learn' ? 'Learn' : 'Aim'}
            </button>
          ))}
        </div>

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
      </div>

      {touchNote && (
        <p className="mt-4 max-w-xl rounded-lg border border-surface-border px-3 py-2 text-center text-xs text-text-dim" role="status">
          This page is built for a mouse or a laptop trackpad. It still works on a touchscreen.{' '}
          <button type="button" className="text-accent underline" onClick={() => setTouchNote(false)}>
            Dismiss
          </button>
        </p>
      )}

      <div className="mt-6 w-full">{tab === 'learn' ? <MouseLearn /> : <AimTrainer />}</div>
    </div>
  );
}
