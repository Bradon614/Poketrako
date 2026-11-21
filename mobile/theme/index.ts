/**
 * POKETRAKO theme — public entry point.
 *
 *   import { spacing, radius, typography, motion } from '@/theme';  // static
 *   import { useTheme, useThemedStyles } from '@/theme';            // reactive
 */

export * from './tokens';
export { ThemeProvider, useTheme, useThemedStyles, useColors } from './ThemeProvider';
export type { Theme, ThemeMode } from './ThemeProvider';
