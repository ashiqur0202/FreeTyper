import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using FreeTyper’s free typing lessons, tests, practice tools, and games.',
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-text-bright">Terms of Service</h1>
      <p className="mt-2 text-sm text-text-dim">Last updated: September 2026</p>

      <div className="mt-8 space-y-8 text-text leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text-bright">Acceptance of Terms</h2>
          <p className="mt-2">By accessing and using {siteConfig.name} ({siteConfig.url}), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Use of Service</h2>
          <p className="mt-2">{siteConfig.name} provides free typing lessons, speed tests, practice tools, and typing games. The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.</p>
          <p className="mt-2 text-text-dim">You agree to use the service only for its intended purpose and not to attempt to disrupt, overload, or interfere with the proper functioning of the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">No Account Required</h2>
          <p className="mt-2">{siteConfig.name} does not require registration or accounts. Typing progress stays in your browser. We use Google Analytics to measure traffic, as described in the privacy policy. We do not sell user profiles or require you to create a login.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Intellectual Property</h2>
          <p className="mt-2">The content, design, and code of {siteConfig.name} are protected by applicable intellectual property laws. You may not copy or redistribute the site&apos;s design or content without permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Disclaimer</h2>
          <p className="mt-2 text-text-dim">{siteConfig.name} provides typing tools for educational and entertainment purposes. We make no guarantees about specific outcomes, such as reaching a particular WPM or accuracy level. Individual results vary based on practice consistency, starting skill level, and other factors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Limitation of Liability</h2>
          <p className="mt-2 text-text-dim">To the maximum extent permitted by law, {siteConfig.name} and its contributors shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Third-Party Services</h2>
          <p className="mt-2 text-text-dim">The site may use third-party services such as Google Analytics for traffic analysis and Google AdSense for advertising. These services are governed by their respective terms of service and privacy policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Changes to Terms</h2>
          <p className="mt-2 text-text-dim">We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-bright">Contact</h2>
          <p className="mt-2 text-text-dim">Questions about these terms? Email us at contact@freetyper.com.</p>
        </section>
      </div>
    </div>
  );
}
