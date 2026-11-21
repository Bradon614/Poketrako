import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './Text';

/**
 * SegmentedControl — an iOS-style segmented switch.
 *
 * The selection indicator is a glass thumb that slides between segments, so the
 * control reads as a physical object rather than a row of buttons. Generic over
 * the value type, which lets the same component drive the theme picker
 * ("Clair / Sombre / Système") and the expense-type switch.
 */

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme();
  const { colors, shadows } = theme;
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const innerPadding = 3;
  const segmentWidth = trackWidth > 0 ? (trackWidth - innerPadding * 2) / options.length : 0;
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    if (segmentWidth === 0) return;
    Animated.spring(translateX, {
      toValue: activeIndex * segmentWidth,
      useNativeDriver: Platform.OS !== 'web',
      speed: 18,
      bounciness: 4,
    }).start();
  }, [activeIndex, segmentWidth, translateX]);

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.inset, borderColor: colors.border, padding: innerPadding },
        style,
      ]}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              transform: [{ translateX }],
              backgroundColor: colors.surface,
              borderColor: colors.border,
              ...shadows.row,
            },
          ]}
        />
      )}

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <View style={styles.segmentContent}>
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={15}
                  color={selected ? colors.accent : colors.textSecondary}
                  style={styles.segmentIcon}
                />
              )}
              <AppText
                variant="bodySmall"
                tone={selected ? 'default' : 'secondary'}
                style={selected ? styles.segmentLabelSelected : undefined}
                numberOfLines={1}
              >
                {option.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radiusTokens.md,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'hidden',
  },
  thumb: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: radiusTokens.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm - 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentIcon: {
    marginRight: spacing.xs + 1,
  },
  segmentLabelSelected: {
    fontWeight: '600',
  },
});
