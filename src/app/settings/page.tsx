'use client';

import { Type, Volume2, VolumeX, Keyboard, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import { useSettings, type FontSize } from '@/components/layout/SettingsProvider';
import { useState } from 'react';

const fontSizes: { value: FontSize; label: string; px: string }[] = [
  { value: 'small', label: 'Small', px: '14px' },
  { value: 'default', label: 'Default', px: '18px' },
  { value: 'large', label: 'Large', px: '22px' },
];

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings();
  const [confirmClear, setConfirmClear] = useState(false);

  const clearProgress = () => {
    if (confirmClear) {
      localStorage.removeItem('freetyper-progress');
      localStorage.removeItem('freetyper-completed-lessons');
      localStorage.removeItem('freetyper-fw-highscore');
      setConfirmClear(false);
      window.location.reload();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const resetSettings = () => {
    localStorage.removeItem('freetyper-settings');
    window.location.reload();
  };

  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="mb-8 text-lg font-medium text-text-bright">Settings</h1>

      <div className="flex flex-col gap-8">
        {/* Typing section */}
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-dim">
            Typing
          </h2>

          {/* Font size */}
          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Type className="h-4 w-4 text-text-dim" />
              <div>
                <p className="text-sm text-text">Font size</p>
                <p className="text-xs text-text-dim">Change the typing text size</p>
              </div>
            </div>
            <div className="flex gap-1">
              {fontSizes.map((fs) => (
                <button
                  key={fs.value}
                  onClick={() => updateSetting('fontSize', fs.value)}
                  className={`
                    rounded-md px-3 py-1 text-xs transition-colors
                    ${settings.fontSize === fs.value
                      ? 'bg-accent-bg text-accent'
                      : 'text-text-dim hover:bg-surface-raised hover:text-text'
                    }
                  `}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard layout */}
          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Keyboard className="h-4 w-4 text-text-dim" />
              <div>
                <p className="text-sm text-text">Keyboard layout</p>
                <p className="text-xs text-text-dim">Select your keyboard layout</p>
              </div>
            </div>
            <select
              value={settings.keyboardLayout}
              onChange={(e) => updateSetting('keyboardLayout', e.target.value as 'qwerty')}
              className="rounded-md border border-surface-border bg-surface-raised px-3 py-1 text-xs text-text focus:border-accent focus:outline-none"
            >
              <option value="qwerty">QWERTY</option>
            </select>
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {settings.showKeyboardHints
                ? <Eye className="h-4 w-4 text-text-dim" />
                : <EyeOff className="h-4 w-4 text-text-dim" />
              }
              <div>
                <p className="text-sm text-text">Keyboard hints</p>
                <p className="text-xs text-text-dim">Show finger placement guides</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('showKeyboardHints', !settings.showKeyboardHints)}
              className={`
                relative h-5 w-9 rounded-full transition-colors
                ${settings.showKeyboardHints ? 'bg-accent' : 'bg-surface-border'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
                  ${settings.showKeyboardHints ? 'translate-x-4' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </section>

        <div className="h-px bg-surface-border" />

        {/* Audio section */}
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-dim">
            Audio
          </h2>

          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {settings.soundEnabled
                ? <Volume2 className="h-4 w-4 text-text-dim" />
                : <VolumeX className="h-4 w-4 text-text-dim" />
              }
              <div>
                <p className="text-sm text-text">Sound effects</p>
                <p className="text-xs text-text-dim">Play sounds on key press</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`
                relative h-5 w-9 rounded-full transition-colors
                ${settings.soundEnabled ? 'bg-accent' : 'bg-surface-border'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
                  ${settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </section>

        <div className="h-px bg-surface-border" />

        {/* Data section */}
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-dim">
            Data
          </h2>

          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Trash2 className="h-4 w-4 text-text-dim" />
              <div>
                <p className="text-sm text-text">Clear progress</p>
                <p className="text-xs text-text-dim">Delete all typing history, scores, and achievements</p>
              </div>
            </div>
            <button
              onClick={clearProgress}
              className={`
                rounded-md px-3 py-1 text-xs transition-colors
                ${confirmClear
                  ? 'bg-error text-white'
                  : 'border border-surface-border text-text-dim hover:border-error hover:text-error'
                }
              `}
            >
              {confirmClear ? 'confirm?' : 'clear'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-text-dim" />
              <div>
                <p className="text-sm text-text">Reset settings</p>
                <p className="text-xs text-text-dim">Restore all settings to defaults</p>
              </div>
            </div>
            <button
              onClick={resetSettings}
              className="rounded-md border border-surface-border px-3 py-1 text-xs text-text-dim transition-colors hover:border-error hover:text-error"
            >
              reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
