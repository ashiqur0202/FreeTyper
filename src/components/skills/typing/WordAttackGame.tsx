'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Clock } from 'lucide-react';
import { wordAttackRounds, getRandomWords, getWordDifficulty, scoringRules } from './gameData';
import { useTypingProgress } from './useTypingProgress';
import type { TypingSession } from './types';

export default function WordAttackGame() {
  const [gameState, setGameState] = useState<'idle' | 'round-intro' | 'playing' | 'round-end' | 'gameover'>('idle');
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
  const [highScore, setHighScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try { return parseInt(localStorage.getItem('freetyper-wa-highscore') || '0'); } catch { return 0; }
  });

  const { addSession, updateKeyStats } = useTypingProgress();
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);

  const roundConfig = wordAttackRounds[currentRound];

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
    prepareRound(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prepareRound = useCallback((round: number) => {
    const config = wordAttackRounds[round];
    const words = getRandomWords(config.wordCount, config.difficulties);
    setRoundWords(words);
    setCurrentWordIndex(0);
    setInput('');
    setCorrectInRound(0);
    setTimeLeft(config.timePerWord);
  }, []);

  const startRound = useCallback(() => {
    setGameState('playing');
    setTimeLeft(roundConfig.timePerWord);
    if (inputRef.current) inputRef.current.focus();
  }, [roundConfig]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          // Time's up for this word — missed
          setCombo(0);
          setMultiplier(1);
          advanceWord(false);
          return roundConfig.timePerWord;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentWordIndex, currentRound]);

  const advanceWord = useCallback((correct: boolean) => {
    setTotalWords((prev) => prev + 1);

    if (correct) {
      setTotalCorrect((prev) => prev + 1);
      setCorrectInRound((prev) => prev + 1);
    }

    const nextIdx = currentWordIndex + 1;
    if (nextIdx >= roundWords.length) {
      // Round over
      setCorrectInRound((prev) => {
        setRoundResults((r) => [...r, prev]);
        return prev;
      });

      if (currentRound + 1 >= wordAttackRounds.length) {
        // Game over
        finishGame();
      } else {
        setGameState('round-end');
      }
      return;
    }

    setCurrentWordIndex(nextIdx);
    setTimeLeft(roundConfig.timePerWord);
    setInput('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, currentRound, roundWords.length, roundConfig.timePerWord]);

  const finishGame = useCallback(() => {
    setGameState('gameover');
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const mins = elapsed / 60;
    const finalWpm = mins > 0 ? Math.round((totalCharsRef.current / 5) / mins) : 0;
    setWpm(finalWpm);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('freetyper-wa-highscore', String(scoreRef.current));
    }

    const session: TypingSession = {
      id: `game-wa-${Date.now()}`,
      date: Date.now(),
      wpm: finalWpm,
      accuracy: totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0,
      correctChars: totalCharsRef.current,
      incorrectChars: 0,
      totalChars: totalCharsRef.current,
      duration: Math.round(elapsed),
      mode: 'game',
      modeDetail: 'Word Attack',
    };
    addSession(session);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highScore, addSession, totalCorrect, totalWords]);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    const typed = value.toLowerCase().trim();
    const target = roundWords[currentWordIndex]?.toLowerCase();

    if (typed === target && target) {
      // Correct!
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundWords, currentWordIndex, combo, advanceWord, updateKeyStats]);

  // Idle screen
  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-12 min-h-[400px]">
        <h2 className="text-3xl font-bold text-white">Word Attack</h2>
        <p className="mt-3 text-center text-gray-400 max-w-md">
          Type words as fast as you can! Build combos for score multipliers. 8 rounds of increasing difficulty.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          High Score: <span className="font-bold text-amber-400">{highScore}</span>
        </div>
        <button onClick={startGame} className="mt-6 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500">
          <Play className="h-5 w-5" /> Start Game
        </button>
      </div>
    );
  }

  // Round intro
  if (gameState === 'round-intro') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-gray-900 p-12 min-h-[400px]">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-400">Get Ready</p>
        <h2 className="mt-2 text-4xl font-bold text-white">Round {currentRound + 1}</h2>
        <p className="mt-3 text-gray-400">{roundConfig.wordCount} words — {roundConfig.difficulties.join('/')} difficulty</p>
        <button onClick={startRound} className="mt-6 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500">
          <Play className="h-5 w-5" /> Go!
        </button>
      </div>
    );
  }

  // Round end
  if (gameState === 'round-end') {
    return (
      <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 p-12">
        <h2 className="text-2xl font-bold text-white">Round {currentRound + 1} Complete</h2>
        <div className="mt-4 flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{correctInRound}</p>
            <p className="text-xs text-gray-400">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{score}</p>
            <p className="text-xs text-gray-400">Score</p>
          </div>
        </div>
        <button
          onClick={() => {
            const next = currentRound + 1;
            setCurrentRound(next);
            prepareRound(next);
            setGameState('round-intro');
          }}
          className="mt-6 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500"
        >
          Next Round
        </button>
      </div>
    );
  }

  // Game over
  if (gameState === 'gameover') {
    return (
      <div className="flex flex-col items-center rounded-xl border border-amber-500/30 bg-gray-900 p-12">
        <h2 className="text-3xl font-bold text-amber-400">Game Complete!</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="text-center"><p className="text-3xl font-bold text-amber-400">{score}</p><p className="text-sm text-gray-400">Score</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-white">{wpm}</p><p className="text-sm text-gray-400">WPM</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-green-400">{totalCorrect}/{totalWords}</p><p className="text-sm text-gray-400">Accuracy</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-amber-500">{highScore}</p><p className="text-sm text-gray-400">Best</p></div>
        </div>
        <button onClick={startGame} className="mt-8 flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-500">
          <RotateCcw className="h-5 w-5" /> Play Again
        </button>
      </div>
    );
  }

  // Playing
  const currentWord = roundWords[currentWordIndex] || '';
  const typed = input.toLowerCase();
  const isCorrectSoFar = currentWord.toLowerCase().startsWith(typed);

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500">Round</span>
            <p className="text-lg font-bold text-white">{currentRound + 1}/8</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Score</span>
            <p className="text-lg font-bold text-amber-400">{score}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">WPM</span>
            <p className="text-lg font-bold text-gray-300">{wpm}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {combo > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-amber-600/20 px-2 py-1">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{combo}x{multiplier}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={`font-mono text-lg font-bold ${timeLeft <= 1 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Word display */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-8 min-h-[200px]">
        <p className="text-xs text-gray-500 mb-3">Type this word:</p>
        <div className="flex">
          {currentWord.split('').map((ch, i) => {
            const isTyped = i < typed.length;
            const isMatch = isTyped && typed[i] === ch.toLowerCase();
            const isWrong = isTyped && typed[i] !== ch.toLowerCase();
            return (
              <span
                key={i}
                className={`text-4xl font-mono font-bold ${
                  isMatch ? 'text-amber-400' : isWrong ? 'text-red-400' : isTyped ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs text-gray-500">Word {currentWordIndex + 1}/{roundWords.length}</span>
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 font-mono text-lg placeholder-gray-600 focus:outline-none ${
          isCorrectSoFar || !typed
            ? 'border-gray-700 bg-gray-900 text-white focus:border-amber-500'
            : 'border-red-500 bg-red-900/10 text-red-400 focus:border-red-400'
        }`}
        placeholder="Type here..."
        autoFocus
      />
    </div>
  );
}
