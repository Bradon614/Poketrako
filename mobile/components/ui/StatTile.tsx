import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassSurface } from './GlassSurface';
import { AppText } from './Text';

/**
 * StatTile — the compact "metric" tile used on the dashboard (income, expense,
 * balance). A frosted surface with a tinted icon well and a tabular-figure
 * value, so numbers line up across tiles.
 */

export type StatTone = 'accent' | 'income' | 'expense' | 'neutral';

interface StatTileProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone?: StatTone;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, icon, tone = 'neutral', hint, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const toneColor: Record<StatTone, string> = {
    accent: colors.accent,
    income: colors.income,
    expense: colors.expense,
    neutral: colors.textSecondary,
  };
  const toneSoft: Record<StatTone, string> = {
    accent: colors.accentSoft,
    income: colors.incomeSoft,
    expense: colors.expenseSoft,
    neutral: colors.inset,
  };

  return (
    <GlassSurface variant="subtle" elevation="none" style={[styles.tile, style]} padding="none">
      <View style={styles.inner}>
        <View style={[styles.iconWell, { backgroundColor: toneSoft[tone] }]}>
          <Ionicons name={icon} size={16} color={toneColor[tone]} />
        </View>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="amount" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </AppText>
        {hint && (
          <AppText variant="captionSmall" tone="muted" numberOfLines={1}>
            {hint}
          </AppText>
        )}
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
  },
  inner: {
    padding: spacing.md - 4,
    gap: spacing.xs,
  },
  iconWell: {
    width: 28,
    height: 28,
    borderRadius: radiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
});
