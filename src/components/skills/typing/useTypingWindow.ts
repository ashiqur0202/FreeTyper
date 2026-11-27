import { useLayoutEffect, useState, type RefObject } from 'react';
import { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';

/**
 * The text shows exactly three lines. Once the typist is on the third line the text scrolls up, so the line being
 * typed stays the second one. `height` is the window height (no padding inside, so a line scrolled out of view
 * never peeks in); `scrollOffset` is how far to move the text up.
 */
export function useTypingWindow({
  charCount,
  currentIndex,
  firstCharRef,
  currentCharRef,
  boxRef,
}: {
  charCount: number;
  currentIndex: number;
  firstCharRef: RefObject<HTMLSpanElement | null>;
  currentCharRef: RefObject<HTMLSpanElement | null>;
  boxRef: RefObject<HTMLDivElement | null>;
}): { scrollOffset: number; height: number } {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  useLayoutEffect(() => {
    const current = currentCharRef.current;
    const first = firstCharRef.current;
    if (!current || !first || !charCount) {
      setScrollOffset(0);
      return;
    }
    let lh = lineHeight;
    if (lh === 0) {
      const container = boxRef.current?.querySelector('.typing-text');
      if (!container) return;
      lh = measureTypingLineHeight(container as HTMLElement);
      if (lh === 0) return;
      setLineHeight(lh);
    }
    const line = Math.round((current.offsetTop - first.offsetTop) / lh);
    setScrollOffset(line >= 2 ? (line - 1) * lh : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the refs are stable; the text and the cursor are what move it
  }, [currentIndex, lineHeight, charCount]);

  return { scrollOffset, height: typingWindowHeight(lineHeight) - 24 };
}
