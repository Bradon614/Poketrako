import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExpenseTable from './components/ExpenseTable';
import NewExpense from './components/NewExpense';
import IncomeTable from './components/IncomeTable';
import NewIncome from './components/NewIncome';
import Categories from './components/Categories';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route
          path="/expenses"
          element={<ProtectedRoute><AppLayout><ExpenseTable /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/expenses/new"
          element={<ProtectedRoute><AppLayout><NewExpense /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/incomes"
          element={<ProtectedRoute><AppLayout><IncomeTable /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/incomes/new"
          element={<ProtectedRoute><AppLayout><NewIncome /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/categories"
          element={<ProtectedRoute><AppLayout><Categories /></AppLayout></ProtectedRoute>}
        />
        <Route path="*" element={<p style={{ padding: '2rem' }}>Page introuvable.</p>} />
      </Routes>
    </Router>
  );
}

export default App;
