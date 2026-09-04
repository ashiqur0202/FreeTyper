import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Keyboard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About FreeTyper',
  description:
    'FreeTyper is a free typing site: speed test, lessons, practice, and games. No signup. Progress stays in your browser.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <div className="flex items-center gap-3 mb-8">
        <Keyboard className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-text-bright">About {siteConfig.name}</h1>
      </div>

      <div className="space-y-6 text-text leading-relaxed">
        <p>
          {siteConfig.name} is a free typing site. Open it, type, get a WPM and accuracy score. No
          account. Progress stays in your browser.
        </p>
        <p>
          I built it because most typing tests either bury the tool under popups or lock practice
          behind a signup. The test on the home page is the same 5-characters-per-word scoring used
          in a lot of job tests, so the number is comparable — not a vanity score.
        </p>
        <h2 className="text-xl font-bold text-text-bright pt-4">What is on the site</h2>
        <ul className="list-disc list-inside space-y-2 text-text-dim">
          <li>Timed speed test (home)</li>
          <li>Seven lessons from home row to mixed text</li>
          <li>Practice: quotes, news, code, fun, weak keys</li>
          <li>Keyboard guide and a local progress log</li>
          <li>Two short games: Falling Words and Word Attack</li>
        </ul>
        <h2 className="text-xl font-bold text-text-bright pt-4">Who runs it</h2>
        <p className="text-text-dim">
          {siteConfig.name} is a small independent project. Questions:{' '}
          <a href="mailto:contact@freetyper.com" className="text-accent hover:underline">
            contact@freetyper.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
