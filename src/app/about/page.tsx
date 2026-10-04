import type { Metadata } from 'next';
import Link from 'next/link';
import { Keyboard } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About FreeTyper',
  description:
    'Who runs FreeTyper, why the typing test exists, how WPM is scored, and how to get in touch. Independent project — no signup, progress stays in your browser.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <div className="flex items-center gap-3 mb-8">
        <Keyboard className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-text-bright">About {siteConfig.name}</h1>
      </div>
      <p className="text-sm text-text-dim">Last updated: October 2026</p>

      <div className="mt-8 max-w-3xl space-y-8 text-text leading-relaxed">
        <section>
          <p>
            {siteConfig.name} is a free typing site. Open the home page, type, and get a words-per-minute
            score and an accuracy percentage. There is no account. Lessons, practice, a keyboard
            guide, and two short games sit next to the test. Progress stays in this browser.
          </p>
          <p className="mt-4">
            I built it because the tests I actually used either interrupted the first keystroke with
            a popup or locked practice behind a signup. I wanted the test on the home page and the
            rest of the work one click away.
          </p>
        </section>

        <section id="author">
          <h2 className="text-xl font-bold text-text-bright">Who runs it</h2>
          <p className="mt-2">
            I&apos;m Ashiqur Rahman. {siteConfig.name} is a small independent project I operate —
            not a company, not a typing school, and not an employer test vendor. I write the tools
            and the guides, I answer mail at{' '}
            <a href="mailto:contact@freetyper.com" className="text-accent hover:underline">
              contact@freetyper.com
            </a>
            , and I keep the site free to use.
          </p>
          <p className="mt-2 text-text-dim">
            If a page is wrong or a score looks off, that same address is the right place. I read it.
            Replies can take a few days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">How the test is scored</h2>
          <p className="mt-2">
            The home test uses the same <strong>5-characters-per-word</strong> convention used in a
            lot of job tests and older typewriter scoring. A “word” is five characters, including
            spaces and punctuation — not a dictionary word. Net WPM counts only the correct
            characters; gross WPM counts everything you typed. Accuracy is correct characters
            divided by characters typed. When you press Backspace, the character you step back over
            is removed from the count, so a mistake you fix stops counting as an error, but the time
            you spent fixing it still counts. Speed and accuracy are both shown because a fast
            messy run is not useful output.
          </p>
          <p className="mt-2">
            The timer starts on the first keystroke. Backspace is allowed. We do not require a login
            to see the result, and we do not treat a single run as a certificate. Average two or
            three tests if you want a number you can trust. The full method is on the{' '}
            <Link href="/" className="text-accent hover:underline">
              typing speed test
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">What is on the site</h2>
          <ul className="mt-2 list-disc list-inside space-y-2 text-text-dim">
            <li>
              Timed{' '}
              <Link href="/" className="text-accent hover:underline">
                speed test
              </Link>{' '}
              on the home page (several durations, words / sentences / code)
            </li>
            <li>
              Seven{' '}
              <Link href="/typing-lessons" className="text-accent hover:underline">
                typing lessons
              </Link>{' '}
              from home row to mixed text
            </li>
            <li>
              <Link href="/typing-practice" className="text-accent hover:underline">
                Practice
              </Link>{' '}
              with quotes, news, code, and weak-key drills
            </li>
            <li>
              A{' '}
              <Link href="/keyboard-guide" className="text-accent hover:underline">
                keyboard guide
              </Link>{' '}
              and a local{' '}
              <Link href="/typing-progress" className="text-accent hover:underline">
                progress
              </Link>{' '}
              log
            </li>
            <li>Two short games: Falling Words and Word Attack</li>
            <li>
              A{' '}
              <Link href="/blog" className="text-accent hover:underline">
                blog
              </Link>{' '}
              of ten sourced guides on typing speed, accuracy, touch typing, programmers, data-entry
              tests, keyboards, and posture
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">What we store — and what we don&apos;t</h2>
          <p className="mt-2">
            There are no user accounts. WPM history, settings, and game scores stay in this
            browser&apos;s localStorage. Clearing site data deletes them. We use Google Analytics to
            see which pages are used. Google ads may appear after AdSense approval. Those services
            use cookies, which is spelled out on the{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              privacy policy
            </Link>
            .
          </p>
          <p className="mt-2 text-text-dim">
            We do not sell typing results as a profile product. We do not claim “no tracking” while
            Analytics is on. The site is a general-audience tool; it is not directed at children
            under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">What we don&apos;t claim</h2>
          <p className="mt-2 text-text-dim">
            {siteConfig.name} will not make you a court reporter in a weekend. WPM bands on the site
            (beginner to elite) are our own shorthand, not a medical, school, or hiring standard.
            The research figures we do quote come from published studies that the guides link to. If a job posting lists a number, that listing wins. Pain while typing is a
            reason to stop and talk to a clinician, not to grind another lesson — see the{' '}
            <Link href="/disclaimer" className="text-accent hover:underline">
              disclaimer
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Contact</h2>
          <p className="mt-2">
            Email{' '}
            <a href="mailto:contact@freetyper.com" className="text-accent hover:underline">
              contact@freetyper.com
            </a>
            . There is no chat widget. Details: the{' '}
            <Link href="/contact" className="text-accent hover:underline">
              contact
            </Link>{' '}
            page.
          </p>
        </section>
      </div>
    </div>
  );
}
