import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Transparent scene so the ambient background of each screen shows
        // through during the login <-> signup transition.
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
