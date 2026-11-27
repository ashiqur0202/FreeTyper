import { SMART_GOAL_MINUTES } from './smartEngine';

const RING = 169.6;

/** The daily practice ring (minutes typed today against the goal) with its three lines of text. */
export default function DailyRing({ todaySeconds, label = 'Daily practice' }: { todaySeconds: number; label?: string }) {
  const goalPct = Math.min(1, todaySeconds / (SMART_GOAL_MINUTES * 60));
  const goalDone = todaySeconds >= SMART_GOAL_MINUTES * 60;
  const mins = Math.floor(todaySeconds / 60);

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative h-[62px] w-[62px] flex-none" role="img" aria-label={`${label} ${Math.round(goalPct * 100)} percent of ${SMART_GOAL_MINUTES} minutes`}>
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r="27" fill="none" strokeWidth="6" stroke="var(--color-surface-raised)" />
          <circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke={goalDone ? 'var(--color-correct)' : 'var(--color-accent)'}
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - goalPct)}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-[0.95rem] font-bold tabular-nums text-text-bright">
          {goalDone ? '✓' : `${Math.round(goalPct * 100)}%`}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-text-dim">{label}</span>
        <b className="text-base font-semibold text-text-bright">{goalDone ? `Goal done, ${mins} min` : `${mins} of ${SMART_GOAL_MINUTES} min`}</b>
        <span className="text-xs font-semibold text-accent">{goalDone ? 'Nice work today' : `${SMART_GOAL_MINUTES - mins} min to go`}</span>
      </div>
    </div>
  );
}
