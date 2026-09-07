import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingState, Screen } from '@/components/ui';

// Entry route: lands the user on the dashboard or the login screen depending
// on the restored session. A declarative Redirect avoids navigating before
// the root navigator has mounted. Ongoing auth-state changes are handled by
// the guard in the root layout.
export default function IndexRedirect() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Screen>
        <LoadingState fullScreen message="Chargement..." />
      </Screen>
    );
  }

  return <Redirect href={token ? '/(tabs)' : '/(auth)/login'} />;
}
