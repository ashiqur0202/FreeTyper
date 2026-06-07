export type Difficulty = 'easy' | 'medium' | 'hard';

export const wordPools: Record<Difficulty, string[]> = {
  easy: [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy',
    'did', 'let', 'put', 'say', 'she', 'too', 'use', 'dad', 'mom', 'run',
    'big', 'end', 'far', 'few', 'got', 'job', 'man', 'top', 'red', 'set',
    'try', 'ask', 'age', 'air', 'arm', 'art', 'bed', 'bit', 'box', 'buy',
  ],
  medium: [
    'about', 'after', 'again', 'begin', 'below', 'build', 'carry', 'clean',
    'close', 'could', 'cover', 'cross', 'dance', 'doubt', 'dream', 'drink',
    'drive', 'early', 'earth', 'eight', 'enjoy', 'enter', 'equal', 'every',
    'exist', 'field', 'fight', 'final', 'first', 'floor', 'force', 'found',
    'front', 'glass', 'going', 'great', 'green', 'group', 'guard', 'guess',
    'happy', 'heart', 'heavy', 'horse', 'hotel', 'house', 'human', 'image',
    'inner', 'judge', 'known', 'large', 'laugh', 'learn', 'leave', 'level',
    'light', 'limit', 'lunch', 'magic', 'major', 'match', 'metal', 'might',
    'money', 'month', 'moral', 'mouth', 'movie', 'music', 'night', 'noise',
    'north', 'novel', 'ocean', 'offer', 'order', 'other', 'paint', 'panel',
  ],
  hard: [
    'absolute', 'abstract', 'academic', 'accepted', 'accident', 'accurate',
    'achieved', 'acquired', 'activity', 'actually', 'addition', 'adequate',
    'adjusted', 'advanced', 'affected', 'afforded', 'agencies', 'although',
    'altogether', 'analysis', 'announce', 'anything', 'anywhere', 'apparent',
    'appealed', 'approach', 'approved', 'argument', 'arranged', 'articles',
    'assessed', 'assigned', 'assuming', 'attached', 'attacked', 'attempts',
    'attended', 'audience', 'autonomy', 'balanced', 'bathroom', 'becoming',
    'behavior', 'believed', 'belonged', 'benefits', 'birthday', 'blocking',
    'borrowed', 'boundary', 'brothers', 'building', 'business', 'calendar',
    'campaign', 'capacity', 'captured', 'category', 'cautious', 'ceremony',
    'chairman', 'champion', 'changing', 'chapters', 'charging', 'chemical',
    'children', 'choosing', 'circular', 'civilians', 'climbing', 'coaching',
    'collapse', 'colonial', 'combined', 'comeback', 'commerce', 'communal',
    'compared', 'compiler', 'complete', 'composed', 'compound', 'computer',
    'concepts', 'conclude', 'concrete', 'conflict', 'congress', 'conquest',
    'consider', 'constant', 'consumer', 'contains', 'continue', 'contract',
    'contrast', 'controls', 'converts', 'convince', 'corridor', 'counties',
    'coupling', 'coverage', 'creating', 'creative', 'criminal', 'criteria',
    'critical', 'crossing', 'cultural', 'currency', 'customer', 'database',
    'deadline', 'december', 'deciding', 'decision', 'declared', 'declined',
    'decrease', 'defended', 'defining', 'delicate', 'delivery', 'demanded',
    'democrat', 'departed', 'depicted', 'deployed', 'deposits', 'deputies',
    'deriving', 'describe', 'designed', 'designer', 'desired', 'detailed',
    'detected', 'develop', 'dialogue', 'diamonds', 'dictator', 'directed',
    'directly', 'director', 'disabled', 'disaster', 'discover', 'disorder',
    'dispatch', 'disposal', 'disposed', 'dissolve', 'distance', 'distinct',
    'district', 'division', 'doctrine', 'document', 'domestic', 'dominant',
    'doubtful', 'download', 'dramatic', 'drawings', 'drinking', 'dropping',
    'duration', 'dynamics', 'earnings', 'economic', 'educated', 'election',
    'electric', 'elevated', 'eligible', 'embedded', 'emerging', 'emission',
    'emotions', 'emphasis', 'employed', 'employee', 'employer', 'enclosed',
    'encoding', 'endpoint', 'engaging', 'engineer', 'enormous', 'enrolled',
    'ensuring', 'entirely', 'entrance', 'envelope', 'equality', 'equation',
    'equipped', 'estimate', 'evaluate', 'evidence', 'examined', 'examples',
    'exceeded', 'exchange', 'exciting', 'excluded', 'executed', 'exercise',
    'exhibits', 'expanded', 'expected', 'expedite', 'explicit', 'explored',
    'exported', 'extended', 'external', 'extracts', 'extreme', 'facility',
    'faithful', 'familiar', 'favorite', 'feasible', 'featured', 'feedback',
    'festival', 'filename', 'filtered', 'finished', 'firmware', 'flexible',
    'floating', 'focusing', 'followed', 'football', 'forecast', 'forestry',
    'formally', 'formerly', 'formulas', 'fortress', 'founding', 'fraction',
    'fragment', 'frampton', 'frequent', 'friendly', 'frontier', 'fulfill',
    'fully', 'function', 'generate', 'generous', 'genetics', 'genocide',
  ],
};

export interface FallingWordTier {
  tier: number;
  speed: number;
  minWords: number;
  maxWords: number;
  difficulties: Difficulty[];
  wordsToAdvance: number;
}

export const fallingWordsTiers: FallingWordTier[] = [
  { tier: 1, speed: 0.5, minWords: 1, maxWords: 1, difficulties: ['easy'], wordsToAdvance: 10 },
  { tier: 2, speed: 0.7, minWords: 1, maxWords: 2, difficulties: ['easy'], wordsToAdvance: 10 },
  { tier: 3, speed: 0.9, minWords: 1, maxWords: 2, difficulties: ['easy', 'medium'], wordsToAdvance: 12 },
  { tier: 4, speed: 1.1, minWords: 2, maxWords: 2, difficulties: ['easy', 'medium'], wordsToAdvance: 12 },
  { tier: 5, speed: 1.3, minWords: 2, maxWords: 3, difficulties: ['medium'], wordsToAdvance: 15 },
  { tier: 6, speed: 1.5, minWords: 2, maxWords: 3, difficulties: ['medium'], wordsToAdvance: 15 },
  { tier: 7, speed: 1.7, minWords: 3, maxWords: 3, difficulties: ['medium', 'hard'], wordsToAdvance: 18 },
  { tier: 8, speed: 2.0, minWords: 3, maxWords: 4, difficulties: ['medium', 'hard'], wordsToAdvance: 18 },
  { tier: 9, speed: 2.3, minWords: 4, maxWords: 4, difficulties: ['hard'], wordsToAdvance: 20 },
  { tier: 10, speed: 2.7, minWords: 4, maxWords: 5, difficulties: ['hard'], wordsToAdvance: 999 },
];

export interface WordAttackRound {
  round: number;
  duration: number;
  wordCount: number;
  difficulties: Difficulty[];
  timePerWord: number;
  basePoints: number;
}

export const wordAttackRounds: WordAttackRound[] = [
  { round: 1, duration: 30, wordCount: 5, difficulties: ['easy'], timePerWord: 6, basePoints: 10 },
  { round: 2, duration: 30, wordCount: 6, difficulties: ['easy'], timePerWord: 5, basePoints: 15 },
  { round: 3, duration: 30, wordCount: 6, difficulties: ['easy', 'medium'], timePerWord: 5, basePoints: 20 },
  { round: 4, duration: 35, wordCount: 7, difficulties: ['medium'], timePerWord: 5, basePoints: 25 },
  { round: 5, duration: 35, wordCount: 7, difficulties: ['medium'], timePerWord: 5, basePoints: 30 },
  { round: 6, duration: 40, wordCount: 8, difficulties: ['medium', 'hard'], timePerWord: 5, basePoints: 35 },
  { round: 7, duration: 40, wordCount: 8, difficulties: ['hard'], timePerWord: 5, basePoints: 40 },
  { round: 8, duration: 45, wordCount: 10, difficulties: ['hard'], timePerWord: 4.5, basePoints: 50 },
];

export const scoringRules = {
  basePoints: { easy: 10, medium: 25, hard: 50 },
  comboMultipliers: [1, 1.5, 2, 2.5, 3],
  speedBonusThreshold: 2, // seconds
  speedBonusMultiplier: 1.5,
  maxComboMultiplier: 3,
};

export function getRandomWord(difficulty: Difficulty): string {
  const pool = wordPools[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomWords(count: number, difficulties: Difficulty[]): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    words.push(getRandomWord(diff));
  }
  return words;
}

export function getWordDifficulty(word: string): Difficulty {
  if (word.length <= 4) return 'easy';
  if (word.length <= 6) return 'medium';
  return 'hard';
}
