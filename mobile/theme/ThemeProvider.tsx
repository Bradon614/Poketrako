import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme, type ViewStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  blurPresets,
  palettes,
  shadowTokens,
  type BlurPreset,
  type ColorScheme,
  type ShadowTokens,
  type ThemeColors,
} from './tokens';

/**
 * Theme layer — Layer 2
 * ---------------------------------------------------------------------------
 * Resolves "light" | "dark" | "system" into a single `theme` object consumed by
 * every component (`useTheme()`), and persists the user's choice so a reload
 * never resets it. `system` follows the OS setting live.
 *
 * Only colours, shadows, materials and blur presets live here: spacing,
 * radii, typography and motion are scheme-independent and are imported
 * straight from `./tokens`.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type Theme = {
  /** Resolved scheme currently in effect. */
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  shadows: ShadowTokens;
  blur: { chrome: BlurPreset; card: BlurPreset; sheet: BlurPreset };
  /** Ready-made surface recipes so screens never restyle glass by hand. */
  materials: {
    card: ViewStyle;
    chrome: ViewStyle;
    subtle: ViewStyle;
    inset: ViewStyle;
    sheet: ViewStyle;
  };
};

const STORAGE_KEY = 'poketrako.theme.mode';

function buildTheme(scheme: ColorScheme): Theme {
  const colors = palettes[scheme];
  const shadows = shadowTokens[scheme];

  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    shadows,
    blur: blurPresets[scheme],
    materials: {
      // Frosted card: translucent fill + hairline + soft shadow.
      card: {
        backgroundColor: colors.glassTint,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
      },
      // Chrome surfaces (floating tab bar, modal sheets) that sit above content.
      chrome: {
        backgroundColor: colors.glassTintStrong,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.floating,
      },
      // Very light grouping surface used for stacked rows inside a card.
      subtle: {
        backgroundColor: colors.insetRaised,
        borderWidth: 1,
        borderColor: colors.border,
      },
      // Recessed surface: inputs, progress tracks, segmented controls.
      inset: {
        backgroundColor: colors.inset,
        borderWidth: 1,
        borderColor: colors.border,
      },
      // Bottom sheets.
      sheet: {
        backgroundColor: colors.glassTintStrong,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.floating,
      },
    },
  };
}

const lightTheme = buildTheme('light');
const darkTheme = buildTheme('dark');

type ThemeContextValue = {
  theme: Theme;
  /** User preference ('system' by default). */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Cycles light -> dark -> light (the in-app quick toggle). */
  toggleScheme: () => void;
  /** False until the stored preference has been read. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {
        // A storage failure only costs the persisted preference.
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Persisting is best-effort: the in-memory value is already applied.
    });
  }, []);

  const scheme: ColorScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const toggleScheme = useCallback(() => {
    setMode(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, setMode, toggleScheme, ready }),
    [theme, mode, setMode, toggleScheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Builds a memoised StyleSheet from the current theme. The factory must be
 * defined at module scope (stable identity) so styles are only rebuilt when the
 * scheme actually changes:
 *
 *   const createStyles = (t: Theme) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

/** Convenience hook for components that only need the palette. */
export function useColors(): ThemeColors {
  return useTheme().theme.colors;
}
