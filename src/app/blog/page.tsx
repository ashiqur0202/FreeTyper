import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog/typing-skills';
import BlogCard from '@/components/blog/BlogCard';

export const metadata: Metadata = {
  title: 'Blog — Typing Tips, Guides & News',
  description: 'Typing tips, speed improvement guides, ergonomic advice, and the latest in keyboard technology.',
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Blog</h1>
      <p className="mt-2 text-gray-400">Typing tips, guides, and resources to help you type faster.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
