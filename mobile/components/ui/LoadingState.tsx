import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from './design';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  color = colors.primary,
  style,
  fullScreen = false,
}) => {
  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message && <AppText style={styles.message} variant="caption" color={colors.textSecondary}>{message}</AppText>}
    </View>
  );
};

import { AppText } from './Text';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});