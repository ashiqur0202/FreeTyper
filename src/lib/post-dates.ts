import type { BlogPost } from '@/data/blog/typing-skills';

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  // Fixed zone so server and browser render the same text.
  timeZone: 'UTC',
});

/** "2026-10-04" -> "October 4, 2026" */
export function formatPostDate(iso: string): string {
  return formatter.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * The one date shown to readers: the last substantive update when there is
 * one, otherwise the publish date. Both dates stay in the structured data.
 */
export function visiblePostDate(post: Pick<BlogPost, 'date' | 'updated'>): {
  iso: string;
  label: 'Updated' | 'Published';
  text: string;
} {
  const iso = post.updated ?? post.date;
  return {
    iso,
    label: post.updated ? 'Updated' : 'Published',
    text: formatPostDate(iso),
  };
}
