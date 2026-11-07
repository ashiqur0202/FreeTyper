import type { CSSProperties } from 'react';
import { LAYOUT, SHIFTED, isHomeKey } from './guideLayout';

// The drawn US laptop keyboard shared by the live typing keyboard and the progress heatmap.
// It only draws keys: the caller decides how each key looks through `look(id)`.
// (The Keyboard guide has its own richer renderer in KeyboardGuide.tsx, same LAYOUT.)

export type KeyLook = {
  className?: string;
  style?: CSSProperties;
  title?: string;
};

type Props = {
  /** Key height in px. */
  keyH: number;
  /** Gap between keys in px. */
  gap: number;
  /** Total width: a number (px) or any CSS width. */
  width: number | string;
  /** Per-key colours and state. `id` is a layout id: "a", "/", "bksp", "shiftL", " " ... */
  look?: (id: string) => KeyLook;
  /** Draw letters as capitals (heatmap) instead of lowercase (typing). */
  capitals?: boolean;
  /** Smaller type for compact keyboards. */
  compact?: boolean;
  className?: string;
};

export default function LaptopKeyboard({ keyH, gap, width, look, capitals, compact, className }: Props) {
  const fontPx = compact ? 10 : 12;
  const half = Math.floor((keyH - 2) / 2);

  return (
    <div
      className={`lk${compact ? ' lk-compact' : ''}${className ? ` ${className}` : ''}`}
      style={{ width, maxWidth: '100%', gap, fontSize: fontPx }}
      role="img"
      aria-label="Keyboard"
    >
      {LAYOUT.map((row, ri) => (
        <div key={ri} className="lk-row" style={{ gap }}>
          {row.map((cell, ci) => {
            if (cell.kind === 'idle') {
              return (
                <div key={ci} className="key lk-key lk-idle" style={{ flex: `${cell.w} 1 0`, height: keyH }}>
                  <span>{cell.label}</span>
                </div>
              );
            }
            if (cell.kind === 'arrows') {
              return (
                <div key={ci} className="lk-arrows" style={{ flex: `${cell.w} 1 0`, height: keyH, gap: 2 }}>
                  <div className="key lk-key lk-idle" style={{ height: half }}>↑</div>
                  <div className="key lk-key lk-idle" style={{ height: half }}>↓</div>
                </div>
              );
            }
            const { id, w, label } = cell;
            const l = look?.(id) ?? {};
            const symbol = SHIFTED[id];
            const isChar = id.length === 1 && id !== ' ';
            const text = id === 'bksp' ? '⌫' : (label ?? (capitals ? id.toUpperCase() : id));
            const word = label !== undefined;
            return (
              <div
                key={ci}
                className={`key lk-key${word ? ' lk-word' : ''}${!word && isHomeKey(id) ? ' home-row' : ''}${l.className ? ` ${l.className}` : ''}`}
                style={{ flex: `${w} 1 0`, height: keyH, ...l.style }}
                title={l.title}
              >
                {symbol && isChar && !/[a-z]/.test(id) ? (
                  <span className="lk-sym">
                    <span className="lk-shift">{symbol}</span>
                    <span>{text}</span>
                  </span>
                ) : (
                  <span>{id === ' ' && !capitals ? '' : text}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
