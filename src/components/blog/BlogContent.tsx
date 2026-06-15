'use client';

import { useEffect, useRef } from 'react';

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    // Generate IDs for headings (for TOC / anchor links)
    const headings = contentRef.current.querySelectorAll('h2, h3');
    headings.forEach((heading) => {
      const id = heading.textContent
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      if (id) heading.id = id;
    });
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="blog-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
