import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LuLayoutDashboard, LuWallet, LuBanknote, LuFolder, LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import '../styles/Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Accueil', Icon: LuLayoutDashboard },
  { to: '/expenses', label: 'Dépenses', Icon: LuWallet },
  { to: '/incomes', label: 'Revenus', Icon: LuBanknote },
  { to: '/categories', label: 'Catégories', Icon: LuFolder }
];

const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`;

// Navigation only — the logout action lives in the Navbar so it doesn't have
// to be duplicated between the desktop sidebar and the mobile bottom bar.
// On desktop this is a vertical rail; under 768px it becomes a fixed bottom
// tab bar (see Sidebar.css).
const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const ToggleIcon = open ? LuPanelLeftClose : LuPanelLeftOpen;

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <img src="/logo.svg" alt="" className="sidebar-logo" />
        <span className="sidebar-brand">Poketrako</span>
        <button
          className="toggle-btn"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Réduire le menu' : 'Déployer le menu'}
        >
          <ToggleIcon />
        </button>
      </div>

      <nav>
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <NavLink key={item.to} to={item.to} className={navClass} title={item.label}>
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
