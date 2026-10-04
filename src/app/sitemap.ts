import type { MetadataRoute } from 'next';
import { tools } from '@/config/tools';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog/typing-skills';

export default function sitemap(): MetadataRoute.Sitemap {
  // Home (`/`) is the canonical speed-test URL; do not list the duplicate slug.
  const toolPages = tools
    .filter((tool) => tool.id !== 'typing-speed-test')
    .map((tool) => ({
      url: `${siteConfig.url}/${tool.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const blogPages = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const staticPages = [
    { url: siteConfig.url, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${siteConfig.url}/blog`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${siteConfig.url}/contact`, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${siteConfig.url}/disclaimer`, changeFrequency: 'yearly' as const, priority: 0.2 },
  ];

  return [...staticPages, ...toolPages, ...blogPages];
}
