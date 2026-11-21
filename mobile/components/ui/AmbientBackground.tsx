import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * AmbientBackground — the soft, out-of-focus colour field behind every screen.
 *
 * This is what gives the glass surfaces something to refract: a wide top wash
 * plus two off-canvas corner glows. It is purely decorative (no blur passes,
 * no images, no animation) so it costs nothing on modest devices, and it stays
 * subtle enough that text contrast is never affected.
 */

interface AmbientBackgroundProps {
  /** Lets a screen dim the ambience (e.g. auth screens keep it brighter). */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ intensity = 1, style }) => {
  const { theme } = useTheme();
  const { ambient, background } = theme.colors;

  return (
    <View style={[StyleSheet.absoluteFill, styles.noPointer, { backgroundColor: background }, style]}>
      {/* Wide vertical wash from the top edge. */}
      <LinearGradient
        colors={ambient.wash}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.wash, { opacity: intensity }]}
      />
      {/* Off-canvas corner glows — large circles clipped by their own bounds. */}
      <View style={[styles.orb, styles.orbTopRight]}>
        <LinearGradient
          colors={ambient.glow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.orb, styles.orbBottomLeft, { opacity: intensity }]}>
        <LinearGradient
          colors={ambient.accent}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noPointer: {
    pointerEvents: 'none',
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  orb: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    overflow: 'hidden',
  },
  orbTopRight: {
    top: -170,
    right: -140,
  },
  orbBottomLeft: {
    bottom: -190,
    left: -160,
    width: 340,
    height: 340,
    borderRadius: 170,
  },
});
