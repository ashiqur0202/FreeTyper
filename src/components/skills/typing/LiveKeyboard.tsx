'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Full QWERTY layout with modifier keys ── */
interface KeyDef {
  id: string;       // unique id for flash/hint matching
  label: string;    // display label
  w?: number;       // width multiplier (1 = standard key)
  shift?: string;   // shift character shown above
  home?: boolean;   // home row highlight
}

const ROW_0: KeyDef[] = [
  { id: '`', label: '`', shift: '~' },
  { id: '1', label: '1', shift: '!' },
  { id: '2', label: '2', shift: '@' },
  { id: '3', label: '3', shift: '#' },
  { id: '4', label: '4', shift: '$' },
  { id: '5', label: '5', shift: '%' },
  { id: '6', label: '6', shift: '^' },
  { id: '7', label: '7', shift: '&' },
  { id: '8', label: '8', shift: '*' },
  { id: '9', label: '9', shift: '(' },
  { id: '0', label: '0', shift: ')' },
  { id: '-', label: '-', shift: '_' },
  { id: '=', label: '=', shift: '+' },
  { id: 'backspace', label: '⌫', w: 2 },
];

const ROW_1: KeyDef[] = [
  { id: 'tab', label: 'tab', w: 1.5 },
  { id: 'q', label: 'q' },
  { id: 'w', label: 'w' },
  { id: 'e', label: 'e' },
  { id: 'r', label: 'r' },
  { id: 't', label: 't' },
  { id: 'y', label: 'y' },
  { id: 'u', label: 'u' },
  { id: 'i', label: 'i' },
  { id: 'o', label: 'o' },
  { id: 'p', label: 'p' },
  { id: '[', label: '[', shift: '{' },
  { id: ']', label: ']', shift: '}' },
  { id: '\\', label: '\\', shift: '|', w: 1.5 },
];

const ROW_2: KeyDef[] = [
  { id: 'caps', label: 'caps', w: 1.75 },
  { id: 'a', label: 'a', home: true },
  { id: 's', label: 's', home: true },
  { id: 'd', label: 'd', home: true },
  { id: 'f', label: 'f', home: true },
  { id: 'g', label: 'g' },
  { id: 'h', label: 'h' },
  { id: 'j', label: 'j', home: true },
  { id: 'k', label: 'k', home: true },
  { id: 'l', label: 'l', home: true },
  { id: ';', label: ';', shift: ':' },
  { id: "'", label: "'", shift: '"' },
  { id: 'enter', label: 'enter', w: 2.25 },
];

const ROW_3: KeyDef[] = [
  { id: 'shift-l', label: 'shift', w: 2.25 },
  { id: 'z', label: 'z' },
  { id: 'x', label: 'x' },
  { id: 'c', label: 'c' },
  { id: 'v', label: 'v' },
  { id: 'b', label: 'b' },
  { id: 'n', label: 'n' },
  { id: 'm', label: 'm' },
  { id: ',', label: ',', shift: '<' },
  { id: '.', label: '.', shift: '>' },
  { id: '/', label: '/', shift: '?' },
  { id: 'shift-r', label: 'shift', w: 2.75 },
];

const ROW_4: KeyDef[] = [
  { id: 'ctrl', label: 'ctrl', w: 1.25 },
  { id: 'win', label: '⊞', w: 1.25 },
  { id: 'alt', label: 'alt', w: 1.25 },
  { id: 'space', label: '', w: 6.25 },
  { id: 'alt-r', label: 'alt', w: 1.25 },
  { id: 'win-r', label: '⊞', w: 1.25 },
  { id: 'fn', label: 'fn', w: 1.25 },
  { id: 'ctrl-r', label: 'ctrl', w: 1.25 },
];

const ALL_ROWS = [ROW_0, ROW_1, ROW_2, ROW_3, ROW_4];

// Pre-calculate total width units per row (for flex normalization)
const ROW_TOTALS = ALL_ROWS.map(row => row.reduce((sum, k) => sum + (k.w ?? 1), 0));
const MAX_TOTAL = Math.max(...ROW_TOTALS); // 15

/* Character-to-key mapping for hint highlighting */
const CHAR_TO_KEY: Record<string, string> = {};
ALL_ROWS.forEach(row => row.forEach(k => {
  if (k.id.length === 1) CHAR_TO_KEY[k.id] = k.id;
}));
Object.entries(CHAR_TO_KEY).forEach(([k]) => {
  CHAR_TO_KEY[k.toUpperCase()] = CHAR_TO_KEY[k];
});
CHAR_TO_KEY[' '] = 'space';

type KeyFlash = { key: string; correct: boolean; ts: number };

interface LiveKeyboardProps {
  nextChar?: string;
  lastKeyCorrect?: { key: string; correct: boolean } | null;
  compact?: boolean;
}

export default function LiveKeyboard({ nextChar, lastKeyCorrect, compact }: LiveKeyboardProps) {
  const [flashes, setFlashes] = useState<Map<string, KeyFlash>>(new Map());
  const cleanupRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!lastKeyCorrect) return;
    const { key, correct } = lastKeyCorrect;

    setFlashes(prev => {
      const next = new Map(prev);
      next.set(key, { key, correct, ts: Date.now() });
      return next;
    });

    if (cleanupRef.current) clearTimeout(cleanupRef.current);
    cleanupRef.current = setTimeout(() => {
      setFlashes(new Map());
    }, 400);
  }, [lastKeyCorrect]);

  const hintKey = nextChar ? (CHAR_TO_KEY[nextChar] || CHAR_TO_KEY[nextChar.toLowerCase()]) : null;

  const keyH = compact ? 32 : 40;
  const unitW = compact ? 30 : 38;
  const gap = compact ? 2 : 3;

  // Container width: based on the widest row (15 units + 13 gaps)
  const containerW = MAX_TOTAL * unitW + 13 * gap;

  return (
    <div
      className="flex flex-col items-stretch select-none mx-auto"
      style={{ width: containerW, gap }}
    >
      {ALL_ROWS.map((row, ri) => {
        const rowTotal = ROW_TOTALS[ri];
        const extraUnits = MAX_TOTAL - rowTotal;

        return (
          <div key={ri} className="flex" style={{ gap }}>
            {row.map((kd, ki) => {
              const flash = flashes.get(kd.id);
              const isHint = hintKey === kd.id;
              const isFlashCorrect = flash?.correct === true;
              const isFlashIncorrect = flash?.correct === false;
              const keyW = kd.w ?? 1;

              // Last key absorbs any extra units so the row fills full width
              const effectiveW = (ki === row.length - 1) ? keyW + extraUnits : keyW;

              let className = 'key font-mono';
              if (compact) {
                className += ' text-[10px]';
              } else {
                className += ' text-xs';
              }

              if (isFlashCorrect) {
                className += ' key-flash-correct';
              } else if (isFlashIncorrect) {
                className += ' key-flash-incorrect';
              } else if (isHint) {
                className += ' key-hint';
              } else if (kd.home) {
                className += ' home-row';
              }

              return (
                <div
                  key={kd.id}
                  className={className}
                  style={{ flex: `${effectiveW} 0 0`, height: keyH }}
                >
                  {kd.shift && kd.id.length === 1 ? (
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[0.5em] opacity-40">{kd.shift}</span>
                      <span>{kd.label}</span>
                    </span>
                  ) : (
                    <span className={kd.id.length === 1 ? '' : 'mt-0.5'}>{kd.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
