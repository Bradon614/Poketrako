import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

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
    
        <button className="toggle-btn" onClick={() => setOpen(!open)}>☰</button>
      </div>
      <nav>
        <NavLink to="/dashboard" activeclassname="active">🏠 Dashboard</NavLink>
        <NavLink to="/expenses" activeclassname="active">💸 Dépenses</NavLink>
        <NavLink to="/incomes" activeclassname="active">💰 Revenus</NavLink>
        <NavLink to="/categories" activeclassname="active">📂 Catégories</NavLink>
        <button className="logout-btn" onClick={handleLogout}>🚪 Déconnexion</button>
      </nav>
    </div>
  );
};

export default Sidebar;
