import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { toolsData, getToolBySlug } from '@/config/tools';
import { siteConfig } from '@/config/site';
import ToolClient from '@/components/tools/ToolClient';
import ToolPageContent from '@/components/tools/ToolPageContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return toolsData.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: tool.seoTitle,
    description: tool.description,
    openGraph: {
      title: tool.seoTitle,
      description: tool.description,
      url: `${siteConfig.url}/${tool.id}`,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/${tool.id}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <ToolPageContent tool={tool}>
      <ToolClient toolId={tool.id} />
    </ToolPageContent>
  );
}
