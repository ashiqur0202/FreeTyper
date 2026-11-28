'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Share2, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { RunRank } from '@/lib/leaderboard/client';
import type { CardBoard } from '@/lib/leaderboard/store';
import { LEVELS, levelIndex } from './levelLadder';
import RunGraph from './RunGraph';
import { shareResult, type ShareExtra } from './shareImage';
import type { TypingSession } from './types';

interface TestFinishedProps {
  wpm: number;
  accuracy: number;
  seconds: number;
  /** Net WPM of the run before this one, when there is one. */
  previousWpm: number | null;
  /** This run beat every run in the list. */
  newBest: boolean;
  /** No level badge, rank or details (number row runs are not on the level ladder). */
  plain?: boolean;
  /** The finished run itself: its curve and weak spots fill the details, and it is what the picture shows. */
  run: TypingSession;
  /** What the leaderboard says about this run (see `submitRun`). */
  rank: RunRank;
  onAgain: () => void;
  onClose: () => void;
  /** The "challenge a friend" button, when this run can be sent. */
  challenge?: ReactNode;
}

type Period = 'today' | 'week' | 'all';
const PERIOD_LABEL: Record<Period, string> = { today: 'Today', week: 'Week', all: 'All time' };
const PERIOD_WORDS: Record<Period, string> = { today: 'today', week: 'this week', all: 'all time' };

/** Near-black or white, whichever reads better on the accent colour in use (any accent, any theme). */
function inkOnAccent(): string {
  const dark = '#16140f';
  if (typeof document === 'undefined') return dark;
  const m = /^#?([0-9a-f]{6})/i.exec(getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim());
  if (!m) return dark;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  const onDark = (lum + 0.05) / (0.008 + 0.05);
  const onWhite = 1.05 / (lum + 0.05);
  return onDark >= onWhite ? dark : '#ffffff';
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** Counts up to `target` once, unless the person asked for less motion. */
function useCountUp(target: number, ms = 700) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

function Note({ wpm, previousWpm, newBest }: { wpm: number; previousWpm: number | null; newBest: boolean }) {
  if (previousWpm === null) return <>Your first run here. Nice start.</>;
  const d = wpm - previousWpm;
  if (newBest) {
    return (
      <>
        Your fastest yet: <b className="font-mono font-medium text-correct">↑ {d} wpm</b> on your last run.
      </>
    );
  }
  if (d > 0) {
    return (
      <>
        Faster than your last run: <b className="font-mono font-medium text-correct">↑ {d} wpm</b>
      </>
    );
  }
  if (d === 0) return <>Same speed as your last run.</>;
  return (
    <>
      <b className="font-mono font-medium text-error">↓ {Math.abs(d)} wpm</b> under your last run. Go again?
    </>
  );
}

/** How far through the current level the speed is (0 to 100), and the text under the bar. */
function levelProgress(wpm: number) {
  const i = levelIndex(wpm);
  const next = LEVELS[i + 1];
  if (!next) return { pct: 100, left: 'top level' };
  const cur = LEVELS[i];
  return { pct: Math.round(((wpm - cur.min) / (next.min - cur.min)) * 100), left: `+${Math.ceil(next.min - wpm)} to ${next.name}` };
}

const btnBase =
  'inline-flex items-center justify-center gap-[0.5em] rounded-[0.5em] border border-surface-border px-[1em] py-[0.6em] text-[0.875em] text-text transition-colors hover:border-text-dim';

/** The speed your rank comes from (your best on that board) and whether it is this very run. */
function rankSource(board: CardBoard | null, runWpm: number) {
  const mine = board?.rows.find((r) => r.me)?.wpm ?? null;
  return { mine, fromBest: mine !== null && mine !== runWpm };
}

/** The rank block: your place on the board, the typists next to you, and a period switch. */
function RankBlock({ rank, runWpm, onPeriodChange, period }: { rank: RunRank; runWpm: number; period: Period; onPeriodChange: (p: Period) => void }) {
  if (rank.kind === 'none') return null;
  const quiet = (children: ReactNode) => (
    <div className="rounded-[0.75em] border border-surface-border bg-surface px-[0.8em] py-[0.7em] text-[0.8em] text-text-dim">{children}</div>
  );
  if (rank.kind === 'guest') {
    return quiet(
      <>
        <Link href="/login" className="text-accent underline underline-offset-2">Log in</Link> and your speed tests are ranked on the{' '}
        <Link href="/leaderboard" className="text-accent underline underline-offset-2">leaderboard</Link>.
      </>,
    );
  }
  if (rank.kind === 'short') return quiet(<><b className="text-text-bright">Not ranked.</b> Tests under 1 minute do not count for the leaderboard.</>);
  if (rank.kind === 'acc') return quiet(<><b className="text-text-bright">Not ranked.</b> You need 95% accuracy or better to appear on the leaderboard.</>);
  if (rank.kind === 'unavailable') return quiet(<>Your rank could not be loaded just now. <Link href="/leaderboard" className="text-accent underline underline-offset-2">Open the leaderboard</Link>.</>);

  const board: CardBoard | null = rank.kind === 'ranked' ? rank.ranks[period] : null;
  return (
    <div className="overflow-hidden rounded-[0.75em] border border-surface-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-[0.8em] gap-y-[0.4em] border-b border-surface-border px-[0.75em] py-[0.5em]">
        <span className="text-[0.7em] font-semibold uppercase tracking-[0.1em] text-text-dim">Your rank</span>
        <div role="group" aria-label="Period" className="inline-flex overflow-hidden rounded-full border border-surface-border bg-surface-raised">
          {(['today', 'week', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => onPeriodChange(p)}
              className={`px-[0.8em] py-[0.25em] text-[0.74em] transition-colors ${period === p ? 'bg-accent font-semibold text-[var(--ink)]' : 'text-text-dim hover:text-text'}`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
      {rank.kind === 'loading' ? (
        <div className="m-[0.7em] h-[5.4em] animate-pulse rounded-lg bg-surface-raised" aria-busy="true" aria-label="Loading your rank" />
      ) : board ? (
        <>
          <div>
            {board.rows.map((r) => (
              <div
                key={r.rank + r.username}
                className={`grid grid-cols-[2.6em_minmax(0,1fr)_auto] items-center gap-[0.6em] border-t border-surface-border px-[0.75em] py-[0.4em] text-[0.9em] first:border-t-0 ${r.me ? 'bg-accent-bg font-bold text-accent' : ''}`}
              >
                <span className="font-mono text-text-dim">{`#${r.rank}`}</span>
                <span className="truncate">{r.username}{r.me ? ' (you)' : ''}</span>
                <span className={`font-mono ${r.me ? '' : 'text-text-bright'}`}>{r.wpm}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-x-[1em] gap-y-[0.3em] border-t border-surface-border px-[0.75em] py-[0.5em] text-[0.78em] text-text-dim">
            <span>
              {(() => {
                const above = board.rows.find((r) => r.rank === board.rank - 1);
                const src = rankSource(board, runWpm);
                const from = src.fromBest ? <>Ranked by your best, <b className="text-text-bright">{src.mine} wpm</b>. This run was slower. </> : null;
                if (board.rank === 1) return <>{from}<b className="text-text-bright">You are #1</b> {PERIOD_WORDS[period]}, out of {board.total}.</>;
                return above ? <>{from}Beat <b className="text-text-bright">{above.wpm} wpm</b> to take #{above.rank}.</> : <>{from}Out of {board.total} ranked {PERIOD_WORDS[period]}.</>;
              })()}
            </span>
            <Link href="/leaderboard" className="text-accent underline underline-offset-2">Full leaderboard</Link>
          </div>
        </>
      ) : (
        <p className="px-[0.8em] py-[0.7em] text-[0.8em] text-text-dim">No counted score {PERIOD_WORDS[period]} yet. This run does not change that board.</p>
      )}
    </div>
  );
}

type ShareState = '' | 'save' | 'copy' | 'copylink' | 'native';

/** Share as a picture (saved, copied or sent through the share sheet) or as a link whose preview is the same picture. */
function ShareTray({ run, rank, period }: { run: TypingSession; rank: RunRank; period: Period }) {
  const ranked = rank.kind === 'ranked' ? rank : null;
  const board = ranked?.ranks[period] ?? null;
  const [mode, setMode] = useState<'image' | 'link'>('image');
  const [showRank, setShowRank] = useState<boolean | null>(null);
  const [done, setDone] = useState<ShareState>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const canLink = !!ranked?.scoreId;
  // A slower run than your best does not claim a rank in the picture unless you tick the box.
  const fromBest = rankSource(board, run.wpm).fromBest;
  const rankOn = showRank ?? !fromBest;
  const extra: ShareExtra = useMemo(
    () => ({ ...(ranked ? { username: ranked.username } : {}), ...(ranked && rankOn && board ? { rankText: `#${board.rank} ${PERIOD_WORDS[period]}` } : {}) }),
    [ranked, rankOn, board, period],
  );
  const linkUrl = () => {
    const q = rankOn && board ? `?p=${period}` : '';
    return `${window.location.origin}/r/${ranked?.scoreId}${q}`;
  };
  const message = `I typed ${run.wpm} WPM with ${run.accuracy}% accuracy in ${run.duration} s on FreeTyper.${rankOn && board ? ` #${board.rank} ${PERIOD_WORDS[period]}.` : ''} Can you beat me?`;

  // The picture shown is the real one that would be saved (image) or the real preview card of the link.
  const linkPreview = mode === 'link' && canLink ? `/r/${ranked?.scoreId}/og${rankOn && board ? `?p=${period}` : ''}` : null;
  const preview = linkPreview ?? imagePreview;
  useEffect(() => {
    if (linkPreview) return;
    let url: string | null = null;
    let live = true;
    import('./shareImage').then(({ renderResultImage }) =>
      renderResultImage(run, extra)
        .then((blob) => {
          if (!live) return;
          url = URL.createObjectURL(blob);
          setImagePreview(url);
        })
        .catch(() => live && setImagePreview(null)),
    );
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [linkPreview, run, extra]);

  const flash = (key: ShareState) => {
    setDone(key);
    setTimeout(() => setDone(''), 1500);
  };
  const track = (kind: string) => trackEvent('share_result', { source: 'finished_box', kind });
  const act = async (key: 'save' | 'copy' | 'native') => {
    track(`image_${key}`);
    const outcome = await shareResult(run, extra, key === 'native' ? 'auto' : key);
    if (outcome !== 'cancelled' && outcome !== 'failed') flash(key);
  };
  const open = (url: string) => {
    track('link_open');
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const copyLink = async () => {
    track('link_copy');
    try {
      await navigator.clipboard.writeText(`${message} ${linkUrl()}`);
      flash('copylink');
    } catch {
      window.prompt?.('Copy this link', linkUrl());
    }
  };
  const nativeLink = async () => {
    track('link_native');
    try {
      await navigator.share({ title: `${run.wpm} WPM on FreeTyper`, text: message, url: linkUrl() });
    } catch {
      /* cancelled */
    }
  };
  const enc = encodeURIComponent;
  const pill = 'inline-flex items-center rounded-[0.45em] border border-surface-border bg-surface px-[0.85em] py-[0.4em] text-[0.84em] text-text transition-colors hover:border-text-dim';

  return (
    <div className="grid gap-[0.6em] rounded-[0.75em] border border-surface-border bg-surface p-[0.7em]" aria-label="Share your result">
      <div role="group" aria-label="Share as" className="inline-flex justify-self-start overflow-hidden rounded-full border border-surface-border bg-surface-raised">
        {(['image', 'link'] as const)
          .filter((m) => m === 'image' || canLink)
          .map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`px-[0.95em] py-[0.3em] text-[0.8em] ${mode === m ? 'bg-accent font-semibold text-[var(--ink)]' : 'text-text-dim hover:text-text'}`}>
              {m === 'image' ? 'Image' : 'Link card'}
            </button>
          ))}
      </div>
      <div className="overflow-hidden rounded-[0.5em] border border-surface-border bg-surface-raised">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview of the result picture" className="block aspect-[1200/630] w-full object-cover" />
        ) : (
          <div className="aspect-[1200/630] w-full animate-pulse bg-surface-raised" />
        )}
      </div>
      {ranked && board && (
        <label className="flex items-center gap-[0.5em] text-[0.82em] text-text-dim">
          <input type="checkbox" checked={rankOn} onChange={(e) => setShowRank(e.target.checked)} className="size-[1.1em] accent-[var(--color-accent)]" />
          Show my rank ({`#${board.rank} ${PERIOD_WORDS[period]}`}{fromBest ? ', from your best run' : ''})
        </label>
      )}
      {mode === 'image' ? (
        <div className="flex flex-wrap gap-[0.45em]">
          <button type="button" onClick={() => act('save')} className="inline-flex items-center rounded-[0.45em] bg-accent px-[0.95em] py-[0.4em] text-[0.84em] font-semibold" style={{ color: 'var(--ink)' }}>{done === 'save' ? 'Saved ✓' : 'Save image'}</button>
          <button type="button" onClick={() => act('copy')} className={pill}>{done === 'copy' ? 'Copied ✓' : 'Copy image'}</button>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button type="button" onClick={() => act('native')} className={pill}>Share…</button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-[0.45em]">
          <button type="button" onClick={copyLink} className="inline-flex items-center rounded-[0.45em] bg-accent px-[0.95em] py-[0.4em] text-[0.84em] font-semibold" style={{ color: 'var(--ink)' }}>{done === 'copylink' ? 'Copied ✓' : 'Copy link'}</button>
          <button type="button" onClick={() => open(`https://wa.me/?text=${enc(`${message} ${linkUrl()}`)}`)} className={pill}>WhatsApp</button>
          <button type="button" onClick={() => open(`https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(linkUrl())}`)} className={pill}>X</button>
          <button type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(linkUrl())}`)} className={pill}>Facebook</button>
          <button type="button" onClick={() => open(`https://t.me/share/url?url=${enc(linkUrl())}&text=${enc(message)}`)} className={pill}>Telegram</button>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && <button type="button" onClick={nativeLink} className={pill}>Share…</button>}
        </div>
      )}
      <p className="text-[0.74em] text-text-dim">
        {mode === 'image'
          ? 'The picture is drawn in your browser and is never uploaded.'
          : 'The link opens a public page with only these numbers, your level and your username, never what you typed. Chat apps show the picture above as its preview.'}
      </p>
    </div>
  );
}

/** The details of this run, inside the popup: speed graph, four facts, the slowest spots. */
function Details({ run }: { run: TypingSession }) {
  const d = run.run;
  if (!d) return <p className="rounded-[0.75em] border border-surface-border bg-surface p-[0.8em] text-[0.82em] text-text-dim">Details are kept for your latest few runs only, and this one has none.</p>;
  const rawAvg = d.raw.length ? Math.round(d.raw.reduce((a, b) => a + b, 0) / d.raw.length) : run.wpm;
  const peak = d.speed.length ? Math.max(...d.speed) : run.wpm;
  const mistakes = run.incorrectChars;
  const word = d.consistency >= 90 ? 'very steady' : d.consistency >= 80 ? 'steady' : 'uneven';
  const fact = (label: string, value: string, sub: string) => (
    <div className="rounded-[0.5em] border border-surface-border bg-surface-raised px-[0.6em] py-[0.45em]">
      <p className="text-[0.7em] uppercase tracking-[0.08em] text-text-dim">{label}</p>
      <p className="font-mono text-[1.15em] tabular-nums text-text-bright">{value}</p>
      <p className="text-[0.7em] text-text-dim">{sub}</p>
    </div>
  );
  return (
    <div className="grid gap-[0.75em] rounded-[0.75em] border border-surface-border bg-surface p-[0.75em]" aria-label="Run details">
      <div className="flex flex-wrap items-center justify-between gap-x-[0.6em] text-[0.72em] uppercase tracking-[0.1em] text-text-dim">
        <span>Speed over time</span>
        <span className="normal-case tracking-normal">net · raw · mistakes</span>
      </div>
      <RunGraph run={d} />
      <div className="grid grid-cols-2 gap-[0.5em] sm:grid-cols-4">
        {fact('Raw speed', String(rawAvg), 'before mistakes')}
        {fact('Consistency', `${d.consistency}%`, word)}
        {fact('Mistakes', String(mistakes), mistakes ? 'red dots above' : 'a clean run')}
        {fact('Peak', String(peak), 'wpm, best moment')}
      </div>
      {d.spots.length > 0 && (
        <div className="flex flex-wrap items-center gap-[0.4em] text-[0.85em]">
          <span className="text-[0.82em] text-text-dim">Weak spots:</span>
          {d.spots.map((sp) => (
            <span key={sp.kind + sp.label} className="inline-flex items-baseline gap-[0.5em] rounded-[0.45em] border border-surface-border bg-surface-raised px-[0.6em] py-[0.15em] font-mono text-text-bright">
              <span className={sp.kind === 'key' ? 'uppercase' : ''}>{sp.label}</span>
              <span className="text-[0.85em] text-text-dim">{sp.detail}</span>
            </span>
          ))}
          <Link href="/typing-practice" className={`${btnBase} px-[0.85em] py-[0.35em] text-[0.84em] text-accent`}>Practice these</Link>
        </div>
      )}
      <p className="text-[0.76em] text-text-dim">Consistency is our own measure of how steady your speed was, not a standard. Every run is saved in your history below the test.</p>
    </div>
  );
}

/**
 * The box shown over the text when a speed test ends: level and comparison, the numbers with a progress bar,
 * your leaderboard rank, then what to do next (test again, challenge, share, details). Nothing starts again
 * until the person chooses.
 */
export default function TestFinished({
  wpm,
  accuracy,
  seconds,
  previousWpm,
  newBest,
  plain = false,
  run,
  rank,
  onAgain,
  onClose,
  challenge,
}: TestFinishedProps) {
  const shown = useCountUp(wpm);
  const [ink] = useState(inkOnAccent);
  const [period, setPeriod] = useState<Period>('today');
  const [panel, setPanel] = useState<'' | 'share' | 'details'>('');
  const lvl = levelProgress(wpm);
  const toggle = (p: 'share' | 'details') => setPanel((cur) => (cur === p ? '' : p));

  return (
    // An overlay over the page: the popup now holds a rank block and optional panels, so it needs more room than the
    // test area. A click on the dimmed page closes it; Enter (test again) and Escape (close) are handled by the test page.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3"
      data-typing-ignore
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Test finished"
        aria-modal="true"
        style={{ ['--ink' as string]: ink }}
        className={`test-finished relative max-h-[92vh] w-full max-w-[34em] animate-fade-up overflow-y-auto rounded-[1em] border bg-surface-raised px-[1em] py-[0.875em] shadow-2xl sm:px-[1.25em] ${
          newBest ? 'border-accent shadow-[0_0_28px_var(--color-accent-bg)]' : 'border-accent/40'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[0.5em] top-[0.5em] rounded-md p-[0.25em] text-text-dim transition-colors hover:bg-surface hover:text-text-bright"
        >
          <X className="size-[0.875em]" />
        </button>

        <div className="flex min-h-[1.5em] flex-wrap items-center justify-between gap-x-[0.75em] gap-y-[0.25em] pr-[1.75em]">
          <div className="flex items-center gap-[0.375em]">
            {!plain && (
              <span className="rounded-full bg-accent-bg px-[0.625em] py-[0.125em] text-[0.625em] font-semibold uppercase tracking-wider text-accent">
                {LEVELS[levelIndex(wpm)].key}
              </span>
            )}
            {newBest && (
              <span className="rounded-full bg-accent px-[0.625em] py-[0.125em] text-[0.625em] font-semibold uppercase tracking-wider" style={{ color: ink }}>
                new best
              </span>
            )}
          </div>
          <p className="text-[0.75em] text-text-dim">
            <Note wpm={wpm} previousWpm={previousWpm} newBest={newBest} />
          </p>
        </div>

        <div className="mt-[0.5em] flex items-end gap-[1.25em]">
          <div>
            <p className="font-mono text-[3em] font-extralight leading-none tabular-nums text-accent">{shown}</p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">net wpm</p>
          </div>
          <div>
            <p className="font-mono text-[1.5em] font-light leading-none tabular-nums text-text-bright">
              {accuracy}
              <span className="text-[0.58em] text-text-dim">%</span>
            </p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">accuracy</p>
          </div>
          <div>
            <p className="font-mono text-[1.5em] font-light leading-none tabular-nums text-text-bright">
              {seconds}
              <span className="text-[0.58em] text-text-dim">s</span>
            </p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">time</p>
          </div>
        </div>

        {!plain && (
          <div className="mt-[0.7em]" aria-hidden="true">
            <div className="h-[5px] overflow-hidden rounded-full bg-surface"><span className="block h-full rounded-full bg-accent" style={{ width: `${lvl.pct}%` }} /></div>
            <p className="mt-[0.3em] flex justify-between text-[0.72em] text-text-dim"><span>{LEVELS[levelIndex(wpm)].name}</span><span>{lvl.left}</span></p>
          </div>
        )}

        {!plain && rank.kind !== 'none' && (
          <div className="mt-[0.8em]">
            <RankBlock rank={rank} runWpm={wpm} period={period} onPeriodChange={setPeriod} />
          </div>
        )}

        <div className="mt-[0.8em] grid grid-cols-2 gap-[0.5em]">
          <button
            type="button"
            onClick={onAgain}
            style={{ color: ink }}
            className="col-span-2 inline-flex items-center justify-center gap-[0.5em] rounded-[0.5em] bg-accent px-[1em] py-[0.7em] text-[0.95em] font-semibold transition-opacity hover:opacity-90"
          >
            Test again
            <kbd className="hidden rounded border border-current/40 px-[0.3em] font-mono text-[0.72em] sm:inline">Enter</kbd>
          </button>
          {challenge ?? <span />}
          <button
            type="button"
            aria-expanded={panel === 'share'}
            onClick={() => toggle('share')}
            className={`${btnBase} ${panel === 'share' ? 'border-accent bg-accent-bg text-accent' : ''} ${challenge ? '' : 'col-span-2'}`}
          >
            <Share2 className="size-[1em]" />
            Share
          </button>
        </div>

        {panel === 'share' && <div className="mt-[0.6em]"><ShareTray run={run} rank={rank} period={period} /></div>}

        <button
          type="button"
          aria-expanded={panel === 'details'}
          onClick={() => toggle('details')}
          className={`mt-[0.6em] flex w-full items-center gap-[0.7em] rounded-[0.65em] border px-[0.8em] py-[0.55em] text-left transition-colors ${
            panel === 'details' ? 'border-accent bg-accent-bg' : 'border-dashed border-surface-border hover:border-solid hover:border-text-dim hover:bg-surface'
          }`}
        >
          <span className="grid size-[1.9em] shrink-0 place-items-center rounded-[0.5em] border border-surface-border bg-surface text-accent">
            <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 13V9M6 13V4M10 13v-6M14 13V2" /></svg>
          </span>
          <span className="grid min-w-0 flex-1 leading-tight">
            <b className={`text-[0.92em] font-semibold ${panel === 'details' ? 'text-accent' : 'text-text-bright'}`}>{panel === 'details' ? 'Hide details' : 'See details'}</b>
            <small className="truncate text-[0.76em] text-text-dim">{panel === 'details' ? 'Back to your result' : 'Speed graph, consistency, weak spots'}</small>
          </span>
          <ChevronDown className={`size-[1em] shrink-0 transition-transform ${panel === 'details' ? 'rotate-180 text-accent' : 'text-text-dim'}`} />
        </button>

        {panel === 'details' && <div className="mt-[0.6em]"><Details run={run} /></div>}
      </div>
    </div>
  );
}
