import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Platform flag: shadows are expressed differently on web (see `shadow()`). */
const IS_WEB = Platform.OS === 'web';

/**
 * A shadow token is written twice: once as a CSS `box-shadow` for web and once
 * as the native `shadow*`/`elevation` props. React Native Web still renders the
 * legacy `shadow*` props but warns on every surface, and `boxShadow` is both
 * quieter and more faithful to the design. Only one of the two is ever emitted.
 */
function shadow(web: string, native: ViewStyle): ViewStyle {
  return IS_WEB ? ({ boxShadow: web } as ViewStyle) : native;
}

/**
 * POKETRAKO design tokens — Layer 1 (scheme-agnostic)
 * ---------------------------------------------------------------------------
 * Single source of truth for the "Apple-inspired Liquid Glass" direction.
 * Everything here is pure data: no React, no platform side effects, so it can
 * be imported by any file (including tests) without pulling in a provider.
 *
 * The scale is intentionally small and opinionated: components pick from these
 * values instead of hardcoding numbers, which is what keeps every screen
 * visually consistent.
 */

/* -------------------------------------------------------------------------- */
/* Spacing — 4pt base grid                                                    */
/* -------------------------------------------------------------------------- */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/* -------------------------------------------------------------------------- */
/* Corner radii — large, continuous-looking corners are core to the language  */
/* -------------------------------------------------------------------------- */

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 999,
} as const;

/** Hairline border width (the app uses hairlines, never heavy outlines). */
export const hairlineWidth = 1;

/* -------------------------------------------------------------------------- */
/* Layout — screen-level rhythm, shared by every screen                       */
/* -------------------------------------------------------------------------- */

export const layout = {
  /** Horizontal gutter of every screen. */
  screenPadding: 20,
  /** Vertical gap between stacked cards. */
  cardGap: 14,
  /** Gap between distinct sections of a screen. */
  sectionGap: 26,
  /** Vertical padding at the top of a scroll view. */
  topInset: 12,
} as const;

/* -------------------------------------------------------------------------- */
/* Typography — system font stack (San Francisco on iOS, Roboto on Android,   */
/* system-ui on web). Tight tracking on large sizes reproduces Apple's        */
/* optical sizing without shipping a custom font.                            */
/* -------------------------------------------------------------------------- */

export type TypographyVariant =
  | 'display'
  | 'amountLarge'
  | 'amount'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'captionSmall'
  | 'button'
  | 'tabLabel';

export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '700', letterSpacing: -1.2 },
  amountLarge: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  amount: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.8 },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 },
  h3: { fontSize: 19, lineHeight: 25, fontWeight: '600', letterSpacing: -0.3 },
  h4: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400', letterSpacing: -0.1 },
  bodySmall: { fontSize: 14, lineHeight: 19, fontWeight: '400', letterSpacing: -0.1 },
  // Grouped-list section label ("PARAMÈTRES"), uppercase in the UI.
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.6 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0 },
  captionSmall: { fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 0 },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600', letterSpacing: -0.2 },
  tabLabel: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: -0.1 },
};

/* -------------------------------------------------------------------------- */
/* Motion — short, eased, never decorative for its own sake                   */
/* -------------------------------------------------------------------------- */

export const motion = {
  /** Press feedback / colour swaps. */
  fast: 140,
  /** Default transition for appearing surfaces. */
  base: 240,
  /** Larger surface entrances (sheets, hero cards). */
  slow: 340,
  /** Scale applied while a surface is pressed. */
  pressScale: 0.97,
  /** Stagger unit used when a list enters. */
  stagger: 45,
} as const;

/** Extra scroll padding so content clears the floating tab bar. */
export const FLOATING_TAB_BAR_SPACE = 108;
/** Height of the floating tab bar itself. */
export const FLOATING_TAB_BAR_HEIGHT = 62;

/* -------------------------------------------------------------------------- */
/* Colour palettes                                                            */
/* -------------------------------------------------------------------------- */

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  /* Brand */
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentOn: string;
  /** Gradient stops for accent-filled surfaces (hero balance card, CTA). */
  accentGradient: readonly [string, string, string];
  /** Very low-alpha accent used for decorative glows. */
  accentGlow: string;

  /* Functional */
  income: string;
  incomeSoft: string;
  incomeGradient: readonly [string, string];
  expense: string;
  expenseSoft: string;
  expenseGradient: readonly [string, string];
  warning: string;
  warningSoft: string;

  /* Surfaces */
  background: string;
  /** Opaque surface used where transparency would hurt legibility. */
  surface: string;
  surfaceVariant: string;
  /** Translucent fill for glass cards. */
  glassTint: string;
  /** Denser translucent fill for chrome (tab bar, headers, sheets). */
  glassTintStrong: string;
  /** Recessed fill (input fields, progress tracks, segmented controls). */
  inset: string;
  /** Slightly raised fill sitting on a glass card. */
  insetRaised: string;

  /* Lines */
  border: string;
  /** Specular top edge of a glass surface. */
  glassHighlight: string;
  /** Start colour of the vertical specular sheen painted on glass surfaces. */
  glassSheen: string;

  /* Text */
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;

  /* Overlays */
  overlay: string;
  shadow: string;

  /* Decorative ambience (background gradients). Each pair is
     [colour, same-colour-at-zero-alpha] so the fade never passes through
     transparent black on Android. */
  ambient: {
    wash: readonly [string, string];
    glow: readonly [string, string];
    accent: readonly [string, string];
  };

  /* Legacy aliases kept so untouched call sites keep compiling. */
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  success: string;
  error: string;
  white: string;
  black: string;
};

const lightColors: ThemeColors = {
  accent: '#2563EB',
  accentStrong: '#1D4ED8',
  accentSoft: 'rgba(37, 99, 235, 0.12)',
  accentOn: '#FFFFFF',
  accentGradient: ['#3B82F6', '#2563EB', '#1D4ED8'],
  accentGlow: 'rgba(37, 99, 235, 0.28)',

  income: '#15803D',
  incomeSoft: 'rgba(21, 128, 61, 0.12)',
  incomeGradient: ['#22C55E', '#15803D'],
  expense: '#C2261F',
  expenseSoft: 'rgba(194, 38, 31, 0.12)',
  expenseGradient: ['#F87171', '#C2261F'],
  warning: '#B45309',
  warningSoft: 'rgba(245, 158, 11, 0.14)',

  background: '#F2F3F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F7F8FA',
  glassTint: 'rgba(255, 255, 255, 0.72)',
  glassTintStrong: 'rgba(255, 255, 255, 0.62)',
  inset: 'rgba(15, 23, 42, 0.05)',
  insetRaised: 'rgba(255, 255, 255, 0.55)',

  border: 'rgba(15, 23, 42, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.9)',
  glassSheen: 'rgba(255, 255, 255, 0.34)',

  text: '#0B1220',
  textSecondary: '#5A6473',
  textMuted: '#8A93A2',
  textOnAccent: '#FFFFFF',

  overlay: 'rgba(9, 12, 20, 0.42)',
  shadow: '#0F172A',

  ambient: {
    wash: ['rgba(37, 99, 235, 0.10)', 'rgba(37, 99, 235, 0)'],
    glow: ['rgba(124, 92, 255, 0.13)', 'rgba(124, 92, 255, 0)'],
    accent: ['rgba(20, 184, 166, 0.09)', 'rgba(20, 184, 166, 0)'],
  },

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#5A6473',
  success: '#15803D',
  error: '#C2261F',
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors: ThemeColors = {
  accent: '#3B82F6',
  accentStrong: '#60A5FA',
  accentSoft: 'rgba(59, 130, 246, 0.18)',
  accentOn: '#FFFFFF',
  accentGradient: ['#2F6FE0', '#1D4ED8', '#152C6B'],
  accentGlow: 'rgba(59, 130, 246, 0.34)',

  income: '#4ADE80',
  incomeSoft: 'rgba(74, 222, 128, 0.16)',
  incomeGradient: ['#4ADE80', '#16A34A'],
  expense: '#FF7B72',
  expenseSoft: 'rgba(255, 123, 114, 0.16)',
  expenseGradient: ['#FF9A8F', '#E5484D'],
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',

  background: '#0A0B0D',
  surface: '#15171C',
  surfaceVariant: '#1B1E24',
  glassTint: 'rgba(30, 32, 38, 0.66)',
  glassTintStrong: 'rgba(20, 22, 26, 0.62)',
  inset: 'rgba(255, 255, 255, 0.06)',
  insetRaised: 'rgba(255, 255, 255, 0.04)',

  border: 'rgba(255, 255, 255, 0.09)',
  glassHighlight: 'rgba(255, 255, 255, 0.16)',
  glassSheen: 'rgba(255, 255, 255, 0.07)',

  text: '#F5F7FA',
  textSecondary: '#A6AEBB',
  textMuted: '#767E8C',
  textOnAccent: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.58)',
  shadow: '#000000',

  ambient: {
    wash: ['rgba(59, 130, 246, 0.22)', 'rgba(59, 130, 246, 0)'],
    glow: ['rgba(124, 92, 255, 0.18)', 'rgba(124, 92, 255, 0)'],
    accent: ['rgba(20, 184, 166, 0.12)', 'rgba(20, 184, 166, 0)'],
  },

  primary: '#3B82F6',
  primaryDark: '#60A5FA',
  primaryLight: 'rgba(59, 130, 246, 0.18)',
  secondary: '#A6AEBB',
  success: '#4ADE80',
  error: '#FF7B72',
  white: '#FFFFFF',
  black: '#000000',
};

export const palettes: Record<ColorScheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

/* -------------------------------------------------------------------------- */
/* Elevation — soft, wide, low-opacity shadows are what sell the depth        */
/* -------------------------------------------------------------------------- */

export type ShadowTokens = {
  /** Resting card on the background. */
  card: ViewStyle;
  /** Card sitting on top of another card / inset surface. */
  raised: ViewStyle;
  /** Floating chrome: tab bar, sheets, FABs. */
  floating: ViewStyle;
  /** Coloured glow for accent-filled surfaces. */
  accent: ViewStyle;
  /** Barely-there lift for interactive rows. */
  row: ViewStyle;
};

const lightShadows: ShadowTokens = {
  card: shadow('0 8px 20px rgba(15, 23, 42, 0.07)', {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 3,
  }),
  raised: shadow('0 4px 12px rgba(15, 23, 42, 0.06)', {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  }),
  floating: shadow('0 18px 32px rgba(15, 23, 42, 0.16)', {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  }),
  accent: shadow('0 14px 28px rgba(37, 99, 235, 0.28)', {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 10,
  }),
  row: shadow('0 2px 6px rgba(15, 23, 42, 0.04)', {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  }),
};

const darkShadows: ShadowTokens = {
  card: shadow('0 10px 24px rgba(0, 0, 0, 0.5)', {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 3,
  }),
  raised: shadow('0 4px 12px rgba(0, 0, 0, 0.4)', {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 2,
  }),
  floating: shadow('0 20px 36px rgba(0, 0, 0, 0.66)', {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.66,
    shadowRadius: 36,
    elevation: 14,
  }),
  accent: shadow('0 16px 30px rgba(29, 78, 216, 0.5)', {
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  }),
  row: shadow('0 2px 8px rgba(0, 0, 0, 0.3)', {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 1,
  }),
};

export const shadowTokens: Record<ColorScheme, ShadowTokens> = {
  light: lightShadows,
  dark: darkShadows,
};

/* -------------------------------------------------------------------------- */
/* Blur presets — mapped onto platform blur implementations by GlassSurface    */
/* -------------------------------------------------------------------------- */

export type BlurPreset = {
  intensity: number;
  tint: 'light' | 'dark';
};

export const blurPresets: Record<ColorScheme, {
  chrome: BlurPreset;
  card: BlurPreset;
  sheet: BlurPreset;
}> = {
  light: {
    chrome: { intensity: 42, tint: 'light' },
    card: { intensity: 24, tint: 'light' },
    sheet: { intensity: 48, tint: 'light' },
  },
  dark: {
    chrome: { intensity: 44, tint: 'dark' },
    card: { intensity: 26, tint: 'dark' },
    sheet: { intensity: 50, tint: 'dark' },
  },
};

/** Minimum Android API level that gets a real blur (older ones keep the tint). */
export const ANDROID_BLUR_MIN_API = 31;
