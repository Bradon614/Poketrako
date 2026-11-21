import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './Text';

/**
 * LoadingState — inline or full-screen spinner with an optional message.
 */

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  color,
  style,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        fullScreen
          ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
          : { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color ?? theme.colors.accent} />
      {message && (
        <AppText variant="caption" tone="secondary" center style={{ marginTop: spacing.md }}>
          {message}
        </AppText>
      )}
    </View>
  );
};
