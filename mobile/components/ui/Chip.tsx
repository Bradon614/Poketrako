import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';
import { AppText } from './Text';

/**
 * Chip — a small pill used for status badges, currency pickers and category
 * labels. It can be static (badge) or pressable (selectable), which keeps the
 * selected/unselected language identical everywhere.
 */

export type ChipTone = 'neutral' | 'accent' | 'income' | 'expense' | 'warning';

interface ChipProps {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  tone?: ChipTone;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  tone = 'neutral',
  selected,
  onPress,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const toneColor: Record<ChipTone, string> = {
    neutral: colors.textSecondary,
    accent: colors.accent,
    income: colors.income,
    expense: colors.expense,
    warning: colors.warning,
  };
  const toneSoft: Record<ChipTone, string> = {
    neutral: colors.inset,
    accent: colors.accentSoft,
    income: colors.incomeSoft,
    expense: colors.expenseSoft,
    warning: colors.warningSoft,
  };

  const isSelected = selected === true;
  const textColor = isSelected ? colors.textOnAccent : toneColor[tone];

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.accent : toneSoft[tone],
          borderColor: isSelected ? colors.accent : colors.border,
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={13} color={textColor} style={styles.icon} />}
      <AppText variant="caption" color={textColor} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: isSelected }}
      hitSlop={4}
    >
      {content}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radiusTokens.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    marginRight: spacing.xs + 1,
  },
});
