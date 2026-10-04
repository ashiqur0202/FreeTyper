import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts, getBlogPost } from '@/data/blog/typing-skills';
import { articleContent } from '@/data/blog/article-content';
import BlogContent from '@/components/blog/BlogContent';
import { visiblePostDate } from '@/lib/post-dates';
import JsonLd, { blogPostingSchema, breadcrumbSchema } from '@/components/seo/JsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: `${siteConfig.url}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const content = articleContent[slug];
  if (!content) notFound();

  const shownDate = visiblePostDate(post);

  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-text-dim">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-accent">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text">{post.title}</span>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-bright sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-text-dim">
          <Link href="/about#author" className="hover:text-accent">{post.author}</Link>
          <span>·</span>
          <time dateTime={shownDate.iso}>
            {shownDate.label} {shownDate.text}
          </time>
          <span>·</span>
          <span>{post.readTime} read</span>
        </div>
      </header>

      {/* Content */}
      <BlogContent html={content} />

      <JsonLd
        data={[
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Blog', url: `${siteConfig.url}/blog` },
            { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` },
          ]),
        ]}
      />

      {/* Back to blog */}
      <div className="mt-12 border-t border-surface-border pt-6">
        <Link href="/blog" className="text-sm text-accent hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
