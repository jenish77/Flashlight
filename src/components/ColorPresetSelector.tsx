import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Palette, Check } from 'lucide-react-native';
import { ThemeColors, SCREEN_LIGHT_PRESETS } from '../constants/colors';
import { Layout } from '../constants/layout';
import { ColorPreset } from '../types';

interface ColorPresetSelectorProps {
  selectedPreset: ColorPreset;
  onSelectPreset: (preset: ColorPreset) => void;
  colors: ThemeColors;
  onLaunchScreenLight?: () => void;
}

export const ColorPresetSelector: React.FC<ColorPresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  colors,
}) => {
  const presets = Object.values(SCREEN_LIGHT_PRESETS);

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
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Palette size={16} color={colors.secondary} strokeWidth={2.4} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Screen Light Color
          </Text>
        </View>
        <Text style={[styles.activePresetBadge, { color: colors.textAccent }]}>
          {SCREEN_LIGHT_PRESETS[selectedPreset].label}
        </Text>
      </View>

      {/* Preset Buttons Grid */}
      <View style={styles.presetGrid}>
        {presets.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              activeOpacity={0.8}
              onPress={() => onSelectPreset(preset.id)}
              style={[
                styles.presetItem,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                },
                isSelected && styles.selectedItem,
              ]}
            >
              {/* Color Swatch Circle */}
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: preset.hex,
                    borderColor: isSelected ? colors.primary : '#475569',
                  },
                ]}
              >
                {isSelected && <Check size={14} color="#0F172A" strokeWidth={3} />}
              </View>

              <Text
                style={[
                  styles.presetName,
                  {
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {preset.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: 12,
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
  activePresetBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  presetItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Layout.radius.md,
    borderWidth: 1.5,
  },
  selectedItem: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  presetName: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
