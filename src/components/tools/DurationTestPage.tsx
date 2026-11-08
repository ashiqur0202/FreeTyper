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
import { getDurationPage } from '@/data/home/duration-tests-content';

export function durationMetadata(minutes: 1 | 3 | 5): Metadata {
  const page = getDurationPage(minutes);
  const url = `${siteConfig.url}/${page.slug}`;
  return {
    title: { absolute: page.meta.title },
    description: page.meta.description,
    authors: [{ name: siteConfig.author, url: `${siteConfig.url}/about` }],
    alternates: { canonical: url },
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta.title,
      description: page.meta.description,
    },
  };
}

/** A test-length page: the same speed test, opened on a fixed length, with its own short guide. */
export default function DurationTestPage({ minutes }: { minutes: 1 | 3 | 5 }) {
  const page = getDurationPage(minutes);
  const url = `${siteConfig.url}/${page.slug}`;
  const name = `${minutes} Minute Typing Test`;
  return (
    <div>
      <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
        <div className="w-full">
          <TypingSpeedTest initialDuration={page.seconds} />
        </div>
      </section>

      <section className="px-8 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <ExpandableSeoContent
            previewHtml={page.previewHtml}
            bodyHtml={page.bodyHtml}
            readMoreLabel={`Read about the ${minutes} minute test`}
            showLessLabel="Show less"
          />
        </div>
      </section>

      <JsonLd
        data={[
          webApplicationSchema(page.meta.title, page.meta.description, url),
          faqSchema(page.faqs),
          howToSchema(page.howToSteps, {
            name: page.howToName,
            description: page.meta.description,
          }),
          breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Free Typing Speed Test', url: siteConfig.url },
            { name, url },
          ]),
        ]}
      />
    </div>
  );
}
