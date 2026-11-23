/**
 * Layout constants for responsive touch targets and UI spacing
 */

export const Layout = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radiuses
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Touch target sizing (meets 44-48dp accessibility guideline)
  touchTarget: {
    minSize: 48,
    buttonHeight: 52,
    iconButton: 44,
  },

  // Main Torch Button sizing
  torchButton: {
    size: 190,
    innerSize: 154,
    iconSize: 76,
  },

  // Ad Banner standard heights
  adBanner: {
    adaptiveHeight: 60,
    minHeight: 50,
  },

  // Elevation / Shadow styles
  shadows: {
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    torchActive: {
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 24,
      elevation: 12,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};
