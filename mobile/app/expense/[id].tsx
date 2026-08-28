import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/api';
import {
  Screen,
  Card,
  Button,
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
import { formatMoney, formatDate, getRelativeTime } from '@/utils';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExpense, deleteExpense } = useExpenses();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadExpense();
    }
  }, [id]);

  const loadExpense = async () => {
    setLoading(true);
    try {
      const data = await getExpense(parseInt(id, 10));
      setExpense(data);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger la dépense');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la dépense',
      'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(parseInt(id, 10));
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de supprimer');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (expense) {
      router.push({
        pathname: '/expense/create',
        params: { edit: 'true', expense: JSON.stringify(expense) },
      });
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Chargement..." fullScreen />
      </Screen>
    );
  }

  if (!expense) {
    return (
      <Screen>
        <EmptyState
          title="Dépense introuvable"
          message="Cette dépense n'existe plus ou a été supprimée"
          icon={<Ionicons name="receipt-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Retour', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const amount = parseFloat(expense.amount);
  const isRecurring = expense.type === 'RECURRING';

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color={colors.text} />}
          onPress={() => router.back()}
          size="md"
          variant="ghost"
        />
        <Heading level={2}>Détail de la dépense</Heading>
        <View style={styles.headerActions}>
          <IconButton
            icon={<Ionicons name="create-outline" size={22} color={colors.primary} />}
            onPress={handleEdit}
            size="sm"
            variant="ghost"
            accessibilityLabel="Modifier"
          />
          <IconButton
            icon={<Ionicons name="trash-outline" size={22} color={colors.error} />}
            onPress={handleDelete}
            size="sm"
            variant="ghost"
            accessibilityLabel="Supprimer"
          />
        </View>
      </View>

      <Card style={styles.detailCard}>
        <View style={styles.amountRow}>
          <AppText variant="caption" color={colors.textSecondary}>Montant</AppText>
          <AppText variant="h2" color={colors.error} style={styles.amount}>
            -{formatMoney(amount, 'MGA')}
          </AppText>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Catégorie" value={expense.category?.name || 'Sans catégorie'} icon="pricetags" />
        <DetailRow label="Date" value={formatDate(expense.date || expense.creationDate)} icon="calendar" />
        <DetailRow
          label="Type"
          value={isRecurring ? 'Récurrente' : 'Ponctuelle'}
          icon={isRecurring ? 'repeat' : 'remove-circle'}
          valueColor={isRecurring ? colors.primary : colors.text}
        />

        {isRecurring && (
          <>
            <DetailRow label="Date de début" value={formatDate(expense.startDate!)} icon="calendar" />
            {expense.endDate && (
              <DetailRow label="Date de fin" value={formatDate(expense.endDate)} icon="calendar" />
            )}
          </>
        )}

        {expense.description && (
          <>
            <View style={styles.divider} />
            <DetailRow label="Description" value={expense.description} icon="document-text" />
          </>
        )}

        {expense.receiptUpload && (
          <>
            <View style={styles.divider} />
            <DetailRow
              label="Justificatif"
              value="Disponible"
              icon="document"
              onPress={() => {}}
              rightIcon={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
            />
          </>
        )}

        <View style={styles.divider} />
        <DetailRow label="Créée le" value={getRelativeTime(expense.creationDate)} icon="time" />
        <DetailRow label="ID" value={`#${expense.id}`} icon="hash" />
      </Card>
    </Screen>
  );
}

const DetailRow: React.FC<{
  label: string;
  value: string;
  icon: string;
  valueColor?: string;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
}> = ({ label, value, icon, valueColor, onPress, rightIcon }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.detailRow} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
      </View>
      <View style={styles.detailContent}>
        <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
        <AppText variant="body" color={valueColor || colors.text} style={styles.value}>
          {value}
        </AppText>
      </View>
      {rightIcon}
    </TouchableOpacity>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  detailCard: {},
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    marginTop: 2,
  },
};