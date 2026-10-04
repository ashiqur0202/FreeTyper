import Link from 'next/link';
import type { BlogPost } from '@/data/blog/typing-skills';
import { visiblePostDate } from '@/lib/post-dates';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const shownDate = visiblePostDate(post);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-surface-border bg-surface-raised p-5 transition-all hover:border-accent/30 hover:bg-surface"
    >
      <p className="text-xs text-text-dim">
        {shownDate.label} {shownDate.text} · {post.readTime}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-text-bright group-hover:text-accent transition-colors">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-text-dim line-clamp-2">{post.excerpt}</p>
      <span className="mt-3 inline-block text-sm text-accent">Read more →</span>
    </Link>
  );
}
