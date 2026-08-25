import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExpenseTable from './components/ExpenseTable';
import IncomeTable from './components/IncomeTable';
import Categories from './components/Categories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpenseTable />} />
        <Route path="/incomes" element={<IncomeTable />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<p style={{ padding: '2rem' }}>Page introuvable.</p>} />
      </Routes>
    </Router>
  );
}

export default App;
