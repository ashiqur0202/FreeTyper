import { siteConfig } from '@/config/site';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white">Overview</h2>
          <p className="mt-2">{siteConfig.name} is built with privacy as a core principle. We do not require accounts, we do not collect personal information, and we do not track you across the web.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Data Storage</h2>
          <p className="mt-2">All your typing progress, achievements, settings, and history are stored exclusively in your browser&apos;s localStorage. This data never leaves your device. We have no access to it, cannot read it, and cannot share it.</p>
          <p className="mt-2 text-gray-400">Clearing your browser data will permanently delete your progress. We recommend noting your key stats periodically if you wish to track long-term improvement.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="mt-2">We use Google Analytics to understand general site traffic patterns (page views, session duration, country-level location). This data is anonymous and aggregated. We do not track individual users or tie analytics data to any personal identity.</p>
          <p className="mt-2 text-gray-400">You can opt out of analytics by using a browser extension that blocks Google Analytics or by enabling Do Not Track in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Advertising</h2>
          <p className="mt-2">We may display advertisements through Google AdSense. These ads may use cookies to serve relevant content. Google&apos;s advertising cookies enable it and its partners to serve ads based on visits to this site and/or other sites on the Internet.</p>
          <p className="mt-2 text-gray-400">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Cookies</h2>
          <p className="mt-2">Our use of cookies is minimal and limited to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>Google Analytics cookies (for anonymous traffic analysis)</li>
            <li>Google AdSense cookies (for ad personalization, if applicable)</li>
          </ul>
          <p className="mt-2 text-gray-400">We do not set our own cookies. Your typing progress uses localStorage, not cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Third-Party Links</h2>
          <p className="mt-2">Our site may contain links to external websites (e.g., blog references, affiliate recommendations). We are not responsible for the privacy practices of those external sites.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Children&apos;s Privacy</h2>
          <p className="mt-2">{siteConfig.name} is suitable for all ages. We do not knowingly collect personal information from children because we do not collect personal information from anyone.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Changes to This Policy</h2>
          <p className="mt-2 text-gray-400">We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Contact</h2>
          <p className="mt-2 text-gray-400">Questions about this privacy policy? Email us at contact@freetyper.com.</p>
        </section>
      </div>
    </div>
  );
}
