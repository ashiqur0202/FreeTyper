import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How FreeTyper handles data: progress in your browser, the optional account that saves it to our server and ranks your speed tests on a public leaderboard, Google Analytics, and (when enabled) Google ads.',
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-text-bright">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-dim">Last updated: November 2026</p>

      <div className="mt-8 space-y-8 text-text leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text-bright">Overview</h2>
          <p className="mt-2">
            {siteConfig.name} ({siteConfig.url}) is a typing site operated by Ashiqur Rahman. You do
            not need an account. By default your WPM history, settings, and achievements stay in this
            browser (localStorage). You can choose to log in with Google. Then a copy of your
            progress numbers is also saved on our server so it follows you to other devices, and your
            speed tests are ranked on a public leaderboard with your username and your name from
            Google. We never sell profiles or data. We do use Google Analytics to see which pages are used, and
            we may show Google ads after AdSense approval. Those Google services use cookies as
            described below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Data stored on your device</h2>
          <p className="mt-2">
            Progress, achievements, settings (including the text difficulty you chose), game high scores, the speed graph of your latest
            runs, and short fingerprints of the sentences you saw lately (so a new test can avoid them; they hold no text) are stored only in your browser&apos;s localStorage. So are your letter-pair statistics: which letters you type
            one after the other, how often a pair goes wrong and how long it takes, used to build
            weak-key drills. If you do not log in, none of this goes to our servers. Clearing site
            data deletes it, and resetting progress on the progress page clears the pair statistics
            too. If you log in, only the progress part is copied to your account, as described in
            the next section; settings, game high scores, sentence fingerprints and letter-pair
            statistics always stay on the device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Optional account (log in)</h2>
          <p className="mt-2">
            Logging in is optional and every tool works without it. At the moment the only way to
            log in is with a Google account. There is no password on FreeTyper.
          </p>
          <p className="mt-2 font-medium text-text-bright">What we store when you log in</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-text-dim">
            <li>Your email address, name and profile picture link, as Google gives them to us.</li>
            <li>The identifier Google uses for your account, so we can recognise you next time.</li>
            <li>
              A leaderboard username (first made from your name in plain letters; you can change it on the
              Account page), and each speed test that counts for the leaderboard: its speed, accuracy,
              length, text type and level, and the time we received it.
            </li>
            <li>
              A record of each login session: a random session token, when it was made and when it
              expires, and the IP address and browser description of the device. This keeps you
              logged in and lets us sign you out.
            </li>
            <li>
              The progress numbers described below. We do not store your Google password (we never
              see it) or the sign-in tokens Google issues.
            </li>
          </ul>
          <p className="mt-3 font-medium text-text-bright">What progress is saved to your account</p>
          <p className="mt-1">
            The same progress numbers the site keeps in your browser: the date, speed, accuracy,
            length and type of each test, lesson and practice run (with the speed graph of your
            latest five runs), how often and how accurately you typed each key, your streak and best
            scores, which course lessons you passed or skipped, your daily challenge results, and
            the progress of Smart lessons and adaptive practice. It never includes what you typed:
            no text and no keystrokes. At most the newest 1,000 runs are kept.
          </p>
          <p className="mt-3 font-medium text-text-bright">The public leaderboard</p>
          <p className="mt-1">
            Everyone who logs in is on the leaderboard automatically; there is no separate sign-up and no
            switch to turn it off (you can choose not to log in, or delete your account). Anyone, logged in
            or not, can see: your username, the name from your Google account (only while your account is
            active), your best counted score on each board, the length and text type of those tests, and
            when they were taken. We do not show your email address, your picture or your saved progress.
            Only tests with at least 95% accuracy count, and each person appears once per board.
          </p>
          <p className="mt-3 font-medium text-text-bright">Why, and who sees it</p>
          <p className="mt-1">
            To log you in, to keep your progress in step across your devices, and to run the public
            leaderboard. We do not use it for advertising or profiles, we do not sell it, and we do not send your email address
            or account to Google Analytics. It is kept in a database on our own server, which is
            rented from Hetzner and located in Nuremberg, Germany. Google handles the sign-in
            itself under its own privacy policy.
          </p>
          <p className="mt-3 font-medium text-text-bright">Deleting it</p>
          <p className="mt-1">
            Open the Account page and choose &quot;Delete account&quot;. That ends your login: your login
            sessions are removed straight away and you can no longer sign in. <strong className="text-text">We
            keep the data we held about you</strong> in private records: your email address, your name and picture
            from Google, your Google account identifier, when you joined, and the progress saved on our
            server. It is not shown to anyone and not used for ads or sold. Your username and speed test
            scores stay public on the leaderboard and in its history, marked &quot;account deleted&quot;,
            without your name. Progress in your browser stays. To ask for a copy of what we hold about you, to have it erased, to change a username, or if
            you want a score or username removed from the leaderboard, email{' '}
            <a href="mailto:contact@freetyper.com" className="text-accent hover:underline">
              contact@freetyper.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Google Analytics</h2>
          <p className="mt-2">
            We use Google Analytics 4 to measure visits (pages, approximate country, device type,
            session length). Google processes this on our behalf. We do not send your email
            address or account to Analytics, so these visits are not tied to a FreeTyper account.
          </p>
          <p className="mt-2">
            We also send a few anonymous usage events to Analytics so we can see which tools are
            used: for example that a test, lesson, practice run or game was finished, with its
            length, WPM and accuracy numbers, which setting was changed, and that the &quot;continue&quot;
            shortcut in the sidebar was used (with the lesson number). We never send what you
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
            We do not set first-party tracking cookies. The one first-party cookie we use appears
            only if you log in: it keeps you logged in (a random token that lasts up to 30 days, is
            sent only over HTTPS and cannot be read by scripts on the page). Third parties,
            including Google, may place and read cookies on your browser, or use web beacons or IP
            addresses to collect information as a result of ad serving and analytics on this
            website.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-text-dim">
            <li>FreeTyper login cookie (only after you log in)</li>
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
