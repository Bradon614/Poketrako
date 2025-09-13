import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import ExpenseTable from './components/ExpenseTable';
import ExpenseTable from './components/ExpenseTable';
import IncomeTable from './components/IncomeTable';
import Categories from './components/Categories';
import Profile from './components/Profile'
import Receipts from './components/Receipts';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Intro/>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpenseTable />} />
         <Route path="expenses" element={<Expenses />} />
          <Route path="incomes" element={<Incomes />} />
          <Route path="categories" element={<Categories />} />
          <Route path="profile" element={<Profile />} />
      </Routes>
    </Router>
  )



}

export default App
