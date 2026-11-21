import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import {
  Appear,
  AppText,
  Button,
  Card,
  Chip,
  GlassSurface,
  Input,
  LoadingState,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  type SegmentedOption,
} from '@/components/ui';
import { formatMoney } from '@/utils';
import { confirmDialog, showError } from '@/utils/notify';
import { radius, spacing, useThemedStyles, useTheme, type Theme, type ThemeMode } from '@/theme';

const SUPPORTED_CURRENCIES_LIST = ['MGA', 'EUR', 'USD', 'GBP'];

const THEME_OPTIONS: readonly SegmentedOption<ThemeMode>[] = [
  { label: 'Clair', value: 'light', icon: 'sunny-outline' },
  { label: 'Sombre', value: 'dark', icon: 'moon-outline' },
  { label: 'Système', value: 'system', icon: 'phone-portrait-outline' },
];

/** Two-letter initials used by the avatar. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileScreen() {
  const styles = useThemedStyles(createStyles);
  const { theme, mode, setMode } = useTheme();
  const { user, logout, updateBudget, updateCurrency } = useAuth();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(user?.budget || 0));
  const [budgetError, setBudgetError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState<string | null>(null);

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

  const handleCurrencyChange = async (currency: string) => {
    if (currency === user?.currency) return;
    setSavingCurrency(currency);
    try {
      await updateCurrency(currency);
    } catch (err: any) {
      showError(err.message || 'Impossible de mettre à jour la devise');
    } finally {
      setSavingCurrency(null);
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

  const displayName = user.fullName || user.email.split('@')[0];
  const budget = user.budget || 0;

  return (
    <Screen scroll tabBarSpace keyboardShouldPersistTaps="handled">
      <>
        <ScreenHeader title="Profil" subtitle="Votre compte et vos préférences" />

        {/* Identity card: accent-gradient avatar + name + at-a-glance settings. */}
        <Appear>
          <Card padding="lg" style={styles.identityCard}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={theme.colors.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <AppText variant="h2" color={theme.colors.textOnAccent}>
                  {initialsOf(displayName)}
                </AppText>
              </LinearGradient>
            </View>

            <AppText variant="h3" center numberOfLines={1} style={styles.name}>
              {displayName}
            </AppText>
            <AppText variant="bodySmall" tone="secondary" center numberOfLines={1}>
              {user.email}
            </AppText>

            <View style={styles.identityChips}>
              <Chip label={user.currency} icon="cash-outline" tone="accent" />
              <Chip
                label={budget > 0 ? `Budget ${formatMoney(budget, user.currency)}` : 'Aucun budget'}
                icon="pie-chart-outline"
                tone={budget > 0 ? 'income' : 'neutral'}
              />
            </View>
          </Card>
        </Appear>

        {/* Preferences */}
        <Appear delay={60} style={styles.section}>
          <SectionHeader title="Préférences" />
          <Card padding="lg" style={styles.card}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldTitles}>
                <AppText variant="body">Apparence</AppText>
                <AppText variant="caption" tone="muted">
                  Thème clair, sombre ou selon le système
                </AppText>
              </View>
            </View>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={mode}
              onChange={setMode}
              style={styles.themeControl}
            />

            <View style={styles.divider} />

            <View style={styles.fieldHeader}>
              <View style={styles.fieldTitles}>
                <AppText variant="body">Devise</AppText>
                <AppText variant="caption" tone="muted">
                  Utilisée pour tous vos montants
                </AppText>
              </View>
            </View>
            <View style={styles.currencyRow}>
              {SUPPORTED_CURRENCIES_LIST.map((curr) => (
                <Chip
                  key={curr}
                  label={savingCurrency === curr ? `${curr}…` : curr}
                  selected={user.currency === curr}
                  tone="accent"
                  onPress={() => handleCurrencyChange(curr)}
                  accessibilityLabel={`Choisir la devise ${curr}`}
                />
              ))}
            </View>
          </Card>
        </Appear>

        {/* Budget */}
        <Appear delay={120} style={styles.section}>
          <SectionHeader title="Budget mensuel" />
          <Card padding="lg" style={styles.card}>
            <View style={styles.budgetRow}>
              <View style={styles.fieldTitles}>
                <AppText variant="amount" tone={budget > 0 ? 'default' : 'muted'}>
                  {budget > 0 ? formatMoney(budget, user.currency) : 'Non défini'}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {budget > 0
                    ? 'Comparé à vos dépenses du mois sur le tableau de bord'
                    : 'Définissez un plafond pour suivre votre progression'}
                </AppText>
              </View>
              <Button
                title={showBudgetForm ? 'Annuler' : budget > 0 ? 'Modifier' : 'Définir'}
                onPress={() => {
                  if (showBudgetForm) {
                    setShowBudgetForm(false);
                    setBudgetInput(String(budget));
                    setBudgetError('');
                  } else {
                    setBudgetInput(String(budget || ''));
                    setShowBudgetForm(true);
                  }
                }}
                variant={showBudgetForm ? 'secondary' : 'primary'}
                size="sm"
                pill
              />
            </View>

            {showBudgetForm && (
              <View style={styles.budgetForm}>
                <Input
                  label="Montant du budget mensuel"
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  error={budgetError}
                  returnKeyType="done"
                  onSubmitEditing={handleBudgetSave}
                  leftIcon={<Ionicons name="wallet-outline" size={18} color={theme.colors.textMuted} />}
                />
                <Button
                  title="Enregistrer"
                  onPress={handleBudgetSave}
                  loading={saving}
                  fullWidth
                  icon="checkmark"
                />
              </View>
            )}
          </Card>
        </Appear>

        {/* Account */}
        <Appear delay={180} style={styles.section}>
          <SectionHeader title="Compte" />
          <GlassSurface variant="card" padding="none">
            <AccountRow icon="mail-outline" label="Adresse e-mail" value={user.email} />
            <AccountRow
              icon="cash-outline"
              label="Devise active"
              value={user.currency}
              last
            />
          </GlassSurface>
        </Appear>

        <Appear delay={240} style={styles.section}>
          <Button
            title="Se déconnecter"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            icon="log-out-outline"
          />
        </Appear>

        <AppText variant="captionSmall" tone="muted" center style={styles.footer}>
          POKETRAKO · Gestion de finances personnelles
        </AppText>
      </>
    </Screen>
  );
}

const AccountRow: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  last?: boolean;
}> = ({ icon, label, value, last = false }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.accountRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
      <View style={styles.accountIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
      </View>
      <AppText variant="bodySmall" tone="secondary" style={styles.accountLabel}>
        {label}
      </AppText>
      <AppText variant="bodySmall" numberOfLines={1} style={styles.accountValue}>
        {value}
      </AppText>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    identityCard: {
      alignItems: 'center',
      borderRadius: radius.xxl,
    },
    avatarWrapper: {
      borderRadius: radius.full,
      marginBottom: spacing.md,
      ...theme.shadows.accent,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      marginBottom: spacing.xxs,
    },
    identityChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm - 2,
      marginTop: spacing.md,
    },
    section: {
      marginTop: spacing.lg,
    },
    card: {
      borderRadius: radius.xl,
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm + 2,
    },
    fieldTitles: {
      flex: 1,
      minWidth: 0,
    },
    themeControl: {
      marginTop: spacing.xxs,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: spacing.lg,
    },
    currencyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    budgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    budgetForm: {
      marginTop: spacing.md,
      gap: spacing.sm + 4,
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.md,
    },
    accountIcon: {
      width: 24,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    accountLabel: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    accountValue: {
      maxWidth: '52%',
    },
    footer: {
      marginTop: spacing.xl,
    },
  });
