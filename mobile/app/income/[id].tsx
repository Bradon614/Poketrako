import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useIncomes } from '@/hooks/useIncomes';
import { Income } from '@/types/api';
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

export default function IncomeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getIncome, deleteIncome } = useIncomes();
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadIncome();
    }
  }, [id]);

  const loadIncome = async () => {
    setLoading(true);
    try {
      const data = await getIncome(parseInt(id, 10));
      setIncome(data);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger le revenu');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le revenu',
      'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteIncome(parseInt(id, 10));
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de supprimer');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (income) {
      router.push({
        pathname: '/income/create',
        params: { edit: 'true', income: JSON.stringify(income) },
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

  if (!income) {
    return (
      <Screen>
        <EmptyState
          title="Revenu introuvable"
          message="Ce revenu n'existe plus ou a été supprimé"
          icon={<Ionicons name="cash-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Retour', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const amount = parseFloat(income.amount);

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color={colors.text} />}
          onPress={() => router.back()}
          size="md"
          variant="ghost"
        />
        <Heading level={2}>Détail du revenu</Heading>
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
          <AppText variant="h2" color={colors.success} style={styles.amount}>
            +{formatMoney(amount, 'MGA')}
          </AppText>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Source" value={income.source} icon="cash" />
        <DetailRow label="Date" value={formatDate(income.date)} icon="calendar" />

        {income.description && (
          <>
            <View style={styles.divider} />
            <DetailRow label="Description" value={income.description} icon="document-text" />
          </>
        )}

        <View style={styles.divider} />
        <DetailRow label="Créé le" value={getRelativeTime(income.creationDate)} icon="time" />
        <DetailRow label="ID" value={`#${income.id}`} icon="hash" />
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