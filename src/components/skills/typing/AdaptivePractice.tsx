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
import PracticeFeedback, { type CoachTone, type PracticeLogEntry } from './PracticeFeedback';
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import { trackEvent } from '@/lib/analytics';
import { readPracticeSummary } from './practiceSummary';
import {
  KEY_ORDER,
  LEVELS,
  SESSION_SEGMENTS,
  SMART_GOAL_MINUTES,
  applySegment,
  emptyState,
  finishSession,
  generatePracticeSegment,
  levelIndex,
  loadState,
  mastery,
  openKeys,
  planOf,
  saveState,
  type KeySample,
  type PracticePlan,
  type SmartState,
} from './smartEngine';

const LOG_KEY = 'freetyper-adaptive-log';
const LOG_MAX = 5;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
/** The same four colors the letter row used before (good, okay, weak, weakest). */
const LEVEL_COLORS = { good: '#6b7c3a', ok: '#e2b714', weak: '#d97706', bad: '#c44250' } as const;

function levelOf(score: number): keyof typeof LEVEL_COLORS {
  return score >= 0.8 ? 'good' : score >= 0.65 ? 'ok' : score >= 0.5 ? 'weak' : 'bad';
}

function loadLog(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as PracticeLogEntry[]).slice(0, LOG_MAX) : [];
  } catch {
    return [];
  }
}

interface SegmentStat {
  wpm: number;
  accuracy: number;
  duration: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

/**
 * The adaptive tab of the Practice page. Keys unlock by skill (the same keys as Smart lessons), a session is
 * four short segments, and the plan (what to fix, what is almost there, what to review) and the difficulty
 * are recalculated after every segment. The rules live in smartEngine.ts; the Lessons guide describes them.
 */
export default function AdaptivePractice({ tabs, pinKey = null }: { tabs: ReactNode; pinKey?: string | null }) {
  const [state, setState] = useState<SmartState>(emptyState);
  const [plan, setPlan] = useState<PracticePlan>(() => planOf(emptyState()));
  const [text, setText] = useState('');
  const [segIdx, setSegIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [reasons, setReasons] = useState<{ seg: number; text: string }[]>([]);
  const [note, setNote] = useState('');
  const [pinned, setPinned] = useState<string | null>(pinKey);
  const [startScores, setStartScores] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [todaySeconds, setTodaySeconds] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(state);
  const pinnedRef = useRef<string | null>(pinKey);
  const samplesRef = useRef<KeySample[]>([]);
  const segStatsRef = useRef<SegmentStat[]>([]);
  const segIdxRef = useRef(0);
  const sessionDifficultyRef = useRef(2);
  const startScoresRef = useRef<Record<string, number>>({});
  const lastCompleteIdRef = useRef<string | null>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();

  const refreshToday = useCallback(() => {
    try {
      setTodaySeconds(readPracticeSummary().todaySeconds);
    } catch {
      /* no history yet */
    }
  }, []);

  /** A new segment: the plan is recalculated from the latest scores and the text follows it. */
  const startSegment = useCallback(
    (restartEngine: (t: string) => void) => {
      const nextPlan = planOf(stateRef.current, pinnedRef.current);
      const round = generatePracticeSegment(stateRef.current, nextPlan);
      samplesRef.current = [];
      setPlan(nextPlan);
      setText(round.text);
      restartEngine(round.text);
      setLastKeyFlash(null);
      inputRef.current?.focus({ preventScroll: true });
    },
    [],
  );

  const handleComplete = useCallback(
    (session: TypingSession) => {
      const outcome = applySegment(
        stateRef.current,
        samplesRef.current,
        session.accuracy,
        session.wpm,
        sessionDifficultyRef.current,
        pinnedRef.current,
      );
      addSession(withoutRun({ ...session, mode: 'practice' as const, modeDetail: 'adaptive' }));
      trackEvent('practice_complete', { category: 'adaptive', wpm: session.wpm, accuracy: session.accuracy });
      segStatsRef.current.push({
        wpm: session.wpm,
        accuracy: session.accuracy,
        duration: session.duration,
        correctChars: session.correctChars,
        incorrectChars: session.incorrectChars,
        totalChars: session.totalChars,
      });
      const doneSegments = segIdxRef.current + 1;
      setReasons((r) => [...r, ...outcome.reasons.map((t) => ({ seg: doneSegments, text: t }))]);
      stateRef.current = outcome.state;

      if (doneSegments >= SESSION_SEGMENTS) {
        const end = finishSession(outcome.state, startScoresRef.current, pinnedRef.current);
        stateRef.current = end.state;
        const stats = segStatsRef.current;
        const avg = (pick: (s: SegmentStat) => number) => Math.round(stats.reduce((a, s) => a + pick(s), 0) / stats.length);
        const sum = (pick: (s: SegmentStat) => number) => stats.reduce((a, s) => a + pick(s), 0);
        const accuracy = avg((s) => s.accuracy);
        const tone: CoachTone = end.unlockedKey ? 'best' : accuracy >= 95 ? 'up' : accuracy < 88 ? 'warn' : 'steady';
        const entry: PracticeLogEntry = {
          id: `${session.id}-session`,
          date: session.date,
          wpm: avg((s) => s.wpm),
          accuracy,
          correctChars: sum((s) => s.correctChars),
          incorrectChars: sum((s) => s.incorrectChars),
          totalChars: sum((s) => s.totalChars),
          duration: Math.round(sum((s) => s.duration)),
          mode: 'practice',
          modeDetail: `adaptive · ${end.state.unlocked} keys`,
          headline: end.unlockedKey ? `New key: ${end.unlockedKey.toUpperCase()}` : accuracy >= 95 ? 'Clean session' : accuracy < 88 ? 'Easier next' : 'Keep going',
          tip: end.note,
          tone,
        };
        setLog((prev) => {
          const next = [entry, ...prev].slice(0, LOG_MAX);
          try {
            localStorage.setItem(LOG_KEY, JSON.stringify(next));
          } catch {
            /* storage full or blocked */
          }
          return next;
        });
        setNote(end.note);
        trackEvent('practice_session_complete', {
          keys: end.state.unlocked,
          difficulty: end.state.difficulty,
          accuracy,
          wpm: entry.wpm,
        });
        if (end.unlockedKey) trackEvent('smart_key_unlock', { keys: end.state.unlocked, source: 'practice' });
        segIdxRef.current = SESSION_SEGMENTS;
      } else {
        segIdxRef.current = doneSegments;
      }
      setState(stateRef.current);
      saveState(stateRef.current);
      setSegIdx(segIdxRef.current);
      setResult(session);
    },
    [addSession],
  );

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, restart, handleInput, handleBackspace } = useTypingEngine({
    text,
    onStart: () => {
      trackEvent('practice_start', { category: 'adaptive' });
    },
    onComplete: handleComplete,
    onKeyStats: (key, correct, ctx) => {
      updateKeyStats(key, correct);
      recordPair(ctx.prev, key, correct, ctx.gapMs);
      samplesRef.current.push({ key, correct, gapMs: ctx.gapMs });
    },
  });

  const isCompleteRef = useRef(false);
  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  useLayoutEffect(() => {
    isCompleteRef.current = isComplete;
    charsRef.current = chars;
    currentIndexRef.current = currentIndex;
  });

  /** A new session: remember where every key stands, so the row can show what moved. */
  const startSession = useCallback(() => {
    sessionDifficultyRef.current = stateRef.current.difficulty;
    const snap: Record<string, number> = {};
    for (const k of openKeys(stateRef.current)) snap[k] = mastery(stateRef.current, k);
    startScoresRef.current = snap;
    setStartScores(snap);
    segStatsRef.current = [];
    segIdxRef.current = 0;
    setSegIdx(0);
    setReasons([]);
    startSegment(restart);
    isCompleteRef.current = false;
  }, [restart, startSegment]);

  // Read the saved path only after the page has loaded (it lives in this browser's localStorage).
  useEffect(() => {
    const saved = loadState();
    stateRef.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, so it must run after hydration
    setState(saved);
    setLog(loadLog());
    setMounted(true);
    refreshToday();
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a finished segment the next one starts at once; after the fourth a new session begins.
  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const achieved = checkAchievements();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once per finished segment, after the session was saved
    if (achieved.length > 0) setToasts((t) => [...t, ...achieved]);
    refreshToday();
    if (segIdxRef.current >= SESSION_SEGMENTS) startSession();
    else startSegment(restart);
    isCompleteRef.current = false;
  }, [isComplete, result, checkAchievements, refreshToday, startSession, startSegment, restart]);

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

  /** Click an open key to make it the focus of the next segments; click it again to let the plan choose. */
  const pickKey = (k: string) => {
    if (isRunning) return;
    const next = pinnedRef.current === k ? null : k;
    pinnedRef.current = next;
    setPinned(next);
    setPlan(planOf(stateRef.current, next));
  };

  if (!mounted || !text) {
    return (
      <div className="w-full">
        {tabs}
        <div className="h-48" aria-hidden="true" />
      </div>
    );
  }

  const goalSeconds = SMART_GOAL_MINUTES * 60;
  const goalPct = Math.min(1, todaySeconds / goalSeconds);
  const goalDone = todaySeconds >= goalSeconds;
  const mins = Math.floor(todaySeconds / 60);
  const RING = 169.6;

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          {tabs}
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

        {/* Daily practice and the keys */}
        <section
          className="mb-3 grid items-center gap-x-6 gap-y-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 md:grid-cols-[auto_minmax(0,1fr)]"
          aria-label="Daily practice and keys"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative h-[62px] w-[62px] flex-none" role="img" aria-label={`Daily practice ${Math.round(goalPct * 100)} percent of ${SMART_GOAL_MINUTES} minutes`}>
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="32" cy="32" r="27" fill="none" strokeWidth="6" stroke="var(--color-surface-raised)" />
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke={goalDone ? 'var(--color-correct)' : 'var(--color-accent)'}
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - goalPct)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center font-mono text-[0.95rem] font-bold tabular-nums text-text-bright">
                {goalDone ? '✓' : `${Math.round(goalPct * 100)}%`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-dim">Daily practice</span>
              <b className="text-base font-semibold text-text-bright">
                {goalDone ? `Goal done, ${mins} min` : `${mins} of ${SMART_GOAL_MINUTES} min`}
              </b>
              <span className="text-xs font-semibold text-accent">{goalDone ? 'Nice work today' : `${SMART_GOAL_MINUTES - mins} min to go`}</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-xs text-text-dim">
              <div
                className="w-full max-w-[21rem]"
                role="img"
                aria-label={`Level: ${LEVELS[levelIndex(state.unlocked)].name}. ${state.unlocked} of 26 keys open.`}
                title={`You are here: ${LEVELS[levelIndex(state.unlocked)].name} (${state.unlocked} of 26 keys open)`}
              >
                <div className="relative">
                  <div className="grid gap-[3px]" style={{ gridTemplateColumns: '30fr 40fr 30fr' }}>
                    {LEVELS.map((l, i) => {
                      const to = i < 2 ? LEVELS[i + 1].from : 26;
                      const fill = Math.max(0, Math.min(1, (state.unlocked - l.from) / (to - l.from)));
                      return (
                        <span key={l.name} className="block h-1 overflow-hidden rounded-full bg-surface-raised">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${fill * 100}%` }} />
                        </span>
                      );
                    })}
                  </div>
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface shadow-[0_0_0_3px_var(--color-accent-bg)]"
                    style={{ left: `${Math.min(100, Math.max(0, ((state.unlocked - 6) / 20) * 100))}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-1.5 grid text-[11px]" style={{ gridTemplateColumns: '30fr 40fr 30fr' }} aria-hidden="true">
                  {LEVELS.map((l, i) => (
                    <span
                      key={l.name}
                      className={`text-center ${i === levelIndex(state.unlocked) ? 'font-semibold text-accent' : i < levelIndex(state.unlocked) ? 'text-text' : 'text-text-dim/60'}`}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
              <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                {plan.focus.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    {plan.fresh.length > 0 ? 'New' : pinned ? 'Your pick' : 'Practicing'}
                    {plan.focus.map((k) => (
                      <kbd key={k} className="rounded border border-accent bg-accent-bg px-1.5 py-px font-mono text-[10px] font-bold uppercase text-accent">
                        {k}
                      </kbd>
                    ))}
                  </span>
                )}
                {plan.review.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    Review
                    {plan.review.map((k) => (
                      <kbd key={k} className="rounded border border-surface-border bg-surface-raised px-1.5 py-px font-mono text-[10px] font-bold uppercase text-text-bright">
                        {k}
                      </kbd>
                    ))}
                  </span>
                )}
                {plan.focus.length === 0 && plan.review.length === 0 && state.unlocked >= 26 && 'All keys open'}
              </span>
            </div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }} role="group" aria-label="Your letters, click an open one to make it the focus">
              {ALPHABET.map((k) => {
                const pos = KEY_ORDER.indexOf(k);
                if (pos >= state.unlocked) {
                  return (
                    <span
                      key={k}
                      title={`${k.toUpperCase()}: locked${pos === state.unlocked ? '. Next to unlock.' : '.'}`}
                      className="flex flex-col items-center gap-0.5 rounded-md py-0.5 font-mono text-[0.8rem] font-semibold uppercase text-text-dim opacity-45"
                    >
                      {k}
                      <Lock className="h-2.5 w-2.5" aria-label={`${k} locked`} />
                    </span>
                  );
                }
                const st = state.keys[k];
                const m = mastery(state, k);
                const color = st?.n ? LEVEL_COLORS[levelOf(m)] : 'var(--color-surface-raised)';
                const d = startScores[k] !== undefined ? m - startScores[k] : 0;
                const inFocus = plan.focus.includes(k);
                const isReview = plan.review.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pickKey(k)}
                    disabled={isRunning}
                    aria-pressed={pinned === k}
                    title={`${k.toUpperCase()}: ${st?.n ? `score ${m.toFixed(2)}, ${Math.round(st.acc * 100)}% accurate, ${Math.round(st.ms)} ms` : 'new key'}${inFocus ? '. In this session’s focus.' : isReview ? '. Review key.' : ''} Click to make it the focus.`}
                    className={`relative flex flex-col items-center gap-[3px] rounded-md px-0 py-[3px] font-mono text-[0.8rem] font-semibold uppercase text-text-bright transition-colors ${
                      inFocus ? 'bg-accent-bg ring-1 ring-accent' : isReview ? 'shadow-[inset_0_-2px_0_var(--color-text-dim)]' : 'hover:bg-surface-raised'
                    } ${isRunning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {k}
                    <span className="h-[3px] w-[62%] overflow-hidden rounded-sm bg-surface-raised" aria-hidden="true">
                      <span className="block h-full" style={{ width: `${st?.n ? Math.max(12, Math.round(Math.min(1, m) * 100)) : 0}%`, background: color }} />
                    </span>
                    {d >= 0.04 && <span className="absolute -top-[3px] right-0 text-[0.5rem] leading-none text-correct">▲</span>}
                    {d <= -0.04 && <span className="absolute -top-[3px] right-0 text-[0.5rem] leading-none text-error">▼</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Segments of this session */}
        <div>
          <div
            className="grid grid-cols-4 gap-1"
            role="img"
            aria-label={`Segment ${Math.min(segIdx + 1, SESSION_SEGMENTS)} of ${SESSION_SEGMENTS}`}
          >
            {Array.from({ length: SESSION_SEGMENTS }, (_, i) => (
              <span key={i} className="block h-[3px] overflow-hidden rounded-sm bg-surface-raised">
                <span
                  className={`block h-full ${i < segIdx ? 'bg-correct' : 'bg-accent'}`}
                  style={{
                    width: i < segIdx ? '100%' : i === segIdx && chars.length ? `${Math.min(100, (currentIndex / chars.length) * 100)}%` : '0%',
                  }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* The text */}
        <div className="relative mt-2 min-h-[6.5rem] cursor-text py-3" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
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

        <div className="mt-3 flex min-h-8 items-center justify-center text-center">
          {!isRunning && note && (
            <p role="status" className="max-w-2xl text-sm text-text-dim">
              {note}
            </p>
          )}
        </div>

        <div className="mt-3 animate-fade-up">
          <LiveKeyboard nextChar={chars[currentIndex]?.char} lastKeyCorrect={lastKeyFlash} compact />
        </div>

        <PracticeFeedback log={log} collapsible />

        <details className="mt-4 rounded-xl border border-surface-border bg-surface">
          <summary className="cursor-pointer select-none px-3.5 py-3 text-sm font-semibold text-text-bright">How this session adapted</summary>
          <div className="px-3.5 pb-4 text-sm">
            {reasons.length === 0 ? (
              <p className="text-text-dim">Nothing yet. Finish a segment and the changes are listed here.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {reasons.map((r, i) => (
                  <li key={i} className="text-text">
                    <span className="text-text-dim">Segment {r.seg}: </span>
                    {r.text}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-text-dim">
              In the key row, a gold ring marks the keys this session works on, an underline marks keys kept for review, and ▲ ▼ show how a key moved since the
              session started. Difficulty is {state.difficulty} of 10; it moves by one step at most per session. The next key opens when every open key has been typed 6 times or more and scores 0.7 or more (accuracy counts most, speed less, judged against your own
              median speed). These numbers are our own starting values.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
