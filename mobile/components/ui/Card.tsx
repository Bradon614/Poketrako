import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { spacing } from '@/theme/tokens';
import { GlassSurface, type GlassElevation, type GlassVariant } from './GlassSurface';

/**
 * Card — a frosted content panel.
 *
 * Kept API-compatible with the previous implementation (`padding`, `elevation`)
 * so existing screens migrate without behavioural surprises, while delegating
 * every visual decision to GlassSurface.
 */

export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | GlassElevation;

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing | 'none';
  elevation?: CardElevation;
  /** Enable a real backdrop blur (chrome-like surfaces only). */
  blur?: boolean;
  variant?: GlassVariant;
  cornerRadius?: number;
  highlight?: boolean;
}

const ELEVATION_ALIASES: Record<string, GlassElevation> = {
  none: 'none',
  sm: 'card',
  md: 'raised',
  lg: 'floating',
  row: 'row',
  card: 'card',
  raised: 'raised',
  floating: 'floating',
  accent: 'accent',
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  elevation = 'card',
  blur = false,
  variant = 'card',
  cornerRadius,
  highlight,
}) => (
  <GlassSurface
    variant={variant}
    blur={blur}
    padding={padding}
    elevation={ELEVATION_ALIASES[elevation] ?? 'card'}
    cornerRadius={cornerRadius}
    highlight={highlight}
    style={style}
  >
    {children}
  </GlassSurface>
);
