import type { CodeLanguage } from './code';
import { pickWeighted, type Rand } from './rng';

/**
 * The kinds of text the Practice page can show. Every kind is typed inside the same adaptive screen, so every kind
 * counts toward the level and the keys. Mixed picks one of the other kinds for each text; Custom is the person's
 * own pasted text (not checked by us).
 */

export type PracticeSource = 'mixed' | 'sentences' | 'quotes' | 'facts' | 'code' | 'custom';
/** The kind a text really is: Mixed turns into one of the first four. */
export type TextKind = Exclude<PracticeSource, 'mixed'>;
export type CodeChoice = CodeLanguage | 'any';

export const SOURCE_TABS: { id: PracticeSource; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'sentences', label: 'Sentences' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'facts', label: 'Facts' },
  { id: 'code', label: 'Code' },
  { id: 'custom', label: 'Custom' },
];

export const CUSTOM_MAX = 5000;

const SOURCE_IDS = SOURCE_TABS.map((t) => t.id as string);
const LANGUAGES = ['any', 'js', 'python', 'sql', 'css', 'html'];

/** Plain, typable text from whatever was pasted: curly quotes and dashes made plain, whitespace collapsed, anything else dropped. */
export function cleanCustomText(raw: string): string {
  const plain = raw
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[  -  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7e]/g, '');
  return plain.trim().slice(0, CUSTOM_MAX).trim();
}

const MIX_WEIGHTS: Record<Exclude<TextKind, 'custom'>, number> = { sentences: 3, quotes: 3, facts: 3, code: 1 };

/** The kind of the next text in Mixed: never the same as the last one, and code comes up less often. */
export function nextMixedKind(prev: TextKind | null, rand: Rand = Math.random): Exclude<TextKind, 'custom'> {
  const kinds = (Object.keys(MIX_WEIGHTS) as Exclude<TextKind, 'custom'>[]).filter((k) => k !== prev);
  return pickWeighted(kinds, (k) => MIX_WEIGHTS[k], rand);
}

const PREFS_KEY = 'freetyper-practice-source';

export interface SourcePrefs {
  source: PracticeSource;
  language: CodeChoice;
}

/** Sentences first: they are built from the keys a new typist has open, while quotes, facts and code use the whole alphabet. */
export const DEFAULT_PREFS: SourcePrefs = { source: 'sentences', language: 'any' };

export function loadSourcePrefs(): SourcePrefs {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFS;
    const { source, language } = parsed as Record<string, unknown>;
    return {
      source: typeof source === 'string' && SOURCE_IDS.includes(source) ? (source as PracticeSource) : DEFAULT_PREFS.source,
      language: typeof language === 'string' && LANGUAGES.includes(language) ? (language as CodeChoice) : DEFAULT_PREFS.language,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveSourcePrefs(prefs: SourcePrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage may be blocked: the choice just is not remembered */
  }
}
