import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  Screen,
  Card,
  Input,
  Button,
  Heading,
  AppText,
  LoadingState,
  colors,
  spacing,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { showError } from '@/utils/notify';

export default function SignupScreen() {
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
      <Screen style={styles.centered}>
        <LoadingState message="Création du compte..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={48} color={colors.primary} />
          </View>
          <Heading level={1} style={styles.title}>
            POKETRAKO
          </Heading>
          <AppText variant="body" color={colors.textSecondary} center style={styles.subtitle}>
            Créez votre compte
          </AppText>
        </View>

        <Card style={styles.card}>
          <Heading level={3} style={styles.formTitle}>
            Inscription
          </Heading>

          <Input
            label="Nom complet (optionnel)"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jean Dupont"
            autoCapitalize="words"
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
            style={styles.input}
          />

          <Button
            title="Créer mon compte"
            onPress={handleSignup}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </Card>

        <View style={styles.footer}>
          <AppText variant="body" color={colors.textSecondary}>
            Déjà un compte ?
          </AppText>
          <Button
            title="Se connecter"
            onPress={() => router.replace('/(auth)/login')}
            variant="ghost"
            size="md"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
