import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from './design';

type TextVariant = keyof typeof typography;

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  center?: boolean;
}

export const AppText: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = colors.text,
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  center = false,
}) => {
  return (
    <Text
      style={[
        typography[variant],
        { color },
        center && { textAlign: 'center' as const },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </Text>
  );
};

export const Heading = ({ children, level = 1, ...props }: { children: React.ReactNode; level?: 1 | 2 | 3 | 4 } & Omit<TextProps, 'variant'>) => {
  const variants: Record<number, TextVariant> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' };
  return <AppText variant={variants[level]} {...props}>{children}</AppText>;
};

export const Body = ({ children, ...props }: Omit<TextProps, 'variant'>) => (
  <AppText variant="body" {...props}>{children}</AppText>
);

export const Caption = ({ children, ...props }: Omit<TextProps, 'variant'>) => (
  <AppText variant="caption" {...props}>{children}</AppText>
);