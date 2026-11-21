import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './Text';
import { Button } from './Button';

/**
 * ErrorState — recoverable failure with an explanation and a retry action.
 */

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erreur',
  message,
  onRetry,
  retryLabel = 'Réessayer',
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
        style,
      ]}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: radiusTokens.xxl,
          backgroundColor: colors.expenseSoft,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Ionicons name="cloud-offline-outline" size={32} color={colors.expense} />
      </View>

      <AppText variant="h4" center style={{ marginBottom: spacing.xs + 2 }}>
        {title}
      </AppText>
      <AppText variant="bodySmall" tone="secondary" center style={{ maxWidth: 300 }}>
        {message}
      </AppText>

      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="secondary"
          size="md"
          pill
          icon="refresh"
          style={{ marginTop: spacing.lg, minWidth: 200 }}
        />
      )}
    </View>
  );
};
