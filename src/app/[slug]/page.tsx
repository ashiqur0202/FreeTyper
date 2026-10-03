import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { toolsData, getToolBySlug } from '@/config/tools';
import { siteConfig } from '@/config/site';
import ToolClient from '@/components/tools/ToolClient';
import ToolPageContent from '@/components/tools/ToolPageContent';
import ExpandableSeoContent from '@/components/content/ExpandableSeoContent';
import JsonLd, {
  webApplicationSchema,
  faqSchema,
  howToSchema,
} from '@/components/seo/JsonLd';
import {
  meta as lessonsMeta,
  previewHtml as lessonsPreviewHtml,
  bodyHtml as lessonsBodyHtml,
  faqs as lessonsFaqs,
  howToSteps as lessonsHowToSteps,
} from '@/data/tools/typing-lessons-content';
import {
  meta as practiceMeta,
  previewHtml as practicePreviewHtml,
  bodyHtml as practiceBodyHtml,
  faqs as practiceFaqs,
  howToSteps as practiceHowToSteps,
} from '@/data/tools/typing-practice-content';
import {
  meta as guideMeta,
  previewHtml as guidePreviewHtml,
  bodyHtml as guideBodyHtml,
  faqs as guideFaqs,
  howToSteps as guideHowToSteps,
} from '@/data/tools/keyboard-guide-content';
import {
  meta as progressMeta,
  previewHtml as progressPreviewHtml,
  bodyHtml as progressBodyHtml,
  faqs as progressFaqs,
  howToSteps as progressHowToSteps,
} from '@/data/tools/typing-progress-content';
import {
  meta as fallingMeta,
  previewHtml as fallingPreviewHtml,
  bodyHtml as fallingBodyHtml,
  faqs as fallingFaqs,
  howToSteps as fallingHowToSteps,
} from '@/data/tools/falling-words-content';
import {
  meta as attackMeta,
  previewHtml as attackPreviewHtml,
  bodyHtml as attackBodyHtml,
  faqs as attackFaqs,
  howToSteps as attackHowToSteps,
} from '@/data/tools/word-attack-content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Tool pages that get homepage-style layout: full-viewport tool + expandable SEO. */
const seoToolPages: Record<
  string,
  {
    meta: { title: string; description: string };
    previewHtml: string;
    bodyHtml: string;
    faqs: { question: string; answer: string }[];
    howToSteps: { name: string; text: string }[];
    h1: string;
    howToName: string;
  }
> = {
  'typing-lessons': {
    meta: lessonsMeta,
    previewHtml: lessonsPreviewHtml,
    bodyHtml: lessonsBodyHtml,
    faqs: lessonsFaqs,
    howToSteps: lessonsHowToSteps,
    h1: 'Free Typing Lessons',
    howToName: 'How to Use Free Typing Lessons',
  },
  'typing-practice': {
    meta: practiceMeta,
    previewHtml: practicePreviewHtml,
    bodyHtml: practiceBodyHtml,
    faqs: practiceFaqs,
    howToSteps: practiceHowToSteps,
    h1: 'Free Typing Practice',
    howToName: 'How to Use Free Typing Practice',
  },
  'keyboard-guide': {
    meta: guideMeta,
    previewHtml: guidePreviewHtml,
    bodyHtml: guideBodyHtml,
    faqs: guideFaqs,
    howToSteps: guideHowToSteps,
    h1: 'Keyboard Guide — Touch Typing Finger Placement',
    howToName: 'How to Use the FreeTyper Keyboard Guide',
  },
  'typing-progress': {
    meta: progressMeta,
    previewHtml: progressPreviewHtml,
    bodyHtml: progressBodyHtml,
    faqs: progressFaqs,
    howToSteps: progressHowToSteps,
    h1: 'Typing Progress Tracker — WPM History & Achievements',
    howToName: 'How to Track Typing Progress on FreeTyper',
  },
  'typing-game-falling-words': {
    meta: fallingMeta,
    previewHtml: fallingPreviewHtml,
    bodyHtml: fallingBodyHtml,
    faqs: fallingFaqs,
    howToSteps: fallingHowToSteps,
    h1: 'Falling Words Typing Game — Free Speed Training',
    howToName: 'How to Play FreeTyper Falling Words',
  },
  'typing-game-word-attack': {
    meta: attackMeta,
    previewHtml: attackPreviewHtml,
    bodyHtml: attackBodyHtml,
    faqs: attackFaqs,
    howToSteps: attackHowToSteps,
    h1: 'Word Attack Typing Game — Combos & Timed Rounds',
    howToName: 'How to Play FreeTyper Word Attack',
  },
};

export async function generateStaticParams() {
  return toolsData
    .filter((tool) => tool.id !== 'typing-speed-test')
    .map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const seo = seoToolPages[slug];
  const title = seo?.meta.title ?? tool.seoTitle;
  const description = seo?.meta.description ?? tool.description;
  const url =
    slug === 'typing-speed-test' ? siteConfig.url : `${siteConfig.url}/${tool.id}`;

  return {
    title: seo ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      // Home owns the speed-test keyword; point the duplicate route there.
      canonical: slug === 'typing-speed-test' ? siteConfig.url : url,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === 'typing-speed-test') {
    permanentRedirect('/');
  }

  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const seo = seoToolPages[slug];
  if (seo) {
    const pageUrl = `${siteConfig.url}/${slug}`;
    return (
      <div>
        <section
          className={
            slug === 'typing-practice' ||
            slug === 'typing-lessons' ||
            slug === 'typing-game-falling-words' ||
            slug === 'typing-game-word-attack'
              ? 'flex min-h-screen flex-col justify-start px-8 pt-16 pb-12 sm:px-10 md:pt-10 lg:px-12'
              : 'flex min-h-screen items-center justify-center px-8 py-12 sm:px-10 lg:px-12'
          }
        >
          <div className="w-full">
            <ToolClient toolId={tool.id} />
          </div>
        </section>

        <section className="px-8 pb-16 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <ExpandableSeoContent
              previewHtml={seo.previewHtml}
              bodyHtml={seo.bodyHtml}
              readMoreLabel="Read the full guide"
              showLessLabel="Show less"
            />
          </div>
        </section>

        <JsonLd
          data={[
            webApplicationSchema(seo.meta.title, seo.meta.description, pageUrl),
            faqSchema(seo.faqs),
            howToSchema(seo.howToSteps, {
              name: seo.howToName,
              description: seo.meta.description,
            }),
          ]}
        />
      </div>
    );
  }

  return (
    <ToolPageContent tool={tool}>
      <ToolClient toolId={tool.id} />
    </ToolPageContent>
  );
}
