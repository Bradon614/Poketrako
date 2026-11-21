import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/types/api';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import {
  Appear,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  RefreshableList,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { formatMoney, formatDate, getCategoryVisual } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';
import { radius, spacing } from '@/theme';

export default function ExpensesScreen() {
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { expenses, loading, error, refetch, create, updateExpense, deleteExpense } = useExpenses({
    _sort: 'date:desc',
  });
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

  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

  if (loading && expenses.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des dépenses..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Dépenses"
        subtitle={
          expenses.length > 0
            ? `${expenses.length} opération${expenses.length > 1 ? 's' : ''} · ${formatMoney(total, currency)}`
            : 'Suivez où part votre argent'
        }
        actions={
          showForm ? undefined : (
            <Button title="Ajouter" onPress={handleAddExpense} variant="primary" size="sm" icon="add" pill />
          )
        }
      />

      {showForm && (
        <Appear>
          <ExpenseForm
            categories={categories}
            initial={formInitial}
            submitting={submitting}
            editing={!!editingExpense}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </Appear>
      )}

      {error && expenses.length === 0 ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : expenses.length === 0 && !showForm ? (
        <EmptyState
          title="Aucune dépense"
          message="Commencez par ajouter votre première dépense pour suivre où part votre argent."
          iconName="receipt-outline"
          action={{ label: 'Ajouter une dépense', onPress: handleAddExpense }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          style={styles.list}
          tabBarSpace
          contentContainerStyle={styles.listContent}
        >
          {!showForm && (
            <SectionHeader
              title="Historique"
              caption="Les plus récentes en premier"
              actionLabel="Ajouter"
              onActionPress={handleAddExpense}
            />
          )}

          {expenses.map((expense, index) => {
            const title = expense.category?.name || expense.description || 'Sans catégorie';
            const visual = getCategoryVisual(expense.category?.name || expense.description);
            return (
              <Appear key={expense.id} delay={Math.min(index, 6) * 30} offset={10}>
                <TransactionCard
                  variant="expense"
                  title={title}
                  amountLabel={formatMoney(parseFloat(expense.amount), currency)}
                  dateLabel={formatDate(expense.date || expense.creationDate)}
                  description={expense.description && expense.category ? expense.description : undefined}
                  icon={visual.icon}
                  iconColor={visual.color}
                  badge={
                    expense.type === 'RECURRING' ? (
                      <Chip label="Récurrente" icon="repeat" tone="accent" />
                    ) : undefined
                  }
                  onPress={() => router.push(`/expense/${expense.id}`)}
                  onEdit={() => handleEdit(expense)}
                  onDelete={() => handleDelete(expense)}
                  style={styles.card}
                />
              </Appear>
            );
          })}
        </RefreshableList>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md - 4,
    paddingTop: spacing.xxs,
  },
  card: {
    borderRadius: radius.xl,
  },
});
