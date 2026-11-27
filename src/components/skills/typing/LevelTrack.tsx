import { KEY_ORDER, LEVELS, START_KEYS, levelIndex } from './smartEngine';

/** The level line is as wide as the keys it spans: Beginner 1 to 12, Intermediate 12 to 20, Advanced 20 to 26. */
const TRACK_COLUMNS = `${LEVELS[1].from - LEVELS[0].from}fr ${LEVELS[2].from - LEVELS[1].from}fr ${KEY_ORDER.length - LEVELS[2].from}fr`;

/** Beginner, Intermediate and Advanced as one line with a dot where the typist is. */
export default function LevelTrack({ unlocked }: { unlocked: number }) {
  const li = levelIndex(unlocked);
  return (
    <div
      className="w-full max-w-[21rem]"
      role="img"
      aria-label={`Level: ${LEVELS[li].name}. ${unlocked} of 26 keys open.`}
      title={`You are here: ${LEVELS[li].name} (${unlocked} of 26 keys open)`}
    >
      <div className="relative">
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: TRACK_COLUMNS }}>
          {LEVELS.map((l, i) => {
            const to = i < 2 ? LEVELS[i + 1].from : 26;
            const fill = Math.max(0, Math.min(1, (unlocked - l.from) / (to - l.from)));
            return (
              <span key={l.name} className="block h-1 overflow-hidden rounded-full bg-surface-raised">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${fill * 100}%` }} />
              </span>
            );
          })}
        </div>
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface shadow-[0_0_0_3px_var(--color-accent-bg)]"
          style={{ left: `${Math.min(100, Math.max(0, ((unlocked - START_KEYS) / (KEY_ORDER.length - START_KEYS)) * 100))}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1.5 grid text-[11px]" style={{ gridTemplateColumns: TRACK_COLUMNS }} aria-hidden="true">
        {LEVELS.map((l, i) => (
          <span key={l.name} className={`text-center ${i === li ? 'font-semibold text-accent' : i < li ? 'text-text' : 'text-text-dim/60'}`}>
            {l.name}
          </span>
        ))}
      </div>
    </div>
  );
}
