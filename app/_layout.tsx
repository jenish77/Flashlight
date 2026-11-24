import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from 'expo-router';
import { initializeMobileAds, tryShowAppOpenAdOnLaunch, preloadExitInterstitialAd } from '../src/components/ads/AppOpenAdManager';
import { useThemePreference } from '../src/hooks/useThemePreference';

// Set native window background to dark immediately to prevent any white transition flashes
SystemUI.setBackgroundColorAsync('#080C14').catch(() => {});

// Prevent splash screen from hiding until basic initialization completes
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useThemePreference();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Keep native window background in sync with theme
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Render UI and dismiss splash screen immediately without blocking
        setAppReady(true);
        await SplashScreen.hideAsync().catch(() => {});

        // Safely initialize AdMob after Activity is fully resumed in foreground
        setTimeout(() => {
          initializeMobileAds()
            .then(() => {
              // Preload Interstitial ad for light toggles and exit
              preloadExitInterstitialAd();
              // Safely attempt App Open ad on startup
              tryShowAppOpenAdOnLaunch(() => {});
            })
            .catch((err) => {
              console.log('[AdMob] Init warning (app continues normally):', err);
            });
        }, 600);
      } catch (err) {
        console.warn('Initialization error:', err);
        setAppReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepareApp();
  }, []);

  const navigationTheme = isDark
    ? {
        ...NavDarkTheme,
        colors: {
          ...NavDarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.surfaceBorder,
        },
      }
    : {
        ...NavDefaultTheme,
        colors: {
          ...NavDefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.surfaceBorder,
        },
      };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen
            name="screen-light"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'card',
              animation: 'fade_from_bottom',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
