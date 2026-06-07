'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type FontSize = 'small' | 'default' | 'large';
export type KeyboardLayout = 'qwerty';
export type AccentColor = 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'cyan';

export interface UserSettings {
  fontSize: FontSize;
  soundEnabled: boolean;
  keyboardLayout: KeyboardLayout;
  showKeyboardHints: boolean;
  accentColor: AccentColor;
}

const STORAGE_KEY = 'freetyper-settings';

const defaultSettings: UserSettings = {
  fontSize: 'default',
  soundEnabled: false,
  keyboardLayout: 'qwerty',
  showKeyboardHints: true,
  accentColor: 'gold',
};

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
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {}
    }
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
