/**
 * Legacy design bridge.
 *
 * The design system now lives in `@/theme` (see `theme/tokens.ts` and
 * `theme/ThemeProvider.tsx`). This module is kept so older imports of
 * `@/components/ui/design` keep resolving, and it exposes the *light* palette as
 * a static snapshot for non-React call sites. Any component that renders should
 * use `useTheme()` instead, so it follows the light/dark/system setting.
 */

import { palettes, radius, spacing, typography, shadowTokens } from '@/theme/tokens';

export const colors = palettes.light;
export { spacing, typography };

/** Backwards-compatible alias of the current `radius` scale. */
export const borderRadius = {
  sm: radius.xs,
  md: radius.sm,
  lg: radius.md,
  xl: radius.lg,
  full: radius.full,
};

export const shadows = {
  sm: shadowTokens.light.row,
  md: shadowTokens.light.card,
  lg: shadowTokens.light.floating,
};

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
