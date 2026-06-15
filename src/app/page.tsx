import type { Metadata } from 'next';
import TypingSpeedTest from '@/components/skills/typing/TypingSpeedTest';
import ExpandableSeoContent from '@/components/content/ExpandableSeoContent';
import JsonLd, {
  webApplicationSchema,
  faqSchema,
  howToSchema,
} from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';
import {
  meta,
  previewHtml,
  bodyHtml,
  faqs,
  howToSteps,
} from '@/data/home/typing-speed-content';

// Home (`/`) is the canonical speed-test page — see plan.
export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: siteConfig.url,
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
  },
};

export default function HomePage() {
  return (
    <div>
      {/* Typing window — fills the viewport so SEO content starts below the fold
          and stays out of sight while a test is in progress. */}
      <section className="flex min-h-screen items-center justify-center px-8 py-12 sm:px-10 lg:px-12">
        {/* Visible hero is the tool; the H1 carries the primary keyword for SEO/a11y. */}
        <h1 className="sr-only">Free Typing Speed Test</h1>
        <div className="w-full">
          <TypingSpeedTest />
        </div>
      </section>

      {/* SEO content — visible only once the user scrolls past the typing window.
          Preview is always shown; the full article is in the DOM but expandable. */}
      <section className="px-8 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <ExpandableSeoContent previewHtml={previewHtml} bodyHtml={bodyHtml} />
        </div>
      </section>

      <JsonLd
        data={[
          webApplicationSchema(meta.title, meta.description, siteConfig.url),
          faqSchema(faqs),
          howToSchema(howToSteps, {
            name: 'How to Take the Typing Speed Test',
            description: meta.description,
          }),
        ]}
      />
    </div>
  );
}
