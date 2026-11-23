import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme, ThemeColors } from '../constants/colors';
import { ThemePreference } from '../types';
import { loadUserPreferences, saveThemePreference } from '../utils/storage';

export interface UseThemePreferenceReturn {
  theme: ThemePreference;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

export function useThemePreference(): UseThemePreferenceReturn {
  const systemScheme = useColorScheme();
  const [themePref, setThemePref] = useState<ThemePreference>('dark');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const prefs = await loadUserPreferences();
      if (isMounted) {
        setThemePref(prefs.theme);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = useCallback(async (newTheme: ThemePreference) => {
    setThemePref(newTheme);
    await saveThemePreference(newTheme);
  }, []);

  const isDark =
    themePref === 'system' ? systemScheme === 'dark' : themePref === 'dark';

  const colors = isDark ? DarkTheme : LightTheme;

  return {
    theme: themePref,
    colors,
    isDark,
    setTheme,
  };
}
