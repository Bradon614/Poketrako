import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlySummary, useAlerts } from '@/hooks/useSummary';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import {
  Screen,
  Card,
  Button,
  Heading,
  AppText,
  LoadingState,
  EmptyState,
  RefreshableList,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, getRelativeTime } from '@/utils';
import { Expense, Income } from '@/types/api';
import { confirmDialog } from '@/utils/notify';

type Transaction = { kind: 'expense'; data: Expense } | { kind: 'income'; data: Income };

const DASHBOARD_LIST_SIZE = 5;

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const currency = user?.currency || 'MGA';
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useMonthlySummary();
  const { alert } = useAlerts();
  const { expenses, loading: expensesLoading, refetch: refetchExpenses } = useExpenses({ _limit: DASHBOARD_LIST_SIZE, _sort: 'date:desc' });
  const { incomes, loading: incomesLoading, refetch: refetchIncomes } = useIncomes({ _limit: DASHBOARD_LIST_SIZE, _sort: 'date:desc' });
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

  const handleViewAllExpenses = () => router.push('/(tabs)/expenses');

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

  return (
    <Screen>
      <RefreshableList
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Heading level={2}>Bonjour, {user?.fullName || user?.email?.split('@')[0] || 'Utilisateur'}</Heading>
            <AppText variant="caption" color={colors.textMuted}>
              {summary?.month ? `Mois de ${summary.month}` : 'Aperçu mensuel'}
            </AppText>
          </View>
          <Button
            title="Déconnexion"
            onPress={handleLogout}
            variant="ghost"
            size="sm"
            style={styles.logoutButton}
          />
        </View>

        {alert && (
          <Card style={styles.alertCard}>
            <View style={styles.alertRow}>
              <Ionicons
                name={alert.alert ? 'alert-circle' : 'checkmark-circle'}
                size={20}
                color={alert.alert ? colors.warning : colors.success}
              />
              <AppText variant="bodySmall" color={colors.text} style={styles.alertText}>
                {alert.message}
              </AppText>
            </View>
          </Card>
        )}

        {summary && (
          <View style={styles.balanceSection}>
            <View style={styles.balanceCard}>
              <AppText variant="caption" color={colors.textSecondary}>Solde actuel</AppText>
              <Heading level={1} style={styles.balanceAmount}>
                {formatMoney(summary.balance, currency)}
              </Heading>
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <AppText variant="caption" color={colors.success}>Revenus</AppText>
                  <AppText variant="body" color={colors.text}>
                    {formatMoney(summary.income, currency)}
                  </AppText>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceItem}>
                  <AppText variant="caption" color={colors.error}>Dépenses</AppText>
                  <AppText variant="body" color={colors.text}>
                    {formatMoney(summary.expenses, currency)}
                  </AppText>
                </View>
              </View>
              {summary.budget > 0 && (
                <View style={styles.budgetProgress}>
                  <View style={styles.budgetLabels}>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Budget: {formatMoney(summary.budget, currency)}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {Math.min(Math.round((summary.expenses / summary.budget) * 100), 100)}%
                    </AppText>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((summary.expenses / summary.budget) * 100, 100)}%`,
                          backgroundColor: summary.expenses > summary.budget ? colors.error : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heading level={3}>Dernières transactions</Heading>
            <Button title="Tout voir" onPress={handleViewAllExpenses} variant="ghost" size="sm" />
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Aucune transaction"
              message="Commencez par ajouter une dépense ou un revenu"
              icon={<Ionicons name="receipt-outline" size={48} color={colors.textMuted} />}
            />
          ) : (
            <View style={styles.transactionList}>
              {recentTransactions.map((tx) => (
                <TransactionItem
                  key={`${tx.kind}-${tx.data.id}`}
                  transaction={tx}
                  currency={currency}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heading level={3}>Actions rapides</Heading>
          </View>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle"
              label="Dépense"
              color={colors.error}
              onPress={() => router.push('/expense/create')}
            />
            <QuickAction
              icon="cash"
              label="Revenu"
              color={colors.success}
              onPress={() => router.push('/income/create')}
            />
            <QuickAction
              icon="pricetags"
              label="Catégories"
              color={colors.primary}
              onPress={() => router.push('/(tabs)/categories')}
            />
          </View>
        </View>
      </RefreshableList>
    </Screen>
  );
}

const TransactionItem: React.FC<{
  transaction: Transaction;
  currency: string;
}> = ({ transaction, currency }) => {
  const isExpense = transaction.kind === 'expense';
  const data = transaction.data;
  const amount = parseFloat(data.amount);
  const date = 'date' in data && data.date ? data.date : data.creationDate;
  const categoryName =
    transaction.kind === 'expense'
      ? transaction.data.category?.name || transaction.data.description || 'Sans catégorie'
      : transaction.data.source;

  const openDetail = () =>
    router.push(isExpense ? `/expense/${data.id}` : `/income/${data.id}`);

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={openDetail} activeOpacity={0.7}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: isExpense ? colors.error + '15' : colors.success + '15' },
        ]}
      >
        <Ionicons
          name={isExpense ? 'remove-circle' : 'add-circle'}
          size={20}
          color={isExpense ? colors.error : colors.success}
        />
      </View>
      <View style={styles.transactionInfo}>
        <AppText variant="body" color={colors.text} style={styles.transactionTitle}>
          {categoryName}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.transactionDate}>
          {getRelativeTime(date)}
        </AppText>
      </View>
      <AppText
        variant="body"
        color={isExpense ? colors.error : colors.success}
        style={styles.transactionAmount}
      >
        {isExpense ? '-' : '+'}{formatMoney(amount, currency)}
      </AppText>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const QuickAction: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View
      style={[
        styles.quickActionIcon,
        { backgroundColor: color + '15' },
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <AppText variant="bodySmall" color={colors.text} center style={styles.quickActionLabel}>
      {label}
    </AppText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  logoutButton: {
    marginLeft: spacing.sm,
  },
  alertCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '50',
  },
  alertRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertText: {
    flex: 1,
  },
  balanceSection: {
    marginBottom: spacing.lg,
  },
  balanceCard: {
    padding: spacing.lg,
  },
  balanceAmount: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  balanceDetails: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  budgetProgress: {
    marginTop: spacing.lg,
  },
  budgetLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  transactionList: {
    gap: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    marginBottom: 2,
  },
  transactionDate: {
    marginBottom: 0,
  },
  transactionAmount: {
    fontWeight: '600' as const,
  },
  quickActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  quickActionLabel: {
    marginTop: 0,
  },
});
