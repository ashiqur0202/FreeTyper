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
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import { trackEvent } from '@/lib/analytics';
import { fingerMap } from './typingData';
import { FINGER_NAMES, PLAIN_FINGER } from './guideLayout';
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

export default function SmartLessons() {
  const [state, setState] = useState<SmartState>(emptyState);
  const [round, setRound] = useState<RoundText>({ text: '', realWords: 0 });
  const [coach, setCoach] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
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
      const level = LEVELS[levelIndex(outcome.state.unlocked)].name;
      addSession(
        withoutRun({ ...session, mode: 'lesson' as const, modeDetail: `Smart lessons · ${level} · ${outcome.state.unlocked} keys` }),
      );
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

  const { chars, currentIndex, isRunning, isComplete, restart, handleInput, handleBackspace } = useTypingEngine({
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
  const main = focus.fresh[0] ?? focus.weak[0];
  const isNew = focus.fresh.length > 0;
  const more = focus.weak.filter((k) => k !== main);
  const last = state.history[state.history.length - 1];
  const before = state.history[state.history.length - 2];
  const mins = Math.floor(today.seconds / 60);
  const goalDone = today.seconds >= today.goal * 60;
  const goalPct = Math.min(100, (today.seconds / (today.goal * 60)) * 100);

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="flex w-full flex-col gap-3">
        {/* Level, daily goal and the keys */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-surface-border bg-surface px-3.5 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <div className="flex flex-wrap gap-1.5" aria-label="Level">
              {LEVELS.map((l, i) => {
                const locked = i > li;
                return (
                  <span
                    key={l.name}
                    title={locked ? `Locked. Unlocks at ${l.from} keys (${l.from - state.unlocked} more).` : i === li ? 'Your level now.' : 'Passed.'}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      i === li
                        ? 'border-accent bg-accent-bg text-accent'
                        : locked
                          ? 'border-dashed border-surface-border text-text-dim opacity-60'
                          : 'border-surface-border text-text-bright'
                    }`}
                  >
                    {locked && <Lock className="h-2.5 w-2.5" aria-hidden="true" />}
                    {l.name}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-dim">
              <span>
                {goalDone ? 'Daily goal done' : <>Daily goal <b className="tabular-nums text-text-bright">{mins}</b> of {today.goal} min</>}
              </span>
              <span className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-border" role="img" aria-label={`Daily goal ${Math.round(goalPct)} percent`}>
                <span className="block h-full rounded-full bg-accent" style={{ width: `${goalPct}%` }} />
              </span>
            </div>
          </div>

          <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }} role="list" aria-label="Keys in the order they unlock">
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
                  className={`relative grid h-7 place-items-center rounded-md border font-mono text-[0.8rem] font-semibold uppercase ${
                    open ? 'border-surface-border text-text-bright' : 'border-dashed border-surface-border text-text-dim opacity-40'
                  }`}
                  style={{
                    background: open ? `color-mix(in srgb, var(--color-correct) ${Math.round(m * 60)}%, var(--color-surface-raised))` : undefined,
                    boxShadow: open ? `0 2px 0 ${fresh ? 'var(--color-accent)' : weak ? 'var(--color-error)' : 'var(--color-surface-border)'}` : undefined,
                    color: fresh ? 'var(--color-accent)' : undefined,
                  }}
                >
                  {k}
                  {!open && <Lock className="absolute right-0.5 top-0.5 h-2 w-2" aria-hidden="true" />}
                </span>
              );
            })}
          </div>
        </div>

        {/* After the first round: where you are and what the next round works on */}
        {state.rounds > 0 && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-text-dim">
            <span className="font-semibold uppercase tracking-wider">Round {state.rounds + 1}</span>
            {last && (
              <span>
                Last round{' '}
                <b className="tabular-nums text-text-bright">
                  {last.wpm} wpm · {Math.round(last.accuracy)}%
                </b>
                {before && (
                  <span className="tabular-nums">
                    {' '}
                    (before {before.wpm} wpm · {Math.round(before.accuracy)}%)
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {main && state.rounds > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-raised px-3 py-1.5">
            <span
              className={`grid h-8 w-8 place-items-center rounded-md border-2 bg-surface font-mono text-base font-bold uppercase ${
                isNew ? 'border-accent text-accent' : 'border-surface-border text-text-bright'
              }`}
            >
              {main}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-text-bright">
                {isNew ? 'New key' : 'Extra practice'} · {main.toUpperCase()}
              </p>
              <p className="text-text">{fingerLine(main)}</p>
            </div>
            {more.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-text-dim">
                Also practice
                {more.map((k) => (
                  <kbd key={k} className="rounded-md border border-surface-border bg-surface px-2 font-mono font-bold text-text-bright">
                    {k}
                  </kbd>
                ))}
              </p>
            )}
          </div>
        )}

        {/* The text */}
        <div
          className="cursor-text rounded-lg bg-surface-raised px-4 py-3"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <TypingPassage chars={chars} currentIndex={currentIndex} firstCharRef={firstCharRef} currentCharRef={currentCharRef} />
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

        <p className="min-h-[1.25rem] text-xs text-text-dim" role="status">
          {isRunning ? '' : coach[0] ?? ''}
        </p>

        {/* The keyboard */}
        <LiveKeyboard nextChar={chars[currentIndex]?.char} lastKeyCorrect={lastKeyFlash} compact />
      </div>
    </div>
  );
}
