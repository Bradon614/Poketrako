import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from './design';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erreur',
  message,
  onRetry,
  retryLabel = 'Réessayer',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <IconError color={colors.error} size={48} />
      </View>
      <AppText style={styles.title} variant="h4" color={colors.text} center>
        {title}
      </AppText>
      <AppText style={styles.message} variant="body" color={colors.textSecondary} center>
        {message}
      </AppText>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

import { AppText } from './Text';

const IconError: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.md,
    minWidth: 200,
  },
});