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
import { numberRowContent } from '@/data/home/number-row-content';

const url = `${siteConfig.url}/${numberRowContent.slug}`;

export function numberRowMetadata(): Metadata {
  const { meta } = numberRowContent;
  return {
    title: { absolute: meta.title },
    description: meta.description,
    authors: [{ name: siteConfig.author, url: `${siteConfig.url}/about` }],
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

/** The speed test on digits (and the shifted symbols above them), with its own short guide. */
export default function NumberRowPage() {
  const page = numberRowContent;
  return (
    <div>
      <section className="flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12">
        <div className="w-full">
          <TypingSpeedTest numberRow initialDuration={30} />
        </div>
      </section>

      <section className="px-8 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <ExpandableSeoContent
            previewHtml={page.previewHtml}
            bodyHtml={page.bodyHtml}
            readMoreLabel="Read about the number row test"
            showLessLabel="Show less"
          />
        </div>
      </section>

      <JsonLd
        data={[
          webApplicationSchema(page.meta.title, page.meta.description, url),
          faqSchema(page.faqs),
          howToSchema(page.howToSteps, { name: page.howToName, description: page.meta.description }),
          breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Free Typing Speed Test', url: siteConfig.url },
            { name: 'Number Row Typing Test', url },
          ]),
        ]}
      />
    </div>
  );
}
