/**
 * The speed test listens for keys on the whole window and swallows every key press. A text box placed under the
 * test (such as the certificate name) opts out by carrying data-typing-ignore, on itself or on a parent.
 */
export function ignoresTyping(target: EventTarget | null): boolean {
  const el = target as { closest?: (selector: string) => unknown } | null;
  return Boolean(el?.closest?.('[data-typing-ignore]'));
}
