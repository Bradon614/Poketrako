import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuPlus,
  LuTarget,
} from 'react-icons/lu';
import { NAV_SECTIONS } from './navigation';
import { useSession } from '../lib/session';
import { formatMoney } from '../currency';

/**
 * SidebarNav — the desktop navigation rail (macOS-style).
 *
 * A frosted rail pinned to the left: brand, primary CTA, grouped destinations,
 * and a budget summary at the bottom so the user keeps their envelope in
 * sight without leaving the current page. Collapses to icons only.
 *
 * It is hidden below 768px, where BottomTabBar takes over.
 */

const SidebarNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, currency, budget, displayName } = useSession();
  const navigate = useNavigate();
  const ToggleIcon = collapsed ? LuPanelLeftOpen : LuPanelLeftClose;

  return (
    <aside className={`rail glass--chrome${collapsed ? ' is-collapsed' : ''}`}>
      <div className="rail__head">
        <button
          type="button"
          className="rail__brand"
          onClick={() => navigate('/dashboard')}
          aria-label="Poketrako — aller au tableau de bord"
        >
          <img src="/logo.svg" alt="" className="rail__logo" />
          <span className="rail__brand-name">Poketrako</span>
        </button>

        <button
          type="button"
          className="rail__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'}
          aria-expanded={!collapsed}
        >
          <ToggleIcon aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        className="rail__cta btn btn--primary"
        onClick={() => navigate('/expenses?new=1')}
        title="Nouvelle dépense"
      >
        <LuPlus className="btn__icon" aria-hidden="true" />
        <span className="rail__cta-label">Nouvelle dépense</span>
      </button>

      <nav className="rail__nav" aria-label="Navigation principale">
        {NAV_SECTIONS.map((section) => (
          <div className="rail__section" key={section.title}>
            <p className="rail__section-title">{section.title}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `rail__item${isActive ? ' is-active' : ''}`}
                  title={item.label}
                >
                  <Icon className="rail__item-icon" aria-hidden="true" />
                  <span className="rail__item-label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="rail__foot">
        <div className="rail__budget">
          <span className="rail__budget-icon" aria-hidden="true">
            <LuTarget />
          </span>
          <span className="rail__budget-text">
            <span className="rail__budget-label">Budget mensuel</span>
            <span className="rail__budget-value tnum">
              {budget > 0 ? formatMoney(budget, currency) : 'Non défini'}
            </span>
          </span>
        </div>

        <div className="rail__user">
          <span className="avatar" aria-hidden="true">
            {(displayName || user?.email || '?').trim().charAt(0).toUpperCase()}
          </span>
          <span className="rail__user-text">
            <span className="rail__user-name">{displayName || 'Utilisateur'}</span>
            <span className="rail__user-email">{user?.email}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
