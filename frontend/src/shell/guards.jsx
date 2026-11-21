import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guards.
 *
 * `RequireAuth` keeps the previous behaviour (a missing token sends you to the
 * login screen) and remembers where the user was heading, so a deep link lands
 * back on the right page after signing in.
 *
 * `PublicOnly` is the mirror: an already signed-in user who opens /login or
 * /signup is sent to the dashboard instead of seeing a form they don't need.
 */

export function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    const target = redirect && redirect !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
    return <Navigate to={target} replace />;
  }

  return children;
}

export function PublicOnly({ children }) {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}
