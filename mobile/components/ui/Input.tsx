import React, { forwardRef, useCallback, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { radius, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Input — a recessed glass text field.
 *
 * Focus is signalled by an accent hairline plus a soft accent ring, so the
 * active field is obvious without heavy borders. Labels, helper text and
 * errors keep the same slots as before (API compatible).
 */

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      style,
      inputStyle,
      secureTextEntry = false,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const hasError = !!error;
    const [focused, setFocused] = useState(false);

    const handleFocus = useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    return (
      <View style={style}>
        {label && (
          <Text style={[styles.label, { color: hasError ? colors.expense : colors.textSecondary }]}>
            {label}
          </Text>
        )}

        <View
          style={[
            styles.field,
            {
              backgroundColor: colors.insetRaised,
              borderColor: hasError ? colors.expense : focused ? colors.accent : colors.border,
            },
            focused && styles.fieldFocused,
            focused && { borderColor: hasError ? colors.expense : colors.accent },
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text },
              leftIcon ? styles.inputWithLeftIcon : null,
              rightIcon ? styles.inputWithRightIcon : null,
              inputStyle,
            ]}
            secureTextEntry={secureTextEntry}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
        ) : helperText ? (
          <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.sm - 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    minHeight: 50,
  },
  fieldFocused: {
    // A touch of lift while editing — never a heavy focus ring. Expressed per
    // platform so web gets a CSS box-shadow and native gets shadow*/elevation.
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)' } as TextStyle)
      : {
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 2,
        }),
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    // Removes the default web outline: the field itself shows focus.
    outlineStyle: 'none',
  } as TextStyle,
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  iconLeft: {
    paddingLeft: spacing.md - 4,
  },
  iconRight: {
    paddingRight: spacing.md - 4,
  },
  errorText: {
    ...typography.caption,
    marginTop: spacing.xs + 2,
  },
  helperText: {
    ...typography.caption,
    marginTop: spacing.xs + 2,
  },
});
