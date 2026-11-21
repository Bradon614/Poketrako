import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIncomes } from '@/hooks/useIncomes';
import { useAuth } from '@/hooks/useAuth';
import { Income } from '@/types/api';
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
import { formatMoney, formatDate, getRelativeTime } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';
import { radius, spacing, useTheme } from '@/theme';

export default function IncomeDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const currency = user?.currency || 'MGA';
  const { getIncome, deleteIncome } = useIncomes();
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadIncome = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getIncome(parseInt(id, 10));
      setIncome(data);
    } catch (err: any) {
      showError(err.message || 'Impossible de charger le revenu');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, getIncome]);

  // Reload on focus so returning from the edit screen shows fresh data.
  useFocusEffect(
    useCallback(() => {
      loadIncome();
    }, [loadIncome])
  );

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Supprimer le revenu',
      message: 'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteIncome(parseInt(id, 10));
      router.back();
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (income) {
      router.push(`/income/create?edit=true&id=${income.id}`);
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
          message="Ce revenu n'existe plus ou a été supprimé."
          iconName="cash-outline"
          action={{ label: 'Retour', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const amount = parseFloat(income.amount);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Détail du revenu"
        eyebrow={getRelativeTime(income.date)}
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

      <Appear>
        <Card padding="lg" style={styles.heroCard}>
          <View style={[styles.heroIconWell, { backgroundColor: theme.colors.incomeSoft }]}>
            <Ionicons name="cash-outline" size={24} color={theme.colors.income} />
          </View>
          <AppText variant="label" tone="secondary" uppercase>
            Montant reçu
          </AppText>
          <AppText
            variant="amountLarge"
            tone="income"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={styles.heroAmount}
          >
            +{formatMoney(amount, currency)}
          </AppText>
          <View style={styles.heroChips}>
            <Chip label={income.source} icon="briefcase-outline" tone="neutral" />
          </View>
        </Card>
      </Appear>

      <Appear delay={60} style={styles.section}>
        <SectionHeader title="Informations" />
        <GlassSurface variant="card" padding="none">
          <ListRow icon="briefcase-outline" title="Source" value={income.source} />
          <ListRow icon="calendar-outline" title="Date" value={formatDate(income.date)} last={!income.description} />
          {income.description && (
            <ListRow icon="document-text-outline" title="Description" subtitle={income.description} last />
          )}
        </GlassSurface>
      </Appear>

      <Appear delay={120} style={styles.section}>
        <GlassSurface variant="subtle" padding="none">
          <ListRow icon="time-outline" title="Créé" value={getRelativeTime(income.creationDate)} />
          <ListRow icon="key-outline" title="Identifiant" value={`#${income.id}`} last />
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
