/**
 * How hard a text is to type, 1 to 10 (the same scale as the typist's text difficulty). Longer words, capitals,
 * punctuation, digits and code symbols all add to it. An estimate from the text only; it is our own measure,
 * not a standard.
 */

function count(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

export function rateDifficulty(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const letters = count(text, /[a-zA-Z]/g);
  const per100 = (n: number) => (n / Math.max(1, text.length)) * 100;
  const avgLen = letters / Math.max(1, words.length);
  const caps = per100(count(text, /[A-Z]/g));
  const punct = per100(count(text, /[.,;:!?'"()-]/g));
  const digits = per100(count(text, /[0-9]/g));
  const symbols = per100(count(text, /[^a-zA-Z0-9\s.,;:!?'"()-]/g));
  const rating = 1 + (avgLen - 3.5) * 1.1 + caps * 0.25 + punct * 0.45 + digits * 0.5 + symbols * 0.7;
  return Math.round(Math.min(10, Math.max(1, rating)) * 10) / 10;
}
