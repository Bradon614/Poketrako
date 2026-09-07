import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import {
  Screen,
  Card,
  Button,
  Input,
  Heading,
  AppText,
  LoadingState,
  colors,
  spacing,
  borderRadius,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';

const SUPPORTED_CURRENCIES_LIST = ['MGA', 'EUR', 'USD', 'GBP'];

export default function ProfileScreen() {
  const { user, logout, updateBudget, updateCurrency } = useAuth();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(user?.budget || 0));
  const [currencyInput, setCurrencyInput] = useState(user?.currency || 'MGA');
  const [budgetError, setBudgetError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleBudgetSave = async () => {
    const budget = parseFloat(budgetInput) || 0;
    if (budget < 0) {
      setBudgetError('Le budget doit être positif ou nul');
      return;
    }
    setBudgetError('');
    setSaving(true);
    try {
      await updateBudget(budget);
      setShowBudgetForm(false);
    } catch (err: any) {
      showError(err.message || 'Impossible de mettre à jour le budget');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencySave = async () => {
    setSaving(true);
    try {
      await updateCurrency(currencyInput);
      setShowCurrencyForm(false);
    } catch (err: any) {
      showError(err.message || 'Impossible de mettre à jour la devise');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmLabel: 'Déconnexion',
      destructive: true,
    });
    if (!confirmed) return;
    await logout();
  };

  if (!user) {
    return (
      <Screen>
        <LoadingState message="Chargement du profil..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading level={2}>Profil</Heading>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={80} color={colors.primary} />
        </View>
        <AppText variant="h3" color={colors.text} center style={styles.name}>
          {user.fullName || user.email.split('@')[0]}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} center style={styles.email}>
          {user.email}
        </AppText>
      </Card>

      <Card style={styles.settingsCard}>
        <Heading level={3} style={styles.sectionTitle}>Paramètres</Heading>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <AppText variant="body" color={colors.text}>Budget mensuel</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {user.budget > 0
                ? formatMoney(user.budget, user.currency)
                : 'Aucun budget défini'}
            </AppText>
          </View>
          <Button
            title={showBudgetForm ? 'Enregistrer' : 'Modifier'}
            onPress={showBudgetForm ? handleBudgetSave : () => setShowBudgetForm(true)}
            variant={showBudgetForm ? 'primary' : 'ghost'}
            size="sm"
            loading={saving}
          />
        </View>

        {showBudgetForm && (
          <Input
            label="Budget mensuel"
            value={budgetInput}
            onChangeText={setBudgetInput}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={budgetError}
            style={styles.formInput}
          />
        )}

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <AppText variant="body" color={colors.text}>Devise</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {user.currency}
            </AppText>
          </View>
          <Button
            title={showCurrencyForm ? 'Enregistrer' : 'Modifier'}
            onPress={showCurrencyForm ? handleCurrencySave : () => setShowCurrencyForm(true)}
            variant={showCurrencyForm ? 'primary' : 'ghost'}
            size="sm"
            loading={saving}
          />
        </View>

        {showCurrencyForm && (
          <View style={styles.currencySelector}>
            {SUPPORTED_CURRENCIES_LIST.map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => setCurrencyInput(curr)}
                style={[
                  styles.currencyOption,
                  currencyInput === curr && styles.currencyOptionActive,
                ]}
              >
                <AppText
                  variant="body"
                  color={currencyInput === curr ? colors.white : colors.text}
                >
                  {curr}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.dangerCard}>
        <Button title="Se déconnecter" onPress={handleLogout} variant="danger" fullWidth />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  profileCard: {
    padding: spacing.xl,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  name: {
    marginBottom: spacing.xs,
  },
  email: {
    marginBottom: 0,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  formInput: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  currencySelector: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  currencyOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  currencyOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dangerCard: {
    padding: spacing.sm,
  },
});
