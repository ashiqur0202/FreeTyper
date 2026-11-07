'use client';

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { fingerMap } from './typingData';
import { useTypingProgress } from './useTypingProgress';
import GuideHands from './GuideHands';
import {
  LAYOUT,
  PLAIN_FINGER,
  FINGER_NAMES,
  SHIFTED,
  UNSHIFT,
  SPECIAL_KEYS,
  capitalize,
  colorOfZone,
  fingerOf,
  isHomeKey,
  reachHint,
  shiftKeyFor,
  zoneOf,
  type Cell,
} from './guideLayout';

// False on the server and during hydration, true afterwards, so per-user stats
// (read from localStorage) never cause a hydration mismatch.
const subscribeNoop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

const INTERACTIVE = 'button, a, [role="button"], input, textarea, select, [contenteditable="true"]';

export default function KeyboardGuide() {
  const [selected, setSelected] = useState('f');
  const [hovered, setHovered] = useState<string | null>(null);
  // True when the selection came from typing a capital or a shifted symbol.
  const [shifted, setShifted] = useState(false);
  const { progress, getWeakKeys } = useTypingProgress();
  const isClient = useIsClient();

  const active = hovered ?? selected;
  const activeShifted = hovered ? false : shifted;
  const zone = zoneOf(active);
  const color = colorOfZone(zone);

  const select = (id: string, withShift = false) => {
    setSelected(id);
    setShifted(withShift);
  };

  // Press keys on the real keyboard to see their finger. Tab is left alone so
  // keyboard navigation keeps working, and Enter / Space on a focused control
  // still activate that control.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      const target = e.target as HTMLElement | null;
      const onControl = !!target?.closest?.(INTERACTIVE);
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;

      let id: string | null = null;
      let withShift = false;
      if (e.key === 'Shift') id = e.location === 2 ? 'shiftR' : 'shiftL';
      else if (e.key === 'Backspace') id = 'bksp';
      else if (e.key === 'CapsLock') id = 'caps';
      else if (e.key === 'Enter') {
        if (onControl) return;
        id = 'enter';
      } else if (e.key === ' ') {
        if (onControl) return;
        id = ' ';
        e.preventDefault(); // do not scroll the page
      } else if (e.key.length === 1) {
        const base = UNSHIFT[e.key] ?? e.key.toLowerCase();
        if (fingerMap[base]) {
          id = base;
          withShift = e.key !== base;
        }
      }
      if (id) {
        setSelected(id);
        setShifted(withShift);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Clicking a finger picks that finger's home key (or the space bar for a thumb).
  const pickZone = (z: string) => {
    if (z === 'thumb') return select(' ');
    const home = Object.keys(fingerMap).find((k) => zoneOf(k) === z && isHomeKey(k));
    if (home) select(home);
  };

  const keyStats = (id: string) => (isClient && id.length === 1 ? progress.keyStats[id] || null : null);

  const weakKeys = useMemo(
    () => (isClient ? getWeakKeys().filter((k) => k.key === ' ' || fingerMap[k.key]).slice(0, 6) : []),
    [isClient, getWeakKeys],
  );

  const stats = keyStats(active);
  const finger = fingerOf(active);

  // ---- answer card -------------------------------------------------------------------
  let cap = active.toUpperCase();
  let capWord = false;
  let headline: ReactNode;
  let detail: string;
  if (active === ' ') {
    cap = '␣';
    headline = (
      <>
        Use either <b>thumb</b>
      </>
    );
    detail = 'Space bar. Your thumbs rest here.';
  } else if (!finger) {
    headline = <>Pick a key</>;
    detail = '';
  } else {
    const fingerText = `${PLAIN_FINGER[FINGER_NAMES[finger.finger]]} finger`;
    const special = SPECIAL_KEYS[active];
    if (special) {
      cap = special.name;
      capWord = true;
      headline = (
        <>
          {capitalize(finger.hand)} hand, <b>{fingerText}</b>
        </>
      );
      detail = special.tip;
    } else if (activeShifted) {
      const opposite = finger.hand === 'left' ? 'right' : 'left';
      cap = SHIFTED[active] ?? active.toUpperCase();
      headline = (
        <>
          Hold <b>Shift</b> with your {opposite} little finger
        </>
      );
      detail = `Then press ${active.toUpperCase()} with your ${finger.hand} ${fingerText}.`;
    } else {
      headline = (
        <>
          {capitalize(finger.hand)} hand, <b>{fingerText}</b>
        </>
      );
      const withShift = SHIFTED[active] ? ` With Shift it types ${SHIFTED[active]}.` : '';
      detail = (isHomeKey(active) ? 'Home key: this finger rests here.' : reachHint(active)) + withShift;
    }
  }

  const statsLine = (() => {
    if (active.length !== 1 || !finger) return '';
    if (!isClient) return '';
    if (!stats || stats.totalPresses === 0) return 'No data for this key yet. Practice to fill this in.';
    const acc = Math.round((stats.correctPresses / stats.totalPresses) * 100);
    return `Your ${active.toUpperCase()} key: ${stats.totalPresses} presses, ${acc}% accuracy, ${stats.incorrectPresses} errors`;
  })();

  // ---- keyboard ----------------------------------------------------------------------
  const shiftHint = activeShifted ? shiftKeyFor(active) : null;
  const fadeOthers = zone !== null;

  const renderCell = (cell: Cell, i: number) => {
    const style = { '--w': cell.w } as CSSProperties;
    if (cell.kind === 'idle') {
      return (
        <span key={i} className={`kg-idle${fadeOthers ? ' kg-fade' : ''}`} style={style} aria-hidden="true">
          {cell.sub ? <span className="kg-arrow">{cell.label}</span> : cell.label}
          {cell.sub && <span className="kg-sub">{cell.sub}</span>}
        </span>
      );
    }
    if (cell.kind === 'arrows') {
      return (
        <span key={i} className="kg-arrows" style={style} aria-hidden="true">
          <span className={`kg-idle${fadeOthers ? ' kg-fade' : ''}`}>
            <span className="kg-arrow">↑</span>
            <span className="kg-sub">PgUp</span>
          </span>
          <span className={`kg-idle${fadeOthers ? ' kg-fade' : ''}`}>
            <span className="kg-arrow">↓</span>
            <span className="kg-sub">PgDn</span>
          </span>
        </span>
      );
    }
    const { id } = cell;
    const keyZone = zoneOf(id);
    const isShiftHint = shiftHint === id;
    const fade = !isShiftHint && fadeOthers && keyZone !== zone;
    const isWord = id.length > 1 || id === ' ';
    const symbol = SHIFTED[id];
    const stat = keyStats(id);
    const weak = stat && stat.totalPresses > 0 && stat.correctPresses / stat.totalPresses < 0.9;
    const spoken = isWord ? (SPECIAL_KEYS[id]?.name ?? 'Space') : id;
    const label = cell.label ?? (symbol ? null : id.toUpperCase());
    return (
      <button
        key={i}
        type="button"
        className={[
          'kg-key',
          isWord && 'kg-mod',
          symbol && 'kg-sym',
          isHomeKey(id) && 'kg-home',
          (active === id || isShiftHint) && 'kg-act',
          fade && 'kg-fade',
          weak && 'kg-weak',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ '--kc': colorOfZone(keyZone), '--w': cell.w } as CSSProperties}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => select(id)}
        aria-label={`${spoken}, ${keyZone === 'thumb' ? 'either thumb' : keyZone?.replace('-', ' ').replace('pinky', 'little') + ' finger'}`}
        aria-pressed={selected === id}
      >
        {label ?? (
          <>
            <span className="kg-sh">{symbol}</span>
            <span>{id}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="kg mx-auto flex w-full max-w-[52rem] flex-col" style={{ '--kg-c': color } as CSSProperties}>
      <p className="mb-4 text-center text-sm text-text-dim">
        Every colour is one finger. Press a key, or tap one, and see.
      </p>

      <div className="kg-ans" aria-live="polite">
        <div className={`kg-cap${capWord ? ' kg-cap-word' : ''}`}>{cap}</div>
        <div className="kg-say">
          {headline}
          {detail && <small>{detail}</small>}
        </div>
      </div>
      <p className="kg-stats">{statsLine}</p>

      <div className="kg-board">
        {LAYOUT.map((row, ri) => (
          <div key={ri} className="kg-row">
            {row.map(renderCell)}
          </div>
        ))}
      </div>

      <div className="kg-hands">
        <div>
          <GuideHands hand="left" activeZone={zone} onPick={pickZone} />
          <p className="kg-hand-label">Left hand</p>
        </div>
        <div>
          <GuideHands hand="right" activeZone={zone} onPick={pickZone} />
          <p className="kg-hand-label">Right hand</p>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-xl rounded-xl border border-accent/30 bg-accent-bg px-4 py-3 text-center text-sm text-text">
        Start with your fingers on <b className="text-accent">A S D F</b> and{' '}
        <b className="text-accent">J K L ;</b>. Feel the bumps on <b className="text-accent">F</b> and{' '}
        <b className="text-accent">J</b>: that is home. Your thumbs rest on the space bar.
      </div>
      <p className="mt-3 text-center text-xs text-text-dim">
        You can also press keys on your real keyboard. Grey keys are not part of finger training.
      </p>

      {/* Weak keys + next steps */}
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
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
                  onClick={() => select(k.key)}
                  className="rounded-md border border-surface-border px-2 py-1 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
                >
                  {k.key === ' ' ? 'space' : k.key.toUpperCase()}
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
    </div>
  );
}
