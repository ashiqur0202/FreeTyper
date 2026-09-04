'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Share2, Check, RotateCcw, Image, PenTool } from 'lucide-react';
import type { TypingSession } from './types';

/* ── Rank helpers ── */
function getRank(wpm: number) {
  if (wpm >= 100) return { label: 'ELITE', emoji: '🏆', gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20', border: 'border-amber-500/40', glow: 'shadow-amber-500/10' };
  if (wpm >= 80) return { label: 'PRO', emoji: '⚡', gradient: 'from-blue-500/15 via-cyan-500/10 to-blue-600/15', border: 'border-blue-400/30', glow: 'shadow-blue-500/10' };
  if (wpm >= 60) return { label: 'SKILLED', emoji: '🎯', gradient: 'from-green-500/15 via-emerald-500/10 to-green-600/15', border: 'border-green-400/30', glow: 'shadow-green-500/10' };
  if (wpm >= 40) return { label: 'AVERAGE', emoji: '⌨️', gradient: 'from-slate-500/15 via-gray-500/10 to-slate-600/15', border: 'border-slate-400/30', glow: 'shadow-slate-500/10' };
  return { label: 'BEGINNER', emoji: '🌱', gradient: 'from-purple-500/15 via-violet-500/10 to-purple-600/15', border: 'border-purple-400/30', glow: 'shadow-purple-500/10' };
}

function getPercentile(wpm: number): string {
  if (wpm >= 100) return 'Top 5%';
  if (wpm >= 80) return 'Fast';
  if (wpm >= 70) return 'Above Avg';
  if (wpm >= 50) return 'Average';
  if (wpm >= 30) return 'Below Avg';
  return 'Beginner';
}

/* ── WPM bar fill (max 120 for visual) ── */
function wpmBarPercent(wpm: number) {
  return Math.min(100, (wpm / 120) * 100);
}

/* ── Animated WPM counter ── */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{display}</>;
}

/* ── Stat block ── */
function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`font-mono text-lg tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-text-dim">{label}</p>
    </div>
  );
}

interface ResultCardProps {
  result: TypingSession;
  onNext: () => void;
  /** Primary action label (default: "next test"). */
  nextLabel?: string;
  /** Shortcut hint under actions (default: "tab · next test"). */
  nextHint?: string;
  /** Optional secondary action (e.g. retry lesson). */
  onRetry?: () => void;
  retryLabel?: string;
  /** Optional link to daily practice (used on the speed-test result). */
  practiceHref?: string;
  practiceLabel?: string;
}

export default function ResultCard({
  result,
  onNext,
  nextLabel = 'next test',
  nextHint = 'tab · next test',
  onRetry,
  retryLabel = 'retry',
  practiceHref,
  practiceLabel = 'practice',
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const rank = getRank(result.wpm);

  useEffect(() => {
    if (result.wpm >= 60) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [result.wpm]);

  const shareText = useCallback(async () => {
    const text = `${result.wpm} WPM · ${result.accuracy}% accuracy · ${rank.label} — FreeTyper`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, [result, rank]);

  const shareImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      // Use the browser's html-to-image via canvas approach
      // Since we don't have html-to-image, copy rich text to clipboard
      const text = `┌─────────────────────────────┐
│  🎯 FreeTyper Speed Test    │
│                             │
│     ${String(result.wpm).padEnd(3)} WPM               │
│  ${rank.emoji}  ${rank.label.padEnd(10)}             │
│                             │
│  Accuracy:  ${String(result.accuracy).padStart(3)}%           │
│  Correct:   ${String(result.correctChars).padStart(4)}           │
│  Errors:    ${String(result.incorrectChars).padStart(4)}           │
│  Level:     ${getPercentile(result.wpm).padEnd(10)}     │
│                             │
│  freetyper.com              │
└─────────────────────────────┘`;
      await navigator.clipboard.writeText(text);
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2000);
    } catch { /* noop */ }
  }, [result, rank]);

  return (
    <div className="relative w-full animate-result-appear">
      {/* Confetti particles */}
      {showConfetti && <ConfettiParticles />}

      {/* The card */}
      <div
        ref={cardRef}
        className={`relative mx-auto max-w-md overflow-hidden rounded-2xl border ${rank.border} bg-gradient-to-br ${rank.gradient} p-6 shadow-2xl ${rank.glow}`}
      >
        {/* Subtle grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(var(--color-text-dim) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-dim) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{rank.emoji}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-text-dim">{rank.label}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-surface/60 px-2.5 py-1">
            <span className="text-[10px] text-text-dim">FreeTyper</span>
          </div>
        </div>

        {/* Big WPM */}
        <div className="relative mt-6 text-center">
          <p className="font-mono text-7xl font-extralight tabular-nums text-accent">
            <AnimatedNumber value={result.wpm} />
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-text-dim">words per minute</p>
        </div>

        {/* WPM bar */}
        <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-1000 ease-out"
            style={{ width: `${wpmBarPercent(result.wpm)}%` }}
          />
        </div>

        {/* Stats grid */}
        <div className="relative mt-6 grid grid-cols-4 gap-2">
          <StatBlock label="Accuracy" value={`${result.accuracy}%`} color="text-text-bright" />
          <StatBlock label="Correct" value={String(result.correctChars)} color="text-correct" />
          <StatBlock label="Errors" value={String(result.incorrectChars)} color="text-error" />
          <StatBlock label="Level" value={getPercentile(result.wpm)} color="text-accent" />
        </div>

        {/* Duration tag */}
        <div className="relative mt-4 text-center">
          <span className="inline-block rounded-full bg-surface/60 px-3 py-0.5 text-[10px] text-text-dim">
            {result.duration}s test
          </span>
        </div>
      </div>

      {/* Actions below card */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-xs font-medium text-surface transition-all hover:brightness-110 active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {nextLabel}
        </button>
        {practiceHref && (
          <Link
            href={practiceHref}
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-bg px-4 py-2.5 text-xs text-accent transition-all hover:border-accent hover:brightness-110 active:scale-95"
          >
            <PenTool className="h-3.5 w-3.5" />
            {practiceLabel}
          </Link>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2.5 text-xs text-text-dim transition-all hover:border-accent/30 hover:text-text active:scale-95"
          >
            {retryLabel}
          </button>
        )}
        <button
          onClick={shareImage}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2.5 text-xs text-text-dim transition-all hover:border-accent/30 hover:text-text active:scale-95"
        >
          {imageCopied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Image className="h-3.5 w-3.5" />}
          {imageCopied ? 'copied!' : 'card'}
        </button>
        <button
          onClick={shareText}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2.5 text-xs text-text-dim transition-all hover:border-accent/30 hover:text-text active:scale-95"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? 'copied' : 'share'}
        </button>
      </div>

      {/* Shortcut hint */}
      <p className="mt-3 text-center text-[10px] text-surface-border">
        {nextHint}
      </p>
    </div>
  );
}

/* ── Mini confetti effect ── */
function ConfettiParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 4 + Math.random() * 6,
    color: ['#e2b714', '#f59e0b', '#fbbf24', '#d97706', '#92400e', '#c44250', '#8a8a6e'][Math.floor(Math.random() * 7)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 50 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle absolute"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
