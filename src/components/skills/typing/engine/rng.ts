/**
 * Small helpers every generator shares: a seeded random source (same seed, same text, on every device) and
 * weighted picking. The seed function is the same one the speed test generator uses, so a seed means the same
 * thing everywhere.
 */

export type Rand = () => number;

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded random source. */
export function seeded(seed: string): Rand {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickOne<T>(items: readonly T[], rand: Rand): T {
  return items[Math.floor(rand() * items.length)];
}

/** Picks one item with probability proportional to its weight. Items with weight 0 or less are never picked unless all are. */
export function pickWeighted<T>(items: readonly T[], weight: (x: T) => number, rand: Rand): T {
  let sum = 0;
  const ws = items.map((x) => {
    const w = Math.max(0, weight(x));
    sum += w;
    return w;
  });
  if (sum <= 0) return items[Math.floor(rand() * items.length)];
  let r = rand() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function shuffled<T>(items: readonly T[], rand: Rand): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
