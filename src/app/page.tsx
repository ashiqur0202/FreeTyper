import type { Metadata } from 'next';
import TypingSpeedTest from '@/components/skills/typing/TypingSpeedTest';
import ExpandableSeoContent from '@/components/content/ExpandableSeoContent';
import JsonLd, {
  webApplicationSchema,
  faqSchema,
  howToSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';
import {
  meta,
  previewHtml,
  bodyHtml,
  faqs,
  howToSteps,
} from '@/data/home/typing-speed-content';
import { getContentUpdatedMonthYear } from '@/lib/content-dates';

const { datetime: contentUpdatedMonth } = getContentUpdatedMonthYear();

// Home (`/`) is the canonical speed-test page.
export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  keywords: [
    'typing speed test',
    'free typing test',
    'wpm test',
    'words per minute test',
    'typing test online',
    'check typing speed',
    'typing accuracy test',
    'free wpm test',
  ],
  authors: [{ name: siteConfig.author, url: `${siteConfig.url}/about` }],
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
  other: {
    // Month-level freshness signal (YYYY-MM), matches on-page "Updated" byline.
    'article:modified_time': contentUpdatedMonth,
  },
};

export default function HomePage() {
  return (
    <div>
      {/* Typing window — fills the viewport so SEO content starts below the fold. */}
      <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
        <div className="w-full">
          <TypingSpeedTest />
        </div>
      </section>

      {/* Long-form SEO — full article always in DOM (Read more only hides visually). */}
      <section className="px-8 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <ExpandableSeoContent
            previewHtml={previewHtml}
            bodyHtml={bodyHtml}
            readMoreLabel="Read the full typing speed guide"
            showLessLabel="Show less"
          />
        </div>
      </section>

      <JsonLd
        data={[
          webApplicationSchema(meta.title, meta.description, siteConfig.url),
          faqSchema(faqs),
          howToSchema(howToSteps, {
            name: 'How to Take the FreeTyper Typing Speed Test',
            description: meta.description,
          }),
          breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Free Typing Speed Test', url: siteConfig.url },
          ]),
        ]}
      />
    </div>
  );
}
