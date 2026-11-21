import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { typography, type TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * AppText — every string in the app goes through here.
 *
 * Text colour defaults to the theme's primary text colour, so a dark-mode
 * switch is handled once, centrally. Semantic `tone` values are preferred over
 * raw hex colours at call sites, which keeps income/expense coding consistent
 * across screens.
 */

export type TextTone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'income'
  | 'expense'
  | 'warning'
  | 'onAccent';

interface TextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  /** Semantic colour. Ignored when `color` is provided. */
  tone?: TextTone;
  /** Explicit colour override (rare — prefer `tone`). */
  color?: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  center?: boolean;
  /** Uppercase grouped-list label styling. */
  uppercase?: boolean;
  selectable?: boolean;
  /** Shrinks long values (e.g. large money amounts) instead of truncating. */
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

export const AppText: React.FC<TextProps> = ({
  children,
  variant = 'body',
  tone = 'default',
  color,
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  center = false,
  uppercase = false,
  selectable,
  adjustsFontSizeToFit,
  minimumFontScale,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const toneColors: Record<TextTone, string> = {
    default: colors.text,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.accent,
    income: colors.income,
    expense: colors.expense,
    warning: colors.warning,
    onAccent: colors.textOnAccent,
  };

  return (
    <Text
      style={[
        typography[variant],
        { color: color ?? toneColors[tone] },
        center && { textAlign: 'center' as const },
        uppercase && { textTransform: 'uppercase' as const },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      selectable={selectable}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
    >
      {children}
    </Text>
  );
};

export const Heading = ({
  children,
  level = 1,
  ...props
}: { children: React.ReactNode; level?: 1 | 2 | 3 | 4 } & Omit<TextProps, 'variant'>) => {
  const variants: Record<number, TypographyVariant> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' };
  return (
    <AppText variant={variants[level]} {...props}>
      {children}
    </AppText>
  );
};

export const Body = ({ children, ...props }: Omit<TextProps, 'variant'>) => (
  <AppText variant="body" {...props}>
    {children}
  </AppText>
);

export const Caption = ({ children, ...props }: Omit<TextProps, 'variant'>) => (
  <AppText variant="caption" {...props}>
    {children}
  </AppText>
);

export const Money = ({
  children,
  size = 'amount',
  ...props
}: { children: React.ReactNode; size?: 'amount' | 'amountLarge' } & Omit<TextProps, 'variant'>) => (
  <AppText variant={size} {...props}>
    {children}
  </AppText>
);
