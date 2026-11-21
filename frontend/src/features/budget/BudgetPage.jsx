import { useMemo, useState } from 'react';
import {
  LuChartPie,
  LuCircleCheck,
  LuGauge,
  LuPencil,
  LuPlus,
  LuTarget,
  LuTriangleAlert,
  LuZap,
} from 'react-icons/lu';
import {
  Alert,
  Button,
  Card,
  ErrorState,
  GlassPanel,
  Input,
  ProgressBar,
  ProgressRing,
  SectionCard,
  Skeleton,
  StatTile,
} from '../../components/ui';
import { updateBudget } from '../../api';
import { useDashboardData } from '../dashboard/useDashboardData';
import { useSession } from '../../lib/session';
import { useToast } from '../../lib/toast';
import { formatMoney } from '../../currency';
import { formatMonthLabel } from '../../lib/dates';
import './Budget.css';

/**
 * BudgetPage — a dedicated budget tracking screen.
 *
 * Answers, in order: how much of the envelope is left, how fast it is being
 * consumed, and what is driving it (top categories, recurring share). The
 * budget itself is editable inline, and the same /auth/budget endpoint is used
 * as before.
 */

const BudgetPage = () => {
  const { currency, budget: sessionBudget, patchUser } = useSession();
  const { success, error: toastError } = useToast();
  const data = useDashboardData(6);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const summary = data.summary;
  const budget = Number(summary?.budget ?? sessionBudget ?? 0);
  const expenses = Number(summary?.expenses ?? data.monthExpenses ?? 0);
  const income = Number(summary?.income ?? data.monthIncomes ?? 0);

  const monthLabel = formatMonthLabel(new Date());

  const derived = useMemo(() => {
    const ratio = budget > 0 ? expenses / budget : 0;
    const remaining = Math.max(budget - expenses, 0);
    const over = budget > 0 && expenses > budget;
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyAverage = expenses / Math.max(today, 1);
    const projected = dailyAverage * daysInMonth;
    const remainingDays = Math.max(daysInMonth - today, 1);
    const safeDailySpend = remaining > 0 ? remaining / remainingDays : 0;
    const monthProgress = today / daysInMonth;

    return {
      ratio,
      remaining,
      over,
      dailyAverage,
      projected,
      safeDailySpend,
      percentage: Math.min(Math.round(ratio * 100), 999),
      /** Budget pace vs calendar pace: > 1 means spending faster than time passes. */
      pace: monthProgress > 0 ? ratio / monthProgress : 0,
      daysLeft: remainingDays,
    };
  }, [budget, expenses]);

  const startEditing = () => {
    setValue(budget > 0 ? String(budget) : '');
    setError('');
    setEditing(true);
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    const parsed = value === '' ? 0 : Number(String(value).replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0) {
      setError('Le budget doit être un nombre positif ou nul');
      return;
    }

    setSaving(true);
    try {
      const response = await updateBudget(parsed);
      patchUser({ budget: response?.budget ?? parsed });
      success('Budget mis à jour.');
      setEditing(false);
      await data.refetch();
    } catch (err) {
      const message = err?.message || 'Impossible de mettre à jour le budget';
      setError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  if (data.error && !summary) {
    return <ErrorState title="Budget indisponible" message={data.error} onRetry={data.refetch} />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">Budget mensuel</h2>
          <p className="page-subtitle">
            {budget > 0
              ? `Enveloppe de ${formatMoney(budget, currency)} · ${monthLabel}`
              : 'Définissez une enveloppe pour piloter vos dépenses du mois'}
          </p>
        </div>
        {!editing && (
          <Button variant="secondary" icon={budget > 0 ? LuPencil : LuPlus} onClick={startEditing}>
            {budget > 0 ? 'Modifier le budget' : 'Définir un budget'}
          </Button>
        )}
      </div>

      {editing && (
        <GlassPanel className="budget-editor">
          <form onSubmit={handleSave} className="budget-editor__form">
            <Input
              label="Budget mensuel"
              inputMode="decimal"
              placeholder="0"
              suffix={currency}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={error}
              hint="Laissez vide ou mettez 0 pour désactiver le suivi budgétaire."
              autoFocus
            />
            <div className="budget-editor__actions">
              <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                Annuler
              </Button>
              <Button variant="primary" icon={LuCircleCheck} loading={saving} onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </form>
        </GlassPanel>
      )}

      {budget === 0 && !editing ? (
        <Card>
          <div className="budget-empty">
            <span className="state__icon" aria-hidden="true">
              <LuTarget />
            </span>
            <h3 className="state__title">Aucun budget défini</h3>
            <p className="state__message">
              Fixez un plafond mensuel : Poketrako calcule alors votre consommation, votre rythme et
              vous alerte avant le dépassement.
            </p>
            <Button variant="primary" icon={LuTarget} onClick={startEditing}>
              Définir mon budget
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {derived.over && (
            <Alert tone="danger" icon={LuTriangleAlert} title="Budget dépassé">
              Vous avez dépassé votre enveloppe de {formatMoney(expenses - budget, currency)}. Pensez à
              ajuster vos dépenses variables ou à revoir votre budget.
            </Alert>
          )}

          {!derived.over && derived.pace > 1.15 && budget > 0 && (
            <Alert tone="warning" icon={LuTriangleAlert} title="Rythme soutenu">
              Vous consommez votre budget plus vite que le mois n’avance. Il vous reste{' '}
              {formatMoney(derived.remaining, currency)} pour {derived.daysLeft} jour
              {derived.daysLeft > 1 ? 's' : ''}.
            </Alert>
          )}

          <div className="page-grid page-grid--2">
            <Card className="budget-hero">
              <div className="budget-hero__main">
                {summary ? (
                  <ProgressRing
                    value={derived.ratio}
                    size={168}
                    stroke={13}
                    tone={derived.over ? 'expense' : derived.ratio > 0.75 ? 'warning' : 'accent'}
                    label="du budget consommé"
                    sublabel={`${monthLabel.split(' ')[0]}`}
                  />
                ) : (
                  <Skeleton width={168} height={168} radius="var(--r-pill)" />
                )}

                <dl className="budget-hero__facts">
                  <div>
                    <dt>Budget</dt>
                    <dd className="tnum">{formatMoney(budget, currency)}</dd>
                  </div>
                  <div>
                    <dt>Dépensé</dt>
                    <dd className="tnum">{formatMoney(expenses, currency)}</dd>
                  </div>
                  <div>
                    <dt>{derived.over ? 'Dépassement' : 'Restant'}</dt>
                    <dd className={derived.over ? 'is-over tnum' : 'tnum'}>
                      {formatMoney(derived.over ? expenses - budget : derived.remaining, currency)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="budget-hero__bar">
                <div className="budget-hero__bar-head">
                  <span>Consommation</span>
                  <strong className="tnum">{derived.percentage}%</strong>
                </div>
                <ProgressBar
                  value={derived.ratio}
                  tone={derived.over ? 'expense' : derived.ratio > 0.75 ? 'warning' : 'accent'}
                  height={10}
                  label={`Budget consommé : ${derived.percentage}%`}
                />
              </div>
            </Card>

            <div className="page-grid">
              <Card>
                <div className="budget-kpis">
                  <StatTile
                    label="Dépense moyenne / jour"
                    value={formatMoney(derived.dailyAverage, currency)}
                    icon={LuGauge}
                    tone="accent"
                    hint={`sur ${new Date().getDate()} jour${new Date().getDate() > 1 ? 's' : ''} écoulés`}
                  />
                  <StatTile
                    label="Projection fin de mois"
                    value={formatMoney(derived.projected, currency)}
                    icon={LuZap}
                    tone={derived.projected > budget ? 'expense' : 'income'}
                    hint={derived.projected > budget ? 'Au-dessus du budget' : 'Dans l’enveloppe'}
                  />
                  <StatTile
                    label="Reste à dépenser / jour"
                    value={formatMoney(derived.safeDailySpend, currency)}
                    icon={LuTarget}
                    tone="neutral"
                    hint={`${derived.daysLeft} jour${derived.daysLeft > 1 ? 's' : ''} restant${derived.daysLeft > 1 ? 's' : ''}`}
                  />
                  <StatTile
                    label="Revenus du mois"
                    value={formatMoney(income, currency)}
                    icon={LuChartPie}
                    tone="income"
                    hint={
                      income > 0
                        ? `Taux d’épargne ${Math.max(0, Math.round(((income - expenses) / income) * 100))}%`
                        : 'Aucun revenu enregistré'
                    }
                  />
                </div>
              </Card>

              <SectionCard
                title="Ce qui pèse le plus"
                subtitle="Répartition de vos dépenses du mois"
              >
                {data.breakdown.length === 0 ? (
                  <p className="hint">Aucune dépense ce mois-ci.</p>
                ) : (
                  <ul className="budget-drivers">
                    {data.breakdown.slice(0, 5).map((entry) => {
                      const Icon = entry.icon;
                      const share = data.breakdownTotal > 0 ? (entry.total / data.breakdownTotal) * 100 : 0;
                      return (
                        <li key={entry.name}>
                          <span
                            className="budget-drivers__well"
                            style={{ background: `${entry.color}1f`, color: entry.color }}
                            aria-hidden="true"
                          >
                            <Icon />
                          </span>
                          <span className="budget-drivers__body">
                            <span className="budget-drivers__head">
                              <strong>{entry.name}</strong>
                              <em className="tnum">{formatMoney(entry.total, currency)}</em>
                            </span>
                            <ProgressBar value={entry.total / (data.breakdownTotal || 1)} height={5} tone="accent" />
                            <span className="budget-drivers__meta">
                              {Math.round(share)}% de vos dépenses · {entry.count} opération
                              {entry.count > 1 ? 's' : ''}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BudgetPage;
