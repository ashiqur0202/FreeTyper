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
  dailyMeta,
  dailyPreviewHtml,
  dailyBodyHtml,
  dailyFaqs,
  dailyHowToName,
  dailyHowToSteps,
} from '@/data/home/daily-challenge-content';

const url = `${siteConfig.url}/daily-typing-challenge`;

export const dailyMetadata: Metadata = {
  title: { absolute: dailyMeta.title },
  description: dailyMeta.description,
  authors: [{ name: siteConfig.author, url: `${siteConfig.url}/about` }],
  alternates: { canonical: url },
  openGraph: {
    title: dailyMeta.title,
    description: dailyMeta.description,
    url,
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: dailyMeta.title,
    description: dailyMeta.description,
  },
};

/** The speed test in daily mode: one fixed 60 s run on today's passage, with a streak. */
export default function DailyChallengePage() {
  return (
    <div>
      <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
        <div className="w-full">
          <TypingSpeedTest daily />
        </div>
      </section>

      <section className="px-8 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <ExpandableSeoContent
            previewHtml={dailyPreviewHtml}
            bodyHtml={dailyBodyHtml}
            readMoreLabel="Read about the daily challenge"
            showLessLabel="Show less"
          />
        </div>
      </section>

      <JsonLd
        data={[
          webApplicationSchema(dailyMeta.title, dailyMeta.description, url),
          faqSchema(dailyFaqs),
          howToSchema(dailyHowToSteps, { name: dailyHowToName, description: dailyMeta.description }),
          breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Free Typing Speed Test', url: siteConfig.url },
            { name: 'Daily Typing Challenge', url },
          ]),
        ]}
      />
    </div>
  );
}
