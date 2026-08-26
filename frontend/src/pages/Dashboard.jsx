import AppLayout from '../components/AppLayout';
import SummaryCards from '../components/SummaryCards';
import BudgetSettings from '../components/BudgetSettings';
import CashFlowChart from '../components/CashFlowChart';
import ExpenseTable from '../components/ExpenseTable';
import IncomeTable from '../components/IncomeTable';
import BudgetAlert from '../components/BudgetAlert';

const Dashboard = () => (
  <AppLayout>
    <BudgetAlert />
    <h2>Mon tableau de bord</h2>
    <SummaryCards />
    <BudgetSettings />
    <CashFlowChart />
    <div className="tables-section">
      <ExpenseTable />
      <IncomeTable />
    </div>
  </AppLayout>
);

export default Dashboard;
