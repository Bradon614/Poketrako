import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';
import SummaryCards from '../components/SummaryCards';
import CashFlowChart from '../components/CashFlowChart';
import ExpenseTable from '../components/ExpenseTable';
import IncomeTable from '../components/IncomeTable';
import BudgetAlert from '../components/BudgetAlert';

const Dashboard = () => {
     const token = localStorage.getItem('token');
  return (
    <div className="dashboard-layout">
       <Sidebar />
        <div className="dashboard-container">
        <Navbar  />
         <div style={{ marginTop: '80px' }}>
        <BudgetAlert token={token} />
        <h2>Mon tableau de bord</h2>
        <SummaryCards />
        <CashFlowChart />
         <div className="tables-section">
        <ExpenseTable />
        <IncomeTable />
        </div>
        </div>
        </div>
    </div>
  )
}
export default Dashboard;