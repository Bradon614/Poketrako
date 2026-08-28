import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function LoginScreen() {
  const { login } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      if (redirect) {
        router.replace(redirect as string);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <LoadingState message="Connexion en cours..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={48} color={colors.primary} />
          </View>
          <Heading level={1} style={styles.title}>
            POKETRAKO
          </Heading>
          <AppText variant="body" color={colors.textSecondary} center style={styles.subtitle}>
            Gérez vos finances simplement
          </AppText>
        </View>

        <Card style={styles.card}>
          <Heading level={3} style={styles.formTitle}>
            Connexion
          </Heading>

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
            autoComplete="password"
            error={passwordError}
            style={styles.input}
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </Card>

        <View style={styles.footer}>
          <AppText variant="body" color={colors.textSecondary}>
            Pas encore de compte ?
          </AppText>
          <Button
            title="S'inscrire"
            onPress={() => router.push('/(auth)/signup')}
            variant="ghost"
            size="md"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

import { View } from 'react-native';

const styles = {
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
};