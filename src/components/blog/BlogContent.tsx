'use client';

import { useEffect, useRef } from 'react';

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    // Generate TOC from headings
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
      className="prose prose-invert prose-amber max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:marker:text-amber-500
        prose-table:text-sm
        prose-th:text-gray-300 prose-th:bg-gray-900 prose-th:px-4 prose-th:py-2
        prose-td:text-gray-400 prose-td:border-gray-800 prose-td:px-4 prose-td:py-2
        prose-blockquote:border-amber-500 prose-blockquote:text-gray-400"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
