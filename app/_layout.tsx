import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from 'expo-router';
import { Flashlight } from 'lucide-react-native';
import { initializeMobileAds, showLaunchVideoAd } from '../src/components/ads/AppOpenAdManager';
import { useThemePreference } from '../src/hooks/useThemePreference';

// Set native window background to dark immediately to prevent any white transition flashes
SystemUI.setBackgroundColorAsync('#080C14').catch(() => {});

// Prevent splash screen from hiding until basic initialization completes
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useThemePreference();
  const [launchAdCompleted, setLaunchAdCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Keep native window background in sync with theme
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  useEffect(() => {
    let isMounted = true;

    async function startApp() {
      try {
        // Dismiss splash screen immediately so our native React Native Activity is active & in foreground
        await SplashScreen.hideAsync().catch(() => {});

        // Initialize Mobile Ads SDK asynchronously
        await initializeMobileAds();

        // Load and show full-screen Video Ad when opening the app (matching reference screenshot)
        showLaunchVideoAd(() => {
          if (isMounted) {
            setLaunchAdCompleted(true);
          }
        });
      } catch (err) {
        console.warn('[RootLayout] Startup error:', err);
        if (isMounted) {
          setLaunchAdCompleted(true);
        }
      }
    }

    startApp();

    return () => {
      isMounted = false;
    };
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

  // While launch video ad is loading/playing, show a sleek launch splash screen
  if (!launchAdCompleted) {
    return (
      <View style={[styles.launchContainer, { backgroundColor: '#080C14' }]}>
        <StatusBar style="light" />
        <View style={styles.launchCard}>
          <View style={styles.launchIconBg}>
            <Flashlight size={44} color="#38BDF8" strokeWidth={2.2} />
          </View>
          <Text style={styles.launchTitle}>Luma Torch</Text>
          <Text style={styles.launchSubtitle}>Instant Illumination & RGB Light</Text>
          <View style={styles.launchLoadingRow}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.launchLoadingText}>Loading advertisement...</Text>
          </View>
        </View>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  launchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  launchCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchIconBg: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  launchTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  launchSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 6,
  },
  launchLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 36,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  launchLoadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
