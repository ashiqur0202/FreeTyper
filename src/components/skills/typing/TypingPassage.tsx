'use client';

import type { CSSProperties, RefObject } from 'react';
import type { TypingCharState } from './types';

type WordRun = {
  start: number;
  chars: TypingCharState[];
  newline?: boolean;
  space?: boolean;
};

function groupWords(chars: TypingCharState[]): WordRun[] {
  const words: WordRun[] = [];
  let start = 0;
  let buf: TypingCharState[] = [];

  chars.forEach((c, i) => {
    if (c.char === '\n') {
      if (buf.length) {
        words.push({ start, chars: buf });
        buf = [];
      }
      words.push({ start: i, chars: [c], newline: true });
      start = i + 1;
      return;
    }
    if (c.char === ' ') {
      if (buf.length) {
        words.push({ start, chars: buf });
        buf = [];
      }
      words.push({ start: i, chars: [c], space: true });
      start = i + 1;
      return;
    }
    if (buf.length === 0) start = i;
    buf.push(c);
  });
  if (buf.length) words.push({ start, chars: buf });
  return words;
}

const MIN_LINE = 24;

/** Stable CSS line-height. Never treat a 2px underline/space offset as a new line. */
export function measureTypingLineHeight(container: HTMLElement): number {
  const computed = parseFloat(getComputedStyle(container).lineHeight);
  if (Number.isFinite(computed) && computed >= MIN_LINE) return computed;

  const fontSize = parseFloat(getComputedStyle(container).fontSize) || 18;
  const minDelta = fontSize * 0.9;
  const nodes = container.querySelectorAll('.char');
  for (let i = 1; i < nodes.length; i++) {
    const delta =
      (nodes[i] as HTMLElement).offsetTop - (nodes[i - 1] as HTMLElement).offsetTop;
    if (delta >= minDelta) return delta;
  }
  return fontSize * 1.625;
}

export function typingWindowHeight(lineHeight: number): number {
  const lh = lineHeight > 0 ? lineHeight : 36;
  return Math.max(112, lh * 3 + 24);
}

interface TypingPassageProps {
  chars: TypingCharState[];
  currentIndex: number;
  firstCharRef: RefObject<HTMLSpanElement | null>;
  currentCharRef: RefObject<HTMLSpanElement | null>;
  className?: string;
  style?: CSSProperties;
}

export default function TypingPassage({
  chars,
  currentIndex,
  firstCharRef,
  currentCharRef,
  className = '',
  style,
}: TypingPassageProps) {
  const words = groupWords(chars);

  return (
    <div
      className={`typing-text text-lg tracking-wide ${className}`}
      style={style}
    >
      {words.map((word) => {
        if (word.newline) {
          return <br key={`br-${word.start}`} />;
        }

        const bindRef = (gi: number) => (el: HTMLSpanElement | null) => {
          if (gi === 0) firstCharRef.current = el;
          if (gi === currentIndex) currentCharRef.current = el;
        };

        if (word.space) {
          const c = word.chars[0];
          return (
            <span
              key={word.start}
              ref={bindRef(word.start)}
              className={`char space ${c.status}`}
            >
              {' '}
            </span>
          );
        }

        return (
          <span key={word.start} className="word">
            {word.chars.map((c, i) => {
              const gi = word.start + i;
              return (
                <span key={gi} ref={bindRef(gi)} className={`char ${c.status}`}>
                  {c.char}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
