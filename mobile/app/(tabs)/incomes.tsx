import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useIncomes } from '@/hooks/useIncomes';
import { useAuth } from '@/hooks/useAuth';
import { Income, CreateIncomeRequest, UpdateIncomeRequest } from '@/types/api';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import {
  Appear,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  RefreshableList,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { formatMoney, formatDate, toISODateString } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme';

export default function IncomesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { incomes, loading, error, refetch, create, updateIncome, deleteIncome } = useIncomes({
    _sort: 'date:desc',
  });
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

  const total = incomes.reduce((sum, income) => sum + parseFloat(income.amount || '0'), 0);

  if (loading && incomes.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des revenus..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Revenus"
        subtitle={
          incomes.length > 0
            ? `${incomes.length} entrée${incomes.length > 1 ? 's' : ''} · ${formatMoney(total, currency)}`
            : "Enregistrez ce que vous encaissez"
        }
        actions={
          showForm ? undefined : (
            <Button title="Ajouter" onPress={handleAddIncome} variant="primary" size="sm" icon="add" pill />
          )
        }
      />

      {showForm && (
        <Appear>
          <IncomeForm
            initial={formInitial}
            submitting={submitting}
            editing={!!editingIncome}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </Appear>
      )}

      {error && incomes.length === 0 ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : incomes.length === 0 && !showForm ? (
        <EmptyState
          title="Aucun revenu"
          message="Ajoutez votre premier revenu (salaire, vente, freelance…) pour équilibrer votre budget."
          iconName="cash-outline"
          action={{ label: 'Ajouter un revenu', onPress: handleAddIncome }}
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
              caption="Les plus récents en premier"
              actionLabel="Ajouter"
              onActionPress={handleAddIncome}
            />
          )}

          {incomes.map((income, index) => (
            <Appear key={income.id} delay={Math.min(index, 6) * 30} offset={10}>
              <TransactionCard
                variant="income"
                title={income.source}
                amountLabel={formatMoney(parseFloat(income.amount), currency)}
                dateLabel={formatDate(income.date)}
                description={income.description}
                icon="cash-outline"
                iconColor={theme.colors.income}
                onPress={() => router.push(`/income/${income.id}`)}
                onEdit={() => handleEdit(income)}
                onDelete={() => handleDelete(income)}
                style={styles.card}
              />
            </Appear>
          ))}
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
