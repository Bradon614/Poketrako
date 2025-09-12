import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

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
        </div>
        </div>
    </div>
  )
}
export default Dashboard;