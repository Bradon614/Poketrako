import React, { useState, useEffect } from 'react';
import { Alert, Platform, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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

export default function ExpensesScreen() {
  const { expenses, loading, error, refetch, create, updateExpense, deleteExpense } = useExpenses({ _sort: 'date:desc' });
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    amount: 0,
    date: toISODateString(new Date()),
    categoryId: undefined,
    description: '',
    type: 'ONE_TIME',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateExpenseRequest, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      amount: 0,
      date: toISODateString(new Date()),
      categoryId: undefined,
      description: '',
      type: 'ONE_TIME',
    });
    setFormErrors({});
    setEditingExpense(null);
    setShowForm(false);
  };

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
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData as UpdateExpenseRequest);
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

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: parseFloat(expense.amount),
      date: expense.date ? expense.date.split('T')[0] : toISODateString(new Date()),
      categoryId: expense.categoryId,
      description: expense.description || '',
      type: expense.type,
      startDate: expense.startDate ? expense.startDate.split('T')[0] : undefined,
      endDate: expense.endDate ? expense.endDate.split('T')[0] : undefined,
    });
    setShowForm(true);
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Supprimer la dépense',
      'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteExpense(expense.id) },
      ]
    );
  };

  const handleAddExpense = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading && expenses.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des dépenses..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading level={2}>Dépenses</Heading>
        <Button title="Ajouter" onPress={handleAddExpense} variant="primary" size="sm" />
      </View>

      {showForm && (
        <ExpenseForm
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          submitting={submitting}
          editing={!!editingExpense}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {expenses.length === 0 ? (
        <EmptyState
          title="Aucune dépense"
          message="Commencez par ajouter votre première dépense"
          icon={<Ionicons name="receipt-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Ajouter une dépense', onPress: handleAddExpense }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
        >
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </RefreshableList>
      )}
    </Screen>
  );
}

const ExpenseForm: React.FC<{
  formData: CreateExpenseRequest;
  formErrors: Partial<Record<keyof CreateExpenseRequest, string>>;
  categories: { id: number; name: string }[];
  submitting: boolean;
  editing: boolean;
  onChange: (data: CreateExpenseRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({
  formData,
  formErrors,
  categories,
  submitting,
  editing,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const updateField = <K extends keyof CreateExpenseRequest>(key: K, value: CreateExpenseRequest[K]) => {
    onChange({ ...formData, [key]: value });
  };

  return (
    <Card style={styles.formCard}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier la dépense' : 'Nouvelle dépense'}</Heading>
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
        label="Catégorie"
        value={categories.find(c => c.id === formData.categoryId)?.name || ''}
        onChangeText={() => {}}
        placeholder="Sélectionner une catégorie"
        editable={false}
        style={styles.input}
        rightIcon={
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        }
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

const ExpenseCard: React.FC<{
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}> = ({ expense, onEdit, onDelete }) => {
  const amount = parseFloat(expense.amount);
  const isRecurring = expense.type === 'RECURRING';

  return (
    <Card style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseMain}>
          <AppText variant="body" color={colors.text} style={styles.expenseTitle}>
            {expense.category?.name || expense.description || 'Sans catégorie'}
          </AppText>
          <View style={styles.expenseMeta}>
            <AppText variant="caption" color={colors.textMuted}>
              {formatDate(expense.date || expense.creationDate)}
            </AppText>
            {isRecurring && (
              <View style={styles.recurringBadge}>
                <AppText variant="caption" color={colors.primary} style={styles.badgeText}>
                  Récurrente
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.expenseActions}>
          <AppText variant="h4" color={colors.error} style={styles.expenseAmount}>
            -{formatMoney(amount, 'MGA')}
          </AppText>
          <IconButton
            icon={<Ionicons name="create-outline" size={20} color={colors.textSecondary} />}
            onPress={() => onEdit(expense)}
            size="sm"
            variant="ghost"
            accessibilityLabel="Modifier"
          />
          <IconButton
            icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
            onPress={() => onDelete(expense)}
            size="sm"
            variant="ghost"
            accessibilityLabel="Supprimer"
          />
        </View>
      </View>

      {expense.description && (
        <AppText variant="caption" color={colors.textSecondary} style={styles.expenseDescription}>
          {expense.description}
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
  expenseCard: {
    marginBottom: spacing.md,
  },
  expenseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseMain: {
    flex: 1,
  },
  expenseTitle: {
    marginBottom: spacing.xs,
  },
  expenseMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurringBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontWeight: '600' as const,
  },
  expenseAmount: {
    marginBottom: spacing.sm,
  },
  expenseActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.xs,
  },
  expenseDescription: {
    marginTop: spacing.sm,
    fontStyle: 'italic' as const,
  },
};