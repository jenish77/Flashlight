import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Zap, AlertTriangle, Radio } from 'lucide-react-native';
import { ThemeColors } from '../constants/colors';
import { Layout } from '../constants/layout';
import { StrobeMode } from '../types';

interface StrobeControlProps {
  isStrobeActive: boolean;
  strobeMode: StrobeMode;
  strobeFrequency: number;
  onToggleStrobe: () => void;
  onSelectMode: (mode: StrobeMode) => void;
  onFrequencyChange: (freq: number) => void;
  colors: ThemeColors;
  disabled?: boolean;
}

const PRESET_FREQUENCIES = [1, 3, 5, 8];

export const StrobeControl: React.FC<StrobeControlProps> = ({
  isStrobeActive,
  strobeMode,
  strobeFrequency,
  onToggleStrobe,
  onSelectMode,
  onFrequencyChange,
  colors,
  disabled = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isStrobeActive
            ? strobeMode === 'sos'
              ? colors.danger
              : colors.primary
            : colors.surfaceBorder,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Radio
            size={18}
            color={
              isStrobeActive
                ? strobeMode === 'sos'
                  ? colors.danger
                  : colors.primary
                : colors.secondary
            }
            strokeWidth={2.4}
          />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Flashlight Strobe & Blink
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Blink physical LED flash or trigger SOS signal
            </Text>
          </View>
        </View>

        {/* Master Strobe Toggle Switch Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={onToggleStrobe}
          style={[
            styles.toggleButton,
            isStrobeActive
              ? {
                  backgroundColor:
                    strobeMode === 'sos' ? colors.danger : colors.primary,
                }
              : {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.surfaceBorder,
                  borderWidth: 1,
                },
          ]}
        >
          <Text
            style={[
              styles.toggleButtonText,
              { color: isStrobeActive ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {isStrobeActive ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Selector: Strobe Frequency vs SOS */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMode('strobe')}
          style={[
            styles.modeTab,
            strobeMode === 'strobe' && [
              styles.activeModeTab,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.primary },
            ],
          ]}
        >
          <Zap
            size={15}
            color={strobeMode === 'strobe' ? colors.primary : colors.textSecondary}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.modeTabText,
              {
                color:
                  strobeMode === 'strobe' ? colors.textPrimary : colors.textSecondary,
                fontWeight: strobeMode === 'strobe' ? '700' : '500',
              },
            ]}
          >
            Frequency Strobe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMode('sos')}
          style={[
            styles.modeTab,
            strobeMode === 'sos' && [
              styles.activeModeTab,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.danger },
            ],
          ]}
        >
          <AlertTriangle
            size={15}
            color={strobeMode === 'sos' ? colors.danger : colors.textSecondary}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.modeTabText,
              {
                color:
                  strobeMode === 'sos' ? colors.danger : colors.textSecondary,
                fontWeight: strobeMode === 'sos' ? '700' : '500',
              },
            ]}
          >
            SOS Morse Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Frequency Details when in Strobe mode */}
      {strobeMode === 'strobe' ? (
        <View style={styles.frequencySection}>
          <View style={styles.freqHeader}>
            <Text style={[styles.freqLabel, { color: colors.textSecondary }]}>
              Blink Speed:
            </Text>
            <Text style={[styles.freqValue, { color: colors.textAccent }]}>
              {strobeFrequency} Hz ({strobeFrequency} flashes / sec)
            </Text>
          </View>

          {/* Quick Preset Pills */}
          <View style={styles.presetPillsRow}>
            {PRESET_FREQUENCIES.map((freq) => {
              const isSelected = strobeFrequency === freq;
              return (
                <TouchableOpacity
                  key={freq}
                  activeOpacity={0.8}
                  onPress={() => onFrequencyChange(freq)}
                  style={[
                    styles.presetPill,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.backgroundSecondary,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.surfaceBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {freq} Hz
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continuous Frequency Slider */}
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={strobeFrequency}
            onValueChange={onFrequencyChange}
            minimumTrackTintColor={colors.sliderTrackActive}
            maximumTrackTintColor={colors.sliderTrackInactive}
            thumbTintColor={colors.sliderThumb}
          />
        </View>
      ) : (
        <View
          style={[
            styles.sosInfoBox,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text style={[styles.sosTitle, { color: colors.danger }]}>
            International Emergency Signal
          </Text>
          <Text style={[styles.sosPattern, { color: colors.textPrimary }]}>
            • • •  — — —  • • •   (S - O - S)
          </Text>
          <Text style={[styles.sosDescription, { color: colors.textMuted }]}>
            Continuous standard Morse code rescue sequence. Visible from long distances in emergencies.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.lg,
    borderWidth: 1.5,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  activeModeTab: {
    borderWidth: 1,
  },
  modeTabText: {
    fontSize: 12,
  },
  frequencySection: {
    marginTop: 2,
  },
  freqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  freqLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  freqValue: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  presetPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Layout.radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sosInfoBox: {
    borderRadius: Layout.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  sosTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sosPattern: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  sosDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
