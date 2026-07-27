'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { injectContentDates } from '@/lib/content-dates';

interface ExpandableSeoContentProps {
  /** Always-visible intro (rendered with `.blog-article` styling). */
  previewHtml: string;
  /** Full article body — always in the DOM, hidden until expanded (SEO-safe). */
  bodyHtml: string;
  readMoreLabel?: string;
  showLessLabel?: string;
}

/**
 * Renders a short visible preview plus a "Read more" toggle that reveals the
 * full body. The body is always present in the HTML (only visually hidden via
 * the Tailwind `hidden` utility) so crawlers and no-JS clients see the entire
 * article — the toggle never mounts/unmounts content.
 *
 * Injects {{UPDATED_DISPLAY}} / {{UPDATED_DATETIME}} as the current month+year.
 *
 * Hash links (in-article TOC) auto-expand the body so anchors are reachable.
 */
export default function ExpandableSeoContent({
  previewHtml,
  bodyHtml,
  readMoreLabel = 'Read more',
  showLessLabel = 'Show less',
}: ExpandableSeoContentProps) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  const preview = useMemo(() => injectContentDates(previewHtml), [previewHtml]);
  const body = useMemo(() => injectContentDates(bodyHtml), [bodyHtml]);

  useEffect(() => {
    const expandForHash = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash) {
        setExpanded(true);
        requestAnimationFrame(() => {
          const id = window.location.hash.slice(1);
          if (!id) return;
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };

    expandForHash();
    window.addEventListener('hashchange', expandForHash);
    return () => window.removeEventListener('hashchange', expandForHash);
  }, []);

  return (
    <section className="border-t border-surface-border pt-10">
      <div
        className="blog-article"
        dangerouslySetInnerHTML={{ __html: preview }}
      />

      <div
        id={bodyId}
        className={`blog-article ${expanded ? '' : 'hidden'}`}
        dangerouslySetInnerHTML={{ __html: body }}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-4 py-3 text-sm font-medium text-text-dim transition-colors hover:border-accent hover:text-accent"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            <span>{showLessLabel}</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            <span>{readMoreLabel}</span>
          </>
        )}
      </button>
    </section>
  );
}
