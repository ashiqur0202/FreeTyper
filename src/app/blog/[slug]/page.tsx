import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts, getBlogPost } from '@/data/blog/typing-skills';
import { articleContent } from '@/data/blog/article-content';
import BlogContent from '@/components/blog/BlogContent';

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-amber-400">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-300">{post.title}</span>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
          <span>{post.author}</span>
          <span>·</span>
          <time>{post.date}</time>
          <span>·</span>
          <span>{post.readTime} read</span>
        </div>
      </header>

      {/* Content */}
      <BlogContent html={content} />

      {/* Back to blog */}
      <div className="mt-12 border-t border-gray-800 pt-6">
        <Link href="/blog" className="text-sm text-amber-500 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
