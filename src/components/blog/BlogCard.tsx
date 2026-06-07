import Link from 'next/link';
import type { BlogPost } from '@/data/blog/typing-skills';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-amber-500/30 hover:bg-gray-800"
    >
      <p className="text-xs text-gray-500">{post.date} · {post.readTime}</p>
      <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
      <span className="mt-3 inline-block text-sm text-amber-500">Read more →</span>
    </Link>
  );
}
