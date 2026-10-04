import type { FocusEvent, FormEvent } from 'react';

/**
 * Touch and IME keyboards often do not send usable `keydown` events
 * (`key` is "Unidentified"/"Process"), so typing has to be read from the
 * hidden input's `input` event as well.
 *
 * The input always holds one invisible sentinel character. Anything typed
 * shows up as extra text after it; Backspace removes the sentinel itself.
 * Each event is turned into onChar / onBackspace calls and the input is reset.
 *
 * On desktop the keydown handler calls preventDefault() for printable keys,
 * so the input never changes and nothing is counted twice.
 */
export const INPUT_SENTINEL = '\u200b';

function reset(el: HTMLInputElement) {
  el.value = INPUT_SENTINEL;
  try {
    el.setSelectionRange(INPUT_SENTINEL.length, INPUT_SENTINEL.length);
  } catch {
    /* some input types do not support selection */
  }
}

export function resetMobileInput(e: FocusEvent<HTMLInputElement>) {
  reset(e.currentTarget);
}

export function handleMobileInput(
  e: FormEvent<HTMLInputElement>,
  onChar: (char: string) => void,
  onBackspace: () => void,
) {
  const el = e.currentTarget;
  const value = el.value;
  const hadSentinel = value.includes(INPUT_SENTINEL);
  const typed = value.split(INPUT_SENTINEL).join('');
  if (!hadSentinel && typed.length === 0) {
    onBackspace();
  } else {
    for (const ch of typed) onChar(ch);
  }
  reset(el);
}
