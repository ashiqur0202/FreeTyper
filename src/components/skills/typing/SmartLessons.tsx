'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { withoutRun } from './runStats';
import { recordPair } from './pairStats';
import type { Achievement, TypingSession } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import TypingPassage from './TypingPassage';
import PracticeFeedback, { type CoachTone, type PracticeLogEntry } from './PracticeFeedback';
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import { trackEvent } from '@/lib/analytics';
import { readGoalMinutes, readPracticeSummary } from './practiceSummary';
import {
  KEY_ORDER,
  LEVELS,
  applyRound,
  emptyState,
  focusOf,
  generateRoundText,
  levelIndex,
  loadState,
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

export default function SmartLessons() {
  const [state, setState] = useState<SmartState>(emptyState);
  const [round, setRound] = useState<RoundText>({ text: '', realWords: 0 });
  const [coach, setCoach] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [today, setToday] = useState({ seconds: 0, goal: 10 });

  const inputRef = useRef<HTMLInputElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(state);
  const samplesRef = useRef<KeySample[]>([]);
  const lastCompleteIdRef = useRef<string | null>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();

  const refreshToday = useCallback(() => {
    try {
      const s = readPracticeSummary();
      setToday({ seconds: s.todaySeconds, goal: readGoalMinutes() });
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

  if (!mounted) return <div className="h-48 w-full" aria-hidden="true" />;

  const li = levelIndex(state.unlocked);
  const focus = focusOf(state);
  const practicing = [...focus.fresh, ...focus.weak];
  const mins = Math.floor(today.seconds / 60);
  const goalDone = today.seconds >= today.goal * 60;

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="w-full">
        {/* Level (like the course's stage tabs) and the daily goal */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-center gap-1" aria-label="Level">
            {LEVELS.map((l, i) => {
              const locked = i > li;
              return (
                <span
                  key={l.name}
                  title={locked ? `Locked. Unlocks at ${l.from} keys (${l.from - state.unlocked} more).` : i === li ? 'Your level now.' : 'Passed.'}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs ${
                    i === li ? 'bg-accent-bg font-medium text-text-bright' : locked ? 'text-text-dim/40' : 'text-text'
                  }`}
                >
                  {locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                  {l.name}
                </span>
              );
            })}
          </div>
          <p className="text-[11px] text-text-dim">
            {goalDone ? (
              'Daily goal done'
            ) : (
              <>
                Daily goal <span className="tabular-nums text-text-bright">{mins}</span> of {today.goal} min
              </>
            )}
          </p>
        </div>

        {/* All 26 keys in one row, in the order they unlock */}
        <div
          className="mb-3 grid gap-px"
          style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}
          role="list"
          aria-label="Keys in the order they unlock"
        >
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
                    : `${k.toUpperCase()}: locked${i === state.unlocked ? '. Next to unlock.' : '.'}`
                }
                className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md py-1 font-mono text-[11px] uppercase sm:text-xs ${
                  fresh
                    ? 'bg-accent-bg font-medium text-accent'
                    : weak
                      ? 'text-error'
                      : open
                        ? 'text-text-bright'
                        : 'text-text-dim/40'
                }`}
              >
                {open ? k : <Lock className="h-3 w-3" aria-label={`${k} locked`} />}
                <span className="h-0.5 w-3/5 overflow-hidden rounded-full bg-surface-raised" aria-hidden="true">
                  <span className="block h-full rounded-full bg-correct" style={{ width: `${Math.round(m * 100)}%` }} />
                </span>
              </span>
            );
          })}
        </div>

        {/* The key to work on, and live speed and accuracy */}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            {practicing.length > 0 && state.rounds > 0 && (
              <p className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="text-text-dim">Practicing</span>
                {practicing.map((k) => (
                  <kbd
                    key={k}
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                      focus.fresh.includes(k)
                        ? 'border-accent bg-accent-bg text-accent'
                        : 'border-surface-border bg-surface-raised text-text-bright'
                    }`}
                  >
                    {k}
                  </kbd>
                ))}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-sm text-text">
            <span className="tabular-nums text-text-bright">
              {isRunning ? wpm : '--'}
              <span className="text-text"> wpm</span>
            </span>
            <span className="text-text-dim">·</span>
            <span className="tabular-nums text-text-bright">
              {isRunning ? accuracy : '--'}
              <span className="text-text">%</span>
            </span>
          </div>
        </div>

        <div className="h-0.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className={`h-full rounded-full bg-accent transition-all duration-150 ${isRunning ? 'progress-glow' : ''}`}
            style={{ width: chars.length ? `${Math.min(100, (currentIndex / chars.length) * 100)}%` : '0%' }}
          />
        </div>

        {/* The text */}
        <div className="relative mt-3 min-h-[7rem] cursor-text py-3" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
          <TypingPassage chars={chars} currentIndex={currentIndex} firstCharRef={firstCharRef} currentCharRef={currentCharRef} className="transition-transform duration-150 ease-out" />
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

        <div className="mt-4 flex min-h-8 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          {!isRunning && coach[0] && (
            <p role="status" className="text-sm text-text">
              {coach[0]}
            </p>
          )}
        </div>

        <div className="mt-4 animate-fade-up">
          <LiveKeyboard nextChar={chars[currentIndex]?.char} lastKeyCorrect={lastKeyFlash} compact />
        </div>

        <PracticeFeedback log={log} collapsible />
      </div>
    </div>
  );
}
