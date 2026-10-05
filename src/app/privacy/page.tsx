import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How FreeTyper handles data: local progress in your browser, Google Analytics, and (when enabled) Google ads.',
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-text-bright">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-dim">Last updated: October 2026</p>

      <div className="mt-8 space-y-8 text-text leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text-bright">Overview</h2>
          <p className="mt-2">
            {siteConfig.name} ({siteConfig.url}) is a no-account typing site operated by Ashiqur
            Rahman. Your WPM history, settings, and achievements stay in this browser
            (localStorage). We do not run user accounts or sell profiles. We do use Google Analytics
            to see which pages are used, and we may show Google ads after AdSense approval. Those
            Google services use cookies as described below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Data stored on your device</h2>
          <p className="mt-2">
            Progress, achievements, settings, game high scores, and the speed graph of your latest
            runs are stored only in your browser&apos;s localStorage. So are your letter-pair statistics: which letters you type
            one after the other, how often a pair goes wrong and how long it takes, used to build
            weak-key drills. That data does not go to our servers. Clearing site data deletes it,
            and resetting progress on the progress page clears the pair statistics too.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Google Analytics</h2>
          <p className="mt-2">
            We use Google Analytics 4 to measure visits (pages, approximate country, device type,
            session length). Google processes this on our behalf. It is not tied to a FreeTyper
            login because we do not have logins.
          </p>
          <p className="mt-2">
            We also send a few anonymous usage events to Analytics so we can see which tools are
            used: for example that a test, lesson, practice run or game was finished, with its
            length, WPM and accuracy numbers, and which setting was changed. We never send what you
            type.
          </p>
          <p className="mt-2 text-text-dim">
            You can block Analytics with a browser extension or Google&apos;s own opt-out tools.
            &quot;Do Not Track&quot; browser flags are not a reliable opt-out for Analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Google advertising</h2>
          <p className="mt-2">
            When ads are enabled, third-party vendors, including Google, use cookies to serve ads
            based on a user&apos;s prior visits to this website or other websites. Google&apos;s use
            of advertising cookies enables it and its partners to serve ads to your users based on
            their visit to this site and/or other sites on the Internet.
          </p>
          <p className="mt-2">
            See{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses information on sites or apps that use our services
            </a>
            .
          </p>
          <p className="mt-2 text-text-dim">
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            . You can also opt out of some third-party vendors&apos; use of cookies for personalized
            advertising at{' '}
            <a
              href="https://www.aboutads.info/choices/"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Cookies</h2>
          <p className="mt-2">
            We do not set first-party tracking cookies. Third parties, including Google, may place
            and read cookies on your browser, or use web beacons or IP addresses to collect
            information as a result of ad serving and analytics on this website.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-text-dim">
            <li>Google Analytics cookies (traffic measurement)</li>
            <li>Google AdSense cookies (ads), once ads are live</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Children</h2>
          <p className="mt-2">
            {siteConfig.name} is a general-audience typing tool. It is not directed at children
            under 13. We do not knowingly collect personal information from children. If you believe
            a child has sent us personal information, email contact@freetyper.com and we will delete
            it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Contact</h2>
          <p className="mt-2 text-text-dim">
            Questions about this policy:{' '}
            <a href="mailto:contact@freetyper.com" className="text-accent hover:underline">
              contact@freetyper.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
