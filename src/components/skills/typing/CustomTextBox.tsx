'use client';

import { useState } from 'react';
import { CUSTOM_MAX, cleanCustomText } from './engine/sources';

/** The paste box of the Custom tab: the person's own text, cleaned to plain typable characters. */
export default function CustomTextBox({ initial, onUse }: { initial: string; onUse: (cleaned: string) => void }) {
  const [value, setValue] = useState(initial);
  const cleaned = cleanCustomText(value);

  return (
    <div className="mt-2 flex flex-col gap-2 py-3">
      <label htmlFor="custom-text" className="sr-only">
        Your own text to practise
      </label>
      <textarea
        id="custom-text"
        value={value}
        maxLength={CUSTOM_MAX}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Paste or type the text you want to practise (up to ${CUSTOM_MAX.toLocaleString('en-US')} characters)`}
        className="min-h-28 w-full resize-y rounded-xl border border-surface-border bg-surface px-3 py-2.5 font-mono text-[0.95rem] leading-relaxed text-text-bright focus:outline-2 focus:outline-offset-1 focus:outline-accent"
      />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-text-dim">
        <span>
          {value.length} / {CUSTOM_MAX.toLocaleString('en-US')} · Your own text, we do not check it. Curly quotes become plain, line breaks become spaces, and
          characters the keyboard cannot type are dropped.
        </span>
        <button
          type="button"
          disabled={!cleaned}
          onClick={() => onUse(cleaned)}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-bg transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          Practise this text
        </button>
      </div>
    </div>
  );
}
