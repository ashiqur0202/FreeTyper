import { NextResponse } from 'next/server';
import { tools } from '@/config/tools';
import { siteConfig } from '@/config/site';

export async function GET() {
  const items = tools.map((tool) => `
    <item>
      <title>${tool.name}</title>
      <link>${siteConfig.url}/${tool.id}</link>
      <description>${tool.description}</description>
      <guid>${siteConfig.url}/${tool.id}</guid>
    </item>
  `).join('');

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
