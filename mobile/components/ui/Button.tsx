import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from './design';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      title,
      onPress,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      style,
      textStyle,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
        ...shadows.sm,
      },
      secondary: {
        backgroundColor: colors.surfaceVariant,
        borderWidth: 1,
        borderColor: colors.border,
      },
      danger: {
        backgroundColor: colors.error,
        ...shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    const textColors: Record<string, string> = {
      primary: colors.white,
      secondary: colors.primary,
      danger: colors.white,
      ghost: colors.primary,
    };

    const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
      sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, fontSize: 14 },
      md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: 16 },
      lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: 18 },
    };

    const sizeStyle = sizeStyles[size];
    const variantStyle = variantStyles[variant];
    const textColor = textColors[variant];

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          {
            borderRadius: borderRadius.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flexDirection: 'row' as const,
            width: fullWidth ? '100%' : 'auto',
            opacity: isDisabled ? 0.5 : 1,
          },
          variantStyle,
          { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
          style,
        ]}
        activeOpacity={0.8}
      >
        {loading ? (
          <Text style={[typography.button, { fontSize: sizeStyle.fontSize, color: textColor }]}>Chargement...</Text>
        ) : (
          <Text style={[typography.button, { fontSize: sizeStyle.fontSize, color: textColor }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';