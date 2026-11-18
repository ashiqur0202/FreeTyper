import type { Metadata } from 'next';
import TypingSpeedTest from '@/components/skills/typing/TypingSpeedTest';
import { challengeCard, challengeImagePath, parseScore, parseSeconds } from '@/components/skills/typing/challengeLink';
import { siteConfig } from '@/config/site';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// A link page: every challenge has its own query string, so one canonical, kept out of search results.
// The link preview (title, description and picture) shows the sender's score, taken from the same
// range-checked `w` and `a` values the page itself reads.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const query = new URLSearchParams();
  for (const key of ['w', 'a', 'd']) {
    const v = first(sp[key]);
    if (v !== undefined) query.set(key, v);
  }
  const score = parseScore(query.toString());
  const seconds = parseSeconds(query.toString());
  const card = challengeCard(score, seconds);
  const images = [{ url: challengeImagePath(score, seconds), width: 1200, height: 630, alt: card.headline }];

  return {
    title: { absolute: card.title },
    description: card.description,
    alternates: { canonical: `${siteConfig.url}/typing-challenge` },
    robots: { index: false, follow: true },
    openGraph: { title: card.title, description: card.description, images },
    twitter: { card: 'summary_large_image', title: card.title, description: card.description, images },
  };
}

/** The speed test in challenge mode: a fixed 60 s run on the link's passage, compared with the sender's score. */
export default function Page() {
  return (
    <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
      <div className="w-full">
        <h1 className="sr-only">Typing challenge: beat a friend’s score</h1>
        <TypingSpeedTest challenge />
      </div>
    </section>
  );
}
