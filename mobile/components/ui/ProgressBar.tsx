import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { motion, radius as radiusTokens } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * ProgressBar — budget consumption indicator.
 *
 * The track is a recessed glass inset; the fill is a gradient that turns from
 * accent to expense as the budget is consumed (green-ish accent under 70%,
 * warning to 90%, expense beyond). It animates once on mount and on change,
 * capped at 100% so the layout never overflows.
 */

interface ProgressBarProps {
  /** 0..1 (values above 1 are clamped for width but still coloured as over). */
  value: number;
  height?: number;
  /** Force a colour instead of the automatic threshold colouring. */
  colorOverride?: readonly [string, string];
  /** Overrides the recessed track fill (e.g. on top of the accent hero card). */
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 10,
  colorOverride,
  trackColor,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const clamped = Math.max(0, Math.min(value, 1));
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, clamped]);

  const gradient: readonly [string, string] =
    colorOverride ??
    (value > 0.9
      ? colors.expenseGradient
      : value > 0.7
      ? ['#F59E0B', '#D97706']
      : colors.accentGradient.slice(0, 2) as unknown as readonly [string, string]);

  const width = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor ?? colors.inset, borderColor: trackColor ?? colors.border },
        style,
      ]}
    >
      <Animated.View style={[styles.fill, { width }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radiusTokens.full }]}
        />
        {/* Specular highlight along the top of the fill. */}
        <View style={[styles.fillHighlight, { backgroundColor: colors.glassHighlight }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radiusTokens.full,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusTokens.full,
    overflow: 'hidden',
    // Percent widths on web need an explicit min width to stay visible.
    minWidth: Platform.OS === 'web' ? 0 : undefined,
  },
  fillHighlight: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.55,
  },
});
