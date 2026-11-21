import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';

/**
 * IconButton — a circular, glass-backed icon action.
 *
 * Used for back buttons, row actions (edit/delete) and header actions. Icons
 * can be passed either as a ready-made node (`icon`) or by Ionicon name
 * (`name`), which keeps call sites short and the icon colouring consistent.
 */

export type IconButtonVariant = 'glass' | 'primary' | 'secondary' | 'ghost' | 'danger';

interface IconButtonProps {
  /** Pre-built icon node (legacy call sites). */
  icon?: React.ReactNode;
  /** Ionicon name — wrapped in an <Ionicons /> with the right size/colour. */
  name?: React.ComponentProps<typeof Ionicons>['name'];
  /** Icon colour override. */
  color?: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZE_MAP = { sm: 32, md: 40, lg: 46 } as const;
const ICON_SIZE_MAP = { sm: 18, md: 20, lg: 22 } as const;

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  name,
  color,
  onPress,
  size = 'md',
  variant = 'glass',
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;
  const buttonSize = SIZE_MAP[size];

  const variantColor: Record<IconButtonVariant, string> = {
    glass: colors.text,
    primary: colors.textOnAccent,
    secondary: colors.accent,
    ghost: colors.text,
    danger: colors.expense,
  };

  const variantStyle: Record<IconButtonVariant, ViewStyle> = {
    glass: {
      backgroundColor: colors.insetRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...shadows.row,
    },
    primary: { backgroundColor: colors.accent, ...shadows.row },
    secondary: {
      backgroundColor: colors.accentSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.expenseSoft },
  };

  const iconColor = color ?? variantColor[variant];
  const renderedIcon =
    icon ??
    (name ? <Ionicons name={name} size={ICON_SIZE_MAP[size]} color={iconColor} /> : null);

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      // Small visual size, comfortable 44pt+ touch target.
      hitSlop={buttonSize < 44 ? (44 - buttonSize) / 2 : 0}
      style={style}
      contentStyle={[
        styles.base,
        { width: buttonSize, height: buttonSize, borderRadius: radius.full },
        variantStyle[variant],
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.noPointer}>{renderedIcon}</View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xxs,
  },
  disabled: {
    opacity: 0.4,
  },
  noPointer: {
    pointerEvents: 'none',
  },
});
