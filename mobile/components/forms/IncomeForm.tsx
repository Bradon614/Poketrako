import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Heading, IconButton, Input } from '@/components/ui';
import { toISODateString, isValidDateString } from '@/utils';
import { CreateIncomeRequest } from '@/types/api';
import { radius, spacing, useTheme } from '@/theme';

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
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CreateIncomeRequest>(initial ?? DEFAULT_FORM);
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

  const updateField = <K extends keyof CreateIncomeRequest>(
    key: K,
    value: CreateIncomeRequest[K]
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
    <Card padding="lg" style={styles.card}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier le revenu' : 'Nouveau revenu'}</Heading>
        <IconButton
          name="close"
          onPress={onCancel}
          size="sm"
          variant="glass"
          accessibilityLabel="Fermer"
        />
      </View>

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

      <Input
        label="Source"
        value={formData.source}
        onChangeText={(v) => updateField('source', v)}
        placeholder="Ex : Salaire, Freelance, Vente…"
        error={errors.source}
        leftIcon={<Ionicons name="briefcase-outline" size={18} color={theme.colors.textMuted} />}
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
