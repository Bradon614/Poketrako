import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { expenseService } from '@/services/expense.service';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { CreateExpenseRequest } from '@/types/api';
import { Screen, Heading, LoadingState, IconButton, colors, spacing } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { showError } from '@/utils/notify';

// Create + edit screen. Edit mode is triggered by /expense/create?edit=true&id=123.
export default function ExpenseCreateScreen() {
  const { edit, id } = useLocalSearchParams<{ edit?: string; id?: string }>();
  const isEdit = edit === 'true' && !!id;
  const expenseId = id ? parseInt(id, 10) : undefined;

  const { create, updateExpense } = useExpenses();
  const { categories } = useCategories();
  const [initial, setInitial] = useState<CreateExpenseRequest | undefined>(undefined);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      if (!isEdit || !expenseId) return;
      setLoading(true);
      try {
        const expense = await expenseService.getExpense(expenseId);
        setInitial({
          amount: parseFloat(expense.amount),
          date: expense.date ? expense.date.split('T')[0] : undefined,
          categoryId: expense.categoryId,
          description: expense.description || '',
          type: expense.type,
          startDate: expense.startDate ? expense.startDate.split('T')[0] : undefined,
          endDate: expense.endDate ? expense.endDate.split('T')[0] : undefined,
        });
      } catch (err: any) {
        showError(err.message || 'Impossible de charger la dépense');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadExpense();
  }, [isEdit, expenseId]);

  const handleSubmit = async (payload: CreateExpenseRequest) => {
    setSubmitting(true);
    try {
      if (isEdit && expenseId) {
        await updateExpense(expenseId, payload);
      } else {
        await create(payload);
      }
      router.back();
    } catch (err: any) {
      showError(err.message || 'Impossible de sauvegarder la dépense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <IconButton
            icon={<Ionicons name="chevron-back" size={24} color={colors.text} />}
            onPress={() => router.back()}
            size="md"
            variant="ghost"
          />
          <Heading level={2}>{isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}</Heading>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <LoadingState fullScreen message="Chargement de la dépense..." />
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ExpenseForm
              categories={categories}
              initial={initial}
              submitting={submitting}
              editing={isEdit}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
