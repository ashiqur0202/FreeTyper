'use client';

import { useEffect, useState, type ReactNode } from 'react';
import AdaptivePractice from './AdaptivePractice';
import CustomTextBox from './CustomTextBox';
import { CODE_LANGUAGE_NAMES, type CodeLanguage } from './engine/code';
import {
  DEFAULT_PREFS,
  SOURCE_TABS,
  loadSourcePrefs,
  saveSourcePrefs,
  type CodeChoice,
  type PracticeSource,
} from './engine/sources';

const LANGUAGE_CHOICES: { id: CodeChoice; label: string }[] = [
  { id: 'any', label: 'Any' },
  ...(Object.keys(CODE_LANGUAGE_NAMES) as CodeLanguage[]).map((id) => ({ id, label: CODE_LANGUAGE_NAMES[id] })),
];

/**
 * The Practice page. The tabs in the strip are the kinds of text (Mixed, Sentences, Quotes, Facts, Code, Custom);
 * every kind is typed inside the same adaptive screen (AdaptivePractice), so each one counts toward the level and the keys.
 * The last choice is remembered in this browser and read only after the page has loaded.
 */
export default function TypingPractice() {
  const [source, setSource] = useState<PracticeSource>(DEFAULT_PREFS.source);
  const [language, setLanguage] = useState<CodeChoice>(DEFAULT_PREFS.language);
  const [customText, setCustomText] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prefs = loadSourcePrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, so it must run after hydration
    setSource(prefs.source);
    setLanguage(prefs.language);
    setMounted(true);
  }, []);

  const choose = (next: PracticeSource, nextLanguage: CodeChoice = language) => {
    setSource(next);
    setLanguage(nextLanguage);
    saveSourcePrefs({ source: next, language: nextLanguage });
  };

  const tabs = (running: boolean): ReactNode => (
    <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Kind of text">
      {SOURCE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={source === tab.id}
          onClick={() => choose(tab.id)}
          disabled={running}
          className={`rounded-md px-2.5 py-1 text-sm transition-all ${
            source === tab.id ? 'bg-accent-bg font-medium text-text-bright' : 'text-text hover:bg-surface hover:text-text-bright'
          } ${running ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const subRow = (running: boolean): ReactNode => {
    if (source === 'code') {
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-surface-border px-3 py-1.5 text-xs text-text-dim">
          <span>Language</span>
          {LANGUAGE_CHOICES.map((l) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={language === l.id}
              disabled={running}
              onClick={() => choose('code', l.id)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                language === l.id ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text hover:text-text-bright'
              } ${running ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      );
    }
    if (source === 'mixed') {
      return (
        <p className="border-b border-surface-border px-3 py-1.5 text-xs text-text-dim">
          Rotates through sentences, quotes, facts and code. Code comes up less often.
        </p>
      );
    }
    if (source === 'custom' && customText) {
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-surface-border px-3 py-1.5 text-xs text-text-dim">
          <span>Your own text, repeated until you change it.</span>
          <button
            type="button"
            disabled={running}
            onClick={() => setCustomText('')}
            className={`rounded-full border border-surface-border px-2.5 py-0.5 text-text hover:text-text-bright ${running ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
          >
            Change text
          </button>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-1">
          {SOURCE_TABS.map((t) => (
            <span key={t.id} className="px-2.5 py-1 text-sm text-text-dim">
              {t.label}
            </span>
          ))}
        </div>
        <div className="h-48" aria-hidden="true" />
      </div>
    );
  }

  return (
    <AdaptivePractice
      tabs={tabs}
      subRow={subRow}
      customPrompt={source === 'custom' && !customText ? <CustomTextBox initial="" onUse={setCustomText} /> : undefined}
      source={source}
      language={language}
      customText={customText}
    />
  );
}
