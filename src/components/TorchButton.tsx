import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Power, Zap } from 'lucide-react-native';
import { ThemeColors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface TorchButtonProps {
  isOn: boolean;
  onToggle: () => void;
  colors: ThemeColors;
  disabled?: boolean;
  statusText?: string;
}

export const TorchButton: React.FC<TorchButtonProps> = ({
  isOn,
  onToggle,
  colors,
  disabled = false,
  statusText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 50,
    }).start();
  };

  return (
    <View style={styles.wrapper}>
      {/* Outer Pulse/Glow Ring */}
      <View
        style={[
          styles.glowRing,
          isOn
            ? {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.primary,
                borderWidth: 2,
              }
            : {
                backgroundColor: 'transparent',
                borderColor: colors.surfaceBorder,
                borderWidth: 1,
              },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onToggle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
              styles.button,
              isOn
                ? {
                    backgroundColor: colors.torchActiveBg,
                    borderColor: '#60A5FA',
                    ...Platform.select({
                      ios: {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 28,
                      },
                      android: {
                        elevation: 16,
                      },
                    }),
                  }
                : {
                    backgroundColor: colors.torchInactiveBg,
                    borderColor: colors.torchInactiveBorder,
                    ...Platform.select({
                      ios: {
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                      },
                      android: {
                        elevation: 4,
                      },
                    }),
                  },
            ]}
          >
            {/* Power / Light Icon */}
            <View style={styles.iconContainer}>
              <Power
                size={Layout.torchButton.iconSize}
                color={isOn ? colors.torchIconActive : colors.torchIconInactive}
                strokeWidth={2.5}
              />
            </View>

            {/* Subtle lightning indicator when active */}
            {isOn && (
              <View style={styles.activePill}>
                <Zap size={13} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.activePillText}>ON</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Main Status Text */}
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusLabel,
            { color: isOn ? colors.textPrimary : colors.textMuted },
          ]}
        >
          {statusText || (isOn ? 'Torch is ON' : 'Torch is OFF')}
        </Text>
        <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
          {isOn ? 'Tap to turn off' : 'Tap to illuminate'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  glowRing: {
    width: Layout.torchButton.size + 36,
    height: Layout.torchButton.size + 36,
    borderRadius: (Layout.torchButton.size + 36) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  button: {
    width: Layout.torchButton.size,
    height: Layout.torchButton.size,
    borderRadius: Layout.torchButton.size / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 3,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusSubtext: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '400',
  },
});
