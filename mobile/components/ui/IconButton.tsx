import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from './design';

interface IconButtonProps {
  icon: string; // Ionicons name
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const sizeMap = {
    sm: { size: 36, iconSize: 20 },
    md: { size: 44, iconSize: 24 },
    lg: { size: 52, iconSize: 28 },
  };

  const variantStyles = {
    primary: { backgroundColor: colors.primary, ...shadows.sm },
    secondary: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error, ...shadows.sm },
  };

  const { size: buttonSize, iconSize } = sizeMap[size];
  const variantStyle = variantStyles[variant];
  const iconColor = variant === 'ghost' ? colors.primary : colors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variantStyle,
        { width: buttonSize, height: buttonSize },
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  disabled: {
    opacity: 0.4,
  },
});