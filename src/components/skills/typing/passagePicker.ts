import { KEY_ORDER, openKeys, planOf, type SmartState } from './smartEngine';

/**
 * Chooses which fixed passage the quotes, news, code and fun tabs show next. The passages themselves do not
 * change; the choice follows the typist: passages that use their focus keys, that are about as long as their
 * level asks for (one, two or three lines) and about as hard as their text difficulty. Pure functions plus a
 * small "recently shown" list. The rules are described in the Practice guide; keep both in step.
 */

type Rand = () => number;

export interface PassageChoice {
  id: string;
  text: string;
  /** One short sentence for under the text, or '' when there is no history to personalise from yet. */
  note: string;
}

const RECENT_KEY = 'freetyper-recent-passages';
const RECENT_MAX = 8;

function count(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

/**
 * How hard a passage is to type, 1 to 10 (the same scale as the text difficulty): longer words, capitals,
 * punctuation, digits and code symbols all add to it. An estimate from the text only; it is our own measure.
 */
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

function pickWeighted<T>(items: T[], weight: (x: T) => number, rand: Rand): T {
  let sum = 0;
  const ws = items.map((x) => {
    const w = weight(x);
    sum += w;
    return w;
  });
  let r = rand() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * `targetChars` is how many letters the typist's level fills (see segmentLines in smartEngine). `recent` holds the
 * ids shown lately: they are strongly (not completely) avoided, so a tiny pool still works.
 */
export function pickPassage(
  pool: { id: string; text: string }[],
  state: SmartState,
  targetChars: number,
  recent: string[],
  rand: Rand = Math.random,
): PassageChoice {
  const plan = planOf(state);
  const open = new Set(openKeys(state));
  const weightOfKey = (k: string) =>
    plan.fresh.includes(k) ? 4 : plan.focus.includes(k) ? 5 : plan.almost.includes(k) ? 2.5 : plan.review.includes(k) ? 2 : open.has(k) ? 1 : 0.6;

  const scored = pool.map((p) => {
    const lower = p.text.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    let locked = 0;
    for (const ch of lower) {
      sum += weightOfKey(ch);
      if (!open.has(ch)) locked++;
    }
    const lockedShare = locked / Math.max(1, lower.length);
    const avgWeight = sum / Math.max(1, lower.length);
    const lenFit = Math.exp(-1.5 * Math.pow((p.text.length - targetChars) / Math.max(60, targetChars), 2));
    const diffFit = Math.exp(-Math.pow(rateDifficulty(p.text) - state.difficulty, 2) / 12);
    const fresh = recent.includes(p.id) ? 0.05 : 1;
    const utility = Math.pow(avgWeight, 1.5) * lenFit * diffFit * (1 - 0.5 * lockedShare) * fresh;
    return { p, utility, lockedShare };
  });

  const chosen = pickWeighted(scored, (s) => s.utility, rand);
  const personalised = state.rounds > 0 || Object.keys(state.keys).length > 0;
  let note = '';
  if (personalised) {
    const lower = chosen.p.text.toLowerCase();
    const hits = plan.focus.filter((k) => count(lower, new RegExp(k, 'g')) >= 2).slice(0, 3);
    note = hits.length
      ? `Picked for you: it has your focus keys ${hits.map((k) => k.toUpperCase()).join(', ')}.`
      : 'Picked to fit your level.';
    if (state.unlocked < KEY_ORDER.length && chosen.lockedShare > 0.15) note += ' It uses some keys you have not opened yet.';
  }
  return { id: chosen.p.id, text: chosen.p.text, note };
}

export function loadRecentPassages(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberPassage(id: string): void {
  try {
    const kept = [...loadRecentPassages().filter((x) => x !== id), id];
    localStorage.setItem(RECENT_KEY, JSON.stringify(kept.slice(-RECENT_MAX)));
  } catch {
    /* storage may be blocked: the passage still shows, it just may repeat sooner */
  }
}
