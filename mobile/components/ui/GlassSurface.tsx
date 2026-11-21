import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { BACKDROP_BLUR_SUPPORTED } from '@/theme/platform';

/**
 * GlassSurface — the single building block behind every "Liquid Glass" panel.
 *
 * Structure (outer -> inner) so that shadow, border and clip never fight:
 *   1. outer view   : elevation/shadow only (never clipped by overflow)
 *   2. inner view    : hairline border + rounded clip
 *   3. BlurView      : real backdrop blur when the platform supports it
 *   4. tint overlay  : the controlled translucency that keeps text legible
 *   5. sheen         : a barely-there vertical highlight (the "liquid" read)
 *   6. content
 *
 * Blur is opt-in per surface on purpose: in Apple's own language only chrome
 * (bars, sheets, floating controls) is frosted, while content cards use a
 * material fill. Keeping it opt-in also protects low-end Android performance.
 */

export type GlassVariant = 'card' | 'chrome' | 'sheet' | 'subtle' | 'inset' | 'plain';
export type GlassElevation = 'none' | 'row' | 'card' | 'raised' | 'floating' | 'accent';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  variant?: GlassVariant;
  /** Enable a real backdrop blur on capable platforms (iOS/web). */
  blur?: boolean;
  /**
   * Stretch the surface to fill its parent. Required when the outer view is
   * absolutely positioned (e.g. the tab bar backdrop), because a glass surface
   * has no intrinsic height of its own.
   */
  stretch?: boolean;
  /** Corner radius override; defaults to the variant's radius. */
  cornerRadius?: number;
  /** Built-in padding; pass `none` to control padding from the outside. */
  padding?: keyof typeof spacing | 'none';
  elevation?: GlassElevation;
  /** Specular top hairline + sheen (on by default for glass variants). */
  highlight?: boolean;
  /** Hairline border (on by default; `inset`/`plain` skip it). */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_RADIUS: Record<GlassVariant, number> = {
  card: radiusTokens.xl,
  chrome: radiusTokens.xxl,
  sheet: radiusTokens.xxl,
  subtle: radiusTokens.lg,
  inset: radiusTokens.md,
  plain: radiusTokens.lg,
};

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  variant = 'card',
  blur = false,
  stretch = false,
  cornerRadius,
  padding = 'none',
  elevation = 'card',
  highlight,
  bordered,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const { colors, materials, shadows } = theme;

  const r = cornerRadius ?? DEFAULT_RADIUS[variant];
  const showHighlight = highlight ?? (variant === 'card' || variant === 'chrome' || variant === 'sheet');
  const showBorder = bordered ?? variant !== 'plain';

  const surface = variant === 'plain' ? null : materials[variant];
  const surfaceBackground = surface?.backgroundColor ?? 'transparent';

  const elevationStyle: ViewStyle =
    elevation === 'none'
      ? {}
      : elevation === 'accent'
      ? shadows.accent
      : elevation === 'floating'
      ? shadows.floating
      : elevation === 'raised'
      ? shadows.raised
      : elevation === 'row'
      ? shadows.row
      : shadows.card;

  const useBlur = blur && BACKDROP_BLUR_SUPPORTED && variant !== 'inset' && variant !== 'plain';
  const blurPreset = variant === 'chrome' ? theme.blur.chrome : variant === 'sheet' ? theme.blur.sheet : theme.blur.card;

  return (
    <View style={[{ borderRadius: r }, elevationStyle, style]}>
      <View
        style={[
          styles.inner,
          { borderRadius: r },
          showBorder && {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          },
          // With a real blur underneath, the tint is painted on top of the
          // blurred backdrop; without it, it is the surface itself.
          { backgroundColor: useBlur ? 'transparent' : surfaceBackground },
          stretch && styles.stretch,
          { overflow: 'hidden' },
        ]}
      >
        {useBlur && (
          <BlurView
            intensity={blurPreset.intensity}
            tint={blurPreset.tint}
            style={[StyleSheet.absoluteFill, styles.noPointer]}
          />
        )}

        {useBlur && (
          <View style={[StyleSheet.absoluteFill, styles.noPointer, { backgroundColor: surfaceBackground }]} />
        )}

        {showHighlight && (
          <>
            <View
              style={[
                styles.topHairline,
                styles.noPointer,
                { backgroundColor: colors.glassHighlight, borderTopLeftRadius: r, borderTopRightRadius: r },
              ]}
            />
            <LinearGradient
              colors={[colors.glassSheen, 'rgba(255,255,255,0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.sheen, styles.noPointer, { borderTopLeftRadius: r, borderTopRightRadius: r }]}
            />
          </>
        )}

        <View style={[padding !== 'none' && { padding: spacing[padding] }, contentStyle]}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inner: {
    // Children must be able to paint over the absolute blur layers.
    position: 'relative',
  },
  stretch: {
    width: '100%',
    height: '100%',
  },
  // React Native Web deprecates the `pointerEvents` prop in favour of the style.
  noPointer: {
    pointerEvents: 'none',
  },
  topHairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    opacity: 0.8,
  },
});
