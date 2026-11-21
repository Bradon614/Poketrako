import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuChartColumn,
  LuCircleCheck,
  LuCoins,
  LuLogOut,
  LuMonitor,
  LuMoon,
  LuPalette,
  LuShieldCheck,
  LuSun,
  LuUser,
} from 'react-icons/lu';
import {
  Button,
  Card,
  GlassPanel,
  SectionCard,
  SegmentedControl,
  Switch,
  useConfirm,
} from '../../components/ui';
import { updateBudget, updateCurrency } from '../../api';
import { useSession } from '../../lib/session';
import { useTheme } from '../../lib/theme';
import { useToast } from '../../lib/toast';
import { SUPPORTED_CURRENCIES } from '../../currency';
import { formatMoney } from '../../currency';
import './Settings.css';

/**
 * SettingsPage — account and preferences, macOS-style grouped lists.
 *
 * Sections: profile, appearance, currency, budget, danger zone. Everything the
 * old dashboard widgets did (currency change, budget change, sign out) now
 * lives here, and the appearance section is new (light / dark / system, which
 * is persisted).
 */

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: LuSun },
  { value: 'dark', label: 'Sombre', icon: LuMoon },
  { value: 'system', label: 'Système', icon: LuMonitor },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, displayName, currency, budget, patchUser, logout, refresh } = useSession();
  const { mode, setMode, resolved } = useTheme();
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [currencySaving, setCurrencySaving] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    setBudgetValue(budget > 0 ? String(budget) : '');
  }, [budget]);

  const handleCurrency = async (next) => {
    if (next === currency) return;
    setCurrencySaving(true);
    try {
      const response = await updateCurrency(next);
      patchUser({ currency: response?.currency ?? next });
      success(`Devise mise à jour (${next}).`);
    } catch (error) {
      toastError(error?.message || 'Impossible de changer la devise');
    } finally {
      setCurrencySaving(false);
    }
  };

  const handleBudget = async (event) => {
    event?.preventDefault();
    const parsed = budgetValue === '' ? 0 : Number(String(budgetValue).replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0) {
      setBudgetError('Le budget doit être un nombre positif ou nul');
      return;
    }
    setBudgetError('');
    setBudgetSaving(true);
    try {
      const response = await updateBudget(parsed);
      patchUser({ budget: response?.budget ?? parsed });
      success('Budget mis à jour.');
    } catch (error) {
      const message = error?.message || 'Impossible de mettre à jour le budget';
      setBudgetError(message);
      toastError(message);
    } finally {
      setBudgetSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Se déconnecter ?',
      message: 'Vous devrez saisir vos identifiants pour revenir sur votre tableau de bord.',
      confirmLabel: 'Déconnexion',
      destructive: true,
    });
    if (confirmed) logout();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">Paramètres</h2>
          <p className="page-subtitle">Compte, apparence, devise et budget</p>
        </div>
      </div>

      <SectionCard title="Compte" subtitle="Informations rattachées à votre session">
        <GlassPanel quiet className="settings-profile">
          <span className="avatar settings-profile__avatar" aria-hidden="true">
            {(displayName || user?.email || '?').trim().charAt(0).toUpperCase()}
          </span>
          <div className="settings-profile__body">
            <p className="settings-profile__name">
              <LuUser aria-hidden="true" />
              {displayName || 'Utilisateur'}
            </p>
            <p className="settings-profile__email">{user?.email}</p>
          </div>
          <div className="settings-profile__meta">
            <span className="badge badge--accent">
              <LuShieldCheck aria-hidden="true" />
              Session JWT active
            </span>
          </div>
        </GlassPanel>

        <ul className="settings-list">
          <li className="settings-list__row">
            <span className="settings-list__label">Identifiant</span>
            <span className="settings-list__value">#{user?.id ?? '—'}</span>
          </li>
          <li className="settings-list__row">
            <span className="settings-list__label">Devise active</span>
            <span className="settings-list__value">{currency}</span>
          </li>
          <li className="settings-list__row">
            <span className="settings-list__label">Budget mensuel</span>
            <span className="settings-list__value tnum">
              {budget > 0 ? formatMoney(budget, currency) : 'Non défini'}
            </span>
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Apparence" subtitle="Le thème est mémorisé sur cet appareil">
        <div className="settings-theme">
          <SegmentedControl
            options={THEME_OPTIONS}
            value={mode}
            onChange={setMode}
            label="Choix du thème"
            className="segmented--keep-labels settings-theme__control"
          />
          <p className="hint">
            Thème actif : <strong>{resolved === 'dark' ? 'sombre' : 'clair'}</strong>
            {mode === 'system' ? ' (suivant les réglages de votre appareil)' : ''}.
          </p>
        </div>

        <div className="settings-list">
          <Switch
            checked={mode !== 'system'}
            onChange={(checked) => setMode(checked ? resolved : 'system')}
            label="Ignorer le réglage système"
            description="Fige le thème choisi au lieu de suivre l’appareil."
            id="theme-override"
          />
        </div>
      </SectionCard>

      <SectionCard title="Devise" subtitle="Utilisée pour tous les montants affichés">
        <ul className="settings-list">
          {SUPPORTED_CURRENCIES.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className={`settings-list__row settings-list__row--action${currency === item.code ? ' is-selected' : ''}`}
                onClick={() => handleCurrency(item.code)}
                disabled={currencySaving}
                aria-pressed={currency === item.code}
              >
                <span className="settings-list__icon" aria-hidden="true">
                  <LuCoins />
                </span>
                <span className="settings-list__label settings-list__label--stacked">
                  <strong>{item.code}</strong>
                  <em>{item.label}</em>
                </span>
                {currency === item.code && <LuCircleCheck className="settings-list__check" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Budget mensuel" subtitle="Enveloppe utilisée par le suivi et les alertes">
        <form className="settings-budget" onSubmit={handleBudget}>
          <label className="settings-budget__field">
            <span className="settings-list__label">Montant du budget</span>
            <span className={`settings-budget__control${budgetError ? ' is-error' : ''}`}>
              <LuChartColumn aria-hidden="true" />
              <input
                type="text"
                inputMode="decimal"
                value={budgetValue}
                onChange={(event) => setBudgetValue(event.target.value)}
                placeholder="0"
                aria-label="Montant du budget mensuel"
                aria-invalid={budgetError ? 'true' : undefined}
              />
              <span className="settings-budget__suffix">{currency}</span>
            </span>
          </label>

          <div className="settings-budget__actions">
            <Button type="submit" variant="primary" icon={LuCircleCheck} loading={budgetSaving}>
              Enregistrer
            </Button>
            <Button variant="secondary" onClick={() => navigate('/budget')}>
              Voir le suivi
            </Button>
          </div>
        </form>
        {budgetError && (
          <p className="field__message field__message--error" role="alert">
            {budgetError}
          </p>
        )}
      </SectionCard>

      <SectionCard title="Zone sensible" subtitle="Actions irréversibles">
        <div className="settings-danger">
          <Card inset className="settings-danger__card">
            <div>
              <p className="settings-danger__title">
                <LuPalette aria-hidden="true" />
                Réinitialiser les préférences locales
              </p>
              <p className="hint">
                Efface le thème mémorisé et recharge votre profil depuis le serveur. Vos données
                financières ne sont pas touchées.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  localStorage.removeItem('poketrako.theme');
                  await refresh();
                  success('Préférences réinitialisées.');
                } catch {
                  toastError('Impossible de recharger le profil');
                }
              }}
            >
              Réinitialiser
            </Button>
          </Card>

          <Card inset className="settings-danger__card">
            <div>
              <p className="settings-danger__title">
                <LuLogOut aria-hidden="true" />
                Se déconnecter
              </p>
              <p className="hint">Met fin à la session sur cet appareil.</p>
            </div>
            <Button variant="danger" icon={LuLogOut} onClick={handleLogout}>
              Déconnexion
            </Button>
          </Card>
        </div>
      </SectionCard>
    </>
  );
};

export default SettingsPage;
