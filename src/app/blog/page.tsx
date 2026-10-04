import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog/typing-skills';
import BlogCard from '@/components/blog/BlogCard';

export const metadata: Metadata = {
  title: 'Blog — Typing Tips and Guides',
  description:
    'Sourced guides on typing speed, accuracy, touch typing, programmers, data-entry tests, keyboards and posture. Studies are linked and our own suggestions are labelled.',
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-text-bright">Blog</h1>
      <p className="mt-2 text-text-dim">
        Sourced typing guides. Where we cite research it is linked, and our own suggestions are labelled.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
