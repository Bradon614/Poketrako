import React from 'react';
import { RefreshControl, ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { FLOATING_TAB_BAR_SPACE, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * RefreshableList — the scroll container used by every list screen.
 *
 * Wraps ScrollView with a theme-aware pull-to-refresh control, keeps the
 * inline-form behaviour the screens rely on (taps register while the keyboard
 * is up) and can reserve space for the floating tab bar.
 */

interface RefreshableListProps {
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Adds bottom padding so content clears the floating tab bar. */
  tabBarSpace?: boolean;
}

export const RefreshableList: React.FC<RefreshableListProps> = ({
  children,
  refreshing,
  onRefresh,
  contentContainerStyle,
  style,
  tabBarSpace = false,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.accent}
          colors={[theme.colors.accent]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
      contentContainerStyle={[
        { paddingBottom: spacing.xl },
        tabBarSpace && { paddingBottom: FLOATING_TAB_BAR_SPACE },
        contentContainerStyle,
      ]}
      style={style}
      // Taps on buttons inside the list register on first touch even while
      // the keyboard is up (inline forms on the list screens).
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};
