'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type FontSize = 'small' | 'default' | 'large';
export type KeyboardLayout = 'qwerty';
export type AccentColor = 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'cyan';
export type ThemeMode = 'dark' | 'light' | 'midnight' | 'paper';

export interface UserSettings {
  fontSize: FontSize;
  soundEnabled: boolean;
  keyboardLayout: KeyboardLayout;
  showKeyboardHints: boolean;
  accentColor: AccentColor;
  theme: ThemeMode;
}

const STORAGE_KEY = 'freetyper-settings';

export const ACCENT_COLORS: { id: AccentColor; color: string }[] = [
  { id: 'gold', color: '#e2b714' },
  { id: 'blue', color: '#519aba' },
  { id: 'green', color: '#8a8a6e' },
  { id: 'red', color: '#c44250' },
  { id: 'purple', color: '#a37acc' },
  { id: 'cyan', color: '#56b6c2' },
];

export const THEMES: { id: ThemeMode; label: string; swatch: string }[] = [
  { id: 'dark', label: 'dark', swatch: '#323234' },
  { id: 'light', label: 'light', swatch: '#e8e9e4' },
  { id: 'midnight', label: 'midnight', swatch: '#0e0e10' },
  { id: 'paper', label: 'paper', swatch: '#e2d3b8' },
];

const THEME_META: Record<ThemeMode, string> = {
  dark: '#323234',
  light: '#e8e9e4',
  midnight: '#0e0e10',
  paper: '#e2d3b8',
};

/** Darker accents so gold/cyan still read on pale backgrounds. */
const ACCENT_ON_LIGHT: Record<AccentColor, string> = {
  gold: '#b08912',
  blue: '#3d738c',
  green: '#5c6350',
  red: '#b44a4a',
  purple: '#6e5a88',
  cyan: '#3d7d82',
};

const DARK_THEMES: ThemeMode[] = ['dark', 'midnight'];

const defaultSettings: UserSettings = {
  fontSize: 'default',
  soundEnabled: false,
  keyboardLayout: 'qwerty',
  showKeyboardHints: true,
  accentColor: 'gold',
  theme: 'dark',
};

export function applyAppearance(theme: ThemeMode, accent: AccentColor) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', DARK_THEMES.includes(theme));
  const lightBg = theme === 'light' || theme === 'paper';
  const hex = lightBg
    ? ACCENT_ON_LIGHT[accent]
    : (ACCENT_COLORS.find((a) => a.id === accent)?.color ?? '#e2b714');
  root.style.setProperty('--color-accent', hex);
  root.style.setProperty('--color-accent-dim', `${hex}99`);
  root.style.setProperty('--color-accent-bg', `${hex}${lightBg ? '22' : '15'}`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_META[theme]);
}

type SettingsContextType = {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserSettings>;
        const next = { ...defaultSettings, ...parsed };
        setSettings(next);
        applyAppearance(next.theme, next.accentColor);
      } else {
        applyAppearance(defaultSettings.theme, defaultSettings.accentColor);
      }
    } catch {
      applyAppearance(defaultSettings.theme, defaultSettings.accentColor);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
    applyAppearance(settings.theme, settings.accentColor);
  }, [settings, loaded]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
