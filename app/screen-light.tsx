import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X,
  Sun,
  Eye,
  EyeOff,
  Zap,
  AlertTriangle,
  Palette,
  Sparkles,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { SCREEN_LIGHT_PRESETS } from '../src/constants/colors';
import { ColorPreset } from '../src/types';
import { useScreenBrightness } from '../src/hooks/useScreenBrightness';
import {
  loadUserPreferences,
  saveColorPresetPreference,
} from '../src/utils/storage';
import { RgbColorWheel } from '../src/components/RgbColorWheel';
import { PRESET_RGB_PALETTE, hsvToHex } from '../src/utils/colorUtils';
import { AdBanner } from '../src/components/ads/AdBanner';

// SOS Timings: 3 dots, 3 dashes, 3 dots (unit = 160ms)
const U = 160;
const SOS_STEPS = [
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: 3 * U },
  { on: true, ms: 3 * U },
  { on: false, ms: U },
  { on: true, ms: 3 * U },
  { on: false, ms: U },
  { on: true, ms: 3 * U },
  { on: false, ms: 3 * U },
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: 7 * U },
];

type ScreenLightMode = 'steady' | 'cycle' | 'strobe' | 'sos';

export default function ScreenLightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preset?: ColorPreset; blink?: string }>();
  const { width, height } = useWindowDimensions();

  const {
    brightness,
    percentage,
    setBrightness,
    restoreOriginalBrightness,
  } = useScreenBrightness();

  // Active lighting mode
  const [lightMode, setLightMode] = useState<ScreenLightMode>(
    params.blink === 'true' ? 'strobe' : 'steady'
  );

  // Custom RGB color hex
  const [customColor, setCustomColor] = useState<string>(() => {
    if (params.preset && SCREEN_LIGHT_PRESETS[params.preset]) {
      return SCREEN_LIGHT_PRESETS[params.preset].hex;
    }
    return '#FFFFFF';
  });

  // Controls visibility: toggled by tapping anywhere on the screen OR the Eye button
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [restoreOnExit, setRestoreOnExit] = useState<boolean>(true);

  // Active effect sub-tab: 'wheel' | 'presets'
  const [activeTab, setActiveTab] = useState<'wheel' | 'presets'>('wheel');

  // Strobe & Blink parameters
  const [strobeFrequency, setStrobeFrequency] = useState<number>(3); // 1-10 Hz
  const [isLightPhase, setIsLightPhase] = useState<boolean>(true);

  // Color cycle (smooth rainbow transition) parameters
  const [cycleSpeed, setCycleSpeed] = useState<number>(2); // 1 (slow) to 5 (fast)
  const cycleHueRef = useRef<number>(0);
  const cycleIntervalRef = useRef<any>(null);

  const lightModeRef = useRef<ScreenLightMode>(lightMode);
  lightModeRef.current = lightMode;

  const strobeFrequencyRef = useRef<number>(strobeFrequency);
  strobeFrequencyRef.current = strobeFrequency;

  const strobeTimerRef = useRef<any>(null);
  const sosStepRef = useRef<number>(0);

  const controlsAnim = useRef(new Animated.Value(1)).current;

  const clearAllTimers = useCallback(() => {
    if (strobeTimerRef.current) {
      clearTimeout(strobeTimerRef.current);
      clearInterval(strobeTimerRef.current);
      strobeTimerRef.current = null;
    }
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  // Strobe execution engine
  const runStrobeStep = useCallback(() => {
    if (lightModeRef.current !== 'strobe' && lightModeRef.current !== 'sos') {
      setIsLightPhase(true);
      return;
    }

    if (lightModeRef.current === 'sos') {
      const stepIndex = sosStepRef.current % SOS_STEPS.length;
      const currentStep = SOS_STEPS[stepIndex];
      setIsLightPhase(currentStep.on);
      sosStepRef.current = stepIndex + 1;

      strobeTimerRef.current = setTimeout(() => {
        runStrobeStep();
      }, currentStep.ms);
    } else {
      const freq = strobeFrequencyRef.current;
      const halfPeriodMs = Math.max(50, Math.round(500 / freq));

      setIsLightPhase((prev) => !prev);
      strobeTimerRef.current = setTimeout(() => {
        runStrobeStep();
      }, halfPeriodMs);
    }
  }, []);

  // Effect manager for Strobe and Smooth Color Cycle
  useEffect(() => {
    clearAllTimers();

    if (lightMode === 'cycle') {
      // Smooth color transition across RGB spectrum
      const stepMs = 70;
      const stepHue = cycleSpeed * 1.5;

      cycleIntervalRef.current = setInterval(() => {
        cycleHueRef.current = (cycleHueRef.current + stepHue) % 360;
        setCustomColor(hsvToHex(cycleHueRef.current, 1, 1));
      }, stepMs);
      setIsLightPhase(true);
    } else if (lightMode === 'strobe' || lightMode === 'sos') {
      sosStepRef.current = 0;
      setIsLightPhase(true);
      strobeTimerRef.current = setTimeout(
        () => {
          runStrobeStep();
        },
        lightMode === 'sos' ? SOS_STEPS[0].ms : Math.round(500 / strobeFrequency)
      );
    } else {
      setIsLightPhase(true);
    }

    return () => {
      clearAllTimers();
    };
  }, [lightMode, strobeFrequency, cycleSpeed, clearAllTimers, runStrobeStep]);

  // Load preferences and setup brightness restoration
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const prefs = await loadUserPreferences();
      if (isMounted) {
        setRestoreOnExit(prefs.restoreBrightness);
        if (!params.preset) {
          const defaultPreset = SCREEN_LIGHT_PRESETS[prefs.selectedColorPreset];
          if (defaultPreset) {
            setCustomColor(defaultPreset.hex);
          }
        }
        setBrightness(prefs.preferredBrightness || 1.0, false);
      }
    }

    init();

    return () => {
      isMounted = false;
      clearAllTimers();
      if (restoreOnExit) {
        restoreOriginalBrightness();
      }
    };
  }, [restoreOnExit, restoreOriginalBrightness, setBrightness, params.preset, clearAllTimers]);

  // Toggle controls visibility on tap anywhere or via Eye button
  const toggleControls = () => {
    const nextVal = !controlsVisible;
    setControlsVisible(nextVal);
    Animated.timing(controlsAnim, {
      toValue: nextVal ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleExit = () => {
    clearAllTimers();
    if (restoreOnExit) {
      restoreOriginalBrightness();
    }
    router.back();
  };

  const handleResetToWhite = () => {
    setLightMode('steady');
    setCustomColor('#FFFFFF');
  };

  const currentBackgroundColor =
    (lightMode === 'strobe' || lightMode === 'sos') && !isLightPhase
      ? '#000000'
      : customColor;

  const isCompact = height < 740;

  return (
    <View style={[styles.container, { backgroundColor: currentBackgroundColor }]}>
      <StatusBar hidden={!controlsVisible} animated />

      {/* FULL-SCREEN PRESSABLE: Tap anywhere on the screen to toggle full lantern mode */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={toggleControls}
        accessibilityLabel="Tap anywhere to toggle full lantern mode"
      />

      {/* Floating Top Bar (pointerEvents='box-none' so empty space passes clicks through to background) */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleExit}
          style={styles.floatingButton}
          accessibilityLabel="Close Screen Light"
          accessibilityRole="button"
        >
          <X size={26} color="#0F172A" strokeWidth={3} />
        </TouchableOpacity>

        {/* Title Badge (pointerEvents='none' so touches pass through to toggle lantern mode) */}
        {controlsVisible && (
          <Animated.View style={[styles.titleBadge, { opacity: controlsAnim }]} pointerEvents="none">
            <Text style={styles.titleText}>
              {lightMode === 'cycle'
                ? 'RGB Rainbow Transition'
                : lightMode === 'sos'
                ? 'SOS Emergency Blink'
                : lightMode === 'strobe'
                ? `RGB Strobe (${strobeFrequency} Hz)`
                : 'RGB Screen Light'}
            </Text>
          </Animated.View>
        )}

        {/* Eye Button: click here to hide/show full lantern mode */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleControls}
          style={[styles.floatingButton, !controlsVisible && styles.floatingButtonActive]}
          accessibilityLabel={controlsVisible ? 'Hide controls for full lantern mode' : 'Show controls'}
          accessibilityRole="button"
        >
          {controlsVisible ? (
            <EyeOff size={22} color="#0F172A" strokeWidth={2.4} />
          ) : (
            <Eye size={22} color="#2563EB" strokeWidth={2.6} />
          )}
        </TouchableOpacity>
      </View>

      {/* Center Hint: "Tap anywhere to toggle full lantern mode" (pointerEvents='none' so tapping it toggles lantern mode!) */}
      {controlsVisible && (
        <Animated.View style={[styles.centerHint, { opacity: controlsAnim }]} pointerEvents="none">
          <View style={styles.hintBubble}>
            <Text style={styles.hintText}>Tap anywhere to toggle full lantern mode</Text>
          </View>
        </Animated.View>
      )}

      {/* Animated Bottom Control Sheet (Pressable stopPropagation prevents bottom card interactions from toggling lantern mode) */}
      {controlsVisible && (
        <Animated.View
          style={[
            styles.bottomSheetWrapper,
            {
              opacity: controlsAnim,
              transform: [
                {
                  translateY: controlsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={[styles.bottomSheet, { maxWidth: Math.min(width - 24, 440) }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Mode Selector: Steady vs Rainbow Transition vs Strobe vs SOS */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLightMode('steady')}
                style={[styles.modeTab, lightMode === 'steady' && styles.activeModeTab]}
              >
                <Sun size={14} color={lightMode === 'steady' ? '#2563EB' : '#64748B'} strokeWidth={2.4} />
                <Text style={[styles.modeTabText, lightMode === 'steady' && styles.activeModeTabText]}>
                  Steady
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLightMode('cycle')}
                style={[styles.modeTab, lightMode === 'cycle' && styles.activeModeTab]}
              >
                <Sparkles size={14} color={lightMode === 'cycle' ? '#2563EB' : '#64748B'} strokeWidth={2.4} />
                <Text style={[styles.modeTabText, lightMode === 'cycle' && styles.activeModeTabText]}>
                  RGB Cycle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLightMode('strobe')}
                style={[styles.modeTab, lightMode === 'strobe' && styles.activeModeTab]}
              >
                <Zap size={14} color={lightMode === 'strobe' ? '#2563EB' : '#64748B'} strokeWidth={2.4} />
                <Text style={[styles.modeTabText, lightMode === 'strobe' && styles.activeModeTabText]}>
                  Blink
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLightMode('sos')}
                style={[styles.modeTab, lightMode === 'sos' && styles.activeModeTabDanger]}
              >
                <AlertTriangle size={14} color={lightMode === 'sos' ? '#DC2626' : '#64748B'} strokeWidth={2.4} />
                <Text style={[styles.modeTabText, lightMode === 'sos' && styles.activeModeTabTextDanger]}>
                  SOS
                </Text>
              </TouchableOpacity>
            </View>

            {/* If Rainbow Cycle Mode is active: Cycle Speed Slider */}
            {lightMode === 'cycle' && (
              <View style={styles.subControlBox}>
                <View style={styles.subControlHeader}>
                  <Text style={styles.subControlLabel}>Smooth Transition Speed</Text>
                  <Text style={styles.subControlValue}>
                    {cycleSpeed === 1 ? 'Gentle' : cycleSpeed <= 3 ? 'Medium' : 'Fast'}
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={5}
                  step={1}
                  value={cycleSpeed}
                  onValueChange={(val) => setCycleSpeed(Math.round(val))}
                  minimumTrackTintColor="#2563EB"
                  maximumTrackTintColor="#CBD5E1"
                  thumbTintColor="#2563EB"
                />
              </View>
            )}

            {/* If Strobe Mode is active: Frequency Slider */}
            {lightMode === 'strobe' && (
              <View style={styles.subControlBox}>
                <View style={styles.subControlHeader}>
                  <Text style={styles.subControlLabel}>Strobe Blink Speed</Text>
                  <Text style={styles.subControlValue}>{strobeFrequency} Hz ({strobeFrequency} flashes/sec)</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={strobeFrequency}
                  onValueChange={(val) => setStrobeFrequency(Math.round(val))}
                  minimumTrackTintColor="#2563EB"
                  maximumTrackTintColor="#CBD5E1"
                  thumbTintColor="#2563EB"
                />
              </View>
            )}

            {/* Sub Navigation: Wheel vs Presets */}
            <View style={styles.subTabRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('wheel')}
                style={[styles.subTab, activeTab === 'wheel' && styles.activeSubTab]}
              >
                <Palette size={14} color={activeTab === 'wheel' ? '#1E40AF' : '#64748B'} strokeWidth={2.2} />
                <Text style={[styles.subTabText, activeTab === 'wheel' && styles.activeSubTabText]}>
                  RGB Color Wheel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('presets')}
                style={[styles.subTab, activeTab === 'presets' && styles.activeSubTab]}
              >
                <Text style={[styles.subTabText, activeTab === 'presets' && styles.activeSubTabText]}>
                  Palette Swatches
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content: Either Circular RGB Color Wheel or Preset Palette Swatches */}
            {activeTab === 'wheel' ? (
              <View style={styles.wheelSection}>
                <RgbColorWheel
                  selectedHex={customColor}
                  onColorChange={(hex) => {
                    if (lightMode === 'cycle') setLightMode('steady');
                    setCustomColor(hex);
                  }}
                  onReset={handleResetToWhite}
                  size={isCompact ? 135 : 155}
                />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.swatchesScroll}
              >
                {PRESET_RGB_PALETTE.map((item) => {
                  const isSelected = customColor.toUpperCase() === item.hex.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (lightMode === 'cycle') setLightMode('steady');
                        setCustomColor(item.hex);
                      }}
                      style={[
                        styles.swatchItem,
                        isSelected && styles.swatchItemSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.swatchCircle,
                          { backgroundColor: item.hex },
                          isSelected && { borderColor: '#2563EB', borderWidth: 2.5 },
                        ]}
                      />
                      <Text
                        style={[
                          styles.swatchLabel,
                          isSelected && styles.swatchLabelSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Screen Brightness Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelRow}>
                  <Sun size={14} color="#0F172A" strokeWidth={2.4} />
                  <Text style={styles.sliderLabel}>Brightness</Text>
                </View>
                <Text style={styles.sliderPercent}>{percentage}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0.05}
                maximumValue={1.0}
                step={0.01}
                value={brightness}
                onValueChange={(val) => setBrightness(val, false)}
                onSlidingComplete={(val) => setBrightness(val, true)}
                minimumTrackTintColor="#2563EB"
                maximumTrackTintColor="#CBD5E1"
                thumbTintColor="#2563EB"
              />
            </View>

            {/* Anchored Banner Advertisement */}
            <View style={styles.bannerContainer}>
              <AdBanner showPlaceholderInDev={false} />
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  titleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  centerHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  hintBubble: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  bottomSheetWrapper: {
    paddingBottom: 16,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  bottomSheet: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 8,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  activeModeTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    elevation: 2,
  },
  activeModeTabDanger: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    elevation: 2,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activeModeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  activeModeTabTextDanger: {
    color: '#DC2626',
    fontWeight: '700',
  },
  subControlBox: {
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  subControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  subControlLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  subControlValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  subTabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeSubTab: {
    backgroundColor: '#DBEAFE',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activeSubTabText: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  wheelSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  swatchesScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  swatchItem: {
    alignItems: 'center',
    gap: 4,
  },
  swatchItemSelected: {
    transform: [{ scale: 1.05 }],
  },
  swatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },
  swatchLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  swatchLabelSelected: {
    color: '#1E40AF',
    fontWeight: '800',
  },
  sliderContainer: {
    width: '100%',
    marginTop: 2,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  sliderPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 32,
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 50,
  },
});
