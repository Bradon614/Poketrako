import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuChevronDown, LuLogOut, LuMoon, LuSettings, LuSun, LuSunMoon } from 'react-icons/lu';
import { metaForPath } from './navigation';
import { useSession } from '../lib/session';
import { useTheme } from '../lib/theme';
import { useClickOutside, useEscapeKey } from '../lib/hooks';

/**
 * TopBar — quiet, useful header.
 *
 * Left: current page title + context (on phones: the brand instead).
 * Right: quick theme switch and the account menu (settings + sign out), which
 * is what keeps "Paramètres" reachable on phones where the rail is a tab bar.
 */

const TopBar = () => {
  const { pathname } = useLocation();
  const { title, subtitle } = metaForPath(pathname);
  const { user, displayName, logout } = useSession();
  const { resolved, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);
  useEscapeKey(() => setMenuOpen(false), menuOpen);

  const isDark = resolved === 'dark';

  return (
    <header className="topbar glass--chrome">
      <div className="topbar__brand">
        <img src="/logo.svg" alt="" className="topbar__logo" />
        <span className="topbar__brand-name">Poketrako</span>
      </div>

      <div className="topbar__titles">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="topbar__icon-btn"
          onClick={toggle}
          aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
          title={isDark ? 'Thème clair' : 'Thème sombre'}
        >
          {isDark ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
        </button>

        <div className="topbar__menu" ref={menuRef}>
          <button
            type="button"
            className="topbar__account"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="avatar avatar--sm" aria-hidden="true">
              {(displayName || user?.email || '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className="topbar__account-name">{displayName || 'Utilisateur'}</span>
            <LuChevronDown className="topbar__account-chevron" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="menu glass--float" role="menu">
              <div className="menu__header">
                <span className="menu__name">{displayName || 'Utilisateur'}</span>
                <span className="menu__email">{user?.email}</span>
              </div>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <LuSettings aria-hidden="true" />
                Paramètres
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  setMenuOpen(false);
                  toggle();
                }}
              >
                <LuSunMoon aria-hidden="true" />
                {isDark ? 'Thème clair' : 'Thème sombre'}
              </button>
              <div className="divider" />
              <button
                type="button"
                role="menuitem"
                className="menu__item menu__item--danger"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <LuLogOut aria-hidden="true" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
