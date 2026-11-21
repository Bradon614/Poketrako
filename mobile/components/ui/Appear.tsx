import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { motion } from '@/theme/tokens';

/**
 * Appear — a one-shot entrance animation (fade + short rise).
 *
 * Used to stage the sections of a screen as it mounts. Deliberately subtle and
 * fast, and it never re-runs on re-render, so it adds depth without becoming
 * noise (or costing anything on low-end devices).
 */

interface AppearProps {
  children: React.ReactNode;
  /** Stagger offset in milliseconds. */
  delay?: number;
  /** Vertical travel in pixels. */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const Appear: React.FC<AppearProps> = ({
  children,
  delay = 0,
  offset = 14,
  duration = motion.base,
  style,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [delay, duration, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};
