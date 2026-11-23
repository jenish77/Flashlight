export type LightMode = 'torch' | 'screen';

export type ColorPreset = 'warm' | 'neutral' | 'cool';

export type ThemePreference = 'dark' | 'light' | 'system';

export type StrobeMode = 'strobe' | 'sos';

export interface StrobeConfig {
  isActive: boolean;
  mode: StrobeMode;
  frequency: number; // 1 to 10 Hz
}

export interface BatteryInfo {
  level: number | null;        // 0 to 100 percentage
  isCharging: boolean | null;
  isLowPower: boolean;
  isAvailable: boolean;
  refresh: () => Promise<void>;
}

export interface TorchState {
  isOn: boolean;
  isAvailable: boolean;
  hasPermission: boolean | null;
  error: string | null;
  isTransitioning: boolean;
  isStrobeActive: boolean;
  strobeMode: StrobeMode;
  strobeFrequency: number;
}

export interface ScreenBrightnessState {
  brightness: number;          // 0.05 to 1.0 (5% to 100%)
  percentage: number;          // 5 to 100
  isSupported: boolean;
  initialBrightness: number | null;
}

export interface UserPreferences {
  theme: ThemePreference;
  restoreBrightness: boolean;
  preferredBrightness: number;
  selectedColorPreset: ColorPreset;
  strobeFrequency: number;
}
