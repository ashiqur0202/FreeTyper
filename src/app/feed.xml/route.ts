import { NextResponse } from 'next/server';
import { tools } from '@/config/tools';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog/typing-skills';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const toolItems = tools
    .filter((tool) => tool.id !== 'typing-speed-test')
    .map(
      (tool) => `
    <item>
      <title>${escapeXml(tool.name)}</title>
      <link>${siteConfig.url}/${tool.id}</link>
      <description>${escapeXml(tool.description)}</description>
      <guid>${siteConfig.url}/${tool.id}</guid>
    </item>`
    )
    .join('');

  const speedTestItem = `
    <item>
      <title>${escapeXml('Typing Speed Test')}</title>
      <link>${siteConfig.url}</link>
      <description>${escapeXml(
        'Timed typing speed test — get instant WPM, accuracy, and detailed results. Free, no signup.'
      )}</description>
      <guid>${siteConfig.url}</guid>
    </item>`;

  const blogItems = blogPosts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteConfig.url}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <guid>${siteConfig.url}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const items = `${speedTestItem}${toolItems}${blogItems}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
