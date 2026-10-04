'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Zap, Clock, Crosshair } from 'lucide-react';
import { wordAttackRounds, getRandomWords, getWordDifficulty, scoringRules } from './gameData';
import { useTypingProgress } from './useTypingProgress';
import { useKeySound } from './useKeySound';
import GameFeedback, {
  attackCoachNote,
  loadGameLog,
  prependGameLog,
  type GameLogEntry,
} from './GameFeedback';

const LOG_KEY = 'freetyper-wa-log';

function practiceLink() {
  return (
    <Link
      href="/typing-practice"
      className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
    >
      practice
    </Link>
  );
}

export default function WordAttackGame() {
  const [gameState, setGameState] = useState<
    'idle' | 'round-intro' | 'playing' | 'round-end' | 'gameover'
  >('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctInRound, setCorrectInRound] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [log, setLog] = useState<GameLogEntry[]>([]);

  const { addSession, updateKeyStats } = useTypingProgress();
  const playKeySound = useKeySound();
  const prevInputLenRef = useRef(0);
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const currentRoundRef = useRef(0);
  const currentWordIndexRef = useRef(0);
  const roundWordsRef = useRef<string[]>([]);
  const totalWordsRef = useRef(0);
  const totalCorrectRef = useRef(0);
  const correctInRoundRef = useRef(0);
  const logRef = useRef<GameLogEntry[]>([]);
  const timeLeftRef = useRef(0);
  const closingRoundRef = useRef(false);
  const advanceWordRef = useRef<(correct: boolean) => void>(() => {});
  // One id per game, so every round-end save updates the same log entry.
  const gameIdRef = useRef('');
  // Only time spent actually playing counts toward WPM and typing time
  // (not the "get ready" and "round complete" screens).
  const activeMsRef = useRef(0);
  const segmentStartRef = useRef(0);
  // What has already been written to progress, so each round adds only its own share.
  const savedRef = useRef({ chars: 0, hits: 0, attempts: 0, activeSec: 0 });

  const getActiveSeconds = useCallback(() => {
    const running = segmentStartRef.current ? performance.now() - segmentStartRef.current : 0;
    return (activeMsRef.current + running) / 1000;
  }, []);

  logRef.current = log;

  useEffect(() => {
    setMounted(true);
    try {
      setHighScore(parseInt(localStorage.getItem('freetyper-wa-highscore') || '0', 10) || 0);
    } catch {
      /* ignore */
    }
    setLog(loadGameLog(LOG_KEY));
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveRun = useCallback(() => {
    const elapsed = getActiveSeconds();
    const mins = elapsed / 60;
    const finalWpm = mins > 0 ? Math.round(totalCharsRef.current / 5 / mins) : 0;
    const hits = totalCorrectRef.current;
    const attempts = totalWordsRef.current;
    const accuracy = attempts > 0 ? Math.round((hits / attempts) * 100) : 0;
    const misses = Math.max(0, attempts - hits);
    const roundsPlayed = Math.min(currentRoundRef.current + 1, wordAttackRounds.length);
    // Drop this game's earlier snapshot so one game shows as one entry.
    const all = logRef.current;
    const prev = all[0]?.id === gameIdRef.current ? all.slice(1) : all;
    const draft: Omit<GameLogEntry, 'headline' | 'tip' | 'tone'> = {
      id: gameIdRef.current,
      date: Date.now(),
      game: 'attack',
      score: scoreRef.current,
      wpm: finalWpm,
      words: hits,
      hits,
      misses,
      accuracy,
      duration: Math.round(elapsed),
      detail: `${roundsPlayed} round${roundsPlayed === 1 ? '' : 's'}`,
      combo: maxComboRef.current,
    };
    const entry: GameLogEntry = { ...draft, ...attackCoachNote(draft, prev[0], prev) };
    const next = prependGameLog(LOG_KEY, entry, prev);
    logRef.current = next;
    setLog(next);
    setWpm(finalWpm);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      try {
        localStorage.setItem('freetyper-wa-highscore', String(scoreRef.current));
      } catch {
        /* ignore */
      }
    }

    try {
      // Save only this round's share, so progress is not double-counted.
      const saved = savedRef.current;
      const dChars = totalCharsRef.current - saved.chars;
      const dHits = hits - saved.hits;
      const dAttempts = attempts - saved.attempts;
      const dSec = elapsed - saved.activeSec;
      if (dAttempts > 0) {
        const dMins = dSec / 60;
        addSession({
          id: `game-${gameIdRef.current}-r${roundsPlayed}`,
          date: Date.now(),
          wpm: dMins > 0 ? Math.round(dChars / 5 / dMins) : 0,
          accuracy: Math.round((dHits / dAttempts) * 100),
          correctChars: dChars,
          incorrectChars: dAttempts - dHits,
          totalChars: dChars,
          duration: Math.round(dSec),
          mode: 'game',
          modeDetail: `Word Attack - Round ${roundsPlayed}`,
        });
        savedRef.current = {
          chars: totalCharsRef.current,
          hits,
          attempts,
          activeSec: elapsed,
        };
      }
    } catch {
      /* ignore */
    }

    return entry;
  }, [addSession, getActiveSeconds, highScore]);

  const prepareRound = useCallback((round: number) => {
    const config = wordAttackRounds[round];
    if (!config) return false;
    const words = getRandomWords(config.wordCount, config.difficulties);
    roundWordsRef.current = words;
    currentWordIndexRef.current = 0;
    correctInRoundRef.current = 0;
    closingRoundRef.current = false;
    timeLeftRef.current = config.timePerWord;
    setRoundWords(words);
    setCurrentWordIndex(0);
    setInput('');
    setCorrectInRound(0);
    setTimeLeft(config.timePerWord);
    return true;
  }, []);

  const startGame = useCallback(() => {
    stopTimer();
    closingRoundRef.current = false;
    currentRoundRef.current = 0;
    totalWordsRef.current = 0;
    totalCorrectRef.current = 0;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    totalCharsRef.current = 0;
    startTimeRef.current = performance.now();
    gameIdRef.current = `wa-${Date.now()}`;
    activeMsRef.current = 0;
    segmentStartRef.current = 0;
    savedRef.current = { chars: 0, hits: 0, attempts: 0, activeSec: 0 };
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    setTotalCorrect(0);
    setTotalWords(0);
    setWpm(0);
    prepareRound(0);
    setGameState('round-intro');
  }, [prepareRound, stopTimer]);

  const startRound = useCallback(() => {
    closingRoundRef.current = false;
    const t = wordAttackRounds[currentRoundRef.current]?.timePerWord ?? 5;
    timeLeftRef.current = t;
    setTimeLeft(t);
    segmentStartRef.current = performance.now();
    setGameState('playing');
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const completeRound = useCallback(() => {
    if (closingRoundRef.current) return;
    closingRoundRef.current = true;
    stopTimer();
    if (segmentStartRef.current) {
      activeMsRef.current += performance.now() - segmentStartRef.current;
      segmentStartRef.current = 0;
    }
    saveRun();
    const last = currentRoundRef.current >= wordAttackRounds.length - 1;
    setGameState(last ? 'gameover' : 'round-end');
  }, [saveRun, stopTimer]);

  const advanceWord = useCallback(
    (correct: boolean) => {
      if (closingRoundRef.current) return;

      totalWordsRef.current += 1;
      setTotalWords(totalWordsRef.current);
      if (correct) {
        totalCorrectRef.current += 1;
        correctInRoundRef.current += 1;
        setTotalCorrect(totalCorrectRef.current);
        setCorrectInRound(correctInRoundRef.current);
      } else {
        comboRef.current = 0;
        setCombo(0);
        setMultiplier(1);
      }

      const nextIdx = currentWordIndexRef.current + 1;
      if (nextIdx >= roundWordsRef.current.length) {
        completeRound();
        return;
      }

      currentWordIndexRef.current = nextIdx;
      setCurrentWordIndex(nextIdx);
      setInput('');
      const t = wordAttackRounds[currentRoundRef.current]?.timePerWord ?? 5;
      timeLeftRef.current = t;
      setTimeLeft(t);
    },
    [completeRound],
  );
  advanceWordRef.current = advanceWord;

  useEffect(() => {
    if (gameState !== 'playing') {
      stopTimer();
      return;
    }

    stopTimer();
    timerRef.current = window.setInterval(() => {
      timeLeftRef.current = Math.max(0, Math.round((timeLeftRef.current - 0.1) * 10) / 10);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        stopTimer();
        advanceWordRef.current(false);
      }
    }, 100);

    return stopTimer;
  }, [gameState, currentWordIndex, stopTimer]);

  const handleInput = useCallback(
    (value: string) => {
      setInput(value);
      const typed = value.toLowerCase().trim();
      const target = roundWordsRef.current[currentWordIndexRef.current]?.toLowerCase();

      // Key sound (only if enabled in Settings): tick while the typing still fits the word.
      const grew = value.length > prevInputLenRef.current;
      prevInputLenRef.current = value.length;
      if (grew && typed) playKeySound(Boolean(target) && target.startsWith(typed));

      if (!typed || typed !== target) return;
      prevInputLenRef.current = 0;

      const diff = getWordDifficulty(target);
      const base = scoringRules.basePoints[diff];
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      if (newCombo > maxComboRef.current) maxComboRef.current = newCombo;
      const idx = Math.min(Math.floor(newCombo / 3), scoringRules.comboMultipliers.length - 1);
      const mult = scoringRules.comboMultipliers[idx];
      const points = Math.round(base * mult);
      scoreRef.current += points;
      setScore(scoreRef.current);
      setCombo(newCombo);
      setMultiplier(mult);
      totalCharsRef.current += target.length;
      for (const ch of target) updateKeyStats(ch, true);
      setInput('');
      advanceWord(true);
    },
    [advanceWord, updateKeyStats, playKeySound],
  );

  useEffect(() => {
    if (gameState !== 'playing') return;
    const id = window.setInterval(() => {
      const mins = getActiveSeconds() / 60;
      if (mins > 0) setWpm(Math.round(totalCharsRef.current / 5 / mins));
    }, 500);
    return () => window.clearInterval(id);
  }, [gameState, getActiveSeconds]);

  const goNextRound = () => {
    const next = currentRoundRef.current + 1;
    if (next >= wordAttackRounds.length) {
      setGameState('gameover');
      return;
    }
    currentRoundRef.current = next;
    setCurrentRound(next);
    if (!prepareRound(next)) {
      setGameState('gameover');
      return;
    }
    setGameState('round-intro');
  };

  if (!mounted) {
    return (
      <div className="w-full">
        <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">word attack</p>
        <div className="h-20" />
      </div>
    );
  }

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">word attack</p>
          <p className="font-mono text-sm text-text-dim">
            best <span className="tabular-nums text-accent">{highScore}</span>
          </p>
        </div>
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-raised/30 px-6 py-10 text-center">
          <Crosshair className="h-6 w-6 text-accent" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-dim">
            Type each word before the timer hits zero. Combos stack across 8 rounds.
          </p>
          <button
            type="button"
            onClick={startGame}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface hover:opacity-90"
          >
            <Play className="h-4 w-4" /> start game
          </button>
        </div>
        <GameFeedback log={log} extraActions={practiceLink()} />
      </div>
    );
  }

  const currentWord = roundWords[currentWordIndex] || '';
  const typed = input.toLowerCase();
  const isCorrectSoFar = currentWord.toLowerCase().startsWith(typed);
  const roundConfig = wordAttackRounds[currentRound] || wordAttackRounds[0];

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">word attack</p>
        <p className="font-mono text-sm text-text-dim">
          best <span className="tabular-nums text-accent">{highScore}</span>
        </p>
      </div>

      {gameState === 'round-intro' && (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-raised/30 px-6 py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent">get ready</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-bright">Round {currentRound + 1}</h2>
          <p className="mt-3 text-sm text-text-dim">
            {roundConfig.wordCount} words · {roundConfig.difficulties.join(' / ')} ·{' '}
            {roundConfig.timePerWord}s each
          </p>
          <button
            type="button"
            onClick={startRound}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface hover:opacity-90"
          >
            <Play className="h-4 w-4" /> go
          </button>
        </div>
      )}

      {gameState === 'round-end' && (
        <>
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-raised/30 px-6 py-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">round complete</p>
            <p className="mt-2 font-mono text-sm text-text">
              <span className="tabular-nums text-accent">{score}</span>
              <span className="text-text-dim"> pts</span>
              <span className="text-surface-border"> · </span>
              round {currentRound + 1}/{wordAttackRounds.length}
            </p>
            <button
              type="button"
              onClick={goNextRound}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface hover:opacity-90"
            >
              next round
            </button>
          </div>
          <GameFeedback log={log} extraActions={practiceLink()} />
        </>
      )}

      {gameState === 'playing' && (
        <div className="space-y-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex items-center gap-3 font-mono text-sm text-text">
              <span className="tabular-nums text-text-bright">
                {currentRound + 1}/{wordAttackRounds.length}
              </span>
              <span className="text-[11px] text-text-dim">round</span>
              <span className="text-surface-border">·</span>
              <span className="tabular-nums text-accent">{score}</span>
              <span className="text-[11px] text-text-dim">pts</span>
              <span className="text-surface-border">·</span>
              <span className="tabular-nums text-text-bright">{wpm}</span>
              <span className="text-[11px] text-text-dim">wpm</span>
            </div>
            <div className="flex items-center gap-3">
              {combo > 0 && (
                <div className="inline-flex items-center gap-1 rounded-md bg-accent-bg px-2 py-1 font-mono text-xs text-accent">
                  <Zap className="h-3.5 w-3.5" />
                  {combo}×{multiplier}
                </div>
              )}
              <div className="inline-flex items-center gap-1 font-mono text-sm">
                <Clock className={`h-3.5 w-3.5 ${timeLeft <= 1 ? 'text-error' : 'text-text-dim'}`} />
                <span className={`tabular-nums ${timeLeft <= 1 ? 'text-error' : 'text-text-bright'}`}>
                  {timeLeft.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-raised/30 px-6 py-10">
            <p className="mb-4 text-[10px] uppercase tracking-widest text-text-dim">type this word</p>
            <div className="flex flex-wrap justify-center">
              {currentWord.split('').map((ch, i) => {
                const isTyped = i < typed.length;
                const isMatch = isTyped && typed[i] === ch.toLowerCase();
                const isWrong = isTyped && typed[i] !== ch.toLowerCase();
                return (
                  <span
                    key={i}
                    className={`font-mono text-3xl font-medium sm:text-4xl ${
                      isMatch ? 'text-accent' : isWrong ? 'text-error' : 'text-text-dim'
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
            <p className="mt-6 font-mono text-[11px] text-text-dim">
              word {currentWordIndex + 1}/{roundWords.length}
            </p>
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-base focus:outline-none ${
              isCorrectSoFar || !typed
                ? 'border-surface-border bg-surface-raised text-text-bright focus:border-accent'
                : 'border-error bg-error-bg text-error focus:border-error'
            }`}
            placeholder="type here…"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
