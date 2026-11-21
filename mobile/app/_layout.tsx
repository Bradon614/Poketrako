import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/theme';

const AUTH_ROUTES = ['/login', '/signup'];

// Guards navigation based on the auth state: signed-out users are pushed to
// login, signed-in users never land back on an auth screen. The Slot must
// always be rendered (expo-router requirement); the guard only navigates from
// effects, once the navigator is mounted.
function AuthGate() {
  const { token, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (!token && !onAuthScreen) {
      router.replace('/(auth)/login');
    } else if (token && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [loading, token, pathname]);

  return <Slot />;
}

/**
 * Applies the resolved theme to the pieces that live outside React's tree:
 * the status bar glyph colour, and (on web) the document background so the
 * browser never flashes white around the app in dark mode.
 */
function ThemedShell() {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = theme.colors.background;
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, [theme.colors.background]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AuthGate />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ThemedShell />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
