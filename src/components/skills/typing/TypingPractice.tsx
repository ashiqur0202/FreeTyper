'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PenTool, RotateCcw, Shuffle, Target } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts, keyboardRows, homeRowKeys, getKeyColor } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';

type Category = 'quotes' | 'news' | 'code' | 'fun' | 'weak';

export default function TypingPractice() {
  const [category, setCategory] = useState<Category>('quotes');
  const [text, setText] = useState('');
  const [result, setResult] = useState<TypingSession | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addSession, updateKeyStats, checkAchievements, getWeakKeys } = useTypingProgress();

  const generateText = useCallback((cat: Category) => {
    if (cat === 'weak') {
      const weak = getWeakKeys();
      if (weak.length === 0) {
        // No weak key data yet, use random practice text
        const random = practiceTexts[Math.floor(Math.random() * practiceTexts.length)];
        return random.text;
      }
      // Generate text focusing on weak keys
      const weakChars = weak.map((k) => k.key).join('');
      const words: string[] = [];
      const commonWords = [
        'the','be','to','of','and','a','in','that','have','it','for','not','on','with',
        'he','as','you','do','at','this','but','his','by','from','they','we','say','her',
        'she','or','an','will','my','one','all','would','there','their','what','so','up',
        'out','if','about','who','get','which','go','me','when','make','can','like','time',
        'no','just','him','know','take','people','into','year','your','good','some','could',
        'them','see','other','than','then','now','look','only','come','its','over','think',
        'also','back','after','use','two','how','our','work','first','well','way','even',
        'new','want','because','any','these','give','day','most','us','great','between',
        'need','large','under','never','same','last','long','world','still','own','find',
        'here','thing','many','right','begin','since','before','little','end','real','life',
      ];
      // Filter words containing weak keys
      const focused = commonWords.filter((w) =>
        weakChars.split('').some((c) => w.includes(c))
      );
      const pool = focused.length > 5 ? focused : commonWords;
      for (let i = 0; i < 40; i++) {
        words.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      return words.join(' ');
    }
    const pool = practiceTexts.filter((p) => p.category === cat);
    if (pool.length === 0) return practiceTexts[0].text;
    return pool[Math.floor(Math.random() * pool.length)].text;
  }, [getWeakKeys]);

  useEffect(() => {
    setText(generateText(category));
  }, [category, generateText]);

  const handleComplete = useCallback((session: TypingSession) => {
    const updated = { ...session, mode: 'practice' as const, modeDetail: category };
    addSession(updated);
    setResult(updated);
  }, [addSession, category]);

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, restart, handleInput } =
    useTypingEngine({
      text,
      onComplete: handleComplete,
      onKeyStats: (key, correct) => updateKeyStats(key, correct),
    });

  useEffect(() => {
    if (isComplete) {
      const newA = checkAchievements();
      if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    }
  }, [isComplete, checkAchievements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length === 1) { e.preventDefault(); handleInput(e.key); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, isComplete]);

  const nextText = () => {
    setResult(null);
    setText(generateText(category));
    restart();
  };

  const changeCategory = (cat: Category) => {
    setCategory(cat);
    setResult(null);
  };

  const categories: { id: Category; label: string }[] = [
    { id: 'quotes', label: 'quotes' },
    { id: 'news', label: 'news' },
    { id: 'code', label: 'code' },
    { id: 'fun', label: 'fun' },
    { id: 'weak', label: 'weak keys' },
  ];

  return (
    <div>
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      {/* Category selector — minimal pills */}
      <div className="flex flex-wrap items-center gap-1 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => changeCategory(cat.id)}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              category === cat.id
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats bar — minimal */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-gray-500 tabular-nums">{wpm}<span className="text-gray-700"> wpm</span></span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-500 tabular-nums">{accuracy}<span className="text-gray-700">%</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={nextText} className="text-gray-700 hover:text-gray-400 transition-colors" title="New text">
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setResult(null); restart(); }} className="text-gray-700 hover:text-gray-400 transition-colors" title="Restart">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Typing area */}
      {!result ? (
        <div
          className="cursor-text py-2"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="typing-text text-xl leading-relaxed tracking-wide">
            {chars.map((c, i) => (
              <span key={i} className={`char ${c.status}`}>{c.char}</span>
            ))}
          </div>
          <input ref={inputRef} className="sr-only" autoFocus />
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="font-mono text-5xl font-light text-white tabular-nums">{result.wpm}</p>
          <p className="mt-1 text-xs text-gray-600">words per minute</p>
          <div className="mt-6 flex items-center justify-center gap-6 font-mono text-sm">
            <div className="text-center">
              <p className="tabular-nums text-gray-400">{result.accuracy}%</p>
              <p className="text-xs text-gray-700">accuracy</p>
            </div>
            <div className="text-gray-800">|</div>
            <div className="text-center">
              <p className="tabular-nums text-gray-400">{result.correctChars}</p>
              <p className="text-xs text-gray-700">correct</p>
            </div>
            <div className="text-gray-800">|</div>
            <div className="text-center">
              <p className="tabular-nums text-gray-400">{result.incorrectChars}</p>
              <p className="text-xs text-gray-700">errors</p>
            </div>
          </div>
          <button onClick={nextText} className="mt-8 px-4 py-1.5 text-xs text-amber-500 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors">
            next text
          </button>
        </div>
      )}
    </div>
  );
}
