'use client';

import { Check, Moon, Sun } from 'lucide-react';
import { ACCENT_COLORS, useSettings, type FontSize, type ThemeMode } from './SettingsProvider';

/**
 * Quick appearance controls in the left sidebar under "settings": light/dark,
 * accent colour and typing-text size. They use the same settings (and the same
 * `setting_change` analytics event) as the Settings page, so both stay in step.
 * The midnight and paper themes are on the Settings page.
 */

const DARK_THEMES: ThemeMode[] = ['dark', 'midnight'];

const SIZES: { value: FontSize; label: string; textClass: string }[] = [
  { value: 'small', label: 'Small typing text', textClass: 'text-[11px]' },
  { value: 'default', label: 'Default typing text', textClass: 'text-[14px]' },
  { value: 'large', label: 'Large typing text', textClass: 'text-[18px]' },
];

const segmentClass = (active: boolean) =>
  `flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 leading-none transition-colors ${
    active
      ? 'bg-surface text-accent shadow-sm ring-1 ring-surface-border'
      : 'text-text-dim hover:text-text'
  }`;

export default function AppearanceControls({ className = 'px-2 pb-2 pt-3' }: { className?: string }) {
  const { settings, updateSetting } = useSettings();
  const isDark = DARK_THEMES.includes(settings.theme);

  return (
    <div className={className} data-appearance-controls>
      <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-text-dim">Appearance</p>

      <div className="space-y-3 rounded-lg border border-surface-border bg-surface-raised/40 p-2.5">
        <div className="flex gap-0.5 rounded-lg bg-surface-raised p-0.5 text-xs" role="group" aria-label="Colour mode">
          <button
            type="button"
            onClick={() => isDark && updateSetting('theme', 'light')}
            className={segmentClass(!isDark)}
            aria-pressed={!isDark}
          >
            <Sun size={13} aria-hidden="true" />
            Light
          </button>
          <button
            type="button"
            onClick={() => !isDark && updateSetting('theme', 'dark')}
            className={segmentClass(isDark)}
            aria-pressed={isDark}
          >
            <Moon size={13} aria-hidden="true" />
            Dark
          </button>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] text-text-dim">Accent</p>
          <div className="flex items-center justify-between px-0.5" role="group" aria-label="Accent colour">
            {ACCENT_COLORS.map((c) => {
              const selected = settings.accentColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateSetting('accentColor', c.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                    selected ? 'ring-2 ring-text-bright ring-offset-2 ring-offset-surface' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={`${c.id} accent`}
                  aria-label={`${c.id} accent`}
                  aria-pressed={selected}
                >
                  {selected && <Check size={11} strokeWidth={3} className="text-surface" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] text-text-dim">Text size</p>
          <div className="flex gap-0.5 rounded-lg bg-surface-raised p-0.5" role="group" aria-label="Typing text size">
            {SIZES.map((sz) => (
              <button
                key={sz.value}
                type="button"
                onClick={() => updateSetting('fontSize', sz.value)}
                className={`${segmentClass(settings.fontSize === sz.value)} ${sz.textClass}`}
                title={sz.label}
                aria-label={sz.label}
                aria-pressed={settings.fontSize === sz.value}
              >
                A
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
