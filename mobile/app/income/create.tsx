import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { incomeService } from '@/services/income.service';
import { useIncomes } from '@/hooks/useIncomes';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { CreateIncomeRequest } from '@/types/api';
import { LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { showError } from '@/utils/notify';
import { toISODateString } from '@/utils';
import { spacing } from '@/theme';

// Create + edit screen. Edit mode is triggered by /income/create?edit=true&id=123.
export default function IncomeCreateScreen() {
  const { edit, id } = useLocalSearchParams<{ edit?: string; id?: string }>();
  const isEdit = edit === 'true' && !!id;
  const incomeId = id ? parseInt(id, 10) : undefined;

  const { create, updateIncome } = useIncomes();
  const [initial, setInitial] = useState<CreateIncomeRequest | undefined>(undefined);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadIncome = async () => {
      if (!isEdit || !incomeId) return;
      setLoading(true);
      try {
        const income = await incomeService.getIncome(incomeId);
        setInitial({
          amount: parseFloat(income.amount),
          date: income.date ? income.date.split('T')[0] : toISODateString(new Date()),
          source: income.source,
          description: income.description || '',
        });
      } catch (err: any) {
        showError(err.message || 'Impossible de charger le revenu');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadIncome();
  }, [isEdit, incomeId]);

  const handleSubmit = async (payload: CreateIncomeRequest) => {
    setSubmitting(true);
    try {
      if (isEdit && incomeId) {
        await updateIncome(incomeId, payload);
      } else {
        await create(payload);
      }
      router.back();
    } catch (err: any) {
      showError(err.message || 'Impossible de sauvegarder le revenu');
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
        <ScreenHeader
          title={isEdit ? 'Modifier le revenu' : 'Nouveau revenu'}
          subtitle={isEdit ? undefined : 'Indiquez le montant et la source du revenu'}
          onBack={() => router.back()}
        />

        {loading ? (
          <LoadingState fullScreen message="Chargement du revenu..." />
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <IncomeForm
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
