import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout as clearToken, setUnauthorizedHandler } from '../api';
import { useToast } from './toast';

/**
 * SessionProvider — one place that owns "who is signed in".
 *
 * It also replaces the old per-component profile fetching: the currency,
 * budget and display name are read once and shared, so the dashboard no longer
 * fires three identical /auth/me + /summary/monthly calls.
 *
 * A 401 from any request ends the session here (token cleared by the API
 * layer, user reset, redirect to /login with an explanation) instead of
 * leaving the user on a broken screen.
 */

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const navigate = useNavigate();
  const { warning } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profile = await getProfile();
      setUser(profile);
      setError('');
    } catch (err) {
      setError(err?.message || 'Session indisponible');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The API layer reports session loss; the routing decision lives here.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      warning('Votre session a expiré. Veuillez vous reconnecter.');
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate, warning]);

  const currency = user?.currency || 'MGA';

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      currency,
      displayName: user?.fullName || user?.email?.split('@')[0] || '',
      budget: Number(user?.budget || 0),
      /** Applies a partial profile update locally after a successful API call. */
      patchUser: (patch) => setUser((current) => (current ? { ...current, ...patch } : current)),
      refresh: load,
      logout,
    }),
    [user, loading, error, currency, load, logout]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + its hook live together
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
