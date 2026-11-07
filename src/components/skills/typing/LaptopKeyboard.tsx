import type { CSSProperties } from 'react';
import { LAYOUT, SHIFTED, colorOfZone, isHomeKey, zoneOf } from './guideLayout';

// The drawn US laptop keyboard shared by every page except the Keyboard guide itself
// (which adds clicking and the hands, in KeyboardGuide.tsx). Same layout, finger colours and
// key style as the guide: it only draws keys, and the caller adds state through `look(id)`.

export type KeyLook = {
  /** Extra classes: "kg-act" (lifted + ring), "lk-ok", "lk-bad", "lk-hint", "kg-fade". */
  className?: string;
  /** Override the key colour with `--kc` (the heatmap does this). */
  color?: string;
  title?: string;
};

type Props = {
  /** Key height in px. */
  keyH: number;
  /** Total width: a number (px) or any CSS width. It never grows past its container. */
  width: number | string;
  /** Per-key state. `id` is a layout id: "a", "/", "bksp", "shiftL", " " ... */
  look?: (id: string) => KeyLook;
  /** Draw Home, End, PgUp and PgDn on the arrow keys (needs tall keys). */
  detail?: boolean;
  /** Colour every key by its finger (default) or in neutral grey. */
  fingerColors?: boolean;
  className?: string;
};

export default function LaptopKeyboard({ keyH, width, look, detail, fingerColors = true, className }: Props) {
  return (
    <div
      className={`kg-board lk${detail ? ' lk-detail' : ''}${className ? ` ${className}` : ''}`}
      style={{ width, maxWidth: '100%', '--kh': `${keyH}px` } as CSSProperties}
      role="img"
      aria-label="Keyboard"
    >
      {LAYOUT.map((row, ri) => (
        <div key={ri} className="kg-row">
          {row.map((cell, ci) => {
            const wStyle = { '--w': cell.w } as CSSProperties;
            if (cell.kind === 'idle') {
              return (
                <span key={ci} className="kg-idle" style={wStyle}>
                  {cell.sub ? <span className="kg-arrow">{cell.label}</span> : cell.label}
                  {cell.sub && <span className="kg-sub">{cell.sub}</span>}
                </span>
              );
            }
            if (cell.kind === 'arrows') {
              return (
                <span key={ci} className="kg-arrows" style={wStyle}>
                  <span className="kg-idle">
                    <span className="kg-arrow">↑</span>
                    <span className="kg-sub">PgUp</span>
                  </span>
                  <span className="kg-idle">
                    <span className="kg-arrow">↓</span>
                    <span className="kg-sub">PgDn</span>
                  </span>
                </span>
              );
            }
            const { id } = cell;
            const l = look?.(id) ?? {};
            const isWord = id.length > 1 || id === ' ';
            const symbol = SHIFTED[id];
            const label = cell.label ?? (symbol ? null : id.toUpperCase());
            const kc = l.color ?? (fingerColors ? colorOfZone(zoneOf(id)) : colorOfZone(null));
            return (
              <span
                key={ci}
                className={[
                  'kg-key',
                  isWord && 'kg-mod',
                  symbol && 'kg-sym',
                  isHomeKey(id) && 'kg-home',
                  l.className,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--kc': kc, '--w': cell.w } as CSSProperties}
                title={l.title}
              >
                {id === 'bksp' ? (
                  '⌫'
                ) : label ?? (
                  <>
                    <span className="kg-sh">{symbol}</span>
                    <span>{id}</span>
                  </>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
