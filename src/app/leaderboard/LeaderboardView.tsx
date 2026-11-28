'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/lib/sync/useAccount';

type Period = 'daily' | 'weekly' | 'monthly' | 'lifetime';

interface Entry {
  rank: number;
  scoreId: string;
  username: string;
  name: string | null;
  deleted: boolean;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: string;
  textLevel: number;
  at: string;
}

const PERIODS: { id: Period; label: string; hint: string }[] = [
  { id: 'daily', label: 'Daily', hint: 'today, UTC' },
  { id: 'weekly', label: 'Weekly', hint: 'Mon to Sun' },
  { id: 'monthly', label: 'Monthly', hint: 'this month' },
  { id: 'lifetime', label: 'Lifetime', hint: 'all time' },
];
const LENGTHS = [15, 30, 60, 120, 180, 300] as const;
const MODES = ['standard', 'words', 'sentences', 'quotes', 'facts', 'code', 'mixed', 'daily'] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lengthLabel = (s: number) => (s < 60 ? `${s} s` : `${s / 60} min`);
const testLabel = (e: Entry) => `${lengthLabel(e.seconds)} · ${cap(e.textMode)}${e.textLevel ? ` ${e.textLevel}` : ''}`;
const REPORT_REASONS = ['Impossible score', 'Offensive name', 'Other'] as const;

function ago(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString('en', { month: 'short', year: 'numeric' });
}

const chip = (on: boolean) =>
  `cursor-pointer rounded-full border px-2.5 py-0.5 text-[12.5px] transition-colors ${on ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border bg-surface-raised text-text-dim hover:text-text'}`;

/**
 * The public leaderboard. Everyone sees it, with no login. Each person appears once per board with
 * their best counted score; deleted accounts keep their entry, marked "account deleted".
 */
export default function LeaderboardView({ enabled }: { enabled: boolean }) {
  const account = useAccount();
  const [period, setPeriod] = useState<Period>('daily');
  const [top, setTop] = useState<10 | 50>(10);
  const [length, setLength] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [me, setMe] = useState<Entry | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [reporting, setReporting] = useState<string | null>(null);
  const [reported, setReported] = useState<string | null>(null);
  const seq = useRef(0);

  const query = `period=${period}&top=${top}${length ? `&length=${length}` : ''}${mode ? `&mode=${mode}` : ''}`;

  useEffect(() => {
    if (!enabled) return;
    const mine = ++seq.current;
    const ctl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard?${query}`, { signal: ctl.signal });
        if (!res.ok) throw new Error('bad');
        const body = (await res.json()) as { entries: Entry[] };
        if (mine === seq.current) { setEntries(body.entries); setFailed(false); setNow(Date.now()); }
      } catch {
        if (mine === seq.current && !ctl.signal.aborted) setFailed(true);
      }
    })();
    return () => ctl.abort();
  }, [enabled, query]);

  useEffect(() => {
    if (!enabled || !account) return;
    let live = true;
    fetch(`/api/leaderboard/me?${query}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { position: Entry | null } | null) => { if (live) setMe(b?.position ?? null); })
      .catch(() => { if (live) setMe(null); });
    return () => { live = false; };
  }, [enabled, account, query]);

  const report = async (scoreId: string, reason: string) => {
    setReporting(null);
    try {
      const res = await fetch('/api/scores/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ scoreId, reason }),
      });
      setReported(res.ok ? scoreId : null);
    } catch {
      setReported(null);
    }
  };

  const meNow = me && account ? me : null;

  return (
    <div className="mx-auto w-full max-w-[780px]">
      <h1 className="text-2xl font-semibold tracking-tight text-text-bright">Leaderboard</h1>
      <p className="mb-5 mt-1 text-sm text-text-dim">The fastest typists on FreeTyper. Every speed test counts, with at least 95% accuracy.</p>

      {!enabled ? (
        <p className="rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-sm text-text-dim">
          The leaderboard is not available right now. Everything else on FreeTyper works as usual.
        </p>
      ) : (
        <>
          <div role="tablist" aria-label="Period" className="grid grid-cols-4 gap-1.5 rounded-xl border border-surface-border bg-surface-raised p-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={`cursor-pointer rounded-lg border px-1.5 py-2 text-sm transition-colors ${period === p.id ? 'border-accent bg-accent-bg font-semibold text-accent' : 'border-transparent text-text-dim hover:text-text'}`}
              >
                {p.label}
                <small className="block text-[11px] font-normal opacity-80">{p.hint}</small>
              </button>
            ))}
          </div>

          <div className="my-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-text-dim">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="How many to show">
              <span>Show</span>
              {([10, 50] as const).map((n) => <button key={n} aria-pressed={top === n} onClick={() => setTop(n)} className={chip(top === n)}>Top {n}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Test length">
              <span>Length</span>
              <button aria-pressed={length === null} onClick={() => setLength(null)} className={chip(length === null)}>All</button>
              {LENGTHS.map((l) => <button key={l} aria-pressed={length === l} onClick={() => setLength(l)} className={chip(length === l)}>{lengthLabel(l)}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Text type">
              <span>Text</span>
              <button aria-pressed={mode === null} onClick={() => setMode(null)} className={chip(mode === null)}>All</button>
              {MODES.map((m) => <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)} className={chip(mode === m)}>{cap(m)}</button>)}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
            <div className="grid grid-cols-[34px_minmax(0,1fr)_62px] items-center gap-2.5 bg-surface px-3.5 py-2 text-[11px] uppercase tracking-[0.07em] text-text-dim sm:grid-cols-[44px_minmax(0,1fr)_76px_64px_120px]">
              <span>#</span><span>Typist</span><span className="text-right">WPM</span><span className="hidden text-right sm:block">Acc.</span><span className="hidden sm:block">Test</span>
            </div>
            <div className={`${top === 50 ? 'max-h-[560px] overflow-auto' : ''} ${entries ? '' : 'opacity-60'}`} aria-busy={!entries && !failed}>
              {failed && <p role="alert" className="px-4 py-6 text-sm text-error">Could not load the leaderboard. Check your connection and try again.</p>}
              {!failed && entries && entries.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-text-dim">No scores on this board yet. Take a speed test while logged in and be the first.</p>
              )}
              {!failed && !entries && <p className="px-4 py-6 text-sm text-text-dim">Loading…</p>}
              {!failed && entries?.map((e) => {
                const mine = !!meNow && meNow.scoreId === e.scoreId;
                return (
                  <div key={e.scoreId} className={`border-t border-surface-border first:border-t-0 ${mine ? 'bg-accent-bg shadow-[inset_3px_0_0_var(--color-accent)]' : ''}`}>
                    <div className="grid grid-cols-[34px_minmax(0,1fr)_62px] items-center gap-2.5 px-3.5 py-2.5 sm:grid-cols-[44px_minmax(0,1fr)_76px_64px_120px]">
                      <span className={`grid h-[30px] w-[30px] place-items-center rounded-lg border border-b-[3px] font-mono text-[13px] font-bold ${e.rank === 1 ? 'border-accent bg-accent text-surface' : e.rank <= 3 ? 'border-accent border-b-key-shadow bg-surface text-accent' : 'border-surface-border border-b-key-shadow bg-surface text-text-dim'}`}>{e.rank}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <b className={`font-semibold ${e.deleted ? 'font-medium text-text-dim' : 'text-text-bright'}`}>{e.username}</b>
                          {e.deleted && <em className="rounded-full border border-surface-border bg-surface px-2 text-[11px] not-italic tracking-wide text-text-dim">account deleted</em>}
                        </div>
                        <span className="block truncate text-[12.5px] text-text-dim">
                          {e.name ? `${e.name} · ` : ''}{ago(e.at, now)}
                          {account && !mine && (
                            <>
                              {' · '}
                              {reported === e.scoreId ? 'reported, thanks' : (
                                <button type="button" className="cursor-pointer underline hover:text-text" onClick={() => setReporting(reporting === e.scoreId ? null : e.scoreId)}>report</button>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-right font-mono text-[17px] font-bold text-accent">{e.wpm}</span>
                      <span className="hidden text-right font-mono text-[13px] sm:block">{e.accuracy}%</span>
                      <span className="hidden text-[12.5px] text-text-dim sm:block">{testLabel(e)}</span>
                    </div>
                    {reporting === e.scoreId && (
                      <div className="flex flex-wrap items-center gap-2 px-3.5 pb-3 text-[12.5px] text-text-dim">
                        Why?
                        {REPORT_REASONS.map((r) => <button key={r} type="button" onClick={() => report(e.scoreId, r)} className={chip(false)}>{r}</button>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-dashed border-accent px-3.5 py-2.5 text-sm">
            {account ? (
              <>
                <span>
                  {meNow ? <>You are <b className="text-accent">#{meNow.rank}</b> on this board with <b className="text-accent">{meNow.wpm} WPM</b>.</> : 'Finish a speed test that fits this board to appear on it.'}
                </span>
                <Link href="/account" className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-[13.5px] hover:border-text-dim">Your username</Link>
              </>
            ) : (
              <>
                <span>Log in and your speed tests are ranked automatically.</span>
                <Link href="/login" className="rounded-lg border border-b-[3px] border-accent bg-accent-bg px-3 py-1.5 text-[13.5px] font-semibold text-accent">Log in</Link>
              </>
            )}
          </div>
        </>
      )}

      <div className="mt-8 space-y-3 text-sm text-text-dim">
        <h2 className="text-base font-semibold text-text-bright">How the leaderboard works</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-text">What counts:</strong> any finished speed test while you are logged in (the number row test is left out), at 95% accuracy or higher. The speed is net WPM, as on the test.</li>
          <li><strong className="text-text">One entry per person:</strong> each board shows your best counted score inside its window. Daily is the current UTC day, weekly runs Monday to Sunday (UTC), monthly is the calendar month, lifetime is everything.</li>
          <li><strong className="text-text">Fair comparison:</strong> all text types and levels count, so use the filters to compare like with like, for example the same length and text type.</li>
          <li><strong className="text-text">Honesty about cheating:</strong> scores are sent by your browser, so they cannot be fully proven. Impossible scores are refused, submissions are rate limited, and anyone logged in can report an entry.</li>
          <li><strong className="text-text">What is public:</strong> your username and the name from your Google account, with your scores. If you delete your account, your name and everything else personal is deleted; your username and scores stay, marked &quot;account deleted&quot;. See the <Link href="/privacy" className="text-accent underline">privacy page</Link>.</li>
        </ul>
      </div>
    </div>
  );
}
