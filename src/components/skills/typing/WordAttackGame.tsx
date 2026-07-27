'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, Zap, Clock, Crosshair } from 'lucide-react';
import { wordAttackRounds, getRandomWords, getWordDifficulty, scoringRules } from './gameData';
import { useTypingProgress } from './useTypingProgress';
import type { TypingSession } from './types';

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="text-center">
      <p
        className={`font-mono text-2xl font-light tabular-nums sm:text-3xl ${
          accent ? 'text-accent' : 'text-text-bright'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-dim">{label}</p>
    </div>
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
  const [roundResults, setRoundResults] = useState<number[]>([]);
  const [wpm, setWpm] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { addSession, updateKeyStats } = useTypingProgress();
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);

  const roundConfig = wordAttackRounds[currentRound] || wordAttackRounds[0];

  useEffect(() => {
    setMounted(true);
    try {
      setHighScore(parseInt(localStorage.getItem('freetyper-wa-highscore') || '0', 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const prepareRound = useCallback((round: number) => {
    const config = wordAttackRounds[round];
    setRoundWords(getRandomWords(config.wordCount, config.difficulties));
    setCurrentWordIndex(0);
    setInput('');
    setCorrectInRound(0);
    setTimeLeft(config.timePerWord);
  }, []);

  const startGame = useCallback(() => {
    setGameState('round-intro');
    setCurrentRound(0);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setMultiplier(1);
    setTotalCorrect(0);
    setTotalWords(0);
    setRoundResults([]);
    totalCharsRef.current = 0;
    startTimeRef.current = performance.now();
    setWpm(0);
    prepareRound(0);
  }, [prepareRound]);

  const startRound = useCallback(() => {
    setGameState('playing');
    setTimeLeft(roundConfig.timePerWord);
    inputRef.current?.focus();
  }, [roundConfig.timePerWord]);

  const finishGame = useCallback(
    (finalCorrect: number, finalTotal: number) => {
      setGameState('gameover');
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const mins = elapsed / 60;
      const finalWpm = mins > 0 ? Math.round(totalCharsRef.current / 5 / mins) : 0;
      setWpm(finalWpm);

      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('freetyper-wa-highscore', String(scoreRef.current));
        } catch {
          /* ignore */
        }
      }

      addSession({
        id: `game-wa-${Date.now()}`,
        date: Date.now(),
        wpm: finalWpm,
        accuracy: finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0,
        correctChars: totalCharsRef.current,
        incorrectChars: 0,
        totalChars: totalCharsRef.current,
        duration: Math.round(elapsed),
        mode: 'game',
        modeDetail: 'Word Attack',
      });
    },
    [highScore, addSession],
  );

  const advanceWord = useCallback(
    (correct: boolean) => {
      const nextTotal = totalWords + 1;
      const nextCorrect = totalCorrect + (correct ? 1 : 0);
      setTotalWords(nextTotal);
      if (correct) {
        setTotalCorrect(nextCorrect);
        setCorrectInRound((p) => p + 1);
      }

      const nextIdx = currentWordIndex + 1;
      if (nextIdx >= roundWords.length) {
        const roundScore = correctInRound + (correct ? 1 : 0);
        setRoundResults((r) => [...r, roundScore]);

        if (currentRound + 1 >= wordAttackRounds.length) {
          finishGame(nextCorrect, nextTotal);
        } else {
          setGameState('round-end');
        }
        return;
      }

      setCurrentWordIndex(nextIdx);
      setTimeLeft(roundConfig.timePerWord);
      setInput('');
    },
    [
      totalWords,
      totalCorrect,
      currentWordIndex,
      roundWords.length,
      correctInRound,
      currentRound,
      roundConfig.timePerWord,
      finishGame,
    ],
  );

  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setCombo(0);
          setMultiplier(1);
          advanceWord(false);
          return roundConfig.timePerWord;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentWordIndex, currentRound, advanceWord, roundConfig.timePerWord]);

  const handleInput = useCallback(
    (value: string) => {
      setInput(value);
      const typed = value.toLowerCase().trim();
      const target = roundWords[currentWordIndex]?.toLowerCase();

      if (typed === target && target) {
        const diff = getWordDifficulty(target);
        const base = scoringRules.basePoints[diff];
        const newCombo = combo + 1;
        const idx = Math.min(Math.floor(newCombo / 3), scoringRules.comboMultipliers.length - 1);
        const mult = scoringRules.comboMultipliers[idx];
        const points = Math.round(base * mult);

        scoreRef.current += points;
        setScore(scoreRef.current);
        setCombo(newCombo);
        setMultiplier(mult);
        totalCharsRef.current += target.length;

        for (const ch of target) updateKeyStats(ch, true);
        advanceWord(true);
      }
    },
    [roundWords, currentWordIndex, combo, advanceWord, updateKeyStats],
  );

  useEffect(() => {
    if (gameState !== 'playing') return;
    const id = setInterval(() => {
      const mins = (performance.now() - startTimeRef.current) / 60000;
      if (mins > 0) setWpm(Math.round(totalCharsRef.current / 5 / mins));
    }, 500);
    return () => clearInterval(id);
  }, [gameState]);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-dim">Loading…</div>
    );
  }

  if (gameState === 'idle') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-2 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-raised text-accent">
          <Crosshair className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-text-bright">Word Attack</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-dim">
          Type each target before the timer hits zero. Build combos for multipliers across 8 escalating
          rounds.
        </p>
        <p className="mt-4 font-mono text-sm text-text-dim">
          best <span className="text-accent">{highScore}</span>
        </p>
        <button
          type="button"
          onClick={startGame}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
        >
          <Play className="h-4 w-4" /> start game
        </button>
        <p className="mt-6 text-[11px] text-text-dim/70">
          Also try{' '}
          <Link href="/typing-game-falling-words" className="text-accent hover:underline">
            Falling Words
          </Link>{' '}
          · track runs in{' '}
          <Link href="/typing-progress" className="text-accent hover:underline">
            progress
          </Link>
        </p>
      </div>
    );
  }

  if (gameState === 'round-intro') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent">get ready</p>
        <h2 className="mt-2 text-3xl font-semibold text-text-bright">Round {currentRound + 1}</h2>
        <p className="mt-3 text-sm text-text-dim">
          {roundConfig.wordCount} words · {roundConfig.difficulties.join(' / ')} ·{' '}
          {roundConfig.timePerWord}s each
        </p>
        <button
          type="button"
          onClick={startRound}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-surface hover:opacity-90"
        >
          <Play className="h-4 w-4" /> go
        </button>
      </div>
    );
  }

  if (gameState === 'round-end') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">round complete</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-bright">Round {currentRound + 1}</h2>
        <div className="mt-6 flex gap-10">
          <Stat label="Correct" value={correctInRound} />
          <Stat label="Score" value={score} accent />
        </div>
        <button
          type="button"
          onClick={() => {
            const next = currentRound + 1;
            setCurrentRound(next);
            prepareRound(next);
            setGameState('round-intro');
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-surface hover:opacity-90"
        >
          next round
        </button>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent">complete</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-bright">Game finished</h2>
        <div className="mt-8 grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Score" value={score} accent />
          <Stat label="WPM" value={wpm} />
          <Stat label="Hits" value={`${totalCorrect}/${totalWords}`} />
          <Stat label="Best" value={highScore} accent />
        </div>
        {roundResults.length > 0 && (
          <p className="mt-4 text-[11px] text-text-dim">
            rounds: {roundResults.map((n, i) => `R${i + 1}:${n}`).join(' · ')}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={startGame}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-medium text-surface hover:opacity-90"
          >
            <RotateCcw className="h-3.5 w-3.5" /> play again
          </button>
          <Link
            href="/typing-progress"
            className="rounded-lg border border-surface-border px-4 py-2.5 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            view progress
          </Link>
        </div>
      </div>
    );
  }

  const currentWord = roundWords[currentWordIndex] || '';
  const typed = input.toLowerCase();
  const isCorrectSoFar = currentWord.toLowerCase().startsWith(typed);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-raised/40 px-4 py-3">
        <div className="flex items-center gap-5 font-mono text-sm">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">round</span>
            <p className="tabular-nums text-text-bright">
              {currentRound + 1}
              <span className="text-text-dim">/8</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">score</span>
            <p className="tabular-nums text-accent">{score}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">wpm</span>
            <p className="tabular-nums text-text">{wpm}</p>
          </div>
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
  );
}
