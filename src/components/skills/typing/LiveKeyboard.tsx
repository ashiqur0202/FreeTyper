'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettings } from '@/components/layout/SettingsProvider';
import LaptopKeyboard, { type KeyLook } from './LaptopKeyboard';
import { LAYOUT, UNSHIFT, shiftKeyFor } from './guideLayout';

/** Every single-character key on the drawn keyboard (layout ids). */
const CHAR_KEYS = new Set<string>();
LAYOUT.forEach((row) => row.forEach((c) => { if (c.kind === 'key' && c.id.length === 1) CHAR_KEYS.add(c.id); }));

/**
 * Work out which key a typed character lives on and whether Shift is needed.
 * 'A' -> key a + shift, '!' -> key 1 + shift, ' ' -> space, 'a' -> key a.
 * Shift is the one on the opposite hand from the key (see shiftKeyFor).
 */
function resolveChar(ch: string | undefined): { id: string; shiftId: string | null } | null {
  if (!ch) return null;
  if (ch === ' ') return { id: ' ', shiftId: null };

  let id: string | undefined;
  let shifted = false;
  if (UNSHIFT[ch]) {
    id = UNSHIFT[ch];
    shifted = true;
  } else if (ch.length === 1 && ch !== ch.toLowerCase() && CHAR_KEYS.has(ch.toLowerCase())) {
    id = ch.toLowerCase();
    shifted = true;
  } else if (CHAR_KEYS.has(ch)) {
    id = ch;
  }
  if (!id) return null;
  return { id, shiftId: shifted ? shiftKeyFor(id) : null };
}

/** How long a pressed key stays lit: quick for a hit, a little longer for a miss so it registers. */
const FLASH_OK_MS = 160;
const FLASH_BAD_MS = 260;

type KeyFlash = { key: string; correct: boolean; ts: number };

interface LiveKeyboardProps {
  nextChar?: string;
  lastKeyCorrect?: { key: string; correct: boolean } | null;
  compact?: boolean;
}

export default function LiveKeyboard({ nextChar, lastKeyCorrect, compact }: LiveKeyboardProps) {
  const { settings } = useSettings();
  const [flashes, setFlashes] = useState<Map<string, KeyFlash>>(new Map());
  // Each key's flash expires on its own timer, so fast typing never leaves a trail of lit keys.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!lastKeyCorrect) return;
    const { key, correct } = lastKeyCorrect;
    const target = resolveChar(key);
    if (!target) return;

    const ids = target.shiftId ? [target.id, target.shiftId] : [target.id];
    const ts = Date.now();
    setFlashes(prev => {
      const next = new Map(prev);
      ids.forEach(id => next.set(id, { key: id, correct, ts }));
      return next;
    });

    ids.forEach(id => {
      const old = timersRef.current.get(id);
      if (old) clearTimeout(old);
      timersRef.current.set(id, setTimeout(() => {
        timersRef.current.delete(id);
        setFlashes(prev => {
          if (!prev.has(id)) return prev;
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }, correct ? FLASH_OK_MS : FLASH_BAD_MS));
    });
  }, [lastKeyCorrect]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  // Settings → Keyboard hints: when off, the next key is not highlighted.
  const hintTarget = settings.showKeyboardHints ? resolveChar(nextChar) : null;
  const hintKey = hintTarget?.id ?? null;
  const hintShiftKey = hintTarget?.shiftId ?? null;

  const keyH = compact ? 32 : 40;
  const unitW = compact ? 30 : 38;

  const look = (id: string): KeyLook => {
    const flash = flashes.get(id);
    const isHint = hintKey === id || hintShiftKey === id;
    const isFlashCorrect = flash?.correct === true;
    const isFlashIncorrect = flash?.correct === false;

    const classes: string[] = [];
    if (isFlashCorrect) classes.push('lk-ok');
    else if (isFlashIncorrect) classes.push('lk-bad');
    else if (isHint) classes.push('lk-hint');
    return { className: classes.join(' ') };
  };

  // Same keys as the Keyboard guide but plain grey like its Ctrl/Alt keys: colours would pull the eye
  // away from the text. The next-key hint lifts and rings the key.
  return <LaptopKeyboard keyH={keyH} width={15 * unitW + 40} look={look} fingerColors={false} className="lk-plain" />;
}
