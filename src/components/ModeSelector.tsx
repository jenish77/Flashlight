import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flashlight, Smartphone } from 'lucide-react-native';
import { ThemeColors } from '../constants/colors';
import { Layout } from '../constants/layout';
import { LightMode } from '../types';

interface ModeSelectorProps {
  currentMode: LightMode;
  onSelectMode: (mode: LightMode) => void;
  colors: ThemeColors;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  colors,
}) => {
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
      {/* LED Torch Option */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMode('torch')}
        style={[
          styles.tab,
          currentMode === 'torch' && [
            styles.activeTab,
            { backgroundColor: colors.primary },
          ],
        ]}
      >
        <Flashlight
          size={18}
          color={currentMode === 'torch' ? '#FFFFFF' : colors.textSecondary}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.tabText,
            {
              color: currentMode === 'torch' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: currentMode === 'torch' ? '700' : '500',
            },
          ]}
        >
          LED Torch
        </Text>
      </TouchableOpacity>

      {/* Screen Light Option */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMode('screen')}
        style={[
          styles.tab,
          currentMode === 'screen' && [
            styles.activeTab,
            { backgroundColor: colors.primary },
          ],
        ]}
      >
        <Smartphone
          size={18}
          color={currentMode === 'screen' ? '#FFFFFF' : colors.textSecondary}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.tabText,
            {
              color: currentMode === 'screen' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: currentMode === 'screen' ? '700' : '500',
            },
          ]}
        >
          Screen Light
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Layout.radius.lg,
    padding: 4,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    gap: 8,
    minHeight: Layout.touchTarget.iconButton,
  },
  activeTab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
