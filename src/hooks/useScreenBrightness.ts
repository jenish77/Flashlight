import { useState, useEffect, useRef, useCallback } from 'react';
import * as Brightness from 'expo-brightness';
import { isWeb } from '../utils/environment';
import {
  loadUserPreferences,
  savePreferredBrightness,
} from '../utils/storage';

export interface UseScreenBrightnessReturn {
  brightness: number;          // 0.05 to 1.0
  percentage: number;          // 5 to 100
  isSupported: boolean;
  setBrightness: (val: number, persist?: boolean) => Promise<void>;
  restoreOriginalBrightness: () => Promise<void>;
  maximizeBrightness: () => Promise<void>;
}

export function useScreenBrightness(): UseScreenBrightnessReturn {
  const [brightness, setBrightnessState] = useState<number>(0.85);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const initialBrightnessRef = useRef<number | null>(null);

  // Initialize brightness and load saved preference
  useEffect(() => {
    let isMounted = true;

    async function initBrightness() {
      if (isWeb) {
        setIsSupported(false);
        return;
      }

      try {
        const available = await Brightness.isAvailableAsync();
        if (!available) {
          if (isMounted) setIsSupported(false);
          return;
        }

        // Capture initial system brightness so we can restore later
        const currentSys = await Brightness.getBrightnessAsync();
        if (initialBrightnessRef.current === null && currentSys >= 0) {
          initialBrightnessRef.current = currentSys;
        }

        // Load saved preferred user brightness
        const prefs = await loadUserPreferences();
        const preferred = prefs.preferredBrightness;
        if (isMounted) {
          setBrightnessState(preferred);
        }
      } catch (e) {
        console.warn('[useScreenBrightness] Failed to init brightness:', e);
        if (isMounted) setIsSupported(false);
      }
    }

    initBrightness();

    return () => {
      isMounted = false;
    };
  }, []);

  const setBrightness = useCallback(
    async (val: number, persist = false) => {
      // Clamp between 0.05 and 1.0 to prevent completely dark unusable screen
      const clamped = Math.max(0.05, Math.min(1.0, val));
      setBrightnessState(clamped);

      if (isSupported && !isWeb) {
        try {
          await Brightness.setBrightnessAsync(clamped);
        } catch (err) {
          console.warn('[useScreenBrightness] Error setting brightness:', err);
        }
      }

      if (persist) {
        savePreferredBrightness(clamped);
      }
    },
    [isSupported]
  );

  const maximizeBrightness = useCallback(async () => {
    await setBrightness(1.0, false);
  }, [setBrightness]);

  const restoreOriginalBrightness = useCallback(async () => {
    if (initialBrightnessRef.current !== null && isSupported && !isWeb) {
      try {
        await Brightness.setBrightnessAsync(initialBrightnessRef.current);
      } catch (e) {
        console.warn('[useScreenBrightness] Error restoring brightness:', e);
      }
    }
  }, [isSupported]);

  const percentage = Math.round(brightness * 100);

  return {
    brightness,
    percentage,
    isSupported,
    setBrightness,
    restoreOriginalBrightness,
    maximizeBrightness,
  };
}
