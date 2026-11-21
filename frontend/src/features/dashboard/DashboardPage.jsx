import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPlus, LuWallet, LuBanknote, LuFolderPlus, LuTarget, LuRepeat, LuTrendingUp, LuTrendingDown, LuScale, LuClock } from 'react-icons/lu';
import {
  Alert,
  Button,
  Card,
  ErrorState,
  LinkButton,
  ProgressRing,
  SectionCard,
  Skeleton,
  SkeletonChart,
  SkeletonRows,
  StatDelta,
  StatTile,
} from '../../components/ui';
import BalanceHero from './BalanceHero';
import CategoryBreakdown from './CategoryBreakdown';
import RecentActivity from './RecentActivity';
import ExpenseFormModal from '../expenses/ExpenseFormModal';
import IncomeFormModal from '../incomes/IncomeFormModal';
import { useDashboardData } from './useDashboardData';
import { useSession } from '../../lib/session';
import { useCategories } from '../categories/useCategories';
import { formatMoney } from '../../currency';
import { formatMonthLabel } from '../../lib/dates';
import './Dashboard.css';

/**
 * The chart (Chart.js) is by far the heaviest dependency in the app and only
 * the dashboard needs it — loading it on demand keeps the login screen and the
 * list pages light. The Suspense fallback mirrors the final card, so there is
 * no layout shift while the chunk arrives.
 */
const CashFlowChart = lazy(() => import('./CashFlowChart'));

/**
 * DashboardPage — the product's front door.
 *
 * Hierarchy: the available balance leads, then the month's flows, then budget
 * consumption, then the chart / breakdown / activity. Secondary KPIs are
 * demoted to small tiles so the page answers "where do I stand?" before it
 * answers "why?".
 */

const DashboardPage = () => {
  const navigate = useNavigate();
  const { displayName, currency, budget } = useSession();
  const { categories } = useCategories();
  const data = useDashboardData(6);

  const [expenseModal, setExpenseModal] = useState({ open: false, expense: null });
  const [incomeModal, setIncomeModal] = useState({ open: false, income: null });

  const monthLabel = formatMonthLabel(new Date());
  const summary = data.summary;

  if (data.error && !summary) {
    return <ErrorState title="Tableau de bord indisponible" message={data.error} onRetry={data.refetch} />;
  }

  const expenses = Number(summary?.expenses || 0);
  const income = Number(summary?.income || 0);
  const effectiveBudget = Number(summary?.budget || budget || 0);
  const budgetRatio = effectiveBudget > 0 ? expenses / effectiveBudget : 0;
  const overBudget = effectiveBudget > 0 && expenses > effectiveBudget;

  return (
    <>
      <div className="dash-hello">
        <div>
          <p className="eyebrow">{monthLabel}</p>
          <h2 className="dash-hello__title">
            Bonjour {displayName ? displayName.split(' ')[0] : ''} 👋
          </h2>
          <p className="dash-hello__text">
            Voici l’état de vos finances {effectiveBudget > 0 ? 'et de votre budget ' : ''}ce mois-ci.
          </p>
        </div>

        <div className="dash-hello__actions">
          <Button variant="primary" icon={LuPlus} onClick={() => setExpenseModal({ open: true, expense: null })}>
            Nouvelle dépense
          </Button>
          <Button variant="secondary" icon={LuBanknote} onClick={() => setIncomeModal({ open: true, income: null })}>
            Revenu
          </Button>
        </div>
      </div>

      {data.alert?.alert && (
        <Alert
          tone="warning"
          title="Attention à votre budget"
          action={
            <LinkButton to="/budget" variant="secondary" size="sm">
              Voir le budget
            </LinkButton>
          }
        >
          {data.alert.message}
        </Alert>
      )}

      {summary ? (
        <BalanceHero
          summary={summary}
          currency={currency}
          expenseDelta={data.expenseDelta}
          incomeDelta={data.incomeDelta}
          monthLabel={monthLabel}
        />
      ) : (
        <Skeleton height={196} radius="var(--r-2xl)" />
      )}

      <div className="dash-kpis">
        <Card className="dash-kpi">
          <StatTile
            label="Revenus du mois"
            value={formatMoney(income, currency)}
            icon={LuTrendingUp}
            tone="income"
            delta={<StatDelta value={data.incomeDelta} />}
          />
        </Card>
        <Card className="dash-kpi">
          <StatTile
            label="Dépenses du mois"
            value={formatMoney(expenses, currency)}
            icon={LuTrendingDown}
            tone="expense"
            delta={<StatDelta value={data.expenseDelta} invert />}
          />
        </Card>
        <Card className="dash-kpi">
          <StatTile
            label="Solde du mois"
            value={formatMoney(income - expenses, currency)}
            icon={LuScale}
            tone={income - expenses >= 0 ? 'income' : 'expense'}
            hint={`${data.expenseCount} opération${data.expenseCount > 1 ? 's' : ''}`}
          />
        </Card>
        <Card className="dash-kpi">
          <StatTile
            label="Dépenses récurrentes"
            value={formatMoney(data.recurringTotal, currency)}
            icon={LuRepeat}
            tone="accent"
            hint="Abonnements et charges fixes"
          />
        </Card>
      </div>

      <div className="page-grid page-grid--2">
        <Suspense
          fallback={
            <SectionCard title="Flux de trésorerie">
              <SkeletonChart height={248} />
            </SectionCard>
          }
        >
          <CashFlowChart series={data.series} currency={currency} loading={data.loading} />
        </Suspense>

        <SectionCard
          title="Budget du mois"
          subtitle={effectiveBudget > 0 ? `sur ${formatMoney(effectiveBudget, currency)}` : 'Aucune enveloppe définie'}
          action={
            <LinkButton to="/budget" variant="quiet" size="sm" icon={LuTarget}>
              Gérer
            </LinkButton>
          }
        >
          {effectiveBudget > 0 ? (
            <div className="dash-budget">
              <ProgressRing
                value={budgetRatio}
                tone={overBudget ? 'expense' : budgetRatio > 0.75 ? 'warning' : 'accent'}
                label="du budget utilisé"
                sublabel="utilisé"
              />
              <dl className="dash-budget__facts">
                <div>
                  <dt>Dépensé</dt>
                  <dd className="tnum">{formatMoney(expenses, currency)}</dd>
                </div>
                <div>
                  <dt>{overBudget ? 'Dépassement' : 'Restant'}</dt>
                  <dd className={overBudget ? 'is-over tnum' : 'tnum'}>
                    {formatMoney(Math.abs(effectiveBudget - expenses), currency)}
                  </dd>
                </div>
                <div>
                  <dt>Moyenne / jour</dt>
                  <dd className="tnum">
                    {formatMoney(expenses / Math.max(new Date().getDate(), 1), currency)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="dash-budget-empty">
              <span className="state__icon" aria-hidden="true">
                <LuTarget />
              </span>
              <p className="state__message">
                Définissez un budget mensuel pour suivre votre consommation et recevoir une alerte en
                cas de dépassement.
              </p>
              <Button variant="primary" icon={LuTarget} onClick={() => navigate('/budget')}>
                Définir mon budget
              </Button>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="page-grid page-grid--2">
        <RecentActivity
          items={data.recent}
          currency={currency}
          loading={data.loading}
          onOpenExpense={(expense) => setExpenseModal({ open: true, expense })}
          onOpenIncome={(incomeItem) => setIncomeModal({ open: true, income: incomeItem })}
        />

        <div className="dash-side">
          <CategoryBreakdown
            breakdown={data.breakdown}
            total={data.breakdownTotal}
            currency={currency}
            loading={data.loading}
            monthLabel={monthLabel}
          />

          <SectionCard title="Raccourcis">
            <div className="dash-shortcuts">
              <LinkButton to="/expenses/new" variant="secondary" icon={LuPlus} fullWidth>
                Ajouter une dépense
              </LinkButton>
              <LinkButton to="/incomes/new" variant="secondary" icon={LuBanknote} fullWidth>
                Ajouter un revenu
              </LinkButton>
              <LinkButton to="/categories" variant="secondary" icon={LuFolderPlus} fullWidth>
                Gérer les catégories
              </LinkButton>
              <LinkButton to="/expenses" variant="quiet" icon={LuWallet} fullWidth>
                Voir toutes mes dépenses
              </LinkButton>
            </div>
          </SectionCard>

          <SectionCard title="Ce mois en bref" subtitle="Repères rapides">
            {data.loading ? (
              <SkeletonRows rows={3} withWell={false} />
            ) : (
              <ul className="dash-facts">
                <li>
                  <LuClock aria-hidden="true" />
                  <span>Mouvements enregistrés</span>
                  <strong className="tnum">
                    {data.recent.length > 0 ? `${data.expenseCount + (data.recent.filter((r) => r.kind === 'income').length || 0)}` : '0'}
                  </strong>
                </li>
                <li>
                  <LuRepeat aria-hidden="true" />
                  <span>Part des dépenses récurrentes</span>
                  <strong className="tnum">
                    {expenses > 0 ? `${Math.round((data.recurringTotal / expenses) * 100)}%` : '—'}
                  </strong>
                </li>
                <li>
                  <LuScale aria-hidden="true" />
                  <span>Taux d’épargne du mois</span>
                  <strong className="tnum">
                    {income > 0 ? `${Math.max(0, Math.round(((income - expenses) / income) * 100))}%` : '—'}
                  </strong>
                </li>
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <ExpenseFormModal
        open={expenseModal.open}
        expense={expenseModal.expense}
        categories={categories}
        currency={currency}
        onClose={() => setExpenseModal({ open: false, expense: null })}
        onSaved={data.refetch}
      />
      <IncomeFormModal
        open={incomeModal.open}
        income={incomeModal.income}
        currency={currency}
        onClose={() => setIncomeModal({ open: false, income: null })}
        onSaved={data.refetch}
      />
    </>
  );
};

export default DashboardPage;
