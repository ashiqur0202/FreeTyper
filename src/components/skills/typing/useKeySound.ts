'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '@/components/layout/SettingsProvider';
import { playKeySound } from '@/lib/key-sound';

/**
 * Returns a stable function that plays a key sound if (and only if) sound
 * effects are switched on in Settings. Safe to call from event handlers.
 */
export function useKeySound() {
  const { settings } = useSettings();
  const enabledRef = useRef(settings.soundEnabled);

  useEffect(() => {
    enabledRef.current = settings.soundEnabled;
  }, [settings.soundEnabled]);

  return useCallback((correct: boolean) => {
    if (enabledRef.current) playKeySound(correct);
  }, []);
}
