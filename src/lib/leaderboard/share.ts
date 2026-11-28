import { LEVELS, levelIndex } from '@/components/skills/typing/levelLadder';
import { dbReady, getDb } from '@/lib/db';
import { authConfigured } from '@/lib/auth';
import { sharedResult, type SharedResult } from './store';

export type RankPeriod = 'today' | 'week' | 'all';

export const rankPeriodOf = (v: string | string[] | null | undefined): RankPeriod | null => {
  const x = Array.isArray(v) ? v[0] : v;
  return x === 'today' || x === 'week' || x === 'all' ? x : null;
};

export const RANK_WORDS: Record<RankPeriod, string> = { today: 'today', week: 'this week', all: 'all time' };

export const levelName = (wpm: number) => LEVELS[levelIndex(wpm)].name;

export const lengthLabel = (seconds: number) => (seconds < 60 ? `${seconds} s` : seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`);

/** Loads a shared result for the page or its picture; null when accounts are off, the id is unknown or the score is hidden. */
export async function loadSharedResult(id: string, period: RankPeriod | null): Promise<SharedResult | null> {
  if (!authConfigured()) return null;
  await dbReady();
  try {
    return await sharedResult(getDb(), id, period);
  } catch {
    return null;
  }
}
