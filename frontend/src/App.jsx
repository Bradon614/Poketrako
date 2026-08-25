import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExpenseTable from './components/ExpenseTable';
import NewExpense from './components/NewExpense';
import IncomeTable from './components/IncomeTable';
import Categories from './components/Categories';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpenseTable /></ProtectedRoute>} />
        <Route path="/expenses/new" element={<ProtectedRoute><NewExpense /></ProtectedRoute>} />
        <Route path="/incomes" element={<ProtectedRoute><IncomeTable /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="*" element={<p style={{ padding: '2rem' }}>Page introuvable.</p>} />
      </Routes>
    </Router>
  );
}

export default App;
