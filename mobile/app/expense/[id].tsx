import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { Expense } from '@/types/api';
import {
  Appear,
  AppText,
  Card,
  Chip,
  EmptyState,
  GlassSurface,
  IconButton,
  ListRow,
  LoadingState,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { ReceiptPreview } from '@/components/transactions/ReceiptPreview';
import { formatMoney, formatDate, getRelativeTime, getCategoryVisual } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';
import { radius, spacing } from '@/theme';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { getExpense, deleteExpense } = useExpenses();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadExpense = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getExpense(parseInt(id, 10));
      setExpense(data);
    } catch (err: any) {
      showError(err.message || 'Impossible de charger la dépense');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, getExpense]);

  // Reload on focus so returning from the edit screen shows fresh data.
  useFocusEffect(
    useCallback(() => {
      loadExpense();
    }, [loadExpense])
  );

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Supprimer la dépense',
      message: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteExpense(parseInt(id, 10));
      router.back();
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (expense) {
      router.push(`/expense/create?edit=true&id=${expense.id}`);
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
          message="Cette dépense n'existe plus ou a été supprimée."
          iconName="receipt-outline"
          action={{ label: 'Retour', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const amount = parseFloat(expense.amount);
  const isRecurring = expense.type === 'RECURRING';
  const title = expense.category?.name || expense.description || 'Sans catégorie';
  const visual = getCategoryVisual(expense.category?.name || expense.description);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Détail de la dépense"
        eyebrow={getRelativeTime(expense.date || expense.creationDate)}
        onBack={() => router.back()}
        actions={
          <>
            <IconButton
              name="create-outline"
              onPress={handleEdit}
              size="md"
              variant="glass"
              accessibilityLabel="Modifier"
            />
            <IconButton
              name="trash-outline"
              onPress={handleDelete}
              size="md"
              variant="danger"
              disabled={deleting}
              accessibilityLabel="Supprimer"
            />
          </>
        }
      />

      {/* Amount hero */}
      <Appear>
        <Card padding="lg" style={styles.heroCard}>
          <View style={[styles.heroIconWell, { backgroundColor: `${visual.color}1F` }]}>
            <Ionicons name={visual.icon} size={24} color={visual.color} />
          </View>
          <AppText variant="label" tone="secondary" uppercase>
            Montant
          </AppText>
          <AppText
            variant="amountLarge"
            tone="expense"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={styles.heroAmount}
          >
            -{formatMoney(amount, currency)}
          </AppText>
          <View style={styles.heroChips}>
            <Chip label={title} icon={visual.icon} tone="neutral" />
            <Chip
              label={isRecurring ? 'Récurrente' : 'Ponctuelle'}
              icon={isRecurring ? 'repeat' : 'flash-outline'}
              tone={isRecurring ? 'accent' : 'neutral'}
            />
          </View>
        </Card>
      </Appear>

      <Appear delay={60} style={styles.section}>
        <SectionHeader title="Informations" />
        <GlassSurface variant="card" padding="none">
          <ListRow icon="pricetags-outline" title="Catégorie" value={expense.category?.name || 'Sans catégorie'} />
          <ListRow
            icon="calendar-outline"
            title="Date"
            value={formatDate(expense.date || expense.creationDate)}
          />
          <ListRow
            icon={isRecurring ? 'repeat-outline' : 'flash-outline'}
            title="Type"
            value={isRecurring ? 'Récurrente' : 'Ponctuelle'}
            valueTone={isRecurring ? 'accent' : 'default'}
            last={!isRecurring && !expense.description}
          />
          {isRecurring && (
            <ListRow
              icon="play-outline"
              title="Date de début"
              value={expense.startDate ? formatDate(expense.startDate) : '—'}
              last={!expense.endDate && !expense.description}
            />
          )}
          {isRecurring && expense.endDate && (
            <ListRow
              icon="stop-outline"
              title="Date de fin"
              value={formatDate(expense.endDate)}
              last={!expense.description}
            />
          )}
          {expense.description && (
            <ListRow icon="document-text-outline" title="Description" subtitle={expense.description} last />
          )}
        </GlassSurface>
      </Appear>

      {expense.receiptUpload && (
        <Appear delay={120} style={styles.section}>
          <SectionHeader title="Justificatif" caption="Touchez pour ouvrir le fichier complet" />
          <ReceiptPreview receipt={expense.receiptUpload} onError={showError} />
        </Appear>
      )}

      <Appear delay={180} style={styles.section}>
        <GlassSurface variant="subtle" padding="none">
          <ListRow icon="time-outline" title="Créée" value={getRelativeTime(expense.creationDate)} />
          <ListRow icon="key-outline" title="Identifiant" value={`#${expense.id}`} last />
        </GlassSurface>
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
    heroCard: {
      alignItems: 'center',
      borderRadius: radius.xxl,
    },
    heroIconWell: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    heroAmount: {
      marginTop: spacing.xxs,
      marginBottom: spacing.md,
    },
    heroChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm - 2,
    },
  section: {
    marginTop: spacing.lg,
  },
});
