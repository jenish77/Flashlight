/**
 * Luma Torch Design System Colors
 * Modern, calm, premium dark interface with electric blue, teal, and warm amber accents.
 */

export const DarkTheme = {
  // Backgrounds
  background: '#080C14',        // Deep navy / near-black
  backgroundSecondary: '#0E1626',// Slightly lighter navy
  surface: '#121D30',            // Card / panel surface
  surfaceHover: '#182740',       // Active card highlight
  surfaceBorder: '#1E2D45',      // Subtle border for cards
  
  // Accents
  primary: '#2563EB',            // Clear electric blue
  primaryGlow: 'rgba(37, 99, 235, 0.35)',
  secondary: '#06B6D4',          // Teal
  secondaryGlow: 'rgba(6, 182, 212, 0.3)',
  amber: '#F59E0B',              // Warm amber highlight
  amberGlow: 'rgba(245, 158, 11, 0.3)',

  // Torch state colors
  torchActiveBg: '#2563EB',
  torchActiveGlow: 'rgba(59, 130, 246, 0.65)',
  torchInactiveBg: '#131D2E',
  torchInactiveBorder: '#1F2E47',
  torchIconActive: '#FFFFFF',
  torchIconInactive: '#64748B',

  // Text
  textPrimary: '#F8FAFC',        // Crisp white
  textSecondary: '#94A3B8',      // Soft slate grey
  textMuted: '#64748B',          // Muted grey
  textAccent: '#38BDF8',         // Light sky blue accent

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Controls
  sliderTrackActive: '#2563EB',
  sliderTrackInactive: '#1E293B',
  sliderThumb: '#38BDF8',

  // Safe ad container
  adBannerBg: '#080C14',
  adBannerBorder: '#172236',
};

export const LightTheme = {
  // Backgrounds
  background: '#F1F5F9',
  backgroundSecondary: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  surfaceBorder: '#CBD5E1',

  // Accents
  primary: '#1D4ED8',
  primaryGlow: 'rgba(29, 78, 216, 0.2)',
  secondary: '#0891B2',
  secondaryGlow: 'rgba(8, 145, 178, 0.2)',
  amber: '#D97706',
  amberGlow: 'rgba(217, 119, 6, 0.2)',

  // Torch state colors
  torchActiveBg: '#1D4ED8',
  torchActiveGlow: 'rgba(29, 78, 216, 0.4)',
  torchInactiveBg: '#E2E8F0',
  torchInactiveBorder: '#CBD5E1',
  torchIconActive: '#FFFFFF',
  torchIconInactive: '#64748B',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textAccent: '#0284C7',

  // Status
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',

  // Controls
  sliderTrackActive: '#1D4ED8',
  sliderTrackInactive: '#E2E8F0',
  sliderThumb: '#0284C7',

  // Safe ad container
  adBannerBg: '#F1F5F9',
  adBannerBorder: '#E2E8F0',
};

/**
 * Screen Light Color Presets
 * Calibrated color temperatures for full screen light mode
 */
export const SCREEN_LIGHT_PRESETS = {
  warm: {
    id: 'warm' as const,
    label: 'Warm Light',
    shortLabel: 'Warm',
    hex: '#FFE0B2',             // Soft incandescent warm glow (~2700K)
    uiBg: '#422800',
    accent: '#FFA726',
    description: 'Cozy, gentle amber glow for night-time reading and relaxing light',
  },
  neutral: {
    id: 'neutral' as const,
    label: 'Neutral Light',
    shortLabel: 'Neutral',
    hex: '#FFFFFF',             // Clean daylight pure white (~5000K)
    uiBg: '#262626',
    accent: '#F5F5F5',
    description: 'Balanced daylight illumination for finding items and general purpose',
  },
  cool: {
    id: 'cool' as const,
    label: 'Cool Light',
    shortLabel: 'Cool',
    hex: '#E0F2FE',             // Crisp ice blue-white (~6500K)
    uiBg: '#082F49',
    accent: '#38BDF8',
    description: 'High-contrast, crisp white for maximum clarity and visibility',
  },
};

export type ThemeColors = typeof DarkTheme;
