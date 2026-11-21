import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Card,
  Heading,
  IconButton,
  Input,
  SegmentedControl,
  SelectField,
  AppText,
  type SegmentedOption,
} from '@/components/ui';
import { toISODateString, isValidDateString } from '@/utils';
import { Category, CreateExpenseRequest, ExpenseType } from '@/types/api';
import { radius, spacing, useTheme } from '@/theme';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_FORM: CreateExpenseRequest = {
  amount: 0,
  date: toISODateString(new Date()),
  categoryId: undefined,
  description: '',
  type: 'ONE_TIME',
};

const TYPE_OPTIONS: readonly SegmentedOption<ExpenseType>[] = [
  { label: 'Ponctuelle', value: 'ONE_TIME', icon: 'flash-outline' },
  { label: 'Récurrente', value: 'RECURRING', icon: 'repeat-outline' },
];

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
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CreateExpenseRequest>(initial ?? DEFAULT_FORM);
  const [amountText, setAmountText] = useState(initial?.amount ? String(initial.amount) : '');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const initialKey = JSON.stringify(initial ?? null);
  useEffect(() => {
    if (initial) {
      setFormData(initial);
      setAmountText(initial.amount ? String(initial.amount) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const updateField = <K extends keyof CreateExpenseRequest>(
    key: K,
    value: CreateExpenseRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      if (
        !formData.startDate ||
        !ISO_DATE_PATTERN.test(formData.startDate) ||
        !isValidDateString(formData.startDate)
      ) {
        next.startDate = 'Date de début requise (AAAA-MM-JJ)';
      }
      if (
        formData.endDate &&
        (!ISO_DATE_PATTERN.test(formData.endDate) || !isValidDateString(formData.endDate))
      ) {
        next.endDate = 'Date de fin invalide (AAAA-MM-JJ)';
      } else if (
        formData.endDate &&
        formData.startDate &&
        formData.endDate <= formData.startDate
      ) {
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
    <Card padding="lg" style={styles.card}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier la dépense' : 'Nouvelle dépense'}</Heading>
        <IconButton
          name="close"
          onPress={onCancel}
          size="sm"
          variant="glass"
          accessibilityLabel="Fermer"
        />
      </View>

      {/* Amount is the primary field: larger, with the currency symbol shown. */}
      <Input
        label="Montant"
        value={amountText}
        onChangeText={setAmountText}
        placeholder="0"
        keyboardType="decimal-pad"
        error={errors.amount}
        inputStyle={styles.amountInput}
        leftIcon={<Ionicons name="cash-outline" size={18} color={theme.colors.textMuted} />}
        style={styles.input}
      />

      <Input
        label="Date"
        value={formData.date || ''}
        onChangeText={(v) => updateField('date', v)}
        placeholder="AAAA-MM-JJ"
        error={errors.date}
        helperText="Format AAAA-MM-JJ (ex : 2026-01-31)"
        leftIcon={<Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />}
        style={styles.input}
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
        leftIcon={<Ionicons name="text-outline" size={18} color={theme.colors.textMuted} />}
        style={styles.input}
      />

      <View style={styles.typeBlock}>
        <AppText variant="bodySmall" tone="secondary" style={styles.typeLabel}>
          Type de dépense
        </AppText>
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={formData.type ?? 'ONE_TIME'}
          onChange={(type) => updateField('type', type)}
        />
      </View>

      {formData.type === 'RECURRING' && (
        <View style={styles.recurringBlock}>
          <AppText variant="caption" tone="muted" style={styles.recurringHint}>
            Une occurrence est créée chaque mois entre ces deux dates.
          </AppText>
          <Input
            label="Date de début"
            value={formData.startDate || ''}
            onChangeText={(v) => updateField('startDate', v)}
            placeholder="AAAA-MM-JJ"
            error={errors.startDate}
            leftIcon={<Ionicons name="play-outline" size={18} color={theme.colors.textMuted} />}
            style={styles.input}
          />
          <Input
            label="Date de fin (optionnel)"
            value={formData.endDate || ''}
            onChangeText={(v) => updateField('endDate', v)}
            placeholder="AAAA-MM-JJ"
            error={errors.endDate}
            leftIcon={<Ionicons name="stop-outline" size={18} color={theme.colors.textMuted} />}
            style={styles.input}
          />
        </View>
      )}

      <View style={styles.formActions}>
        <Button title="Annuler" onPress={onCancel} variant="secondary" fullWidth />
        <Button
          title={submitLabel ?? (editing ? 'Modifier' : 'Créer')}
          onPress={handleSubmit}
          fullWidth
          loading={submitting}
          icon={editing ? 'checkmark' : 'add'}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
  },
  typeBlock: {
    marginBottom: spacing.md,
  },
  typeLabel: {
    marginBottom: spacing.sm,
  },
  recurringBlock: {
    marginBottom: spacing.sm,
  },
  recurringHint: {
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
