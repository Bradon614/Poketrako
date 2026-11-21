import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PressableScale } from '@/components/ui/PressableScale';

/**
 * TransactionCard — one expense or income in a list.
 *
 * Expenses and incomes used to be rendered by two near-identical card
 * components; this is the single implementation they now share, driven by
 * `variant`. Hierarchy is explicit: title (what), meta (when + badges),
 * amount (how much, right-aligned and colour-coded), optional note, then the
 * action row.
 */

export type TransactionVariant = 'expense' | 'income';

interface TransactionCardProps {
  variant: TransactionVariant;
  title: string;
  amountLabel: string;
  dateLabel: string;
  description?: string;
  /** Leading icon + colour (category visuals for expenses, wallet for incomes). */
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  /** Small badges shown next to the date (e.g. "Récurrente"). */
  badge?: React.ReactNode;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  variant,
  title,
  amountLabel,
  dateLabel,
  description,
  icon,
  iconColor,
  badge,
  onPress,
  onEdit,
  onDelete,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isExpense = variant === 'expense';
  const amountTone = isExpense ? 'expense' : 'income';
  const sign = isExpense ? '-' : '+';
  const hasActions = !!(onEdit || onDelete);

  return (
    <GlassSurface variant="card" padding="none" style={style}>
      <PressableScale onPress={onPress} scaleTo={1} pressedOpacity={0.7}>
        <View style={styles.body}>
          <View style={[styles.iconWell, { backgroundColor: `${iconColor}1F` }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>

          <View style={styles.main}>
            <AppText variant="body" numberOfLines={1} style={styles.title}>
              {title}
            </AppText>
            <View style={styles.meta}>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {dateLabel}
              </AppText>
              {badge}
            </View>
          </View>

          <View style={styles.amountColumn}>
            <AppText variant="amount" tone={amountTone} numberOfLines={1} adjustsFontSizeToFit>
              {sign}
              {amountLabel}
            </AppText>
          </View>
        </View>

        {description && (
          <AppText variant="caption" tone="secondary" numberOfLines={2} style={styles.description}>
            {description}
          </AppText>
        )}
      </PressableScale>

      {hasActions && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Button title="Détails" onPress={onPress} variant="secondary" size="sm" pill />
          <View style={styles.actionIcons}>
            {onEdit && (
              <IconButton
                name="create-outline"
                onPress={onEdit}
                size="sm"
                variant="glass"
                accessibilityLabel="Modifier"
              />
            )}
            {onDelete && (
              <IconButton
                name="trash-outline"
                onPress={onDelete}
                size="sm"
                variant="danger"
                accessibilityLabel="Supprimer"
              />
            )}
          </View>
        </View>
      )}
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md - 2,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radiusTokens.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md - 4,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    marginBottom: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
  },
  amountColumn: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
    maxWidth: '46%',
  },
  description: {
    paddingHorizontal: spacing.md - 2,
    paddingBottom: spacing.md - 2,
    marginTop: -spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
