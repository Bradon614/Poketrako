import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
// react-native's SafeAreaView is deprecated and iOS-only; the
// safe-area-context implementation handles notches/status bars on both
// platforms (and no-ops on web).
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { FLOATING_TAB_BAR_SPACE, layout, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AmbientBackground } from './AmbientBackground';

/**
 * Screen — the standard page frame.
 *
 * Provides, in order: the ambient colour field, the safe-area padding, the
 * shared horizontal gutter, and (optionally) a scroll container that leaves
 * room for the floating tab bar. Screens therefore never re-implement padding
 * or notches and stay perfectly aligned with each other.
 */

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  safeArea?: boolean;
  /** Which safe-area edges to respect (defaults to the top edge). */
  edges?: readonly Edge[];
  /** Overrides the theme background (used by the auth screens). */
  backgroundColor?: string;
  /** Wrap the content in a scroll view. */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Toggle the decorative ambience (kept on everywhere by default). */
  ambient?: boolean;
  /** Extra bottom padding for the floating tab bar. */
  tabBarSpace?: boolean;
  /** Horizontal gutter; pass 0 for full-bleed content. */
  horizontalPadding?: number;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeArea = true,
  edges = ['top'],
  backgroundColor,
  scroll = false,
  contentContainerStyle,
  ambient = true,
  tabBarSpace = false,
  horizontalPadding = layout.screenPadding,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const { theme } = useTheme();
  const background = backgroundColor ?? theme.colors.background;

  const frameStyle: StyleProp<ViewStyle> = [
    styles.container,
    { paddingHorizontal: horizontalPadding, paddingTop: layout.topInset, backgroundColor: background },
    style,
  ];

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        tabBarSpace && { paddingBottom: FLOATING_TAB_BAR_SPACE },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  const content = (
    <>
      {ambient && <AmbientBackground />}
      {body}
    </>
  );

  if (!safeArea) {
    return <View style={frameStyle}>{content}</View>;
  }

  return (
    <SafeAreaView edges={edges} style={frameStyle}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
