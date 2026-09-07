import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Button, Input, SelectField, Heading, AppText, IconButton, colors, spacing, borderRadius } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { toISODateString, isValidDateString } from '@/utils';
import { Category, CreateExpenseRequest, ExpenseType } from '@/types/api';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_FORM: CreateExpenseRequest = {
  amount: 0,
  date: toISODateString(new Date()),
  categoryId: undefined,
  description: '',
  type: 'ONE_TIME',
};

interface ExpenseFormProps {
  categories: Category[];
  // Pre-filled values (edit mode). Synced whenever its serialized content changes.
  initial?: CreateExpenseRequest;
  submitting: boolean;
  editing?: boolean;
  submitLabel?: string;
  onSubmit: (payload: CreateExpenseRequest) => void;
  onCancel: () => void;
}

// Shared expense form used by both the expenses tab (inline card) and the
// /expense/create screen (create + edit).
export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  categories,
  initial,
  submitting,
  editing = false,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateExpenseRequest>(initial ?? DEFAULT_FORM);
  const [amountText, setAmountText] = useState(
    initial?.amount ? String(initial.amount) : ''
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const initialKey = JSON.stringify(initial ?? null);
  useEffect(() => {
    if (initial) {
      setFormData(initial);
      setAmountText(initial.amount ? String(initial.amount) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const updateField = <K extends keyof CreateExpenseRequest>(key: K, value: CreateExpenseRequest[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Partial<Record<string, string>> = {};
    const amount = parseFloat(amountText.replace(',', '.'));
    if (!amount || amount <= 0) {
      next.amount = 'Le montant doit être positif';
    }
    if (!formData.date || !ISO_DATE_PATTERN.test(formData.date) || !isValidDateString(formData.date)) {
      next.date = 'Date attendue au format AAAA-MM-JJ';
    }
    if (formData.type === 'RECURRING') {
      if (!formData.startDate || !ISO_DATE_PATTERN.test(formData.startDate) || !isValidDateString(formData.startDate)) {
        next.startDate = 'Date de début requise (AAAA-MM-JJ)';
      }
      if (formData.endDate && (!ISO_DATE_PATTERN.test(formData.endDate) || !isValidDateString(formData.endDate))) {
        next.endDate = 'Date de fin invalide (AAAA-MM-JJ)';
      } else if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
        next.endDate = 'La date de fin doit être postérieure à la date de début';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: parseFloat(amountText.replace(',', '.')),
      description: formData.description?.trim() || undefined,
    });
  };

  const categoryOptions = [
    { label: 'Sans catégorie', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier la dépense' : 'Nouvelle dépense'}</Heading>
        <IconButton
          icon={<Ionicons name="close" size={24} color={colors.textSecondary} />}
          onPress={onCancel}
          size="sm"
          variant="ghost"
          accessibilityLabel="Fermer"
        />
      </View>

      <Input
        label="Montant *"
        value={amountText}
        onChangeText={setAmountText}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.amount}
        style={styles.input}
      />

      <Input
        label="Date *"
        value={formData.date || ''}
        onChangeText={(v) => updateField('date', v)}
        placeholder="AAAA-MM-JJ (ex : 2026-01-31)"
        error={errors.date}
        style={styles.input}
        helperText="Format AAAA-MM-JJ"
      />

      <SelectField
        label="Catégorie"
        value={formData.categoryId ? String(formData.categoryId) : ''}
        options={categoryOptions}
        onSelect={(value) => updateField('categoryId', value ? parseInt(value, 10) : undefined)}
        placeholder="Sélectionner une catégorie"
        style={styles.input}
      />

      <Input
        label="Description"
        value={formData.description || ''}
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
              style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
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
            placeholder="AAAA-MM-JJ"
            error={errors.startDate}
            style={styles.input}
            helperText="Une occurrence sera créée chaque mois"
          />
          <Input
            label="Date de fin (optionnel)"
            value={formData.endDate || ''}
            onChangeText={(v) => updateField('endDate', v)}
            placeholder="AAAA-MM-JJ"
            error={errors.endDate}
            style={styles.input}
          />
        </>
      )}

      <View style={styles.formActions}>
        <Button title="Annuler" onPress={onCancel} variant="secondary" fullWidth />
        <Button
          title={submitLabel ?? (editing ? 'Modifier' : 'Créer')}
          onPress={handleSubmit}
          fullWidth
          loading={submitting}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
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
});
