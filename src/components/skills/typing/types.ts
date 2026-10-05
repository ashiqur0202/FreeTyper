/** One thing worth a look in a run: a key with several mistakes, or an unusually slow letter pair. */
export interface RunSpot {
  kind: 'key' | 'pair';
  label: string;
  detail: string;
}

/** Per-run detail for the result card. Kept only with the latest few runs. */
export interface RunDetail {
  /** Net speed (WPM of correct keystrokes) over time, smoothed over about 5 s. */
  speed: number[];
  /** Raw speed (WPM of all keystrokes), smoothed over about 3 s. */
  raw: number[];
  /** Mistakes per point. */
  errors: number[];
  /** Whole seconds in the run (the curve may have fewer points than this). */
  seconds: number;
  /** 0–100, how steady the speed was. */
  consistency: number;
  spots: RunSpot[];
}

export interface TypingSession {
  id: string;
  date: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  duration: number; // seconds
  mode: 'lesson' | 'practice' | 'speed-test' | 'game';
  modeDetail?: string;
  /** Present on the latest runs only; stripped before the long history is saved. */
  run?: RunDetail;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: string;
}

export interface KeyStats {
  key: string;
  totalPresses: number;
  correctPresses: number;
  incorrectPresses: number;
  averageTime: number;
  lastPracticed: number;
}

export interface ProgressData {
  sessions: TypingSession[];
  achievements: Achievement[];
  keyStats: Record<string, KeyStats>;
  streak: {
    current: number;
    best: number;
    lastPracticeDate: string;
  };
  totalTypingTime: number;
  wordsTyped: number;
  bestWpm: number;
  bestAccuracy: number;
}

export interface TypingCharState {
  char: string;
  status: 'pending' | 'current' | 'correct' | 'incorrect';
}

/** What was typed just before a key: the previous letter in the text and the time since the last keystroke. */
export interface KeyContext {
  prev?: string;
  /** Milliseconds since the previous keystroke; undefined at the start or right after a Backspace. */
  gapMs?: number;
}

export interface TypingEngineOptions {
  text: string;
  timed?: number;
  onStart?: () => void;
  onComplete?: (result: TypingSession) => void;
  onKeyStats?: (key: string, correct: boolean, context: KeyContext) => void;
}
