import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
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
import { formatMoney, formatDate, getRelativeTime } from '@/utils';
import { Expense, Income } from '@/types/api';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useMonthlySummary();
  const { alert, loading: alertLoading } = useAlerts();
  const { expenses, loading: expensesLoading, refetch: refetchExpenses } = useExpenses({ _limit: 5, _sort: 'date:desc' });
  const { incomes, loading: incomesLoading, refetch: refetchIncomes } = useIncomes({ _limit: 5, _sort: 'date:desc' });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchExpenses(), refetchIncomes()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleViewAllExpenses = () => router.push('/(tabs)/expenses');
  const handleViewAllIncomes = () => router.push('/(tabs)/incomes');

  const recentTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
  ]
    .sort((a, b) => new Date(b.date || b.creationDate).getTime() - new Date(a.date || a.creationDate).getTime())
    .slice(0, 5);

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
                {formatMoney(summary.balance, user?.currency || 'MGA')}
              </Heading>
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <AppText variant="caption" color={colors.success}>Revenus</AppText>
                  <AppText variant="body" color={colors.text}>
                    {formatMoney(summary.income, user?.currency || 'MGA')}
                  </AppText>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceItem}>
                  <AppText variant="caption" color={colors.error}>Dépenses</AppText>
                  <AppText variant="body" color={colors.text}>
                    {formatMoney(summary.expenses, user?.currency || 'MGA')}
                  </AppText>
                </View>
              </View>
              {summary.budget > 0 && (
                <View style={styles.budgetProgress}>
                  <View style={styles.budgetLabels}>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Budget: {formatMoney(summary.budget, user?.currency || 'MGA')}
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
                  key={tx.id}
                  transaction={tx}
                  currency={user?.currency || 'MGA'}
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
  transaction: (Expense | Income) & { type: 'expense' | 'income' };
  currency: string;
}> = ({ transaction, currency }) => {
  const isExpense = transaction.type === 'expense';
  const amount = parseFloat(transaction.amount);
  const date = transaction.date || transaction.creationDate;
  const categoryName = 'category' in transaction && transaction.category
    ? transaction.category.name
    : 'source' in transaction
    ? transaction.source
    : 'Sans catégorie';

  return (
    <View style={styles.transactionItem}>
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
    </View>
  );
};

const QuickAction: React.FC<{
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <View style={styles.quickAction}>
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
  </View>
);

const styles = {
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
};