import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlySummary, useAlerts } from '@/hooks/useSummary';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import {
  Appear,
  AppText,
  Card,
  EmptyState,
  GlassSurface,
  IconButton,
  ListRow,
  LoadingState,
  PressableScale,
  ProgressBar,
  RefreshableList,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatTile,
} from '@/components/ui';
import { formatMoney, getRelativeTime, getCategoryVisual } from '@/utils';
import { Expense, Income } from '@/types/api';
import { confirmDialog } from '@/utils/notify';
import { radius, spacing, type Theme } from '@/theme';
import { useTheme, useThemedStyles } from '@/theme';

type Transaction = { kind: 'expense'; data: Expense } | { kind: 'income'; data: Income };

const DASHBOARD_LIST_SIZE = 5;

/** Secondary text colour used on top of the accent hero gradient. */
const ON_ACCENT_MUTED = 'rgba(255,255,255,0.85)';

export default function DashboardScreen() {
  const { theme, toggleScheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user, logout } = useAuth();
  const currency = user?.currency || 'MGA';
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useMonthlySummary();
  const { alert } = useAlerts();
  const { expenses, loading: expensesLoading, refetch: refetchExpenses } = useExpenses({
    _limit: DASHBOARD_LIST_SIZE,
    _sort: 'date:desc',
  });
  const { incomes, loading: incomesLoading, refetch: refetchIncomes } = useIncomes({
    _limit: DASHBOARD_LIST_SIZE,
    _sort: 'date:desc',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Refresh when the dashboard regains focus (e.g. after creating an expense
  // from the quick actions) so balances and recent transactions stay current.
  useFocusEffect(
    useCallback(() => {
      refetchSummary();
      refetchExpenses();
      refetchIncomes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchExpenses(), refetchIncomes()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmLabel: 'Déconnexion',
      destructive: true,
    });
    if (!confirmed) return;
    await logout();
  };

  const recentTransactions: Transaction[] = [
    ...expenses.map((e): Transaction => ({ kind: 'expense', data: e })),
    ...incomes.map((i): Transaction => ({ kind: 'income', data: i })),
  ]
    .sort((a, b) => {
      const dateA = 'date' in a.data && a.data.date ? a.data.date : a.data.creationDate;
      const dateB = 'date' in b.data && b.data.date ? b.data.date : b.data.creationDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, DASHBOARD_LIST_SIZE);

  const loading = summaryLoading || expensesLoading || incomesLoading;

  if (loading && !summary) {
    return (
      <Screen>
        <LoadingState message="Chargement du tableau de bord..." fullScreen />
      </Screen>
    );
  }

  const budgetRatio = summary && summary.budget > 0 ? summary.expenses / summary.budget : 0;
  const remaining = summary ? Math.max(summary.budget - summary.expenses, 0) : 0;

  return (
    <Screen>
      <RefreshableList
        refreshing={refreshing}
        onRefresh={handleRefresh}
        style={styles.list}
        tabBarSpace
      >
        <ScreenHeader
          eyebrow={summary?.month ? `Mois de ${formatMonthLabel(summary.month)}` : 'Aperçu mensuel'}
          title={`Bonjour, ${
            user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Utilisateur'
          }`}
          actions={
            <>
              <IconButton
                name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
                onPress={toggleScheme}
                size="md"
                variant="glass"
                accessibilityLabel={theme.isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
              />
              <IconButton
                name="log-out-outline"
                onPress={handleLogout}
                size="md"
                variant="glass"
                accessibilityLabel="Déconnexion"
              />
            </>
          }
        />

        {alert && (
          <Appear delay={20}>
            <GlassSurface variant="subtle" elevation="none" padding="none" style={styles.alertCard}>
              <View style={styles.alertRow}>
                <View
                  style={[
                    styles.alertIcon,
                    alert.alert ? styles.alertIconWarning : styles.alertIconOk,
                  ]}
                >
                  <Ionicons
                    name={alert.alert ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={alert.alert ? theme.colors.warning : theme.colors.income}
                  />
                </View>
                <AppText variant="bodySmall" style={styles.alertText}>
                  {alert.message}
                </AppText>
              </View>
            </GlassSurface>
          </Appear>
        )}

        {summary && (
          <Appear delay={60}>
            <BalanceHero
              currency={currency}
              balance={summary.balance}
              budget={summary.budget}
              expenses={summary.expenses}
              remaining={remaining}
              budgetRatio={budgetRatio}
            />
          </Appear>
        )}

        {summary && (
          <Appear delay={120} style={styles.statsRow}>
            <StatTile
              label="Revenus"
              value={formatMoney(summary.income, currency)}
              icon="arrow-down-circle-outline"
              tone="income"
              hint="Ce mois-ci"
            />
            <StatTile
              label="Dépenses"
              value={formatMoney(summary.expenses, currency)}
              icon="arrow-up-circle-outline"
              tone="expense"
              hint="Ce mois-ci"
            />
          </Appear>
        )}

        <Appear delay={180} style={styles.section}>
          <SectionHeader title="Actions rapides" />
          <Card padding="sm">
            <View style={styles.quickActions}>
              <QuickAction
                icon="add-circle"
                label="Dépense"
                color={theme.colors.expense}
                onPress={() => router.push('/expense/create')}
              />
              <View style={styles.quickActionDivider} />
              <QuickAction
                icon="cash"
                label="Revenu"
                color={theme.colors.income}
                onPress={() => router.push('/income/create')}
              />
              <View style={styles.quickActionDivider} />
              <QuickAction
                icon="pricetags"
                label="Catégories"
                color={theme.colors.accent}
                onPress={() => router.push('/(tabs)/categories')}
              />
            </View>
          </Card>
        </Appear>

        <Appear delay={240} style={styles.section}>
          <SectionHeader
            title="Dernières transactions"
            actionLabel="Tout voir"
            onActionPress={() => router.push('/(tabs)/expenses')}
          />

          {recentTransactions.length === 0 ? (
            <Card>
              <EmptyState
                title="Aucune transaction"
                message="Commencez par ajouter une dépense ou un revenu pour voir votre activité ici."
                iconName="receipt-outline"
              />
            </Card>
          ) : (
            <Card padding="none">
              {recentTransactions.map((tx, index) => (
                <TransactionRow
                  key={`${tx.kind}-${tx.data.id}`}
                  transaction={tx}
                  currency={currency}
                  last={index === recentTransactions.length - 1}
                />
              ))}
            </Card>
          )}
        </Appear>
      </RefreshableList>
    </Screen>
  );
}

/** "2026-11" -> "Novembre 2026" */
function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split('-');
  const date = new Date(Number(year), Number(monthIndex) - 1, 1);
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * BalanceHero — the accent gradient card that showcases the available balance.
 * White-on-accent typography with translucent wells keeps the numerals the
 * loudest element on the screen while staying WCAG-AA legible in both themes.
 */
const BalanceHero: React.FC<{
  currency: string;
  balance: number;
  budget: number;
  expenses: number;
  remaining: number;
  budgetRatio: number;
}> = ({ currency, balance, budget, expenses, remaining, budgetRatio }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const overBudget = budget > 0 && expenses > budget;
  const percent = budget > 0 ? Math.min(Math.round(budgetRatio * 100), 100) : 0;

  return (
    <View style={[styles.heroShadow, theme.shadows.accent]}>
      <LinearGradient
        colors={theme.colors.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.hero}
      >
        {/* Specular sheen: the "liquid" read of the glass. */}
        <LinearGradient
          colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0)']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroSheen}
        />
        <View style={styles.heroHairline} />

        <AppText variant="label" color="rgba(255,255,255,0.82)" uppercase>
          Solde disponible
        </AppText>
        <AppText
          variant="amountLarge"
          color={theme.colors.textOnAccent}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={styles.heroAmount}
        >
          {formatMoney(balance, currency)}
        </AppText>

        {budget > 0 ? (
          <View style={styles.heroBudget}>
            <View style={styles.heroBudgetLabels}>
              <AppText variant="caption" color={ON_ACCENT_MUTED}>
                Budget utilisé · {percent}%
              </AppText>
              <AppText variant="caption" color={ON_ACCENT_MUTED}>
                {overBudget
                  ? `Dépassé de ${formatMoney(expenses - budget, currency)}`
                  : `${formatMoney(remaining, currency)} restants`}
              </AppText>
            </View>
            <ProgressBar
              value={budgetRatio}
              height={8}
              colorOverride={['#FFFFFF', '#DCE7FF']}
              trackColor="rgba(255,255,255,0.24)"
            />
          </View>
        ) : (
          <View style={styles.heroHintRow}>
            <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.8)" />
            <AppText variant="captionSmall" color="rgba(255,255,255,0.8)" style={styles.heroHint}>
              Définissez un budget mensuel dans votre profil pour suivre votre progression.
            </AppText>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const TransactionRow: React.FC<{
  transaction: Transaction;
  currency: string;
  last: boolean;
}> = ({ transaction, currency, last }) => {
  const { theme } = useTheme();
  const isExpense = transaction.kind === 'expense';
  const data = transaction.data;
  const amount = parseFloat(data.amount);
  const date = 'date' in data && data.date ? data.date : data.creationDate;

  const title = isExpense
    ? (data as Expense).category?.name || (data as Expense).description || 'Sans catégorie'
    : (data as Income).source;

  const icon = isExpense ? getCategoryVisual(title).icon : 'cash-outline';
  const iconColor = isExpense ? getCategoryVisual(title).color : theme.colors.income;

  return (
    <ListRow
      icon={icon}
      iconColor={iconColor}
      title={title}
      subtitle={getRelativeTime(date)}
      value={`${isExpense ? '-' : '+'}${formatMoney(amount, currency)}`}
      valueTone={isExpense ? 'expense' : 'income'}
      showChevron
      last={last}
      onPress={() => router.push(isExpense ? `/expense/${data.id}` : `/income/${data.id}`)}
    />
  );
};

const QuickAction: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <PressableScale
      onPress={onPress}
      style={styles.quickAction}
      contentStyle={styles.quickActionContent}
      accessibilityLabel={label}
    >
      <View style={[styles.quickActionWell, { backgroundColor: `${color}1F` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <AppText variant="caption" tone="secondary" center numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    alertCard: {
      marginBottom: spacing.md,
    },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md - 2,
      gap: spacing.md - 4,
    },
    alertIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertIconWarning: {
      backgroundColor: theme.colors.warningSoft,
    },
    alertIconOk: {
      backgroundColor: theme.colors.incomeSoft,
    },
    alertText: {
      flex: 1,
    },
    heroShadow: {
      borderRadius: radius.xxl,
      marginTop: spacing.xs,
    },
    hero: {
      borderRadius: radius.xxl,
      padding: spacing.lg,
      overflow: 'hidden',
    },
    heroSheen: {
      pointerEvents: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '70%',
    },
    heroHairline: {
      pointerEvents: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    heroAmount: {
      marginTop: spacing.sm - 2,
      marginBottom: spacing.md,
    },
    heroBudget: {
      gap: spacing.sm,
    },
    heroBudgetLabels: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    heroHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm - 2,
      marginTop: spacing.xs,
    },
    heroHint: {
      flex: 1,
      color: 'rgba(255,255,255,0.8)',
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm + 4,
      marginTop: spacing.md,
    },
    section: {
      marginTop: spacing.lg,
    },
    quickActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickAction: {
      flex: 1,
    },
    quickActionContent: {
      alignItems: 'center',
      paddingVertical: spacing.sm + 2,
      gap: spacing.sm - 2,
    },
    quickActionWell: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      marginVertical: spacing.sm,
      backgroundColor: theme.colors.border,
    },
  });
