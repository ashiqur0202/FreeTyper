/**
 * Gates every generated text must pass before it is shown. A failed text is thrown away and made again.
 * The checks are plain and strict: only keys the typist has open (unless told otherwise), plain ASCII, a sane
 * length, no word repeated twice in a row, and none of a short list of words we never want on screen.
 */

/** Words we never show. Kept short and obvious; every word list is also filtered with it. */
const BLOCKED = new Set([
  'damn', 'hell', 'crap', 'sex', 'sexy', 'drug', 'drugs', 'kill', 'killed', 'dead', 'death', 'die', 'died', 'gun', 'guns',
  'bomb', 'hate', 'stupid', 'idiot', 'fat', 'ugly', 'nazi', 'rape', 'slave', 'naked', 'drunk', 'beer', 'wine', 'booze',
]);

export function isBlockedWord(w: string): boolean {
  return BLOCKED.has(w.toLowerCase());
}

export interface QualityLimits {
  /** Letters the text may use (lower case). Omit for no limit (library text, code). */
  open?: ReadonlySet<string>;
  minChars?: number;
  maxChars?: number;
  /** Allow the same word twice in a row (needed when only one or two keys are open). */
  allowRepeats?: boolean;
  /** Skip the blocked-word check (library text such as quotes may hold words we would never generate). */
  allowBlockedWords?: boolean;
}

/** Why a text is not acceptable, or an empty list when it is fine. */
export function checkText(text: string, limits: QualityLimits = {}): string[] {
  const problems: string[] = [];
  if (!/^[\x20-\x7e]+$/.test(text)) problems.push('not plain ASCII');
  if (limits.minChars !== undefined && text.length < limits.minChars) problems.push('too short');
  if (limits.maxChars !== undefined && text.length > limits.maxChars) problems.push('too long');
  if (limits.open) {
    for (const ch of text.toLowerCase()) {
      if (ch >= 'a' && ch <= 'z' && !limits.open.has(ch)) {
        problems.push(`uses a locked key: ${ch}`);
        break;
      }
    }
  }
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  for (let i = 0; i < words.length; i++) {
    if (!limits.allowBlockedWords && isBlockedWord(words[i])) {
      problems.push(`blocked word: ${words[i]}`);
      break;
    }
    if (!limits.allowRepeats && i > 0 && words[i] === words[i - 1] && words[i].length > 1) {
      problems.push(`repeated word: ${words[i]}`);
      break;
    }
  }
  return problems;
}
