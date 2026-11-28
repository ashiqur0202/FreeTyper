import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { lengthLabel, levelName, loadSharedResult, rankPeriodOf, RANK_WORDS } from '@/lib/leaderboard/share';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ [k: string]: string | string[] | undefined }> };

export const dynamic = 'force-dynamic';

// A link page for one shared result: only numbers, the level and the username. Kept out of search results.
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const period = rankPeriodOf((await searchParams).p);
  const r = await loadSharedResult(id, period);
  if (!r) return { title: 'Result not found', robots: { index: false, follow: false } };
  const title = `${r.wpm} WPM on ${siteConfig.name}. Can you beat it?`;
  const description = `${r.username} typed ${r.wpm} WPM at ${r.accuracy}% accuracy in ${lengthLabel(r.seconds)}${r.rank ? `, #${r.rank} ${RANK_WORDS[period ?? 'today']}` : ''}. Take the test and see if you can beat it.`;
  const images = [{ url: `/r/${id}/og${period ? `?p=${period}` : ''}`, width: 1200, height: 630, alt: title }];
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function SharedResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const period = rankPeriodOf((await searchParams).p);
  const r = await loadSharedResult(id, period);
  if (!r) notFound();
  return (
    <div className="px-6 py-10 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-[560px]">
        <p className="text-sm text-text-dim">A result shared from {siteConfig.name}</p>
        <div className="mt-3 rounded-2xl border border-accent/40 bg-surface-raised p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-accent-bg px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">{levelName(r.wpm)}</span>
            {r.rank && <span className="font-mono text-sm text-text-bright"><b className="text-accent">#{r.rank}</b> {RANK_WORDS[period ?? 'today']}</span>}
          </div>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="font-mono text-6xl font-extralight leading-none tabular-nums text-accent">{r.wpm}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-text-dim">net wpm</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-light leading-none tabular-nums text-text-bright">{r.accuracy}<span className="text-sm text-text-dim">%</span></p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-text-dim">accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-light leading-none tabular-nums text-text-bright">{lengthLabel(r.seconds)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-text-dim">time</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-text-dim">
            {r.username}
            {r.deleted ? ' (account deleted)' : ''}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/1-minute-typing-test" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-surface">Take the 1 minute test</Link>
          <Link href="/leaderboard" className="rounded-lg border border-surface-border px-5 py-2.5 text-sm text-text hover:border-text-dim">See the leaderboard</Link>
        </div>
        <p className="mt-6 text-xs text-text-dim">This page shows only the numbers of one test, its level and a username. It never shows what was typed.</p>
      </div>
    </div>
  );
}
