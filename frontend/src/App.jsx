import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { ToastProvider } from './lib/toast';
import { ConfirmProvider } from './components/ui';
import { SessionProvider } from './lib/session';
import AppShell from './shell/AppShell';
import { PublicOnly, RequireAuth } from './shell/guards';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ExpensesPage from './features/expenses/ExpensesPage';
import IncomesPage from './features/incomes/IncomesPage';
import CategoriesPage from './features/categories/CategoriesPage';
import BudgetPage from './features/budget/BudgetPage';
import SettingsPage from './features/settings/SettingsPage';
import NotFoundPage from './shell/NotFoundPage';

/**
 * Application routes.
 *
 * Public:  /login, /signup
 * Private: /dashboard, /expenses, /incomes, /categories, /budget, /settings
 *          — all rendered inside AppShell (rail + top bar + tab bar).
 *
 * Every authenticated path lives under one layout route, so the navigation
 * chrome mounts once and only the page content swaps.
 *
 * Logged-out visitors are never blocked from a URL they typed: the guard
 * forwards the target to /login and the login screen returns them there.
 */

const App = () => (
  <Router>
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <SessionProvider>
            <Routes>
              {/* Root: send the user wherever their session points. */}
              <Route
                path="/"
                element={
                  <Navigate to={localStorage.getItem('token') ? '/dashboard' : '/login'} replace />
                }
              />

              <Route
                path="/login"
                element={
                  <PublicOnly>
                    <LoginPage />
                  </PublicOnly>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnly>
                    <SignupPage />
                  </PublicOnly>
                }
              />

              {/* Authenticated area — one shell, swapped content. */}
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/incomes" element={<IncomesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Legacy create URLs kept as redirects (old bookmarks/links). */}
              <Route path="/expenses/new" element={<Navigate to="/expenses?new=1" replace />} />
              <Route path="/incomes/new" element={<Navigate to="/incomes?new=1" replace />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SessionProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  </Router>
);

export default App;
