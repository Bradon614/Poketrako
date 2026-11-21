import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './Text';
import { Button } from './Button';

/**
 * EmptyState — the "nothing here yet" panel.
 *
 * A frosted icon well, a title, an explanation and (when relevant) a single
 * primary action, so empty screens guide the user instead of dead-ending.
 */

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  /** Ionicon name — preferred over `icon` for consistent sizing/colour. */
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  iconName,
  action,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      {(icon || iconName) && (
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: radiusTokens.xxl,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          {icon ?? <Ionicons name={iconName} size={32} color={colors.accent} />}
        </View>
      )}

      <AppText variant="h4" center style={{ marginBottom: spacing.xs + 2 }}>
        {title}
      </AppText>

      {message && (
        <AppText variant="bodySmall" tone="secondary" center style={{ maxWidth: 300 }}>
          {message}
        </AppText>
      )}

      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
          size="md"
          pill
          style={{ marginTop: spacing.lg, minWidth: 200 }}
        />
      )}
    </View>
  );
};
