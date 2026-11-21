import { LuMoon, LuSun, LuTrendingUp, LuShieldCheck, LuChartPie, LuWallet } from 'react-icons/lu';
import { useTheme } from '../../lib/theme';
import './Auth.css';

/**
 * AuthLayout — the frame shared by /login and /signup.
 *
 * Two real pages (no 3D flip card): the marketing panel on the left gives the
 * product context, the form sits on the right in a frosted card. On phones the
 * panel collapses to a compact brand header, and the form becomes the page.
 *
 * Accessibility note: the previous flip-card kept both forms mounted, so the
 * hidden one stayed focusable and was announced by screen readers. Splitting
 * the screens removes that trap entirely.
 */

const HIGHLIGHTS = [
  { icon: LuWallet, title: 'Toutes vos dépenses au même endroit', text: 'Ponctuelles ou récurrentes, avec justificatif.' },
  { icon: LuChartPie, title: 'Un budget que vous maîtrisez', text: 'Suivi en temps réel et alerte de dépassement.' },
  { icon: LuTrendingUp, title: 'Revenus et dépenses équilibrés', text: 'Vision claire de votre mois, en un coup d’œil.' },
];

export default function AuthLayout({ title, subtitle, children, footer, variant = 'login' }) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <div className="auth">
      <div className="auth__ambient" aria-hidden="true" />

      <div className="auth__panel">
        {/* Brand plate, not a link: on the auth screens it would point back to
            the same page and only add a stop to the keyboard order. */}
        <div className="auth__brand">
          <img src="/logo.svg" alt="" className="auth__logo" />
          <span className="auth__brand-name">Poketrako</span>
        </div>

        <div className="auth__pitch">
          <h1 className="auth__headline">
            Reprenez le contrôle de vos <span className="auth__headline-accent">finances</span>.
          </h1>
          <p className="auth__lede">
            Poketrako réunit vos dépenses, vos revenus et votre budget dans une interface claire,
            pensée pour décider vite et sans tableur.
          </p>
        </div>

        <ul className="auth__highlights">
          {HIGHLIGHTS.map((highlight) => {
            const Icon = highlight.icon;
            return (
            <li className="auth__highlight" key={highlight.title}>
              <span className="auth__highlight-icon" aria-hidden="true">
                <Icon />
              </span>
              <span>
                <strong>{highlight.title}</strong>
                <em>{highlight.text}</em>
              </span>
            </li>
            );
          })}
        </ul>

        <p className="auth__trust">
          <LuShieldCheck aria-hidden="true" />
          Vos données restent privées et rattachées à votre compte.
        </p>
      </div>

      <div className="auth__form-side">
        <div className={`auth__card glass--float auth__card--${variant}`}>
          <header className="auth__card-head">
            <h2 className="auth__card-title">{title}</h2>
            {subtitle && <p className="auth__card-subtitle">{subtitle}</p>}
          </header>
          {children}
        </div>

        {footer && <div className="auth__footer">{footer}</div>}

        {/* Kept after the form in the DOM so keyboard users reach the fields
            first; `order` puts it back on top visually on phones. */}
        <div className="auth__controls">
          <button
            type="button"
            className="auth__theme"
            onClick={toggle}
            aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
          >
            {isDark ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
            <span>{isDark ? 'Thème clair' : 'Thème sombre'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
