import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useIncomes } from '@/hooks/useIncomes';
import { Income, CreateIncomeRequest, UpdateIncomeRequest } from '@/types/api';
import {
  Screen,
  Card,
  Button,
  Input,
  Heading,
  AppText,
  LoadingState,
  IconButton,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, formatDate, toISODateString } from '@/utils';

export default function IncomeCreateScreen() {
  const { create } = useIncomes();
  const [formData, setFormData] = useState<CreateIncomeRequest>({
    amount: 0,
    date: toISODateString(new Date()),
    source: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateIncomeRequest, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Partial<Record<keyof CreateIncomeRequest, string>> = {};
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Le montant doit être positif';
    }
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    if (!formData.source || !formData.source.trim()) {
      errors.source = 'La source est requise';
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
      Alert.alert('Erreur', err.message || 'Impossible de créer le revenu');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof CreateIncomeRequest>(key: K, value: CreateIncomeRequest[K]) => {
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
        <Heading level={2}>Nouveau revenu</Heading>
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
          label="Source *"
          value={formData.source}
          onChangeText={(v) => updateField('source', v)}
          placeholder="Ex: Salaire, Freelance, Vente..."
          error={formErrors.source}
          style={styles.input}
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(v) => updateField('description', v)}
          placeholder="Optionnel"
          style={styles.input}
        />

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
  formActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
};