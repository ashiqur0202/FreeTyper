'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Heart, ArrowDown } from 'lucide-react';
import { fallingWordsTiers, getRandomWords, getWordDifficulty, scoringRules } from './gameData';
import { useTypingProgress } from './useTypingProgress';
import { useKeySound } from './useKeySound';
import { trackEvent } from '@/lib/analytics';
import GameFeedback, {
  fallingCoachNote,
  loadGameLog,
  prependGameLog,
  type GameLogEntry,
} from './GameFeedback';

const LOG_KEY = 'freetyper-fw-log';

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
  const [log, setLog] = useState<GameLogEntry[]>([]);

  const { addSession, updateKeyStats } = useTypingProgress();
  const playKeySound = useKeySound();
  const prevInputLenRef = useRef(0);
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const wordIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<FallingWord[]>([]);
  const livesRef = useRef(3);
  const wordsClearedRef = useRef(0);
  const tierRef = useRef(0);
  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    try {
      setHighScore(parseInt(localStorage.getItem('freetyper-fw-highscore') || '0', 10) || 0);
    } catch {
      /* ignore */
    }
    setLog(loadGameLog(LOG_KEY));
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
    missesRef.current = 0;
    endedRef.current = false;
    setWpm(0);
  }, []);

  const endGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setGameState('gameover');
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const mins = elapsed / 60;
    const finalWpm = mins > 0 ? Math.round(totalCharsRef.current / 5 / mins) : 0;
    const hits = wordsClearedRef.current;
    const misses = missesRef.current;
    const attempts = hits + misses;
    const accuracy = attempts > 0 ? Math.round((hits / attempts) * 100) : 0;

    setWpm(finalWpm);
    trackEvent('game_complete', {
      game: 'falling_words',
      score: scoreRef.current,
      wpm: finalWpm,
      accuracy,
      level: tierRef.current + 1,
    });

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      try {
        localStorage.setItem('freetyper-fw-highscore', String(scoreRef.current));
      } catch {
        /* ignore */
      }
    }

    addSession({
      id: `game-fw-${Date.now()}`,
      date: Date.now(),
      wpm: finalWpm,
      accuracy,
      correctChars: totalCharsRef.current,
      incorrectChars: misses,
      totalChars: totalCharsRef.current,
      duration: Math.round(elapsed),
      mode: 'game',
      modeDetail: `Falling Words - Tier ${tierRef.current + 1}`,
    });

    setLog((prev) => {
      const draft: Omit<GameLogEntry, 'headline' | 'tip' | 'tone'> = {
        id: `fw-${Date.now()}`,
        date: Date.now(),
        game: 'falling',
        score: scoreRef.current,
        wpm: finalWpm,
        words: hits,
        hits,
        misses,
        accuracy,
        duration: Math.round(elapsed),
        detail: `tier ${tierRef.current + 1}`,
      };
      const note = fallingCoachNote(draft, prev[0], prev);
      return prependGameLog(LOG_KEY, { ...draft, ...note }, prev);
    });
  }, [addSession, highScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    lastFrameRef.current = 0;

    const gameLoop = (now: number) => {
      // Fall speed is defined per 60 Hz frame; scale by real elapsed time so the
      // game plays the same on 60, 120 and 144 Hz displays.
      const dt = lastFrameRef.current ? Math.min(now - lastFrameRef.current, 50) : 1000 / 60;
      lastFrameRef.current = now;
      const frameScale = dt / (1000 / 60);

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
          return { ...w, y: w.y + w.speed * frameScale };
        })
        .filter((w) => {
          if (w.y >= 95 && !w.matched && !w.exploding) {
            lostLife = true;
            missesRef.current += 1;
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
      const typed = value.toLowerCase();
      let matched = false;

      wordsRef.current = wordsRef.current.map((w) => {
        if (w.matched || w.exploding) return w;
        const target = w.word.toLowerCase();
        if (!typed) return { ...w, typed: '' };
        if (!matched && target === typed) {
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

          return { ...w, typed, matched: true, exploding: true };
        }
        if (target.startsWith(typed)) {
          return { ...w, typed };
        }
        return { ...w, typed: '' };
      });

      setInput(matched ? '' : value);
      setWords([...wordsRef.current]);

      // Key sound (only if enabled in Settings): tick when the typing still fits a falling word.
      const grew = value.length > prevInputLenRef.current;
      prevInputLenRef.current = matched ? 0 : value.length;
      if (grew && typed) {
        playKeySound(
          matched ||
            wordsRef.current.some((w) => !w.exploding && w.word.toLowerCase().startsWith(typed)),
        );
      }

      if (matched) {
        window.setTimeout(() => {
          wordsRef.current = wordsRef.current.filter((w) => !w.exploding);
          setWords([...wordsRef.current]);
          inputRef.current?.focus();
        }, 300);
      }
    },
    [updateKeyStats, playKeySound],
  );

  useEffect(() => {
    if (gameState === 'playing') inputRef.current?.focus();
  }, [gameState]);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-dim">Loading…</div>
    );
  }

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">falling words</p>
          <p className="font-mono text-sm text-text-dim">
            best <span className="tabular-nums text-accent">{highScore}</span>
          </p>
        </div>
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-raised/30 px-6 py-10 text-center">
          <ArrowDown className="h-6 w-6 text-accent" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-dim">
            Type each word before it hits the bottom. 10 tiers, 3 lives.
          </p>
          <button
            type="button"
            onClick={startGame}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface hover:opacity-90"
          >
            <Play className="h-4 w-4" /> start game
          </button>
        </div>
        <GameFeedback
          log={log}
          extraActions={
            <Link
              href="/typing-practice"
              className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
            >
              practice
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-3 font-mono text-sm text-text">
          <span className="tabular-nums text-accent">{score}</span>
          <span className="text-[11px] text-text-dim">pts</span>
          <span className="text-surface-border">·</span>
          <span className="tabular-nums text-text-bright">{tier + 1}/10</span>
          <span className="text-[11px] text-text-dim">tier</span>
          <span className="text-surface-border">·</span>
          <span className="tabular-nums text-text-bright">{wpm}</span>
          <span className="text-[11px] text-text-dim">wpm</span>
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
