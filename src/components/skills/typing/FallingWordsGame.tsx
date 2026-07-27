'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, Heart, ArrowDown } from 'lucide-react';
import { fallingWordsTiers, getRandomWords, getWordDifficulty, scoringRules } from './gameData';
import { useTypingProgress } from './useTypingProgress';
import type { TypingSession } from './types';

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  typed: string;
  matched: boolean;
  exploding: boolean;
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={`font-mono text-2xl font-light tabular-nums sm:text-3xl ${accent ? 'text-accent' : 'text-text-bright'}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-dim">{label}</p>
    </div>
  );
}

export default function FallingWordsGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tier, setTier] = useState(0);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { addSession, updateKeyStats } = useTypingProgress();
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);
  const frameRef = useRef(0);
  const wordIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<FallingWord[]>([]);
  const livesRef = useRef(3);
  const wordsClearedRef = useRef(0);
  const tierRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    try {
      setHighScore(parseInt(localStorage.getItem('freetyper-fw-highscore') || '0', 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setWords([]);
    wordsRef.current = [];
    setInput('');
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setTier(0);
    tierRef.current = 0;
    setWordsCleared(0);
    wordsClearedRef.current = 0;
    totalCharsRef.current = 0;
    startTimeRef.current = performance.now();
    lastSpawnRef.current = 0;
    wordIdRef.current = 0;
    setWpm(0);
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameover');
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const mins = elapsed / 60;
    const finalWpm = mins > 0 ? Math.round(totalCharsRef.current / 5 / mins) : 0;

    setWpm(finalWpm);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      try {
        localStorage.setItem('freetyper-fw-highscore', String(scoreRef.current));
      } catch {
        /* ignore */
      }
    }

    const session: TypingSession = {
      id: `game-fw-${Date.now()}`,
      date: Date.now(),
      wpm: finalWpm,
      accuracy: 100,
      correctChars: totalCharsRef.current,
      incorrectChars: 0,
      totalChars: totalCharsRef.current,
      duration: Math.round(elapsed),
      mode: 'game',
      modeDetail: `Falling Words - Tier ${tierRef.current + 1}`,
    };
    addSession(session);
  }, [addSession, highScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const mins = elapsed / 60;
      if (mins > 0) {
        setWpm(Math.round(totalCharsRef.current / 5 / mins));
      }

      const tierConfig = fallingWordsTiers[tierRef.current] || fallingWordsTiers[fallingWordsTiers.length - 1];
      const spawnInterval = 2000 / (1 + tierConfig.minWords * 0.3);
      if (now - lastSpawnRef.current > spawnInterval && wordsRef.current.length < tierConfig.maxWords + 1) {
        const newWord = getRandomWords(1, tierConfig.difficulties)[0];
        const fw: FallingWord = {
          id: wordIdRef.current++,
          word: newWord,
          x: 10 + Math.random() * 70,
          y: 0,
          speed: tierConfig.speed,
          typed: '',
          matched: false,
          exploding: false,
        };
        wordsRef.current = [...wordsRef.current, fw];
        setWords(wordsRef.current);
        lastSpawnRef.current = now;
      }

      let lostLife = false;
      wordsRef.current = wordsRef.current
        .map((w) => {
          if (w.exploding) return w;
          return { ...w, y: w.y + w.speed };
        })
        .filter((w) => {
          if (w.y >= 95 && !w.matched && !w.exploding) {
            lostLife = true;
            return false;
          }
          return true;
        });

      if (lostLife) {
        livesRef.current = Math.max(0, livesRef.current - 1);
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          endGame();
          return;
        }
      }

      setWords([...wordsRef.current]);
      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gameState, endGame]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      const typed = value.toLowerCase();

      let matched = false;
      wordsRef.current = wordsRef.current.map((w) => {
        if (w.matched || w.exploding) return w;
        if (w.word.toLowerCase().startsWith(typed) && typed.length > 0) {
          return { ...w, typed };
        }
        if (w.word.toLowerCase() === typed) {
          matched = true;
          const diff = getWordDifficulty(w.word);
          const points = scoringRules.basePoints[diff];
          scoreRef.current += points;
          setScore(scoreRef.current);
          totalCharsRef.current += w.word.length;
          wordsClearedRef.current++;
          setWordsCleared(wordsClearedRef.current);

          for (const ch of w.word) {
            updateKeyStats(ch.toLowerCase(), true);
          }

          const tierConfig = fallingWordsTiers[tierRef.current];
          if (tierConfig && wordsClearedRef.current >= tierConfig.wordsToAdvance * (tierRef.current + 1)) {
            if (tierRef.current < fallingWordsTiers.length - 1) {
              tierRef.current++;
              setTier(tierRef.current);
            }
          }

          return { ...w, matched: true, exploding: true };
        }
        return w;
      });

      if (matched) {
        setInput('');
        setTimeout(() => {
          wordsRef.current = wordsRef.current.filter((w) => !w.exploding);
          setWords([...wordsRef.current]);
        }, 300);
      }

      setWords([...wordsRef.current]);
    },
    [updateKeyStats],
  );

  useEffect(() => {
    if (gameState === 'playing') inputRef.current?.focus();
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
          <ArrowDown className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-text-bright">Falling Words</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-dim">
          Type each word before it hits the bottom. Tiers ramp speed and difficulty — 3 lives, local high score.
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
          <Link href="/typing-game-word-attack" className="text-accent hover:underline">
            Word Attack
          </Link>{' '}
          · track runs in{' '}
          <Link href="/typing-progress" className="text-accent hover:underline">
            progress
          </Link>
        </p>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-error">game over</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-bright">Run complete</h2>
        <div className="mt-8 grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Score" value={score} accent />
          <Stat label="WPM" value={wpm} />
          <Stat label="Words" value={wordsCleared} />
          <Stat label="Best" value={highScore} accent />
        </div>
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-raised/40 px-4 py-3">
        <div className="flex items-center gap-5 font-mono text-sm">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">score</span>
            <p className="tabular-nums text-accent">{score}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">tier</span>
            <p className="tabular-nums text-text-bright">
              {tier + 1}
              <span className="text-text-dim">/10</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">wpm</span>
            <p className="tabular-nums text-text">{wpm}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`h-4 w-4 ${i < lives ? 'fill-error text-error' : 'text-surface-border'}`}
            />
          ))}
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="relative h-[min(420px,55vh)] overflow-hidden rounded-xl border border-surface-border bg-surface"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-error/10 to-transparent" />
        {words.map((w) => (
          <div
            key={w.id}
            className={`absolute font-mono text-base font-medium transition-all duration-75 sm:text-lg ${
              w.exploding
                ? 'scale-150 text-accent opacity-0'
                : w.typed
                  ? 'text-accent'
                  : 'text-text-bright'
            }`}
            style={{ left: `${w.x}%`, top: `${w.y}%` }}
          >
            {w.exploding ? (
              '✦'
            ) : (
              <>
                <span className="text-accent">{w.typed}</span>
                <span className="text-text-dim">{w.word.slice(w.typed.length)}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 font-mono text-base text-text-bright placeholder:text-text-dim/50 focus:border-accent focus:outline-none"
        placeholder="type a falling word…"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
