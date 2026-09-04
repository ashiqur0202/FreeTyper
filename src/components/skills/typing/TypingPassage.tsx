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

/** Line box height from the first wrap among character spans (not word wrappers). */
export function measureTypingLineHeight(container: HTMLElement): number {
  const nodes = container.querySelectorAll('.char');
  for (let i = 1; i < nodes.length; i++) {
    const prevTop = (nodes[i - 1] as HTMLElement).offsetTop;
    const currTop = (nodes[i] as HTMLElement).offsetTop;
    if (currTop > prevTop) return currTop - prevTop;
  }
  return 0;
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
      className={`typing-text text-lg leading-relaxed tracking-wide ${className}`}
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
