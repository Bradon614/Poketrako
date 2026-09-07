import React, { useEffect } from 'react';
import { Slot, router, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
