import React, { useState, useEffect } from 'react';
import { Alert, View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseType } from '@/types/api';
import {
  Screen,
  Card,
  Button,
  Input,
  Heading,
  AppText,
  LoadingState,
  EmptyState,
  IconButton,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, formatDate, toISODateString } from '@/utils';

export default function ExpenseCreateScreen() {
  const { create } = useExpenses();
  const { categories } = useCategories();
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    amount: 0,
    date: toISODateString(new Date()),
    categoryId: undefined,
    description: '',
    type: 'ONE_TIME',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateExpenseRequest, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Partial<Record<keyof CreateExpenseRequest, string>> = {};
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Le montant doit être positif';
    }
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    if (formData.type === 'RECURRING' && !formData.startDate) {
      errors.startDate = 'Date de début requise pour dépense récurrente';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await create(formData);
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de créer la dépense');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof CreateExpenseRequest>(key: K, value: CreateExpenseRequest[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color={colors.text} />}
          onPress={() => router.back()}
          size="md"
          variant="ghost"
        />
        <Heading level={2}>Nouvelle dépense</Heading>
        <View style={{ width: 44 }} />
      </View>

      <Card style={styles.formCard}>
        <Input
          label="Montant *"
          value={String(formData.amount)}
          onChangeText={(v) => updateField('amount', parseFloat(v) || 0)}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={formErrors.amount}
          style={styles.input}
        />

        <Input
          label="Date *"
          value={formData.date || ''}
          onChangeText={(v) => updateField('date', v)}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
          error={formErrors.date}
          style={styles.input}
        />

        <Input
          label="Catégorie"
          value={categories.find(c => c.id === formData.categoryId)?.name || ''}
          onChangeText={() => {}}
          placeholder="Sélectionner une catégorie"
          editable={false}
          style={styles.input}
          rightIcon={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(v) => updateField('description', v)}
          placeholder="Optionnel"
          style={styles.input}
        />

        <View style={styles.typeSelector}>
          <AppText variant="bodySmall" color={colors.textSecondary} style={styles.typeLabel}>
            Type
          </AppText>
          <View style={styles.typeButtons}>
            {(['ONE_TIME', 'RECURRING'] as ExpenseType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateField('type', type)}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
              >
                <AppText
                  variant="bodySmall"
                  color={formData.type === type ? colors.white : colors.textSecondary}
                >
                  {type === 'ONE_TIME' ? 'Ponctuelle' : 'Récurrente'}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {formData.type === 'RECURRING' && (
          <>
            <Input
              label="Date de début *"
              value={formData.startDate || ''}
              onChangeText={(v) => updateField('startDate', v)}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              error={formErrors.startDate}
              style={styles.input}
            />
            <Input
              label="Date de fin (optionnel)"
              value={formData.endDate || ''}
              onChangeText={(v) => updateField('endDate', v)}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        )}

        <View style={styles.formActions}>
          <Button title="Annuler" onPress={() => router.back()} variant="secondary" fullWidth />
          <Button title="Créer" onPress={handleSubmit} fullWidth loading={submitting} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  formCard: {},
  input: {
    marginBottom: spacing.md,
  },
  typeSelector: {
    marginBottom: spacing.md,
  },
  typeLabel: {
    marginBottom: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center' as const,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
};