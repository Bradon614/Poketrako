import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';

/**
 * Button — the app's only call-to-action component.
 *
 * `primary` and `danger` are accent-filled gradients with a coloured glow;
 * `secondary` is a frosted glass pill; `ghost` is a bare text action. All four
 * share the same size scale, press animation and accessibility semantics.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional leading Ionicon (e.g. "add") — keeps icon+label consistent. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Pill shape (Apple-style CTA) instead of the default rounded rect. */
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { height: 36, paddingHorizontal: spacing.md, fontSize: 14, iconSize: 16 },
  md: { height: 46, paddingHorizontal: spacing.lg, fontSize: 16, iconSize: 18 },
  lg: { height: 54, paddingHorizontal: spacing.xl, fontSize: 17, iconSize: 20 },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  pill = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const isDisabled = disabled || loading;
  const sizeStyle = SIZE_STYLES[size];
  const cornerRadius = pill ? radius.full : radius.md;

  const gradientColors: readonly [string, string] | null =
    variant === 'primary'
      ? [colors.accentGradient[0], colors.accentGradient[2]]
      : variant === 'danger'
      ? colors.expenseGradient
      : null;

  const surfaceStyle: ViewStyle =
    variant === 'secondary'
      ? {
          backgroundColor: colors.insetRaised,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        }
      : variant === 'ghost'
      ? { backgroundColor: 'transparent' }
      : {};

  const labelColor =
    variant === 'primary' || variant === 'danger'
      ? colors.textOnAccent
      : variant === 'secondary'
      ? colors.accent
      : colors.accent;

  const glowStyle: ViewStyle =
    !isDisabled && (variant === 'primary' || variant === 'danger')
      ? variant === 'danger'
        ? shadows.raised
        : shadows.accent
      : variant === 'secondary'
      ? shadows.row
      : {};

  const content = (
    <View style={[styles.content, { paddingHorizontal: sizeStyle.paddingHorizontal }]}>
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={sizeStyle.iconSize} color={labelColor} style={styles.icon} />
          )}
          <Text
            style={[
              typography.button,
              { fontSize: sizeStyle.fontSize, color: labelColor },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[fullWidth && styles.fullWidth, style]}
      contentStyle={[
        { borderRadius: cornerRadius, height: sizeStyle.height, overflow: 'hidden' },
        glowStyle,
        isDisabled && styles.disabled,
      ]}
    >
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={[styles.gradient, { borderRadius: cornerRadius }]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.gradient, { borderRadius: cornerRadius }, surfaceStyle]}>{content}</View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm - 2,
  },
  disabled: {
    opacity: 0.45,
  },
});
