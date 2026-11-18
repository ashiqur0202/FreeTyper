import { practiceTexts } from './typingData';
import { wordPools } from './gameData';
import { seededRandom } from './dailyChallenge';

export type TextMode = 'words' | 'sentences' | 'code';

/**
 * Words to build for a run of `seconds`: 5 per second (a 300 WPM budget), so a
 * 1-minute test builds 300 words, not the 1,500 a long run needs. Every character
 * is a DOM element, so a shorter passage makes the first load much lighter.
 * Runs of 5 minutes or more get the same amount as before; the timer still ends the test.
 */
function wordBudget(seconds: number, max: number): number {
  return Math.min(max, Math.max(300, Math.round(seconds * 5)));
}

/** Fisher-Yates: a fair shuffle driven by `rand`, so a seeded source gives the same order every time. */
function shuffled<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The passage for a speed test of `seconds` in `mode`. `rand` decides the order; the default is Math.random. */
export function generateTestText(mode: TextMode, seconds = 60, rand: () => number = Math.random): string {
  if (mode === 'words') {
    const pool = [...wordPools.easy, ...wordPools.medium];
    const out: string[] = [];
    const wanted = wordBudget(seconds, 2000);
    while (out.length < wanted) out.push(...shuffled(pool, rand));
    return out.slice(0, wanted).join(' ');
  }
  if (mode === 'code') {
    const codeTexts = practiceTexts.filter((p) => p.category === 'code');
    const chunks: string[] = [];
    const wantedWords = Math.min(800, Math.max(200, Math.round(wordBudget(seconds, 800) * 0.6)));
    while (chunks.join(' ').split(/\s+/).length < wantedWords) {
      chunks.push(...shuffled(codeTexts, rand).map((p) => p.text));
      if (codeTexts.length === 0) break;
    }
    return chunks.join(' ');
  }
  const proseTexts = practiceTexts.filter((p) => p.category !== 'code');
  const chunks: string[] = [];
  const wantedProse = wordBudget(seconds, 1500);
  while (chunks.join(' ').split(/\s+/).length < wantedProse) {
    chunks.push(...shuffled(proseTexts, rand).map((p) => p.text));
    if (proseTexts.length === 0) break;
  }
  return chunks.join(' ');
}

/**
 * The same passage for the same seed, mode and length, on any device. Every speed test is built this way
 * (with a fresh seed), so a finished run can be sent as a challenge link: the friend's page rebuilds the text
 * from the link's seed, mode and length.
 */
export function seededTestText(mode: TextMode, seconds: number, seed: string): string {
  return generateTestText(mode, seconds, seededRandom(`freetyper-test-${mode}-${seconds}-${seed}`));
}
