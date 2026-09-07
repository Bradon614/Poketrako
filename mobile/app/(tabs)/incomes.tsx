import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useIncomes } from '@/hooks/useIncomes';
import { useAuth } from '@/hooks/useAuth';
import { Income, CreateIncomeRequest, UpdateIncomeRequest } from '@/types/api';
import { IncomeForm } from '@/components/forms/IncomeForm';
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
import { formatMoney, formatDate, toISODateString } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';

export default function IncomesScreen() {
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { incomes, loading, error, refetch, create, updateIncome, deleteIncome } = useIncomes({ _sort: 'date:desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingIncome(null);
    setShowForm(false);
  };

  const handleSubmit = async (payload: CreateIncomeRequest) => {
    setSubmitting(true);
    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, payload as UpdateIncomeRequest);
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

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleDelete = async (income: Income) => {
    const confirmed = await confirmDialog({
      title: 'Supprimer le revenu',
      message: 'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteIncome(income.id);
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer');
    }
  };

  const handleAddIncome = () => {
    setEditingIncome(null);
    setShowForm(true);
  };

  // Keep the list current when coming back from create/detail screens.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Pre-filled values for the shared form: undefined => blank defaults.
  const formInitial: CreateIncomeRequest | undefined = editingIncome
    ? {
        amount: parseFloat(editingIncome.amount),
        date: editingIncome.date ? editingIncome.date.split('T')[0] : toISODateString(new Date()),
        source: editingIncome.source,
        description: editingIncome.description || '',
      }
    : undefined;

  if (loading && incomes.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des revenus..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading level={2}>Revenus</Heading>
        <Button title="Ajouter" onPress={handleAddIncome} variant="primary" size="sm" />
      </View>

      {showForm && (
        <IncomeForm
          initial={formInitial}
          submitting={submitting}
          editing={!!editingIncome}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {error && incomes.length === 0 ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : incomes.length === 0 && !showForm ? (
        <EmptyState
          title="Aucun revenu"
          message="Commencez par ajouter votre premier revenu"
          icon={<Ionicons name="cash-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Ajouter un revenu', onPress: handleAddIncome }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
        >
          {incomes.map((income) => (
            <IncomeCard
              key={income.id}
              income={income}
              currency={currency}
              onPress={() => router.push(`/income/${income.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </RefreshableList>
      )}
    </Screen>
  );
}

const IncomeCard: React.FC<{
  income: Income;
  currency: string;
  onPress: () => void;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}> = ({ income, currency, onPress, onEdit, onDelete }) => {
  const amount = parseFloat(income.amount);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.incomeHeader}>
          <View style={styles.incomeMain}>
            <AppText variant="body" color={colors.text} style={styles.incomeTitle}>
              {income.source}
            </AppText>
            <View style={styles.incomeMeta}>
              <AppText variant="caption" color={colors.textMuted}>
                {formatDate(income.date)}
              </AppText>
            </View>
          </View>
          <View style={styles.incomeActions}>
            <AppText variant="h4" color={colors.success} style={styles.incomeAmount}>
              +{formatMoney(amount, currency)}
            </AppText>
          </View>
        </View>

        {income.description && (
          <AppText variant="caption" color={colors.textSecondary} style={styles.incomeDescription}>
            {income.description}
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
          onPress={() => onEdit(income)}
          size="sm"
          variant="ghost"
          accessibilityLabel="Modifier"
        />
        <IconButton
          icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
          onPress={() => onDelete(income)}
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
  incomeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  incomeMain: {
    flex: 1,
  },
  incomeTitle: {
    marginBottom: spacing.xs,
  },
  incomeMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.sm,
  },
  incomeActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.xs,
  },
  incomeAmount: {
    marginBottom: spacing.sm,
  },
  incomeDescription: {
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
