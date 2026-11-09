import { MIN_DIGIT_SAMPLES, type DigitSpeed } from './numberRow';

/** Ten tiles, one per digit: how long each took to reach, the slowest marked. Shown on the number row result card. */
export default function DigitStrip({ speeds, slowest }: { speeds: DigitSpeed[]; slowest: string | null }) {
  const timed = speeds.filter((s) => s.avgMs !== null);
  const max = Math.max(1, ...timed.map((s) => s.avgMs ?? 0));

  return (
    <div className="mt-4" data-digit-strip>
      <p className="text-[10px] uppercase tracking-widest text-text-dim">Your digits, by speed</p>
      <ol className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {speeds.map((s) => {
          const isSlowest = s.digit === slowest;
          const height = s.avgMs === null ? 0 : Math.max(8, Math.round((s.avgMs / max) * 100));
          return (
            <li
              key={s.digit}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 pb-1.5 pt-2 ${
                isSlowest ? 'border-accent' : 'border-surface-border'
              } bg-surface-raised/40`}
              aria-label={s.avgMs === null ? `${s.digit}: not enough presses` : `${s.digit}: ${s.avgMs} milliseconds${isSlowest ? ', slowest' : ''}`}
            >
              <span className="font-mono text-base text-text-bright">{s.digit}</span>
              <span className="flex h-9 w-3/5 items-end" aria-hidden>
                {s.avgMs !== null && (
                  <span
                    className={`block w-full rounded-t ${isSlowest ? 'bg-accent' : 'bg-typing-pending'}`}
                    style={{ height: `${height}%` }}
                  />
                )}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-text-dim">{s.avgMs === null ? '–' : `${s.avgMs} ms`}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] leading-relaxed text-text-dim">
        Average time to reach each digit after the key before it. Taller is slower. A digit needs at least{' '}
        {MIN_DIGIT_SAMPLES} clean presses to show.
        {timed.length === 0 && ' Not enough here yet: try a longer run.'}
      </p>
    </div>
  );
}
