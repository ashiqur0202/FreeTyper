import { practiceTexts } from './typingData';
import { seededRandom } from './dailyChallenge';
import { DEFAULT_TEXT_LEVEL, generateSentences, generateWords, type TextLevel } from './textGenerator';

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

/** Code snippets are fixed text (a code generator may come later): shuffled, joined until long enough. */
function codeText(seconds: number, rand: () => number): string {
  const codeTexts = practiceTexts.filter((p) => p.category === 'code');
  const chunks: string[] = [];
  const wantedWords = Math.min(800, Math.max(200, Math.round(wordBudget(seconds, 800) * 0.6)));
  while (chunks.join(' ').split(/\s+/).length < wantedWords) {
    chunks.push(...shuffled(codeTexts, rand).map((p) => p.text));
    if (codeTexts.length === 0) break;
  }
  return chunks.join(' ');
}

/**
 * The same text for the same seed, mode, length and level, on any device. Sentences and words are made fresh by
 * `textGenerator` (never a fixed passage); code uses the fixed snippets. Every speed test is built this way
 * (with a new seed), so a finished run can be sent as a challenge link: the friend's page rebuilds the text
 * from the link's seed, mode, length and level.
 */
export function seededTestText(mode: TextMode, seconds: number, seed: string, level: TextLevel = DEFAULT_TEXT_LEVEL): string {
  if (mode === 'sentences') return generateSentences(`${seed}|${seconds}`, level, wordBudget(seconds, 1500));
  if (mode === 'words') return generateWords(`${seed}|${seconds}`, level, wordBudget(seconds, 2000));
  return codeText(seconds, seededRandom(`freetyper-test-code-${seconds}-${seed}`));
}

/** A text from a random source, without a seed to send (the generator needs a seed, so it is drawn from `rand`). */
export function generateTestText(
  mode: TextMode,
  seconds = 60,
  rand: () => number = Math.random,
  level: TextLevel = DEFAULT_TEXT_LEVEL,
): string {
  if (mode === 'code') return codeText(seconds, rand);
  return seededTestText(mode, seconds, Math.floor(rand() * 0xffffffff).toString(36), level);
}
