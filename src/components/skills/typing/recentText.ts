/**
 * Remembers the sentences a person has just seen, so the next test can avoid them.
 *
 * The text of a seed never changes (a challenge link must rebuild exactly what the sender typed), so
 * "no repeats" is done by choosing the seed: a new test tries a few seeds and takes the first whose
 * opening sentences were not seen lately. Only short fingerprints are kept in this browser, never text.
 */

const KEY = 'freetyper-recent-text';
/** About 100 tests of 4 sentences each. */
const MAX_KEYS = 400;

function fingerprint(sentence: string): string {
  let h = 5381;
  for (let i = 0; i < sentence.length; i++) h = (Math.imul(h, 33) ^ sentence.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Fingerprints of the first `count` sentences of a passage (the part a person actually types). */
export function sentenceKeys(text: string, count = 4): string[] {
  return text
    .split(/(?<=[.!?"]) (?=[A-Z"])/)
    .slice(0, count)
    .map(fingerprint);
}

/**
 * A seed whose opening sentences are not in `recent`. Tries up to `tries` seeds; if every one has a repeat
 * (a tiny pool, such as the code snippets) it takes the last, so a test always starts.
 */
export function pickFreshSeed(
  makeSeed: () => string,
  textFor: (seed: string) => string,
  recent: ReadonlySet<string>,
  tries = 12,
): { seed: string; text: string } {
  let seed = makeSeed();
  let text = textFor(seed);
  for (let i = 1; i < tries; i++) {
    if (!sentenceKeys(text).some((k) => recent.has(k))) break;
    seed = makeSeed();
    text = textFor(seed);
  }
  return { seed, text };
}

export function loadRecent(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Keep the newest `MAX_KEYS` fingerprints. */
export function rememberText(text: string): void {
  try {
    const kept = [...loadRecent(), ...sentenceKeys(text)];
    localStorage.setItem(KEY, JSON.stringify(kept.slice(-MAX_KEYS)));
  } catch {
    /* storage may be blocked: the test still works, it just cannot avoid repeats */
  }
}
