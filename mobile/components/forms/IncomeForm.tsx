import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Input, Heading, IconButton, colors, spacing } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { toISODateString, isValidDateString } from '@/utils';
import { CreateIncomeRequest } from '@/types/api';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_FORM: CreateIncomeRequest = {
  amount: 0,
  date: toISODateString(new Date()),
  source: '',
  description: '',
};

interface IncomeFormProps {
  // Pre-filled values (edit mode). Synced whenever its serialized content changes.
  initial?: CreateIncomeRequest;
  submitting: boolean;
  editing?: boolean;
  submitLabel?: string;
  onSubmit: (payload: CreateIncomeRequest) => void;
  onCancel: () => void;
}

// Shared income form used by both the incomes tab (inline card) and the
// /income/create screen (create + edit).
export const IncomeForm: React.FC<IncomeFormProps> = ({
  initial,
  submitting,
  editing = false,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateIncomeRequest>(initial ?? DEFAULT_FORM);
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

  const updateField = <K extends keyof CreateIncomeRequest>(key: K, value: CreateIncomeRequest[K]) => {
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
    if (!formData.source || !formData.source.trim()) {
      next.source = 'La source est requise';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      amount: parseFloat(amountText.replace(',', '.')),
      date: formData.date!,
      source: formData.source.trim(),
      description: formData.description?.trim() || undefined,
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier le revenu' : 'Nouveau revenu'}</Heading>
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

      <Input
        label="Source *"
        value={formData.source}
        onChangeText={(v) => updateField('source', v)}
        placeholder="Ex: Salaire, Freelance, Vente..."
        error={errors.source}
        style={styles.input}
      />

      <Input
        label="Description"
        value={formData.description || ''}
        onChangeText={(v) => updateField('description', v)}
        placeholder="Optionnel"
        style={styles.input}
      />

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
  formActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
