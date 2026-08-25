import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/Dashboard.css';

// Shared shell (sidebar + navbar) for every authenticated page, so
// navigating away from the dashboard doesn't strand the user without a way
// back other than the browser's back button.
const AppLayout = ({ children }) => (
  <div className="dashboard-layout">
    <Sidebar />
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-main">{children}</div>
    </div>
  </div>
);

export default AppLayout;
