import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Settings, Flashlight, AlertCircle, LogOut } from 'lucide-react-native';

import { useTorch } from '../src/hooks/useTorch';
import { useScreenBrightness } from '../src/hooks/useScreenBrightness';
import { useBattery } from '../src/hooks/useBattery';
import { useThemePreference } from '../src/hooks/useThemePreference';
import { TorchButton } from '../src/components/TorchButton';
import { ModeSelector } from '../src/components/ModeSelector';
import { BrightnessControl } from '../src/components/BrightnessControl';
import { ColorPresetSelector } from '../src/components/ColorPresetSelector';
import { StrobeControl } from '../src/components/StrobeControl';
import { BatteryIndicator } from '../src/components/BatteryIndicator';
import { AdBanner } from '../src/components/ads/AdBanner';
import { ExitAppDialog } from '../src/components/ads/ExitAppDialog';
import { tryShowExitInterstitialAd } from '../src/components/ads/AppOpenAdManager';
import { LightMode, ColorPreset } from '../src/types';
import {
  loadUserPreferences,
  saveColorPresetPreference,
} from '../src/utils/storage';
import { showCameraPermissionAlert } from '../src/utils/permissions';

export default function HomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { colors } = useThemePreference();

  // Torch state & hardware management
  const {
    isOn,
    isSteadyOn,
    isStrobeActive,
    strobeMode,
    strobeFrequency,
    hasPermission,
    error: torchError,
    isTransitioning,
    toggleTorch,
    toggleStrobe,
    setStrobeMode,
    setStrobeFrequency,
    turnOff,
    CameraComponent,
  } = useTorch();

  // Screen brightness hook
  const {
    brightness,
    percentage,
    isSupported: isBrightnessSupported,
    setBrightness,
  } = useScreenBrightness();

  // Battery hook
  const battery = useBattery();

  // Mode and color preset states
  const [currentMode, setCurrentMode] = useState<LightMode>('torch');
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>('neutral');

  // Exit App confirmation dialog state
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);

  // Automatically select LED Torch mode whenever Home Screen gains focus,
  // fixing the issue where returning from Screen Light kept Screen Light selected!
  useFocusEffect(
    useCallback(() => {
      setCurrentMode('torch');
      battery.refresh();
    }, [battery])
  );

  // Android Back button handler to show Exit Dialog and full-screen ad
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true);
        return true; // Prevent immediate hardware exit
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Load saved preferences on mount
  useEffect(() => {
    async function loadPrefs() {
      const prefs = await loadUserPreferences();
      setSelectedPreset(prefs.selectedColorPreset);
    }
    loadPrefs();
  }, []);

  const handleModeChange = (mode: LightMode) => {
    setCurrentMode(mode);
    if (mode === 'screen') {
      if (isOn || isStrobeActive) {
        turnOff();
      }
      router.push({
        pathname: '/screen-light',
        params: { preset: selectedPreset },
      });
    }
  };

  const handleSelectPreset = (preset: ColorPreset) => {
    setSelectedPreset(preset);
    saveColorPresetPreference(preset);
  };

  const handleBrightnessChange = (val: number) => {
    setBrightness(val, false);
  };

  const handleBrightnessComplete = (val: number) => {
    setBrightness(val, true);
  };

  const handleConfirmExit = () => {
    setExitModalVisible(false);
    // Show Kotak-style full-screen interstitial ad on exit before terminating app
    tryShowExitInterstitialAd(() => {
      BackHandler.exitApp();
    });
  };

  const getStatusText = () => {
    if (isStrobeActive) {
      return strobeMode === 'sos'
        ? 'SOS EMERGENCY FLASHING'
        : `STROBE BLINKING (${strobeFrequency} Hz)`;
    }
    return isSteadyOn ? 'Torch is ON' : 'Torch is OFF';
  };

  const isCompactScreen = height < 700;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Hidden camera instance to operate the rear LED torch */}
      {CameraComponent}

      {/* Exit App Confirmation Dialog with Ad preview */}
      <ExitAppDialog
        visible={exitModalVisible}
        onCancel={() => setExitModalVisible(false)}
        onConfirmExit={handleConfirmExit}
        colors={colors}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.branding}>
          <View
            style={[
              styles.logoIconBg,
              { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
            ]}
          >
            <Flashlight size={18} color="#38BDF8" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>
              Luma Torch
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Instant Illumination
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <BatteryIndicator battery={battery} colors={colors} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
            style={[
              styles.headerIconButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Settings size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExitModalVisible(true)}
            style={[
              styles.headerIconButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
            accessibilityLabel="Exit App"
            accessibilityRole="button"
          >
            <LogOut size={17} color={colors.textMuted} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Main Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isCompactScreen && styles.scrollContentCompact,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Permission / Hardware Error Notice */}
        {torchError && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (hasPermission === false) {
                showCameraPermissionAlert();
              } else {
                Alert.alert('Torch Notice', torchError);
              }
            }}
            style={[
              styles.errorBanner,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: colors.danger,
              },
            ]}
          >
            <AlertCircle size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {torchError}
            </Text>
          </TouchableOpacity>
        )}

        {/* Mode Selector Tabs (LED Torch vs Screen Light) */}
        <ModeSelector
          currentMode={currentMode}
          onSelectMode={handleModeChange}
          colors={colors}
        />

        {/* Central Torch Power Button */}
        <TorchButton
          isOn={isOn || isStrobeActive}
          onToggle={toggleTorch}
          colors={colors}
          disabled={isTransitioning}
          statusText={getStatusText()}
        />

        {/* LED Torch Strobe & SOS Control Panel */}
        <StrobeControl
          isStrobeActive={isStrobeActive}
          strobeMode={strobeMode}
          strobeFrequency={strobeFrequency}
          onToggleStrobe={toggleStrobe}
          onSelectMode={setStrobeMode}
          onFrequencyChange={setStrobeFrequency}
          colors={colors}
          disabled={isTransitioning}
        />

        {/* In-App Screen Brightness Slider */}
        <BrightnessControl
          brightness={brightness}
          percentage={percentage}
          onBrightnessChange={handleBrightnessChange}
          onBrightnessComplete={handleBrightnessComplete}
          colors={colors}
          isSupported={isBrightnessSupported}
        />

        {/* Screen Light Color Preset Selector */}
        <ColorPresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          colors={colors}
        />

        {/* Bottom Spacing */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Anchored Adaptive Bottom Banner Ad */}
      <View
        style={[
          styles.adContainer,
          {
            backgroundColor: colors.adBannerBg,
            borderTopColor: colors.adBannerBorder,
          },
        ]}
      >
        <AdBanner />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  scrollContentCompact: {
    paddingBottom: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  adContainer: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
});
