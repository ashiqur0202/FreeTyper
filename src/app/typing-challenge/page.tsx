import type { Metadata } from 'next';
import TypingSpeedTest from '@/components/skills/typing/TypingSpeedTest';
import { siteConfig } from '@/config/site';

// A link page: every challenge has its own query string, so one canonical, kept out of search results.
export const metadata: Metadata = {
  title: { absolute: 'Typing Challenge: Beat a Friend’s Score | FreeTyper' },
  description: 'Type the same text as a friend for 60 seconds and see who types faster. Free, no sign-up.',
  alternates: { canonical: `${siteConfig.url}/typing-challenge` },
  robots: { index: false, follow: true },
};

/** The speed test in challenge mode: a fixed 60 s run on the link's passage, compared with the sender's score. */
export default function Page() {
  return (
    <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
      <div className="w-full">
        <TypingSpeedTest challenge />
      </div>
    </section>
  );
}
