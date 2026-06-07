import { siteConfig } from '@/config/site';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white">Acceptance of Terms</h2>
          <p className="mt-2">By accessing and using {siteConfig.name} ({siteConfig.url}), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Use of Service</h2>
          <p className="mt-2">{siteConfig.name} provides free typing lessons, speed tests, practice tools, and typing games. The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.</p>
          <p className="mt-2 text-gray-400">You agree to use the service only for its intended purpose and not to attempt to disrupt, overload, or interfere with the proper functioning of the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">No Account Required</h2>
          <p className="mt-2">{siteConfig.name} does not require user registration or accounts. All features are accessible without providing any personal information. Your typing data is stored locally in your browser and is not transmitted to our servers.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Intellectual Property</h2>
          <p className="mt-2">The content, design, and code of {siteConfig.name} are protected by applicable intellectual property laws. The site&apos;s source code is available under its open-source license on GitHub.</p>
          <p className="mt-2 text-gray-400">You may not copy, modify, or redistribute the site&apos;s design or content without appropriate permission, except as permitted by the open-source license.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Disclaimer</h2>
          <p className="mt-2 text-gray-400">{siteConfig.name} provides typing tools for educational and entertainment purposes. We make no guarantees about specific outcomes, such as reaching a particular WPM or accuracy level. Individual results vary based on practice consistency, starting skill level, and other factors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Limitation of Liability</h2>
          <p className="mt-2 text-gray-400">To the maximum extent permitted by law, {siteConfig.name} and its contributors shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Third-Party Services</h2>
          <p className="mt-2 text-gray-400">The site may use third-party services such as Google Analytics for traffic analysis and Google AdSense for advertising. These services are governed by their respective terms of service and privacy policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Changes to Terms</h2>
          <p className="mt-2 text-gray-400">We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Contact</h2>
          <p className="mt-2 text-gray-400">Questions about these terms? Email us at contact@freetyper.com.</p>
        </section>
      </div>
    </div>
  );
}
