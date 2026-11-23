import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPreset, ThemePreference, UserPreferences } from '../types';

const KEYS = {
  THEME: '@luma_torch/theme',
  RESTORE_BRIGHTNESS: '@luma_torch/restore_brightness',
  PREFERRED_BRIGHTNESS: '@luma_torch/preferred_brightness',
  COLOR_PRESET: '@luma_torch/color_preset',
  STROBE_FREQUENCY: '@luma_torch/strobe_frequency',
  LAST_APP_OPEN_AD: '@luma_torch/last_app_open_ad',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  restoreBrightness: true,
  preferredBrightness: 0.85,
  selectedColorPreset: 'neutral',
  strobeFrequency: 3,
};

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const [theme, restore, brightness, preset, strobeFreq] = await Promise.all([
      AsyncStorage.getItem(KEYS.THEME),
      AsyncStorage.getItem(KEYS.RESTORE_BRIGHTNESS),
      AsyncStorage.getItem(KEYS.PREFERRED_BRIGHTNESS),
      AsyncStorage.getItem(KEYS.COLOR_PRESET),
      AsyncStorage.getItem(KEYS.STROBE_FREQUENCY),
    ]);

    return {
      theme: (theme as ThemePreference) || DEFAULT_PREFERENCES.theme,
      restoreBrightness: restore !== null ? restore === 'true' : DEFAULT_PREFERENCES.restoreBrightness,
      preferredBrightness: brightness !== null ? parseFloat(brightness) : DEFAULT_PREFERENCES.preferredBrightness,
      selectedColorPreset: (preset as ColorPreset) || DEFAULT_PREFERENCES.selectedColorPreset,
      strobeFrequency: strobeFreq !== null ? parseInt(strobeFreq, 10) : DEFAULT_PREFERENCES.strobeFrequency,
    };
  } catch (error) {
    console.warn('Failed to load user preferences from AsyncStorage:', error);
    return DEFAULT_PREFERENCES;
  }
}

export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
}

export async function saveRestoreBrightnessPreference(restore: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.RESTORE_BRIGHTNESS, restore.toString());
  } catch (e) {
    console.warn('Failed to save restoreBrightness preference:', e);
  }
}

export async function savePreferredBrightness(brightness: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PREFERRED_BRIGHTNESS, brightness.toString());
  } catch (e) {
    console.warn('Failed to save preferredBrightness:', e);
  }
}

export async function saveColorPresetPreference(preset: ColorPreset): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.COLOR_PRESET, preset);
  } catch (e) {
    console.warn('Failed to save color preset preference:', e);
  }
}

export async function saveStrobeFrequencyPreference(freq: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STROBE_FREQUENCY, freq.toString());
  } catch (e) {
    console.warn('Failed to save strobe frequency:', e);
  }
}

export async function getLastAppOpenAdTimestamp(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.LAST_APP_OPEN_AD);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function setLastAppOpenAdTimestamp(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_APP_OPEN_AD, timestamp.toString());
  } catch {
    // Ignore
  }
}
