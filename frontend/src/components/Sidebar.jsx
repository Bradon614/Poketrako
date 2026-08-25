import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuWallet, LuBanknote, LuFolder, LuLogOut, LuMenu } from 'react-icons/lu';
import '../styles/Sidebar.css';

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className={`sidebar ${open ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setOpen(!open)} aria-label="Réduire le menu">
          <LuMenu />
        </button>
      </div>
      <nav>
        <NavLink to="/dashboard" className={navClass}><LuLayoutDashboard /> <span>Dashboard</span></NavLink>
        <NavLink to="/expenses" className={navClass}><LuWallet /> <span>Dépenses</span></NavLink>
        <NavLink to="/incomes" className={navClass}><LuBanknote /> <span>Revenus</span></NavLink>
        <NavLink to="/categories" className={navClass}><LuFolder /> <span>Catégories</span></NavLink>
        <button className="logout-btn" onClick={handleLogout}><LuLogOut /> <span>Déconnexion</span></button>
      </nav>
    </div>
  );
};

export default Sidebar;
