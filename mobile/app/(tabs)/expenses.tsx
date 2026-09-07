import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/types/api';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import {
  Screen,
  Button,
  IconButton,
  Heading,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
  RefreshableList,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, formatDate } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';

export default function ExpensesScreen() {
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { expenses, loading, error, refetch, create, updateExpense, deleteExpense } = useExpenses({ _sort: 'date:desc' });
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleSubmit = async (payload: CreateExpenseRequest) => {
    setSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload as UpdateExpenseRequest);
      } else {
        await create(payload);
      }
      resetForm();
    } catch (err: any) {
      showError(err.message || 'Impossible de sauvegarder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expense: Expense) => {
    const confirmed = await confirmDialog({
      title: 'Supprimer la dépense',
      message: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteExpense(expense.id);
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer');
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  // Keep the list current when coming back from create/detail screens.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Pre-filled values for the shared form: undefined => blank defaults.
  const formInitial: CreateExpenseRequest | undefined = editingExpense
    ? {
        amount: parseFloat(editingExpense.amount),
        date: editingExpense.date ? editingExpense.date.split('T')[0] : undefined,
        categoryId: editingExpense.categoryId,
        description: editingExpense.description || '',
        type: editingExpense.type,
        startDate: editingExpense.startDate ? editingExpense.startDate.split('T')[0] : undefined,
        endDate: editingExpense.endDate ? editingExpense.endDate.split('T')[0] : undefined,
      }
    : undefined;

  if (loading && expenses.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des dépenses..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading level={2}>Dépenses</Heading>
        <Button title="Ajouter" onPress={handleAddExpense} variant="primary" size="sm" />
      </View>

      {showForm && (
        <ExpenseForm
          categories={categories}
          initial={formInitial}
          submitting={submitting}
          editing={!!editingExpense}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {error && expenses.length === 0 ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : expenses.length === 0 && !showForm ? (
        <EmptyState
          title="Aucune dépense"
          message="Commencez par ajouter votre première dépense"
          icon={<Ionicons name="receipt-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Ajouter une dépense', onPress: handleAddExpense }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
        >
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currency={currency}
              onPress={() => router.push(`/expense/${expense.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </RefreshableList>
      )}
    </Screen>
  );
}

const ExpenseCard: React.FC<{
  expense: Expense;
  currency: string;
  onPress: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}> = ({ expense, currency, onPress, onEdit, onDelete }) => {
  const amount = parseFloat(expense.amount);
  const isRecurring = expense.type === 'RECURRING';

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseMain}>
            <AppText variant="body" color={colors.text} style={styles.expenseTitle}>
              {expense.category?.name || expense.description || 'Sans catégorie'}
            </AppText>
            <View style={styles.expenseMeta}>
              <AppText variant="caption" color={colors.textMuted}>
                {formatDate(expense.date || expense.creationDate)}
              </AppText>
              {isRecurring && (
                <View style={styles.recurringBadge}>
                  <AppText variant="caption" color={colors.primary} style={styles.badgeText}>
                    Récurrente
                  </AppText>
                </View>
              )}
            </View>
          </View>
          <View style={styles.expenseActions}>
            <AppText variant="h4" color={colors.error} style={styles.expenseAmount}>
              -{formatMoney(amount, currency)}
            </AppText>
          </View>
        </View>

        {expense.description && (
          <AppText variant="caption" color={colors.textSecondary} style={styles.expenseDescription}>
            {expense.description}
          </AppText>
        )}
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <Button
          title="Détails"
          onPress={onPress}
          variant="secondary"
          size="sm"
          style={styles.cardButton}
        />
        <IconButton
          icon={<Ionicons name="create-outline" size={20} color={colors.textSecondary} />}
          onPress={() => onEdit(expense)}
          size="sm"
          variant="ghost"
          accessibilityLabel="Modifier"
        />
        <IconButton
          icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
          onPress={() => onDelete(expense)}
          size="sm"
          variant="ghost"
          accessibilityLabel="Supprimer"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  expenseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseMain: {
    flex: 1,
  },
  expenseTitle: {
    marginBottom: spacing.xs,
  },
  expenseMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurringBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontWeight: '600' as const,
  },
  expenseActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.xs,
  },
  expenseAmount: {
    marginBottom: spacing.sm,
  },
  expenseDescription: {
    marginTop: spacing.sm,
    fontStyle: 'italic' as const,
  },
  cardActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardButton: {},
});
