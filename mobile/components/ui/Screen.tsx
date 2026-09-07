import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
// react-native's SafeAreaView is deprecated and iOS-only; the
// safe-area-context implementation handles notches/status bars on both
// platforms (and no-ops on web). Only the top edge: tab screens already get
// their bottom inset from the tab bar.
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './design';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeArea = true,
  backgroundColor = colors.background,
}) => {
  const baseStyle = [styles.container, { backgroundColor }, style];

  if (safeArea) {
    return (
      <SafeAreaView edges={['top']} style={baseStyle}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={baseStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
