'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Heart } from 'lucide-react';
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

export default function FallingWordsGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tier, setTier] = useState(0);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try { return parseInt(localStorage.getItem('freetyper-fw-highscore') || '0'); } catch { return 0; }
  });

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

  const currentTier = fallingWordsTiers[tier] || fallingWordsTiers[fallingWordsTiers.length - 1];

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
    const finalWpm = mins > 0 ? Math.round((totalCharsRef.current / 5) / mins) : 0;

    setWpm(finalWpm);

    // Save high score
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('freetyper-fw-highscore', String(scoreRef.current));
    }

    // Save session
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

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const areaHeight = gameAreaRef.current?.clientHeight || 400;

    const gameLoop = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const mins = elapsed / 60;
      if (mins > 0) {
        setWpm(Math.round((totalCharsRef.current / 5) / mins));
      }

      // Spawn words
      const tierConfig = fallingWordsTiers[tierRef.current] || fallingWordsTiers[fallingWordsTiers.length - 1];
      const spawnInterval = 2000 / (1 + tierConfig.minWords * 0.3);
      if (now - lastSpawnRef.current > spawnInterval && wordsRef.current.length < tierConfig.maxWords + 1) {
        const diffs = tierConfig.difficulties;
        const newWord = getRandomWords(1, diffs)[0];
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

      // Move words
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
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [gameState, endGame]);

  // Handle input
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    const typed = value.toLowerCase();

    // Check matches
    let matched = false;
    wordsRef.current = wordsRef.current.map((w) => {
      if (w.matched || w.exploding) return w;
      if (w.word.toLowerCase().startsWith(typed) && typed.length > 0) {
        // Partial match
        return { ...w, typed };
      }
      if (w.word.toLowerCase() === typed) {
        // Full match!
        matched = true;
        const diff = getWordDifficulty(w.word);
        const points = scoringRules.basePoints[diff];
        scoreRef.current += points;
        setScore(scoreRef.current);
        totalCharsRef.current += w.word.length;
        wordsClearedRef.current++;
        setWordsCleared(wordsClearedRef.current);

        // Track key stats
        for (const ch of w.word) {
          updateKeyStats(ch.toLowerCase(), true);
        }

        // Check tier advance
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
      // Remove exploded words after animation
      setTimeout(() => {
        wordsRef.current = wordsRef.current.filter((w) => !w.exploding || w.id !== wordsRef.current.find((x) => x.exploding)?.id);
        setWords([...wordsRef.current]);
      }, 300);
    }

    setWords([...wordsRef.current]);
  }, [updateKeyStats]);

  // Focus input on game start
  useEffect(() => {
    if (gameState === 'playing') inputRef.current?.focus();
  }, [gameState]);

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-12 min-h-[400px]">
        <h2 className="text-3xl font-bold text-white">Falling Words</h2>
        <p className="mt-3 text-gray-400 text-center max-w-md">
          Type the falling words before they hit the bottom. Words get faster and harder as you level up!
        </p>
        <div className="mt-4 text-sm text-gray-500">
          High Score: <span className="text-amber-400 font-bold">{highScore}</span>
        </div>
        <button
          onClick={startGame}
          className="mt-6 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500"
        >
          <Play className="h-5 w-5" /> Start Game
        </button>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex flex-col items-center rounded-xl border border-red-500/30 bg-gray-900 p-12">
        <h2 className="text-3xl font-bold text-red-400">Game Over</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{score}</p>
            <p className="text-sm text-gray-400">Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{wpm}</p>
            <p className="text-sm text-gray-400">WPM</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-300">{wordsCleared}</p>
            <p className="text-sm text-gray-400">Words</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{highScore}</p>
            <p className="text-sm text-gray-400">Best</p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-8 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500"
        >
          <RotateCcw className="h-5 w-5" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500">Score</span>
            <p className="text-lg font-bold text-amber-400">{score}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Tier</span>
            <p className="text-lg font-bold text-white">{tier + 1}/10</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">WPM</span>
            <p className="text-lg font-bold text-gray-300">{wpm}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`h-5 w-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
          ))}
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative h-[400px] overflow-hidden rounded-xl border border-gray-800 bg-gray-950"
        onClick={() => inputRef.current?.focus()}
      >
        {words.map((w) => (
          <div
            key={w.id}
            className={`absolute font-mono text-lg font-bold transition-all duration-75 ${
              w.exploding
                ? 'text-amber-300 scale-150 opacity-0'
                : w.typed
                ? 'text-amber-400'
                : 'text-white'
            }`}
            style={{ left: `${w.x}%`, top: `${w.y}%`, transform: w.exploding ? 'scale(1.5)' : undefined }}
          >
            {w.exploding ? '✨' : (
              <>
                <span className="text-amber-400">{w.typed}</span>
                <span>{w.word.slice(w.typed.length)}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-lg text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
        placeholder="Type the falling words..."
        autoFocus
      />
    </div>
  );
}
