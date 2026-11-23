import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react-native';
import { BatteryInfo } from '../types';
import { ThemeColors } from '../constants/colors';

interface BatteryIndicatorProps {
  battery: BatteryInfo;
  colors: ThemeColors;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  battery,
  colors,
}) => {
  if (!battery.isAvailable || battery.level === null) {
    return null;
  }

  const isLow = battery.level <= 20;

  const getIcon = () => {
    if (battery.isCharging) {
      return <BatteryCharging size={16} color={colors.success} strokeWidth={2.4} />;
    }
    if (isLow) {
      return <BatteryWarning size={16} color={colors.danger} strokeWidth={2.4} />;
    }
    return <Battery size={16} color={colors.textSecondary} strokeWidth={2.2} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        },
      ]}
    >
      {getIcon()}
      <Text
        style={[
          styles.text,
          {
            color: isLow
              ? colors.danger
              : battery.isCharging
              ? colors.success
              : colors.textSecondary,
          },
        ]}
      >
        {battery.level}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
