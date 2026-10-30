'use client';

import { Moon, Sun } from 'lucide-react';
import { ACCENT_COLORS, useSettings, type FontSize, type ThemeMode } from './SettingsProvider';

/**
 * Quick appearance controls at the top of the right sidebar: dark/light switch,
 * accent colour and typing-text size. They use the same settings (and the same
 * `setting_change` analytics event) as the Settings page and the sidebar's theme
 * popup, so every place stays in step. The midnight and paper themes stay
 * available in the popup and on the Settings page.
 */

const DARK_THEMES: ThemeMode[] = ['dark', 'midnight'];

const SIZES: { value: FontSize; label: string; textClass: string }[] = [
  { value: 'small', label: 'Small typing text', textClass: 'text-[11px]' },
  { value: 'default', label: 'Default typing text', textClass: 'text-[14px]' },
  { value: 'large', label: 'Large typing text', textClass: 'text-[18px]' },
];

export default function AppearanceControls() {
  const { settings, updateSetting } = useSettings();
  const isDark = DARK_THEMES.includes(settings.theme);

  return (
    <div className="border-b border-surface-border px-4 pb-4 pt-5" data-appearance-controls>
      <p className="text-[10px] uppercase tracking-widest text-text-dim">Appearance</p>

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark theme"
        onClick={() => updateSetting('theme', isDark ? 'light' : 'dark')}
        className="mt-3 flex w-full items-center justify-between rounded-md bg-surface-raised px-3 py-1.5 text-sm text-text transition-colors hover:text-text-bright"
      >
        <span className="inline-flex items-center gap-2">
          {isDark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          {isDark ? 'Dark' : 'Light'}
        </span>
        <span
          aria-hidden="true"
          className={`relative h-4 w-7 rounded-full transition-colors ${isDark ? 'bg-accent' : 'bg-surface-border'}`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-surface transition-all ${isDark ? 'left-3.5' : 'left-0.5'}`}
          />
        </span>
      </button>

      <div className="mt-3 flex items-center gap-1.5" role="group" aria-label="Accent colour">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => updateSetting('accentColor', c.id)}
            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
              settings.accentColor === c.id ? 'scale-110 border-text-bright' : 'border-transparent'
            }`}
            style={{ backgroundColor: c.color }}
            title={`${c.id} accent`}
            aria-label={`${c.id} accent`}
            aria-pressed={settings.accentColor === c.id}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-text-dim">Text size</span>
        <div className="flex gap-0.5" role="group" aria-label="Typing text size">
          {SIZES.map((sz) => (
            <button
              key={sz.value}
              type="button"
              onClick={() => updateSetting('fontSize', sz.value)}
              className={`flex h-7 w-7 items-center justify-center rounded-md leading-none transition-colors ${sz.textClass} ${
                settings.fontSize === sz.value
                  ? 'bg-accent-bg text-accent'
                  : 'text-text-dim hover:bg-surface-raised hover:text-text'
              }`}
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
  );
}
