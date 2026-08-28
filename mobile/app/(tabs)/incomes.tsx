import React, { useState } from 'react';
import { Alert, View, TouchableOpacity } from 'react-native';
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
  EmptyState,
  LoadingState,
  IconButton,
  RefreshableList,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, formatDate, toISODateString } from '@/utils';

export default function IncomesScreen() {
  const { incomes, loading, error, refetch, create, updateIncome, deleteIncome } = useIncomes({ _sort: 'date:desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState<CreateIncomeRequest>({
    amount: 0,
    date: toISODateString(new Date()),
    source: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateIncomeRequest, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      amount: 0,
      date: toISODateString(new Date()),
      source: '',
      description: '',
    });
    setFormErrors({});
    setEditingIncome(null);
    setShowForm(false);
  };

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
      if (editingIncome) {
        await updateIncome(editingIncome.id, formData as UpdateIncomeRequest);
      } else {
        await create(formData);
      }
      resetForm();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      amount: parseFloat(income.amount),
      date: income.date ? income.date.split('T')[0] : toISODateString(new Date()),
      source: income.source,
      description: income.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (income: Income) => {
    Alert.alert(
      'Supprimer le revenu',
      'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteIncome(income.id) },
      ]
    );
  };

  const handleAddIncome = () => {
    resetForm();
    setShowForm(true);
  };

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
          formData={formData}
          formErrors={formErrors}
          submitting={submitting}
          editing={!!editingIncome}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {incomes.length === 0 ? (
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </RefreshableList>
      )}
    </Screen>
  );
}

const IncomeForm: React.FC<{
  formData: CreateIncomeRequest;
  formErrors: Partial<Record<keyof CreateIncomeRequest, string>>;
  submitting: boolean;
  editing: boolean;
  onChange: (data: CreateIncomeRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({
  formData,
  formErrors,
  submitting,
  editing,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const updateField = <K extends keyof CreateIncomeRequest>(key: K, value: CreateIncomeRequest[K]) => {
    onChange({ ...formData, [key]: value });
  };

  return (
    <Card style={styles.formCard}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier le revenu' : 'Nouveau revenu'}</Heading>
        <IconButton
          icon={<Ionicons name="close" size={24} color={colors.textSecondary} />}
          onPress={onCancel}
          size="sm"
          variant="ghost"
        />
      </View>

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
        <Button title="Annuler" onPress={onCancel} variant="secondary" fullWidth />
        <Button
          title={editing ? 'Modifier' : 'Créer'}
          onPress={onSubmit}
          fullWidth
          loading={submitting}
        />
      </View>
    </Card>
  );
};

const IncomeCard: React.FC<{
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}> = ({ income, onEdit, onDelete }) => {
  const amount = parseFloat(income.amount);

  return (
    <Card style={styles.incomeCard}>
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
            +{formatMoney(amount, 'MGA')}
          </AppText>
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

      {income.description && (
        <AppText variant="caption" color={colors.textSecondary} style={styles.incomeDescription}>
          {income.description}
        </AppText>
      )}
    </Card>
  );
};

const styles = {
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
  formCard: {
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
  incomeCard: {
    marginBottom: spacing.md,
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
  incomeAmount: {
    marginBottom: spacing.sm,
  },
  incomeActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.xs,
  },
  incomeDescription: {
    marginTop: spacing.sm,
    fontStyle: 'italic' as const,
  },
};