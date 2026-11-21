import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';
import { AppText } from './Text';

/**
 * ListRow — one row of a grouped list (settings, detail sheets).
 *
 * Replaces the bespoke rows that were duplicated in the expense/income detail
 * screens: leading icon well, title/subtitle stack, optional value or trailing
 * node, optional chevron, and an inset hairline separator that stops at the
 * text edge (the iOS grouped-list detail that makes lists look designed).
 */

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Glyph colour of the leading icon well. */
  iconColor?: string;
  /** Background of the leading icon well (tint of `iconColor` by default). */
  iconBackground?: string;
  /** Trailing text (e.g. a formatted value). */
  value?: string;
  valueTone?: 'default' | 'secondary' | 'accent' | 'income' | 'expense';
  /** Arbitrary trailing node (badge, switch, icon button). */
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  /** Hides the separator — set on the last row of a group. */
  last?: boolean;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  value,
  valueTone = 'default',
  right,
  onPress,
  showChevron = false,
  last = false,
  destructive = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const glyphColor = iconColor ?? (destructive ? colors.expense : colors.textSecondary);
  const wellColor =
    iconBackground ?? (destructive ? colors.expenseSoft : iconColor ? `${iconColor}1F` : colors.inset);

  const content = (
    <View style={[styles.row, style]}>
      {icon && (
        <View style={[styles.iconWell, { backgroundColor: wellColor }]}>
          <Ionicons name={icon} size={17} color={glyphColor} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.texts}>
          <AppText
            variant="body"
            color={destructive ? colors.expense : undefined}
            numberOfLines={2}
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" tone="muted" numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}
        </View>
        {value && (
          <AppText
            variant="amount"
            tone={valueTone === 'default' ? undefined : valueTone}
            numberOfLines={1}
            style={styles.value}
          >
            {value}
          </AppText>
        )}
        {right}
        {showChevron && (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.chevron} />
        )}
      </View>
      {!last && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
    </View>
  );

  if (!onPress) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? title}
      // Rows keep their own chrome: no scale, only a soft opacity dip.
      scaleTo={1}
      pressedOpacity={0.62}
    >
      {content}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 3,
    minHeight: 56,
    position: 'relative',
  },
  iconWell: {
    width: 32,
    height: 32,
    borderRadius: radiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md - 4,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: 2,
  },
  value: {
    marginLeft: spacing.sm,
  },
  chevron: {
    marginLeft: spacing.sm - 2,
  },
  separator: {
    position: 'absolute',
    left: spacing.md,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
});
