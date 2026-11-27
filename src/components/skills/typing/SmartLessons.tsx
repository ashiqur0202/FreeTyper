'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { withoutRun } from './runStats';
import { recordPair } from './pairStats';
import type { Achievement, TypingSession } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import TypingPassage from './TypingPassage';
import PracticeStrip from './PracticeStrip';
import DailyRing from './DailyRing';
import LevelTrack from './LevelTrack';
import { useTypingWindow } from './useTypingWindow';
import PracticeFeedback, { type CoachTone, type PracticeLogEntry } from './PracticeFeedback';
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import { trackEvent } from '@/lib/analytics';
import { fingerMap } from './typingData';
import { FINGER_NAMES, PLAIN_FINGER } from './guideLayout';
import { readPracticeSummary } from './practiceSummary';
import {
  KEY_ORDER,
  SMART_GOAL_MINUTES,
  applyRound,
  emptyState,
  focusOf,
  generateRoundText,
  levelIndex,
  loadState,
  previewKeys,
  mastery,
  saveState,
  type KeySample,
  type RoundText,
  type SmartState,
} from './smartEngine';

const LOG_KEY = 'freetyper-smart-log';
const LOG_MAX = 5;

function loadLog(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as PracticeLogEntry[]).slice(0, LOG_MAX) : [];
  } catch {
    return [];
  }
}

/** The headline and tip a result row opens with: what the path does next, and why. */
function smartNote(dir: number, reasons: string[]): { headline: string; tip: string; tone: CoachTone } {
  return {
    headline: dir > 0 ? 'Harder next' : dir < 0 ? 'Easier next' : 'Holding steady',
    tip: reasons.join(' '),
    tone: dir > 0 ? 'up' : dir < 0 ? 'warn' : 'steady',
  };
}

/** "Left index finger. Reach up one row from the home row, press, and come back." */
function fingerLine(key: string): string {
  const f = fingerMap[key];
  const name = f ? `${f.hand === 'left' ? 'Left' : 'Right'} ${PLAIN_FINGER[FINGER_NAMES[f.finger]]} finger. ` : '';
  const reach = 'asdfghjkl'.includes(key)
    ? 'It is on the home row, so just press it.'
    : 'qwertyuiop'.includes(key)
      ? 'Reach up one row from the home row, press, and come back.'
      : 'Reach down one row from the home row, press, and come back.';
  return name + reach;
}

export default function SmartLessons({ tabs }: { tabs: ReactNode }) {
  const [state, setState] = useState<SmartState>(emptyState);
  const [round, setRound] = useState<RoundText>({ text: '', realWords: 0 });
  const [coach, setCoach] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [today, setToday] = useState({ seconds: 0, goal: SMART_GOAL_MINUTES });

  const inputRef = useRef<HTMLInputElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const samplesRef = useRef<KeySample[]>([]);
  const lastCompleteIdRef = useRef<string | null>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();

  const refreshToday = useCallback(() => {
    try {
      const s = readPracticeSummary();
      setToday({ seconds: s.todaySeconds, goal: SMART_GOAL_MINUTES });
    } catch {
      /* no history yet */
    }
  }, []);

  const handleComplete = useCallback(
    (session: TypingSession) => {
      const prev = stateRef.current;
      const outcome = applyRound(prev, samplesRef.current, session.accuracy, session.wpm);
      const updated = { ...session, mode: 'lesson' as const, modeDetail: `Smart lessons · ${outcome.state.unlocked} keys` };
      addSession(withoutRun(updated));
      setLog((prevLog) => {
        const next = [{ ...updated, ...smartNote(outcome.summary.dir, outcome.reasons) }, ...prevLog].slice(0, LOG_MAX);
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(next));
        } catch {
          /* storage full or blocked */
        }
        return next;
      });
      stateRef.current = outcome.state;
      setState(outcome.state);
      saveState(outcome.state);
      setCoach(outcome.reasons);
      trackEvent('smart_round_complete', {
        keys: outcome.state.unlocked,
        difficulty: outcome.summary.difficulty,
        accuracy: session.accuracy,
        wpm: session.wpm,
        direction: outcome.summary.dir,
      });
      if (outcome.summary.unlockedKey) trackEvent('smart_key_unlock', { keys: outcome.state.unlocked });
      setResult(session);
    },
    [addSession],
  );

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, restart, handleInput, handleBackspace } = useTypingEngine({
    text: round.text,
    onStart: () => {
      trackEvent('smart_round_start', { keys: stateRef.current.unlocked, difficulty: stateRef.current.difficulty });
    },
    onComplete: handleComplete,
    onKeyStats: (key, correct, ctx) => {
      updateKeyStats(key, correct);
      recordPair(ctx.prev, key, correct, ctx.gapMs);
      samplesRef.current.push({ key, correct, gapMs: ctx.gapMs });
    },
  });

  // Keyboard handlers read the latest values from refs; they are refreshed right after every render.
  const isCompleteRef = useRef(false);
  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  useLayoutEffect(() => {
    isCompleteRef.current = isComplete;
    charsRef.current = chars;
    currentIndexRef.current = currentIndex;
  });

  const startRound = useCallback(() => {
    const next = generateRoundText(stateRef.current);
    samplesRef.current = [];
    setRound(next);
    restart(next.text);
    isCompleteRef.current = false;
    setLastKeyFlash(null);
    inputRef.current?.focus({ preventScroll: true });
  }, [restart]);

  // Read the saved path only after the page has loaded (it lives in this browser's localStorage).
  useEffect(() => {
    const saved = loadState();
    stateRef.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, so it must run after hydration
    setState(saved);
    setLog(loadLog());
    setMounted(true);
    refreshToday();
    const first = generateRoundText(saved);
    setRound(first);
    restart(first.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a finished round, the next one starts at once with new text.
  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const achieved = checkAchievements();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once per finished round, after the session was saved
    if (achieved.length > 0) setToasts((t) => [...t, ...achieved]);
    refreshToday();
    startRound();
  }, [isComplete, result, checkAchievements, refreshToday, startRound]);

  const playKeySound = useKeySound();
  const processChar = useCallback(
    (ch: string) => {
      const expected = charsRef.current[currentIndexRef.current]?.char;
      handleInput(ch);
      const correct = ch === expected;
      setLastKeyFlash({ key: ch, correct });
      playKeySound(correct);
    },
    [handleInput, playKeySound],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (isCompleteRef.current) {
        e.preventDefault();
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

  const { scrollOffset, height: windowHeight } = useTypingWindow({
    charCount: chars.length,
    currentIndex,
    firstCharRef,
    currentCharRef,
    boxRef: textBoxRef,
  });

  if (!mounted) {
    return (
      <div className="w-full">
        {tabs}
        <div className="h-48" aria-hidden="true" />
      </div>
    );
  }

  const focus = focusOf(state);
  const practicing = [...focus.fresh, ...focus.weak];
  const preview = previewKeys(state.unlocked);
  // The key to explain: the new key, else the weakest one, else the first key for someone who has not started.
  const main = focus.fresh[0] ?? focus.weak[0] ?? (state.rounds === 0 ? KEY_ORDER[0] : undefined);

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="w-full @container">
        {/* Level, daily goal and the keys, in the same box as Practice */}
        <section className="mb-3 overflow-hidden rounded-2xl border border-surface-border bg-surface" aria-label="Lessons tabs, daily goal and keys">
          <PracticeStrip tabs={tabs} isRunning={isRunning} wpm={wpm} accuracy={accuracy} />
          <div className="grid items-center gap-x-6 gap-y-3 px-4 py-3 @2xl:grid-cols-[auto_minmax(0,1fr)]">
            <DailyRing todaySeconds={today.seconds} label="Daily goal" />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-xs text-text-dim">
                <LevelTrack unlocked={state.unlocked} />
                <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                  {practicing.length > 0 && state.rounds > 0 && (
                    <span className="inline-flex items-center gap-1">
                      {focus.fresh.length > 0 ? 'New' : 'Practicing'}
                      {practicing.map((k) => (
                        <kbd
                          key={k}
                          className={`rounded border px-1.5 py-px font-mono text-[10px] font-bold uppercase ${
                            focus.fresh.includes(k) ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border bg-surface-raised text-text-bright'
                          }`}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  )}
                  {preview.length > 0 && (
                    <span className="inline-flex items-center gap-1" title="Shown a little so the text is not all one letter. They do not count yet.">
                      Preview
                      {preview.map((k) => (
                        <kbd key={k} className="rounded border border-dashed border-accent/60 px-1.5 py-px font-mono text-[10px] font-bold uppercase text-text-dim">
                          {k}
                        </kbd>
                      ))}
                    </span>
                  )}
                </span>
              </div>
              {/* All 26 keys in one row, in the order they unlock */}
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }} role="list" aria-label="Keys in the order they unlock">
                {KEY_ORDER.split('').map((k, i) => {
                  const open = i < state.unlocked;
                  const m = open ? mastery(state, k) : 0;
                  const fresh = focus.fresh.includes(k);
                  const weak = focus.weak.includes(k);
                  const st = state.keys[k];
                  return (
                    <span
                      key={k}
                      role="listitem"
                      title={
                        open
                          ? `${k.toUpperCase()}: score ${m.toFixed(2)}, typed ${st?.n ?? 0} times${st ? `, ${Math.round(st.acc * 100)}% accurate` : ''}`
                          : preview.includes(k)
                            ? `${k.toUpperCase()}: preview. It appears a little so the text is not all one letter. It does not count yet.`
                            : `${k.toUpperCase()}: locked${i === state.unlocked ? '. Next to unlock.' : '.'}`
                      }
                      className={`relative flex min-w-0 flex-col items-center justify-center gap-[3px] rounded-md py-[3px] font-mono text-[0.6rem] font-semibold uppercase @md:text-[0.8rem] ${
                        fresh
                          ? 'bg-accent-bg text-accent ring-1 ring-accent'
                          : weak
                            ? 'text-error'
                            : open
                              ? 'text-text-bright'
                              : preview.includes(k)
                                ? 'text-text-dim outline outline-1 outline-dashed outline-accent/60'
                                : 'text-text-dim/40'
                      }`}
                    >
                      {open || preview.includes(k) ? k : <Lock className="h-2.5 w-2.5" aria-label={`${k} locked`} />}
                      <span className="h-[3px] w-[62%] overflow-hidden rounded-sm bg-surface-raised" aria-hidden="true">
                        <span className="block h-full rounded-sm bg-correct" style={{ width: `${Math.round(m * 100)}%` }} />
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* The text: three lines, justified, scrolling so you stay on the second line */}
        <div
          ref={textBoxRef}
          className="relative my-5 cursor-text overflow-hidden"
          style={{ height: windowHeight }}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <TypingPassage
            chars={chars}
            currentIndex={currentIndex}
            firstCharRef={firstCharRef}
            currentCharRef={currentCharRef}
            className="typing-justify transition-transform duration-150 ease-out"
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

        <div className="mt-3 flex min-h-8 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          {!isRunning && (coach[0] || main) && (
            <p role="status" className="flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm text-text-dim">
              <span className="rounded border border-accent px-1.5 py-px text-[11px] font-semibold uppercase tracking-wider text-accent">Smart lessons</span>
              <span>{coach[0] ?? (main ? `${main.toUpperCase()}: ${fingerLine(main)}` : '')}</span>
            </p>
          )}
        </div>

        <div className="mt-3 animate-fade-up">
          <LiveKeyboard nextChar={chars[currentIndex]?.char} lastKeyCorrect={lastKeyFlash} compact />
        </div>

        <PracticeFeedback log={log} collapsible />
      </div>
    </div>
  );
}
