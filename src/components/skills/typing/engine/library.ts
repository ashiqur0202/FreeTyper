import { KEY_ORDER, openKeys, planOf, type SmartState } from '../smartEngine';
import { QUOTES } from './library/quotes';
import { FACTS } from './library/facts';
import { rateDifficulty } from './rating';
import { pickWeighted, type Rand } from './rng';

/**
 * Chooses which checked text the quotes and facts tabs show next. The texts themselves never change; the choice
 * follows the typist: texts that use their focus keys, that are about as long as their level fills (one, two or
 * three lines) and about as hard as their text difficulty. Quotes and facts are fixed, checked libraries (see
 * library/quotes.ts and library/facts.ts); nothing here writes a quote or a fact.
 */

export interface LibraryItem {
  id: string;
  text: string;
  kind: 'quote' | 'fact';
  /** Who it comes from, short ("Jane Austen, Pride and Prejudice"). */
  credit: string;
}

export function quoteItems(): LibraryItem[] {
  return QUOTES.map((q) => ({
    id: q.id,
    text: q.text,
    kind: 'quote' as const,
    credit: `${q.author}, ${q.work}${q.note ? ` (${q.note})` : ''}`,
  }));
}

export function factItems(): LibraryItem[] {
  return FACTS.map((f) => ({ id: f.id, text: f.text, kind: 'fact' as const, credit: f.source.title }));
}

export interface PassageChoice {
  /** The ids of the items joined into the text (one for a short level, up to three for a long one). */
  ids: string[];
  text: string;
  /** One or two short sentences for under the text: why it was picked, and where it comes from. */
  note: string;
}

const RECENT_KEY = 'freetyper-recent-passages';
const RECENT_MAX = 12;

function count(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

function chooseOne(
  pool: LibraryItem[],
  state: SmartState,
  targetChars: number,
  avoid: string[],
  rand: Rand,
): { item: LibraryItem; lockedShare: number } {
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
    const fresh = avoid.includes(p.id) ? 0.05 : 1;
    return { item: p, lockedShare, utility: Math.pow(avgWeight, 1.5) * lenFit * diffFit * (1 - 0.5 * lockedShare) * fresh };
  });
  return pickWeighted(scored, (s) => s.utility, rand);
}

/**
 * `targetChars` is how many letters the typist's level fills (see segmentLines in smartEngine). `recent` holds the
 * ids shown lately: they are strongly (not completely) avoided, so a small library still works. When one item is
 * much shorter than the level asks for (Intermediate and Advanced fill two and three lines), up to two more
 * items are joined after it, each chosen the same way for the length that is left.
 */
export function pickPassage(
  pool: LibraryItem[],
  state: SmartState,
  targetChars: number,
  recent: string[],
  rand: Rand = Math.random,
): PassageChoice {
  const picked: LibraryItem[] = [];
  let lockedWorst = 0;
  let text = '';
  while (picked.length < 3 && (picked.length === 0 || text.length < targetChars * 0.7)) {
    const avoid = [...recent, ...picked.map((x) => x.id)];
    const c = chooseOne(pool, state, Math.max(40, targetChars - text.length), avoid, rand);
    if (picked.some((x) => x.id === c.item.id)) break;
    picked.push(c.item);
    lockedWorst = Math.max(lockedWorst, c.lockedShare);
    text = picked.map((x) => x.text).join(' ');
  }

  const plan = planOf(state);
  const personalised = state.rounds > 0 || Object.keys(state.keys).length > 0;
  let note = '';
  if (personalised) {
    const lower = text.toLowerCase();
    const hits = plan.focus.filter((k) => count(lower, new RegExp(k, 'g')) >= 2).slice(0, 3);
    note = hits.length ? `Picked for you: it has your focus keys ${hits.map((k) => k.toUpperCase()).join(', ')}.` : 'Picked to fit your level.';
    if (state.unlocked < KEY_ORDER.length && lockedWorst > 0.15) note += ' It uses some keys you have not opened yet.';
  }
  const credits = picked.map((x) => x.credit).join('; ');
  const credit = picked[0].kind === 'quote' ? `${picked.length > 1 ? 'Quotes' : 'Quote'}: ${credits}.` : `Checked against Wikipedia: ${credits}.`;
  return { ids: picked.map((x) => x.id), text, note: note ? `${note} ${credit}` : credit };
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
