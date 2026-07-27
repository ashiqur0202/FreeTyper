/**
 * Dynamic “Updated” labels for SEO content (month + year only).
 *
 * Content HTML can use placeholders:
 *   {{UPDATED_DISPLAY}}   → e.g. "July 2026"
 *   {{UPDATED_DATETIME}}  → e.g. "2026-07" (for <time datetime>)
 *
 * UTC keeps SSR and client hydration aligned across timezones.
 */

export function getContentUpdatedMonthYear(now: Date = new Date()) {
  const display = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(now);

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return {
    /** e.g. "July 2026" */
    display,
    /** e.g. "2026-07" for <time datetime> */
    datetime: `${year}-${month}`,
  };
}

/** Replace {{UPDATED_DISPLAY}} / {{UPDATED_DATETIME}} in SEO HTML strings. */
export function injectContentDates(html: string, now: Date = new Date()): string {
  const { display, datetime } = getContentUpdatedMonthYear(now);
  return html
    .replaceAll('{{UPDATED_DISPLAY}}', display)
    .replaceAll('{{UPDATED_DATETIME}}', datetime);
}

/** Canonical byline fragment for SEO previews. */
export function contentUpdatedBylineHtml(now: Date = new Date()): string {
  const { display, datetime } = getContentUpdatedMonthYear(now);
  return `<span>Updated <time datetime="${datetime}">${display}</time></span>`;
}
