import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function LoginScreen() {
  const { theme, toggleScheme } = useTheme();
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
      showError(error.message || 'Identifiants incorrects', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Connexion en cours..." fullScreen />
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
                <Ionicons name="wallet" size={30} color={theme.colors.textOnAccent} />
              </LinearGradient>
            </View>
            <Heading level={1} center style={styles.title}>
              POKETRAKO
            </Heading>
            <AppText variant="bodySmall" tone="secondary" center>
              Gérez vos finances simplement
            </AppText>
          </View>

          <Card padding="lg" style={styles.card}>
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
              leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
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
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
              }
              style={styles.input}
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />

            <Button
              title="Se connecter"
              onPress={handleLogin}
              fullWidth
              size="lg"
              style={styles.submitButton}
              icon="log-in-outline"
            />
          </Card>

          <View style={styles.footer}>
            <AppText variant="bodySmall" tone="secondary">
              Pas encore de compte ?
            </AppText>
            <Button
              title="S'inscrire"
              onPress={() => router.push('/(auth)/signup')}
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
    justifyContent: 'flex-end',
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
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: radius.xxl,
  },
  formTitle: {
    marginBottom: spacing.lg,
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
