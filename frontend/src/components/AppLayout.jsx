import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { CurrencyProvider } from '../context/CurrencyContext';
import '../styles/Dashboard.css';

// Shared shell (sidebar + navbar) for every authenticated page, so
// navigating away from the dashboard doesn't strand the user without a way
// back other than the browser's back button. Also provides the user's
// currency preference to every descendant.
const AppLayout = ({ children }) => (
  <CurrencyProvider>
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-main">{children}</div>
      </div>
    </div>
  </CurrencyProvider>
);

export default AppLayout;
