import { LEVELS, bandFill, levelIndex, nextStep } from './levelLadder';

const SOURCE_NOTE =
  "FreeTyper's own labels, not a standard. Study mean 51.56 WPM (Dhakal et al., CHI 2018).";

interface LevelLadderProps {
  net: number;
  /** Average net WPM of the user's earlier speed tests, or null when there are too few. */
  avg: number | null;
}

/** Beginner-to-Elite ladder with a pin at the user's net speed, and one caption line. */
export default function LevelLadder({ net, avg }: LevelLadderProps) {
  const current = levelIndex(net);
  const next = nextStep(net);
  const nextText = next ? `+${next.gap} to ${next.name}` : 'top level';
  const name = LEVELS[current].name;
  const avgBand = avg === null ? -1 : levelIndex(avg);

  return (
    <div className="mt-4" data-result-ladder>
      <div
        role="img"
        aria-label={`Level ladder: ${net} net words per minute, ${name}, ${nextText}`}
        className="grid grid-cols-5 gap-1 pt-6"
      >
        {LEVELS.map((level, i) => {
          const fill = bandFill(net, i);
          const isCurrent = i === current;
          const pinLeft = Math.max(18, Math.min(82, Math.round(fill * 100)));
          return (
            <div key={level.key} className="relative min-w-0">
              {isCurrent && (
                <span
                  className="absolute bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-text-bright px-1.5 py-0.5 font-mono text-[10px] font-bold text-surface"
                  style={{ left: `${pinLeft}%` }}
                >
                  You {net}
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-text-bright" />
                </span>
              )}
              <div className="relative h-2.5 rounded-full bg-surface-border">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-accent ${isCurrent ? '' : 'opacity-50'}`}
                  style={{ width: `${Math.round(fill * 100)}%` }}
                />
                {i === avgBand && avg !== null && (
                  <span
                    className="absolute -top-px h-3 border-l-2 border-dotted border-text-bright"
                    style={{ left: `${Math.round(bandFill(avg, i) * 100)}%` }}
                    title={`Your average, ${avg} WPM`}
                  />
                )}
              </div>
              <p
                className={`mt-1 whitespace-nowrap text-center text-[10px] leading-tight ${
                  isCurrent ? 'font-bold text-text-bright' : 'text-text-dim'
                }`}
              >
                {level.name}
                <span className="block font-mono text-[9px] opacity-80">{level.threshold}</span>
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-text-dim">
        <strong className="font-medium text-text-bright">{name}</strong>
        <span> · {nextText}</span>
        {avg !== null && <span> · avg {avg}</span>}
        <span> · </span>
        <span title={SOURCE_NOTE} className="cursor-help underline decoration-dotted underline-offset-2">
          FreeTyper levels
        </span>
      </p>
    </div>
  );
}
