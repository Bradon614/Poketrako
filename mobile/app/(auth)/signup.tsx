import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import {
  AppText,
  Button,
  Card,
  Heading,
  IconButton,
  Input,
  LoadingState,
  Screen,
} from '@/components/ui';
import { showError } from '@/utils/notify';
import { radius, spacing, useTheme } from '@/theme';

export default function SignupScreen() {
  const { theme, toggleScheme } = useTheme();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    if (!email || !email.includes('@')) {
      setEmailError('Email invalide');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password || password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (password !== confirmPassword) {
      setConfirmError('Les mots de passe ne correspondent pas');
      valid = false;
    } else {
      setConfirmError('');
    }
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(email, password, fullName || undefined);
      // Navigate directly: Alert.alert callbacks never fire on web, so the
      // redirect must not live inside the dialog.
      router.replace('/(auth)/login');
    } catch (error: any) {
      showError(error.message || 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Création du compte..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <IconButton
              name="chevron-back"
              onPress={() => router.replace('/(auth)/login')}
              size="md"
              variant="glass"
              accessibilityLabel="Retour à la connexion"
            />
            <IconButton
              name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
              onPress={toggleScheme}
              size="md"
              variant="glass"
              accessibilityLabel={theme.isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
            />
          </View>

          <View style={styles.brand}>
            <View style={[styles.logoGlow, theme.shadows.accent]}>
              <LinearGradient
                colors={theme.colors.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons name="person-add" size={28} color={theme.colors.textOnAccent} />
              </LinearGradient>
            </View>
            <Heading level={2} center style={styles.title}>
              Créer un compte
            </Heading>
            <AppText variant="bodySmall" tone="secondary" center>
              Quelques secondes suffisent pour commencer
            </AppText>
          </View>

          <Card padding="lg" style={styles.card}>
            <Input
              label="Nom complet (optionnel)"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jean Dupont"
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />}
              style={styles.input}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
              leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
              style={styles.input}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              error={passwordError}
              helperText="Au moins 8 caractères"
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
              }
              style={styles.input}
            />

            <Input
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              error={confirmError}
              leftIcon={
                <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.textMuted} />
              }
              style={styles.input}
              onSubmitEditing={handleSignup}
              returnKeyType="go"
            />

            <Button
              title="Créer mon compte"
              onPress={handleSignup}
              fullWidth
              size="lg"
              style={styles.submitButton}
              icon="checkmark-circle-outline"
            />
          </Card>

          <View style={styles.footer}>
            <AppText variant="bodySmall" tone="secondary">
              Déjà un compte ?
            </AppText>
            <Button
              title="Se connecter"
              onPress={() => router.replace('/(auth)/login')}
              variant="ghost"
              size="sm"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoGlow: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.xs,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: radius.xxl,
  },
  input: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm - 4,
  },
});
