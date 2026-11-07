import { fingerMap, keyboardColors, homeRowKeys } from './typingData';

// Data and wording for the Keyboard guide (KeyboardGuide.tsx, GuideHands.tsx).
// The keyboard drawn here is the US laptop layout (ANSI QWERTY) without the F-row.

export const THUMB_COLOR = '#9ca3af';

export type Hand = 'left' | 'right';
export type FingerName = 'pinky' | 'ring' | 'middle' | 'index';

export const FINGER_NAMES: FingerName[] = ['pinky', 'ring', 'middle', 'index'];
// Plain-language names for beginners ("pinky" is read aloud as "little finger").
export const PLAIN_FINGER: Record<FingerName, string> = {
  pinky: 'little',
  ring: 'ring',
  middle: 'middle',
  index: 'index',
};

/** What each symbol key types while Shift is held. Letters simply become capitals. */
export const SHIFTED: Record<string, string> = {
  '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*',
  '9': '(', '0': ')', '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"',
  ',': '<', '.': '>', '/': '?',
};
/** Typed character -> key id, e.g. "?" -> "/". */
export const UNSHIFT: Record<string, string> = Object.fromEntries(
  Object.entries(SHIFTED).map(([base, shifted]) => [shifted, base]),
);

/** Keys that are not characters but are still typed by a finger. */
const SPECIAL_FINGER: Record<string, { finger: number; hand: Hand }> = {
  bksp: { finger: 0, hand: 'right' },
  enter: { finger: 0, hand: 'right' },
  tab: { finger: 0, hand: 'left' },
  caps: { finger: 0, hand: 'left' },
  shiftL: { finger: 0, hand: 'left' },
  shiftR: { finger: 0, hand: 'right' },
};

export const SPECIAL_KEYS: Record<string, { name: string; tip: string }> = {
  bksp: { name: 'Backspace', tip: 'Reach up and right with your little finger, tap, and return.' },
  enter: { name: 'Enter', tip: 'Reach right from the semicolon with your little finger, tap, and return.' },
  tab: { name: 'Tab', tip: 'Reach left and up with your little finger, tap, and return.' },
  caps: { name: 'Caps Lock', tip: 'Reach left with your little finger. Most people never need it.' },
  shiftL: { name: 'Shift', tip: 'Hold it for capitals and symbols typed with your RIGHT hand.' },
  shiftR: { name: 'Shift', tip: 'Hold it for capitals and symbols typed with your LEFT hand.' },
};

export function fingerOf(id: string): { finger: number; hand: Hand } | undefined {
  return SPECIAL_FINGER[id] ?? fingerMap[id];
}

/** Zone id such as "left-index", "right-pinky", or "thumb" for the space bar. */
export function zoneOf(id: string): string | null {
  if (id === ' ') return 'thumb';
  const f = fingerOf(id);
  return f ? `${f.hand}-${FINGER_NAMES[f.finger]}` : null;
}

export function colorOfZone(zone: string | null): string {
  if (!zone || zone === 'thumb') return THUMB_COLOR;
  return keyboardColors[zone] ?? THUMB_COLOR;
}

export const isHomeKey = (id: string) => homeRowKeys.has(id);

/** Shift is held with the hand that is NOT typing the key. */
export function shiftKeyFor(id: string): 'shiftL' | 'shiftR' {
  return fingerOf(id)?.hand === 'left' ? 'shiftR' : 'shiftL';
}

export function reachHint(id: string): string {
  if ('1234567890-=`'.includes(id)) return 'Reach up two rows from the home row, press, and come back.';
  if ("qwertyuiop[]\\".includes(id)) return 'Reach up one row from the home row, press, and come back.';
  if ('zxcvbnm,./'.includes(id)) return 'Reach down one row from the home row, press, and come back.';
  return 'This one is on the home row, so just press it.';
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---- keyboard layout (key units wide) -------------------------------------------------

export type Cell =
  | { kind: 'key'; id: string; w: number; label?: string }
  | { kind: 'idle'; w: number; label: string; sub?: string }
  | { kind: 'arrows'; w: number };

const chars = (s: string): Cell[] => [...s].map((id) => ({ kind: 'key', id, w: 1 }));
const idle = (label: string, w: number, sub?: string): Cell => ({ kind: 'idle', w, label, sub });

export const LAYOUT: Cell[][] = [
  [...chars('`1234567890-='), { kind: 'key', id: 'bksp', w: 2, label: 'Backspace' }],
  [{ kind: 'key', id: 'tab', w: 1.5, label: 'Tab' }, ...chars('qwertyuiop[]'), { kind: 'key', id: '\\', w: 1.5 }],
  [{ kind: 'key', id: 'caps', w: 1.75, label: 'Caps' }, ...chars("asdfghjkl;'"), { kind: 'key', id: 'enter', w: 2.25, label: 'Enter' }],
  [
    { kind: 'key', id: 'shiftL', w: 2.25, label: 'Shift' },
    ...chars('zxcvbnm,./'),
    { kind: 'key', id: 'shiftR', w: 2.75, label: 'Shift' },
  ],
  [
    idle('Ctrl', 1.25),
    idle('Win', 1.25),
    idle('Alt', 1.25),
    { kind: 'key', id: ' ', w: 6.25, label: 'Space' },
    idle('Alt', 1),
    idle('Ctrl', 1),
    idle('←', 1, 'Home'),
    { kind: 'arrows', w: 1 },
    idle('→', 1, 'End'),
  ],
];
