import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { motion } from '@/theme/tokens';

/**
 * PressableScale — the app's single press-feedback primitive.
 *
 * A restrained scale-down (with a matching opacity dip) that springs back on
 * release. Kept on the JS thread on web (`useNativeDriver` is not available in
 * React Native Web) and on the native driver everywhere else.
 */

export interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Layout of the touchable itself (width, flex, margins). */
  style?: StyleProp<ViewStyle>;
  /** The visual surface that scales (background, radius, padding). */
  contentStyle?: StyleProp<ViewStyle>;
  /** How far to scale down while pressed. */
  scaleTo?: number;
  /** Final opacity while pressed. */
  pressedOpacity?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: PressableProps['accessibilityRole'];
  accessibilityState?: PressableProps['accessibilityState'];
  hitSlop?: PressableProps['hitSlop'];
  testID?: string;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  scaleTo = motion.pressScale,
  pressedOpacity = 0.92,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  hitSlop,
  testID,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toValue: number, opacityValue: number) => {
      const config = {
        useNativeDriver: Platform.OS !== 'web',
        // Snappy in, gentle out: reads as a physical, not bouncy, surface.
        speed: toValue === 1 ? 18 : 30,
        bounciness: 0,
      };
      Animated.parallel([
        Animated.spring(scale, { toValue, ...config }),
        Animated.timing(opacity, {
          toValue: opacityValue,
          duration: motion.fast,
          // Opacity can always use the native driver; on web it stays on JS.
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    },
    [opacity, scale]
  );

  const handlePressIn = useCallback(
    (_event: GestureResponderEvent) => {
      animateTo(scaleTo, pressedOpacity);
    },
    [animateTo, pressedOpacity, scaleTo]
  );

  const handlePressOut = useCallback(() => {
    animateTo(1, 1);
  }, [animateTo]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={style}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
    >
      <Animated.View style={[contentStyle, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
