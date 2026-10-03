'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Hand, Home, Target } from 'lucide-react';
import {
  keyboardRows,
  keyboardColors,
  fingerMap,
  homeRowKeys,
  getKeyColor,
} from './typingData';
import { useTypingProgress } from './useTypingProgress';

const FINGER_LABELS = ['Pinky', 'Ring', 'Middle', 'Index'] as const;

type ZoneId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'all';

const ZONES: { id: ZoneId; label: string; color?: string }[] = [
  { id: 'all', label: 'all fingers' },
  { id: 'left-pinky', label: 'L pinky', color: keyboardColors['left-pinky'] },
  { id: 'left-ring', label: 'L ring', color: keyboardColors['left-ring'] },
  { id: 'left-middle', label: 'L middle', color: keyboardColors['left-middle'] },
  { id: 'left-index', label: 'L index', color: keyboardColors['left-index'] },
  { id: 'right-index', label: 'R index', color: keyboardColors['right-index'] },
  { id: 'right-middle', label: 'R middle', color: keyboardColors['right-middle'] },
  { id: 'right-ring', label: 'R ring', color: keyboardColors['right-ring'] },
  { id: 'right-pinky', label: 'R pinky', color: keyboardColors['right-pinky'] },
];

function zoneForKey(key: string): string | null {
  const m = fingerMap[key.toLowerCase()];
  if (!m) return null;
  return `${m.hand}-${['pinky', 'ring', 'middle', 'index'][m.finger]}`;
}

function formatFinger(key: string): string {
  if (key === ' ') return 'either thumb';
  const m = fingerMap[key.toLowerCase()];
  if (!m) return '—';
  return `${m.hand} ${FINGER_LABELS[m.finger].toLowerCase()}`;
}

export default function KeyboardGuide() {
  const [selectedKey, setSelectedKey] = useState<string | null>('f');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<ZoneId>('all');
  const [homeOnly, setHomeOnly] = useState(false);
  const { progress, getWeakKeys } = useTypingProgress();

  const activeKey = hoveredKey ?? selectedKey;

  const keyStats = (key: string) => {
    const k = key.toLowerCase();
    return progress.keyStats[k] || null;
  };

  const weakKeys = useMemo(() => getWeakKeys().slice(0, 6), [getWeakKeys, progress.keyStats]);

  const selectedStats = activeKey ? keyStats(activeKey) : null;
  const selectedColor = activeKey ? getKeyColor(activeKey) : undefined;

  const isDimmed = (key: string) => {
    if (homeOnly && !homeRowKeys.has(key) && key !== ' ') return true;
    if (activeZone === 'all') return false;
    return zoneForKey(key) !== activeZone;
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Finger zone filters */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-1">
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setActiveZone(z.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all ${
              activeZone === z.id
                ? 'bg-accent-bg text-accent'
                : 'text-text-dim hover:bg-surface-raised hover:text-text'
            }`}
          >
            {z.color && (
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: z.color }}
                aria-hidden
              />
            )}
            {z.label}
          </button>
        ))}
      </div>

      {/* Home-row toggle + meta */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-xs text-text-dim">
        <button
          type="button"
          onClick={() => setHomeOnly((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
            homeOnly
              ? 'bg-accent-bg text-accent'
              : 'text-text-dim hover:bg-surface-raised hover:text-text'
          }`}
        >
          <Home className="h-3 w-3" />
          home row only
        </button>
        <span className="text-surface-border">·</span>
        <span className="inline-flex items-center gap-1">
          <Hand className="h-3 w-3 text-accent" />
          hover or click a key
        </span>
      </div>

      {/* Interactive keyboard */}
      <div className="w-full pb-2">
        <div className="w-full space-y-1.5">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => {
                const color = getKeyColor(key);
                const isHome = homeRowKeys.has(key);
                const dim = isDimmed(key);
                const isActive = activeKey === key;
                const stats = keyStats(key);
                const acc =
                  stats && stats.totalPresses > 0
                    ? Math.round((stats.correctPresses / stats.totalPresses) * 100)
                    : null;

                return (
                  <button
                    key={key}
                    type="button"
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => setSelectedKey(key)}
                    className={`key relative h-11 min-w-0 flex-1 text-xs font-mono sm:h-12 sm:text-sm ${
                      isHome ? 'home-row' : ''
                    } ${isActive ? 'key-hint z-10' : ''} ${
                      dim ? 'opacity-20' : ''
                    }`}
                    style={
                      !isActive
                        ? {
                            borderColor: dim ? undefined : color,
                            color: dim ? undefined : color,
                            boxShadow: stats && acc !== null && acc < 90
                              ? `0 0 0 1px ${color}40`
                              : undefined,
                          }
                        : undefined
                    }
                    aria-label={`Key ${key}, ${formatFinger(key)}`}
                    aria-pressed={selectedKey === key}
                  >
                    <span>{key === ';' ? ';' : key.toUpperCase()}</span>
                    {isHome && (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onMouseEnter={() => setHoveredKey(' ')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => setSelectedKey(' ')}
              className={`key h-11 w-[55%] max-w-xl text-xs font-mono sm:h-12 ${
                activeKey === ' ' ? 'key-hint' : ''
              } ${isDimmed(' ') ? 'opacity-20' : ''}`}
              style={
                activeKey !== ' '
                  ? {
                      borderColor: getKeyColor(' '),
                      color: getKeyColor(' '),
                    }
                  : undefined
              }
              aria-label="Space bar, either thumb"
            >
              space
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel — fixed height so hover does not reflow the centered page. */}
      <div className="mt-8 w-full rounded-xl border border-surface-border bg-surface-raised/50 p-5">
        {activeKey ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-dim">selected key</p>
              <p
                className="mt-1 font-mono text-4xl font-light tabular-nums"
                style={{ color: selectedColor }}
              >
                {activeKey === ' ' ? '␣' : activeKey.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-text">
                <span className="text-text-dim">finger · </span>
                {formatFinger(activeKey)}
              </p>
              <p
                className={`mt-1 text-xs text-accent ${
                  homeRowKeys.has(activeKey) ? '' : 'invisible'
                }`}
              >
                Home row rest position
              </p>
            </div>
            <div className="min-h-[7.5rem] min-w-[9rem] rounded-lg border border-surface-border bg-surface px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-text-dim">your stats</p>
              {selectedStats && selectedStats.totalPresses > 0 ? (
                <div className="mt-2 space-y-1 font-mono text-sm">
                  <p className="tabular-nums text-text-bright">
                    {selectedStats.totalPresses}
                    <span className="text-text-dim"> presses</span>
                  </p>
                  <p className="tabular-nums text-correct">
                    {Math.round(
                      (selectedStats.correctPresses / selectedStats.totalPresses) * 100,
                    )}
                    <span className="text-text-dim">% acc</span>
                  </p>
                  <p className="tabular-nums text-error">
                    {selectedStats.incorrectPresses}
                    <span className="text-text-dim"> errors</span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-text-dim">
                  No data yet — practice to fill this in.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-dim">Select a key to see finger placement.</p>
        )}
      </div>

      {/* Weak keys + CTAs */}
      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-surface-border bg-surface-raised/40 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Target className="h-3.5 w-3.5" />
            <p className="text-xs font-medium uppercase tracking-wider">Weak keys</p>
          </div>
          {weakKeys.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {weakKeys.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setSelectedKey(k.key)}
                  className="rounded-md border border-surface-border px-2 py-1 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
                >
                  {k.key.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-text-dim">
              Complete a few tests or practice runs to discover your weak keys.
            </p>
          )}
          <Link
            href="/typing-practice"
            className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Drill weak keys <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-raised/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Next steps</p>
          <ul className="mt-3 space-y-2 text-xs text-text-dim">
            <li>
              <Link href="/typing-lessons" className="text-text hover:text-accent">
                Typing lessons
              </Link>
              <span className="text-text-dim"> — learn home row first</span>
            </li>
            <li>
              <Link href="/typing-practice" className="text-text hover:text-accent">
                Typing practice
              </Link>
              <span className="text-text-dim"> — apply finger maps</span>
            </li>
            <li>
              <Link href="/" className="text-text hover:text-accent">
                Speed test
              </Link>
              <span className="text-text-dim"> — measure WPM weekly</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-8 max-w-md text-center text-[11px] leading-relaxed text-text-dim/70">
        Colors show which finger owns each key. Rest on{' '}
        <span className="text-text">A S D F</span> and{' '}
        <span className="text-text">J K L ;</span> — bumps on F and J are your anchors.
      </p>
    </div>
  );
}
