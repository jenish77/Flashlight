import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Sun, SunDim } from 'lucide-react-native';
import { ThemeColors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface BrightnessControlProps {
  brightness: number;          // 0.05 to 1.0
  percentage: number;          // 5 to 100
  onBrightnessChange: (value: number) => void;
  onBrightnessComplete: (value: number) => void;
  colors: ThemeColors;
  isSupported?: boolean;
}

export const BrightnessControl: React.FC<BrightnessControlProps> = ({
  brightness,
  percentage,
  onBrightnessChange,
  onBrightnessComplete,
  colors,
  isSupported = true,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        },
      ]}
    >
      {/* Header with Title and Live Percentage */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sun size={17} color={colors.amber} strokeWidth={2.4} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Screen Brightness
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text style={[styles.percentageText, { color: colors.textAccent }]}>
            {percentage}%
          </Text>
        </View>
      </View>

      {/* Subtitle explicitly clarifying this controls screen illumination */}
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Adjusts display intensity (does not alter physical LED output)
      </Text>

      {/* Interactive Slider */}
      <View style={styles.sliderRow}>
        <SunDim size={18} color={colors.textMuted} />
        <Slider
          style={styles.slider}
          minimumValue={0.05}
          maximumValue={1.0}
          step={0.01}
          value={brightness}
          onValueChange={onBrightnessChange}
          onSlidingComplete={onBrightnessComplete}
          minimumTrackTintColor={colors.sliderTrackActive}
          maximumTrackTintColor={colors.sliderTrackInactive}
          thumbTintColor={colors.sliderThumb}
          disabled={!isSupported}
        />
        <Sun size={20} color={colors.amber} />
      </View>

      {!isSupported && (
        <Text style={[styles.unsupportedText, { color: colors.warning }]}>
          Brightness adjustment not available on this platform
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Layout.radius.sm,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  unsupportedText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
