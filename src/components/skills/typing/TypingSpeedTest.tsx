'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { RotateCcw, Settings2, X, Maximize, Minimize, PenTool, Swords } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { isLoggedIn, rankVerdict, submitRun, type RunRank } from '@/lib/leaderboard/client';
import { withoutRun } from './runStats';
import { recordPair } from './pairStats';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import { useKeySound } from './useKeySound';
import { trackEvent } from '@/lib/analytics';
import DailyPanel from './DailyPanel';
import ChallengePanel from './ChallengePanel';
import ChallengeSendButton from './ChallengeSendButton';
import TestFinished from './TestFinished';
import { CHALLENGE_SECONDS, buildChallengeUrl, newSeed, parseChallenge, type Challenge } from './challengeLink';
import { TEST_TEXT_VERSION, seededTestText, type TextMode } from './testText';
import { DEFAULT_TEXT_LEVEL, TEXT_LEVELS, normalizeLevel, type TextLevel } from './textGenerator';
import { loadRecent, pickFreshSeed, rememberText } from './recentText';
import {
  challengeText,
  dailyText,
  loadDaily,
  recordDailyRun,
  utcDateKey,
  type DailyStore,
} from './dailyChallenge';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import { ignoresTyping } from './typingTarget';
import {
  NUMBER_ROW_MODES,
  digitOfKey,
  digitSpeeds,
  nextKeyHint,
  numberRowText,
  type NumberRowMode,
} from './numberRow';
import DigitStrip from './DigitStrip';
import { useSettings } from '@/components/layout/SettingsProvider';
import PracticeFeedback, {
  speedTestCoachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';
import PracticeStrip from './PracticeStrip';
import { saveSourcePrefs, loadSourcePrefs, type CodeChoice } from './engine/sources';
import { CODE_LANGUAGE_NAMES, type CodeLanguage } from './engine/code';

const TEXT_MODES: { id: TextMode; label: string }[] = [
  { id: 'standard', label: 'standard' },
  { id: 'words', label: 'words' },
  { id: 'sentences', label: 'sentences' },
  { id: 'quotes', label: 'quotes' },
  { id: 'facts', label: 'facts' },
  { id: 'code', label: 'code' },
  { id: 'mixed', label: 'mixed' },
];

/** One line under the text before a test starts: what this kind of text is. */
const TEXT_MODE_NOTES: Record<TextMode, string> = {
  standard: 'Everyday English: sentences, quotes and facts. No code.',
  words: 'Common English words in random order.',
  sentences: 'Made-up everyday sentences.',
  quotes: 'Checked quotes from public-domain books. A long test can repeat them.',
  facts: 'Short facts, each checked against Wikipedia. A long test can repeat them.',
  code: 'Short code made fresh each time.',
  mixed: 'Sentences, quotes, facts and code, one after another.',
};

interface DurationOption {
  seconds: number;
  label: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { seconds: 15, label: '15s' },
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1m' },
  { seconds: 120, label: '2m' },
  { seconds: 180, label: '3m' },
  { seconds: 300, label: '5m' },
  { seconds: 600, label: '10m' },
  { seconds: 900, label: '15m' },
  { seconds: 1800, label: '30m' },
];

/** The text difficulty saved in settings, read straight from storage (the settings load a moment after the first render). */
function storedTextLevel(): TextLevel {
  try {
    return normalizeLevel((JSON.parse(localStorage.getItem('freetyper-settings') ?? '{}') as { textLevel?: unknown }).textLevel);
  } catch {
    return DEFAULT_TEXT_LEVEL;
  }
}

/**
 * A new text with a fresh seed, remembered in `seedRef` so the finished run can be sent as a challenge link. The seed is
 * chosen so the opening sentences are ones the person has not seen lately; the text of a seed itself never changes.
 */
function freshTest(language: CodeChoice, seedRef: { current: string | null }, mode: TextMode, seconds: number, level: TextLevel): string {
  const { seed, text } = pickFreshSeed(newSeed, (s) => seededTestText(mode, seconds, s, level, TEST_TEXT_VERSION, language), loadRecent());
  seedRef.current = seed;
  rememberText(text);
  return text;
}

const LOG_KEY = 'freetyper-speed-log';
// The daily challenge keeps its own list, so its card does not mix with free-choice tests.
const DAILY_LOG_KEY = 'freetyper-daily-log';
// So does the number row test: digit speeds would mislead next to normal text.
const NUMBER_ROW_LOG_KEY = 'freetyper-number-row-log';
const LOG_MAX = 5;

function loadSpeedLog(key: string = LOG_KEY): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeLogEntry[];
    if (!Array.isArray(parsed)) return [];
    const trimmed = parsed.slice(0, LOG_MAX).map((raw, i, arr) => {
      // A saved run without a text level cannot be rebuilt as the same text, so it cannot be sent as a challenge.
      const { share, ...rest } = raw;
      const entry: PracticeLogEntry = share && typeof share.level === 'number' ? raw : rest;
      if (entry.headline && entry.tone) return entry;
      return { ...entry, ...speedTestCoachNote(entry, arr[i + 1], arr.slice(i + 1)) };
    });
    if (parsed.length > LOG_MAX) {
      try {
        localStorage.setItem(key, JSON.stringify(trimmed));
      } catch {
        /* ignore */
      }
    }
    return trimmed;
  } catch {
    return [];
  }
}

export default function TypingSpeedTest({
  initialDuration = 60,
  daily = false,
  challenge = false,
  numberRow = false,
}: {
  initialDuration?: number;
  /** Number row test: digits (and the shifted symbols above them) instead of prose. Own result list, not saved to progress. */
  numberRow?: boolean;
  /** Daily challenge: a fixed 60 s run on the passage chosen by today's UTC date. */
  daily?: boolean;
  /** Challenge link: a fixed 60 s run on the passage chosen by the link's seed, compared with the sender's score. */
  challenge?: boolean;
}) {
  const [duration, setDuration] = useState(initialDuration);
  const fixedRun = daily || challenge;
  const [challengeInfo, setChallengeInfo] = useState<Challenge | null>(null);
  const [challengeRun, setChallengeRun] = useState<{ wpm: number; accuracy: number } | null>(null);
  const challengeRef = useRef<Challenge | null>(null);
  // Seed of the passage on screen; each finished speed test keeps it (`share`), so "challenge a friend" can turn any listed run into a link.
  const textSeedRef = useRef<string | null>(null);
  // The code language of a code test: part of the text's seed and of a challenge link. Remembered with the one Practice uses.
  const [codeLanguage, setCodeLanguageState] = useState<CodeChoice>('any');
  const codeLanguageRef = useRef<CodeChoice>('any');
  useEffect(() => {
    const saved = loadSourcePrefs().language;
    codeLanguageRef.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, so it must run after hydration
    setCodeLanguageState(saved);
  }, []);
  const [dailyKey, setDailyKey] = useState<string | null>(null);
  const [dailyStore, setDailyStore] = useState<DailyStore>({});
  const dailyRef = useRef<string | null>(null);
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  // The newest run beat every earlier run in the card list: a good moment to offer a challenge.
  const newBest = log.length > 1 && log[0].wpm > Math.max(...log.slice(1).map((r) => r.wpm));
  const [toasts, setToasts] = useState<Achievement[]>([]);
  // The box over the text when a test ends; closing it leaves a one-line "Test again" instead.
  const [popupClosed, setPopupClosed] = useState(false);
  // What the leaderboard says about the run that just finished (shown in the result popup).
  const [runRank, setRunRank] = useState<RunRank>({ kind: 'none' });
  // Which run row is open in the list ("See details" opens the newest).
  const [openRunId, setOpenRunId] = useState<string | null>(null);
  const completedRunRef = useRef<string | null>(null);
  const completedAtRef = useRef(0);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [textMode, setTextMode] = useState<TextMode>('standard');
  const [rowMode, setRowMode] = useState<NumberRowMode>('digits');
  const [digitStats, setDigitStats] = useState<ReturnType<typeof digitSpeeds> | null>(null);
  // Gaps (ms) before each correct press of a number key, for the run in progress.
  const digitTimesRef = useRef<Record<string, number[]>>({});
  const { settings, updateSetting } = useSettings();
  const [focusMode, setFocusMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const commandRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const { progress: savedProgress, addSession, updateKeyStats, checkAchievements } = useTypingProgress();
  const settingsRef = useRef({ duration, textMode, customDuration, rowMode, level: settings.textLevel });
  settingsRef.current = { duration, textMode, customDuration, rowMode, level: settings.textLevel };

  // Labels shared by test_start and test_complete, so the two events can be compared one to one.
  const testLabels = useCallback(() => {
    const { duration: dur, textMode: mode, customDuration: custom, rowMode: row, level } = settingsRef.current;
    const special = dailyRef.current ? 'daily' : challengeRef.current ? 'challenge' : null;
    return {
      duration_s: custom ?? dur,
      text_mode: numberRow ? `number_row_${row}` : (special ?? mode),
      text_level: numberRow || special || mode === 'code' ? 0 : level,
    };
  }, [numberRow]);

  const handleComplete = useCallback((session: TypingSession) => {
    const { duration: dur, textMode: mode, customDuration: custom, rowMode: row, level } = settingsRef.current;
    setPopupClosed(false);
    completedAtRef.current = Date.now();
    const secs = custom ?? dur;
    const day = dailyRef.current;
    const friendRun = challengeRef.current;
    const updated = {
      ...session,
      mode: 'speed-test' as const,
      modeDetail: numberRow
        ? `number row · ${row} · ${secs}s`
        : day
          ? `daily · ${day}`
          : friendRun
            ? `challenge · ${secs}s`
            : `${mode} · ${secs}s`,
    };
    if (day) setDailyStore(recordDailyRun(day, session.wpm, session.accuracy));
    if (friendRun) setChallengeRun({ wpm: session.wpm, accuracy: session.accuracy });
    const seed = textSeedRef.current;
    const shareable = !numberRow && !day && !friendRun && seed !== null && CHALLENGE_SECONDS.includes(secs);
    const share = shareable ? { seed, mode, seconds: secs, level, gen: TEST_TEXT_VERSION, ...(mode === 'code' && codeLanguageRef.current !== 'any' ? { language: codeLanguageRef.current } : {}) } : undefined;
    // Number row runs stay out of progress: digit speeds would shift best WPM, averages and the streak.
    if (numberRow) setDigitStats(digitSpeeds(digitTimesRef.current));
    else addSession(withoutRun(updated));
    // Logged in: the finished run goes to the leaderboard too (numbers and labels only; a guest sends nothing),
    // and the result popup shows where it ranks.
    if (numberRow) {
      setRunRank({ kind: 'none' });
    } else {
      const labels = testLabels();
      const mine = session.id;
      const finished = { runId: mine, wpm: session.wpm, accuracy: session.accuracy, seconds: secs, textMode: labels.text_mode, textLevel: labels.text_level };
      completedRunRef.current = mine;
      const early = rankVerdict(finished, isLoggedIn());
      if (early) {
        setRunRank(early);
      } else {
        setRunRank({ kind: 'loading' });
        void submitRun(finished).then((r) => {
          if (completedRunRef.current === mine) setRunRank(r);
        });
      }
    }
    trackEvent('test_complete', {
      ...testLabels(),
      wpm: session.wpm,
      accuracy: session.accuracy,
    });
    setResult(updated);
    setLog((prev) => {
      const entry: PracticeLogEntry = {
        ...updated,
        ...speedTestCoachNote(updated, prev[0], prev),
        ...(share ? { share } : {}),
      };
      const next = [entry, ...prev].slice(0, LOG_MAX);
      // A challenge run keeps no card history of its own: it is compared with the friend's score instead.
      if (!challengeRef.current) {
        try {
          localStorage.setItem(
            numberRow ? NUMBER_ROW_LOG_KEY : dailyRef.current ? DAILY_LOG_KEY : LOG_KEY,
            JSON.stringify(next),
          );
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, [addSession, numberRow, testLabels]);

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, timeLeft, restart, handleInput, handleBackspace } =
    useTypingEngine({
      text,
      timed: duration,
      onStart: () => trackEvent('test_start', testLabels()),
      onComplete: handleComplete,
      onKeyStats: (key, correct, ctx) => {
      updateKeyStats(key, correct);
      if (numberRow) {
        // The first key of a run has no previous character: start the per-digit timings afresh.
        if (ctx.prev === undefined) digitTimesRef.current = {};
        const digit = digitOfKey(key);
        if (correct && digit && ctx.gapMs !== undefined) (digitTimesRef.current[digit] ??= []).push(ctx.gapMs);
      } else {
        recordPair(ctx.prev, key, correct, ctx.gapMs);
      }
    },
    });

  const isCompleteRef = useRef(false);
  isCompleteRef.current = isComplete;
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  charsRef.current = chars;
  currentIndexRef.current = currentIndex;
  const showCommandPaletteRef = useRef(showCommandPalette);
  showCommandPaletteRef.current = showCommandPalette;
  const focusModeRef = useRef(focusMode);
  focusModeRef.current = focusMode;

  useEffect(() => {
    setMounted(true);
    if (daily) {
      const key = utcDateKey();
      dailyRef.current = key;
      setDailyKey(key);
      setDailyStore(loadDaily());
      setText(dailyText(key));
    } else if (challenge) {
      // No usable link (or none at all): start a fresh challenge the person can send on.
      const parsed = parseChallenge(window.location.search);
      const info: Challenge = parsed ?? { seed: newSeed(), mode: 'sentences', seconds: 60, level: DEFAULT_TEXT_LEVEL, gen: TEST_TEXT_VERSION, language: 'any', wpm: null, accuracy: null };
      challengeRef.current = info;
      setChallengeInfo(info);
      setDuration(info.seconds);
      if (info.mode) setTextMode(info.mode);
      setText(info.mode ? seededTestText(info.mode, info.seconds, info.seed, info.level, info.gen, info.language) : challengeText(info.seed));
      if (parsed?.wpm != null) trackEvent('challenge_link_open');
    } else if (numberRow) {
      setText(numberRowText('digits', initialDuration));
    } else {
      setText(freshTest(codeLanguageRef.current, textSeedRef, 'standard', initialDuration, storedTextLevel()));
    }
    setLog(challenge ? [] : loadSpeedLog(numberRow ? NUMBER_ROW_LOG_KEY : daily ? DAILY_LOG_KEY : LOG_KEY));
  }, [initialDuration, daily, challenge, numberRow]);

  // One path for every typed character: keyboard events and touch/IME input both use it.
  const playKeySound = useKeySound();
  const processChar = useCallback(
    (ch: string) => {
      const expectedChar = charsRef.current[currentIndexRef.current]?.char;
      handleInput(ch);
      const correct = ch === expectedChar;
      setLastKeyFlash({ key: ch, correct });
      playKeySound(correct);
    },
    [handleInput, playKeySound],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ignoresTyping(e.target)) return;
      if (showCommandPaletteRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowCommandPalette(false);
          setCommandInput('');
        }
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // A finished test waits: typing does nothing here (Enter and Escape are handled by the effect below).
      if (isCompleteRef.current) {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape' && focusModeRef.current) {
        e.preventDefault();
        setFocusMode(false);
        return;
      }

      // '/' opens the command palette, unless the passage itself starts with '/'.
      if (
        e.key === '/' &&
        !isRunningRef.current &&
        charsRef.current[currentIndexRef.current]?.char !== '/'
      ) {
        e.preventDefault();
        setShowCommandPalette(true);
        setTimeout(() => commandRef.current?.focus(), 50);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        processChar(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [processChar, handleBackspace]);

  // Line-tracking scroll: recalculate from DOM on every index change (idempotent)
  useLayoutEffect(() => {
    // Prevent any browser-initiated scrolling on the container
    if (typingAreaRef.current && typingAreaRef.current.scrollTop !== 0) {
      typingAreaRef.current.scrollTop = 0;
    }

    if (!currentCharRef.current || !chars.length) {
      setScrollOffset(0);
      return;
    }

    const currentTop = currentCharRef.current.offsetTop;

    // Need baseline from char[0]
    if (!firstCharRef.current) {
      setScrollOffset(0);
      return;
    }
    const baseTop = firstCharRef.current.offsetTop;

    // Still on the first line — no scroll needed
    if (currentTop === baseTop) {
      setScrollOffset(0);
      return;
    }

    // Measure line height if not yet known
    let lh = lineHeight;
    if (lh === 0) {
      const container = typingAreaRef.current?.querySelector('.typing-text');
      if (!container) return;
      lh = measureTypingLineHeight(container as HTMLElement);
      if (lh === 0) return;
      setLineHeight(lh);
    }

    // Which line is cursor on? (0-based, relative to baseline)
    const currentLine = Math.round((currentTop - baseTop) / lh);

    // Keep current line as 2nd visible line, show 3 total
    if (currentLine >= 2) {
      setScrollOffset((currentLine - 1) * lh);
    } else {
      setScrollOffset(0);
    }
  }, [currentIndex, lineHeight, chars.length]);

  const startNewTest = useCallback((dur?: number) => {
    const d = dur ?? duration;
    setDuration(d);
    if (dur !== undefined && DURATION_OPTIONS.some((o) => o.seconds === dur)) {
      setCustomDuration(null);
    }
    setResult(null);
    setPopupClosed(false);
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    let next: string;
    if (dailyRef.current) {
      // Same passage again; if the UTC day rolled over while the page was open, move to the new day's.
      const key = utcDateKey();
      dailyRef.current = key;
      setDailyKey(key);
      next = dailyText(key);
    } else if (challengeRef.current) {
      const c = challengeRef.current;
      next = c.mode ? seededTestText(c.mode, c.seconds, c.seed, c.level, c.gen, c.language) : challengeText(c.seed);
    } else if (numberRow) {
      next = numberRowText(rowMode, dur ?? customDuration ?? duration);
    } else {
      next = freshTest(codeLanguageRef.current, textSeedRef, textMode, dur ?? customDuration ?? duration, settings.textLevel);
    }
    setText(next);
    restart(next);
    isCompleteRef.current = false;
    setShowCustomInput(false);
    inputRef.current?.focus({ preventScroll: true });
  }, [duration, customDuration, textMode, rowMode, numberRow, restart, settings.textLevel]);

  const startNewTestRef = useRef(startNewTest);
  startNewTestRef.current = startNewTest;
  const lastCompleteIdRef = useRef<string | null>(null);

  // A finished test waits for a choice. Enter starts the next test (not in the first half second, so a key
  // still on its way from the end of the test cannot do it); Escape leaves focus mode, or closes the box.
  useEffect(() => {
    if (!isComplete) return;
    const onKey = (e: KeyboardEvent) => {
      if (ignoresTyping(e.target) || showCommandPaletteRef.current) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Enter' && Date.now() - completedAtRef.current > 500) {
        e.preventDefault();
        startNewTest();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (focusModeRef.current) setFocusMode(false);
        else setPopupClosed(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isComplete, startNewTest]);

  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const newA = checkAchievements();
    if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    // No automatic restart: the person decides (box over the text: "Test again", "See details" ...).
  }, [isComplete, result, checkAchievements]);

  const applyCustomDuration = () => {
    const val = parseInt(customValue);
    if (val && val > 0 && val <= 120) {
      const secs = val * 60; // input is in minutes
      setCustomDuration(secs);
      startNewTest(secs);
    }
  };

  const activeDuration = customDuration ?? duration;

  // Command palette handler
  const executeCommand = useCallback((cmd: string) => {
    const c = cmd.trim().toLowerCase();
    setShowCommandPalette(false);
    setCommandInput('');

    if (dailyRef.current || challengeRef.current || numberRow) {
      if (c === 'restart' || c === 'r') startNewTest();
      else if (c === 'focus' || c === 'f') setFocusMode((prev) => !prev);
      return;
    }

    // Time commands
    const timeMatch = c.match(/^(?:time|t)\s+(\d+)(s|m)?/);
    if (timeMatch) {
      const val = parseInt(timeMatch[1]);
      const unit = timeMatch[2] || 's';
      const secs = unit === 'm' ? val * 60 : val;
      setCustomDuration(secs);
      startNewTest(secs);
      return;
    }

    switch (c) {
      case 'restart':
      case 'r':
        startNewTest();
        break;
      case 'focus':
      case 'f':
        setFocusMode((prev) => !prev);
        break;
      case 'words':
      case 'w':
        setTextMode('words');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'words', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'standard':
        setTextMode('standard');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'standard', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'sentences':
      case 's':
        setTextMode('sentences');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'sentences', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'quotes':
      case 'q':
        setTextMode('quotes');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'quotes', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'facts':
        setTextMode('facts');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'facts', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'mixed':
      case 'm':
        setTextMode('mixed');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'mixed', customDuration ?? duration, settings.textLevel));
        restart();
        break;
      case 'code':
      case 'c':
        setTextMode('code');
        setResult(null);
        setText(freshTest(codeLanguageRef.current, textSeedRef, 'code', customDuration ?? duration, settings.textLevel));
        restart();
        break;
    }
  }, [startNewTest, restart, customDuration, duration, numberRow, settings.textLevel]);

  const seconds = Math.ceil(timeLeft || activeDuration);
  const progress = isComplete ? 100 : isRunning ? ((activeDuration - (timeLeft || 0)) / activeDuration) * 100 : 0;
  // The newest run (it is in the list the moment the test ends) and how it compares with the one before.
  const finishedRun = isComplete ? log[0] : undefined;
  const showFinishedBox = !!finishedRun && !popupClosed;
  const finishedShare = finishedRun?.share;
  const isLowTime = isRunning && timeLeft < 10 && timeLeft < activeDuration * 0.1;

  if (!mounted || !text) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-1">
          {DURATION_OPTIONS.map((d) => (
            <span key={d.seconds} className="px-2 py-1 text-xs text-text-dim">
              {d.label}
            </span>
          ))}
        </div>
        <div className="h-20" />
      </div>
    );
  }

  const testContent = (
    <>
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="w-full">
        {/* The test, the keyboard and the run rows fill at least one screen, so the long guide below starts under the fold. */}
        <div className={focusMode ? undefined : 'min-h-[100svh]'} data-test-screen>
          {daily && dailyKey && <DailyPanel dateKey={dailyKey} store={dailyStore} />}
          {challenge && challengeInfo && <ChallengePanel challenge={challengeInfo} run={challengeRun} />}
          {/* The test box: durations and live results in the strip, text type and difficulty under it, time left as the thin bar */}
          <section className="mb-3 overflow-hidden rounded-2xl border border-surface-border bg-surface" aria-label="Test length, text type and live results">
            <PracticeStrip
              isRunning={isRunning || isComplete}
              wpm={wpm}
              accuracy={accuracy}
              lead={
                <span className={`tabular-nums ${isLowTime && isRunning ? 'text-error' : 'text-text-bright'}`}>
                  {isComplete ? 0 : seconds}
                </span>
              }
              tabs={
                <div className="flex flex-wrap items-center gap-1">
              {fixedRun && (
                <span className="rounded-md bg-accent-bg px-2.5 py-1 text-sm text-accent">{daily ? 'daily · 60s · sentences' : `challenge · ${challengeInfo?.seconds ?? 60}s · ${challengeInfo?.mode ?? 'sentences'}`}</span>
              )}
              {!fixedRun && DURATION_OPTIONS.map((d) => (
                <button
                  key={d.seconds}
                  onClick={() => { !isRunning && startNewTest(d.seconds); }}
                  disabled={isRunning}
                  className={`rounded-md px-2.5 py-1 text-sm transition-all ${
                    activeDuration === d.seconds && !customDuration
                      ? 'bg-accent-bg text-accent'
                      : 'text-text hover:bg-surface hover:text-text-bright'
                  } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {d.label}
                </button>
              ))}
              {!fixedRun && <button
                onClick={() => !isRunning && setShowCustomInput(!showCustomInput)}
                disabled={isRunning}
                className={`flex items-center justify-center rounded-md p-1.5 transition-all ${
                  customDuration
                    ? 'bg-accent-bg text-accent'
                    : 'text-text hover:bg-surface hover:text-text-bright'
                } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Custom time"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>}
                  {fixedRun && (
              <button
                onClick={() => setFocusMode(!focusMode)}
                className="flex items-center justify-center rounded-md p-1.5 text-text-dim transition-all hover:bg-surface-raised hover:text-text"
                title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
              >
                {focusMode ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              </button>
                  )}
                </div>
              }
            />
            {!fixedRun && (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3 py-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1" role="group" aria-label="Text type">
              {numberRow && NUMBER_ROW_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (isRunning) return;
                    setRowMode(m.id);
                    const next = numberRowText(m.id, customDuration ?? duration);
                    setText(next);
                    restart(next);
                  }}
                  disabled={isRunning}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    rowMode === m.id
                      ? 'border-accent bg-accent-bg text-accent'
                      : 'border-surface-border text-text hover:text-text-bright'
                  } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {m.label}
                </button>
              ))}
              {!fixedRun && !numberRow && TEXT_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (isRunning) return;
                    setTextMode(m.id);
                    const next = freshTest(codeLanguageRef.current, textSeedRef, m.id, customDuration ?? duration, settings.textLevel);
                    setText(next);
                    restart(next);
                  }}
                  disabled={isRunning}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    textMode === m.id
                      ? 'border-accent bg-accent-bg text-accent'
                      : 'border-surface-border text-text hover:text-text-bright'
                  } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {m.label}
                </button>
              ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                {!numberRow && (
                  <span className="flex flex-wrap items-center gap-1" role="group" aria-label="Difficulty level">
                    <span className="mr-0.5 text-xs text-text-dim">Level</span>
                    {TEXT_LEVELS.map((l) => {
                      const on = settings.textLevel === l.level;
                      return (
                        <button
                          key={l.level}
                          type="button"
                          aria-pressed={on}
                          disabled={isRunning}
                          title={`${l.level} · ${l.name}`}
                          onClick={() => {
                            if (isRunning) return;
                            const lv = normalizeLevel(l.level);
                            updateSetting('textLevel', lv);
                            const next = freshTest(codeLanguageRef.current, textSeedRef, textMode, customDuration ?? duration, lv);
                            setText(next);
                            restart(next);
                          }}
                          className={`rounded-full border px-2.5 py-0.5 text-xs tabular-nums transition-colors ${
                            on ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text hover:text-text-bright'
                          } ${isRunning ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                        >
                          {on ? `${l.level} ${l.name}` : l.level}
                        </button>
                      );
                    })}
                  </span>
                )}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className="flex items-center justify-center rounded-md p-1.5 text-text-dim transition-all hover:bg-surface-raised hover:text-text"
                title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
              >
                {focusMode ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              </button>
              </div>
            </div>
            )}
            {!fixedRun && !numberRow && textMode === 'code' && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-surface-border px-3 py-1.5 text-xs text-text-dim" role="group" aria-label="Code language">
                <span>Language</span>
                {(['any', ...(Object.keys(CODE_LANGUAGE_NAMES) as CodeLanguage[])] as CodeChoice[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={codeLanguage === id}
                    disabled={isRunning}
                    onClick={() => {
                      if (isRunning) return;
                      codeLanguageRef.current = id;
                      setCodeLanguageState(id);
                      saveSourcePrefs({ ...loadSourcePrefs(), language: id });
                      const next = freshTest(id, textSeedRef, 'code', customDuration ?? duration, settings.textLevel);
                      setText(next);
                      restart(next);
                    }}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      codeLanguage === id ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text hover:text-text-bright'
                    } ${isRunning ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                  >
                    {id === 'any' ? 'Any' : CODE_LANGUAGE_NAMES[id]}
                  </button>
                ))}
              </div>
            )}
            <div className="h-[3px] w-full bg-surface-raised">
              <div
                className={`h-full transition-all duration-300 ease-linear ${isLowTime ? 'bg-error' : 'bg-accent'} ${isRunning && !isLowTime ? 'progress-glow' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {/* The finished box sits over the text area and the hint row below it, so nothing moves on a computer (a phone grows a little: the box is taller there). */}
          <div className="relative">
            <div
              ref={typingAreaRef}
              className={`relative my-5 cursor-text overflow-hidden transition-[opacity,filter] duration-200 ${
                showFinishedBox ? 'opacity-35 blur-[1.5px]' : ''
              }`}
              style={{ height: typingWindowHeight(lineHeight) - 24 }}
              onClick={() => inputRef.current?.focus({ preventScroll: true })}
            >
              <TypingPassage
                chars={chars}
                currentIndex={currentIndex}
                firstCharRef={firstCharRef}
                currentCharRef={currentCharRef}
                className={`transition-transform duration-150 ease-out ${!numberRow && textMode === 'code' ? '' : 'typing-justify'}`}
                style={{ transform: `translateY(-${scrollOffset}px)` }}
              />
            </div>

          <input
          ref={inputRef}
          className="sr-only"
          aria-label="Type the text shown on screen here"
          autoFocus
          defaultValue={INPUT_SENTINEL}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onFocus={resetMobileInput}
          onInput={(e) => handleMobileInput(e, processChar, handleBackspace)}
        />

          <div className="mt-4 flex h-8 items-center justify-center">
            {isComplete ? (
              showFinishedBox ? null : (
                <p className="text-sm text-text-dim">
                  Test finished ·{' '}
                  <button type="button" onClick={() => startNewTest()} className="text-accent hover:underline">
                    test again
                  </button>{' '}
                  <kbd className="rounded border border-surface-border px-1 font-mono text-[10px]">Enter</kbd>
                </p>
              )
            ) : !isRunning ? (
              <p className="text-sm text-text-dim">
                {!fixedRun && !numberRow ? `${TEXT_MODE_NOTES[textMode]} ` : ''}start typing to begin
              </p>
            ) : (
              <button
                type="button"
                onClick={() => restart()}
                className="text-text-dim transition-colors hover:text-text"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
            {showFinishedBox && finishedRun && (
              <TestFinished
                key={finishedRun.id}
                wpm={finishedRun.wpm}
                accuracy={finishedRun.accuracy}
                seconds={finishedRun.duration}
                previousWpm={log[1]?.wpm ?? null}
                newBest={newBest}
                plain={numberRow}
                onAgain={() => startNewTest()}
                run={finishedRun}
                rank={runRank}
                onClose={() => setPopupClosed(true)}
                challenge={
                  finishedShare ? (
                    <ChallengeSendButton
                      large
                      wpm={finishedRun.wpm}
                      source="finished_box"
                      emphasis
                      buildUrl={() =>
                        buildChallengeUrl(window.location.origin, finishedShare.seed, finishedRun.wpm, finishedRun.accuracy, finishedShare.mode, finishedShare.seconds, finishedShare.level, finishedShare.gen ?? 1, finishedShare.language ?? 'any')
                      }
                    >
                      Challenge a friend
                    </ChallengeSendButton>
                  ) : undefined
                }
              />
            )}
          </div>

          {numberRow && settings.showKeyboardHints && !isComplete && (
            <p className="mt-1 h-5 text-center text-xs text-text-dim" data-number-row-hint>
              {nextKeyHint(chars[currentIndex]?.char) ? (
                <>
                  next:{' '}
                  <span className="font-medium text-accent">
                    {chars[currentIndex]?.char === ' ' ? 'space' : chars[currentIndex]?.char}
                  </span>
                  {' · '}
                  {nextKeyHint(chars[currentIndex]?.char)}
                </>
              ) : null}
            </p>
          )}

          <div className="mt-4 animate-fade-up">
            <LiveKeyboard
              nextChar={chars[currentIndex]?.char}
              lastKeyCorrect={lastKeyFlash}
              compact
            />
          </div>

          <PracticeFeedback
            log={log}
            savedSessions={numberRow ? undefined : savedProgress.sessions}
            plain={numberRow}
            afterStats={numberRow && digitStats ? <DigitStrip speeds={digitStats.speeds} slowest={digitStats.slowest} /> : undefined}
            collapsible
            openId={openRunId}
            onOpenChange={setOpenRunId}
            rowAction={(entry) =>
              entry.share ? (
                <ChallengeSendButton
                  wpm={entry.wpm}
                  source="history_row"
                  emphasis={false}
                  buildUrl={() =>
                    buildChallengeUrl(window.location.origin, entry.share!.seed, entry.wpm, entry.accuracy, entry.share!.mode, entry.share!.seconds, entry.share!.level, entry.share!.gen ?? 1, entry.share!.language ?? 'any')
                  }
                >
                  challenge
                </ChallengeSendButton>
              ) : null
            }
            extraActions={(entry, i) => (
              <>
                <Link
                  href="/typing-practice"
                  className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <PenTool className="h-3 w-3" />
                  practice
                </Link>
                {entry.share ? (
                  <ChallengeSendButton
                    wpm={entry.wpm}
                    source="result_card"
                    emphasis={i === 0 && newBest}
                    buildUrl={() =>
                      buildChallengeUrl(window.location.origin, entry.share!.seed, entry.wpm, entry.accuracy, entry.share!.mode, entry.share!.seconds, entry.share!.level, entry.share!.gen ?? 1, entry.share!.language ?? 'any')
                    }
                  >
                    {i === 0 && newBest ? 'new best: challenge a friend' : 'challenge a friend'}
                  </ChallengeSendButton>
                ) : i === 0 && !numberRow && (
                  <Link
                    href="/typing-challenge"
                    title="Type a 60 second text, then send the link to a friend"
                    className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <Swords className="h-3 w-3" />
                    challenge a friend
                  </Link>
                )}
              </>
            )}
          />
        </div>
        </div>

      {/* Command palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowCommandPalette(false); setCommandInput(''); }} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-surface-border bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-surface-border px-4 py-3">
              <span className="text-text-dim">›</span>
              <input
                ref={commandRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeCommand(commandInput);
                  if (e.key === 'Escape') { setShowCommandPalette(false); setCommandInput(''); }
                }}
                placeholder="type a command..."
                className="flex-1 bg-transparent text-sm text-text focus:outline-none"
                autoFocus
              />
            </div>
            <div className="px-4 py-3">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-text-dim">commands</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">restart</span>
                  <span className="font-mono text-text-dim">r</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">focus mode</span>
                  <span className="font-mono text-text-dim">f</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">words</span>
                  <span className="font-mono text-text-dim">w</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">sentences</span>
                  <span className="font-mono text-text-dim">s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">code</span>
                  <span className="font-mono text-text-dim">c</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">set time</span>
                  <span className="font-mono text-text-dim">t 60s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom time modal */}
      {showCustomInput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCustomInput(false)} />
          <div className="relative z-10 w-full max-w-xs rounded-xl border border-surface-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border px-5 py-3">
              <span className="text-sm font-medium text-text">Custom Time</span>
              <button
                onClick={() => setShowCustomInput(false)}
                className="rounded-md p-1 text-text-dim transition-colors hover:bg-surface-raised hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="mb-2 block text-xs text-text-dim">Duration in minutes (1–120)</label>
              <input
                ref={customInputRef}
                type="number"
                min="1"
                max="120"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCustomDuration()}
                placeholder="e.g. 45"
                className="w-full rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                autoFocus
              />
              <button
                onClick={applyCustomDuration}
                className="mt-3 w-full rounded-lg bg-accent py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                start test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Focus mode: fullscreen overlay hiding sidebars
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-surface">
        <div className="w-full max-w-5xl px-12">
          {testContent}
        </div>
        <p className="absolute bottom-4 text-[10px] text-text-dim">
          press Esc to exit focus mode
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {testContent}
    </div>
  );
}
