import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { RotateCcw } from 'lucide-react-native';
import { hsvToHex, hexToHsv } from '../utils/colorUtils';

interface RgbColorWheelProps {
  selectedHex: string;
  onColorChange: (hex: string) => void;
  onReset: () => void;
  size?: number;
}

const NUM_SLICES = 48; // Smooth sector resolution

export const RgbColorWheel: React.FC<RgbColorWheelProps> = React.memo(({
  selectedHex,
  onColorChange,
  onReset,
  size = 160,
}) => {
  const radius = size / 2;
  const center = radius;

  // Derive indicator position purely from selectedHex — NO setState in useEffect!
  // This completely eliminates any "Maximum update depth exceeded" infinite loops.
  const indicatorPos = useMemo(() => {
    try {
      const hsv = hexToHsv(selectedHex);
      const angleRad = (hsv.h * Math.PI) / 180;
      const maxUsableRadius = radius - 8;
      const dist = Math.min(hsv.s * maxUsableRadius, maxUsableRadius);
      return {
        x: center + dist * Math.cos(angleRad),
        y: center + dist * Math.sin(angleRad),
      };
    } catch {
      return { x: center, y: center };
    }
  }, [selectedHex, center, radius]);

  // Generate wheel wedges once
  const slices = useMemo(() => {
    const sliceAngle = (2 * Math.PI) / NUM_SLICES;
    const arr = [];

    for (let i = 0; i < NUM_SLICES; i++) {
      const a1 = i * sliceAngle;
      const a2 = (i + 1) * sliceAngle;

      const x1 = center + radius * Math.cos(a1);
      const y1 = center + radius * Math.sin(a1);
      const x2 = center + radius * Math.cos(a2);
      const y2 = center + radius * Math.sin(a2);

      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
      const midAngleDeg = ((i + 0.5) * 360) / NUM_SLICES;
      const color = hsvToHex(midAngleDeg, 1, 1);

      arr.push({ d, color, id: i });
    }
    return arr;
  }, [center, radius]);

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - center;
    const dy = locationY - center;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate Hue in degrees (0 - 360)
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    // Saturation proportional to radius from center (clamped 0 to 1)
    const maxUsableRadius = radius - 6;
    const sat = Math.max(0, Math.min(1, dist / maxUsableRadius));

    const newHex = hsvToHex(angleDeg, sat, 1.0);
    onColorChange(newHex);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouch,
      onPanResponderMove: handleTouch,
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Reset button matching the reference screenshot */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onReset}
        style={styles.resetButton}
        accessibilityLabel="Reset color to white"
        accessibilityRole="button"
      >
        <RotateCcw size={13} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>

      {/* SVG Interactive Wheel */}
      <View
        style={[styles.wheelContainer, { width: size, height: size }]}
        {...panResponder.panHandlers}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="whiteCenter" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Slices */}
          {slices.map((slice) => (
            <Path key={slice.id} d={slice.d} fill={slice.color} />
          ))}

          {/* White Center Desaturation Gradient */}
          <Circle cx={center} cy={center} r={radius} fill="url(#whiteCenter)" />

          {/* Outer Border Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius - 1}
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth={1.5}
            fill="transparent"
          />

          {/* Current Selection Ring Indicator */}
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={10}
            stroke="#FFFFFF"
            strokeWidth={3}
            fill={selectedHex}
          />
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={11.5}
            stroke="rgba(0, 0, 0, 0.35)"
            strokeWidth={1}
            fill="transparent"
          />
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  wheelContainer: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
