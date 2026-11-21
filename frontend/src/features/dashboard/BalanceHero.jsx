import { LuArrowDownRight, LuArrowUpRight, LuInfo, LuTarget } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { ProgressBar } from '../../components/ui';
import { formatMoney } from '../../currency';

/**
 * BalanceHero — the one loud surface on the dashboard.
 *
 * A solid brand gradient (deliberately not glass: glass under big numerals
 * costs legibility) with the available balance, this month's income/expense
 * and the budget consumption bar. Everything else on the page stays quiet so
 * this reads first.
 */

const BalanceHero = ({ summary, currency, expenseDelta, incomeDelta, monthLabel }) => {
  const budget = Number(summary?.budget || 0);
  const expenses = Number(summary?.expenses || 0);
  const income = Number(summary?.income || 0);
  const balance = Number(summary?.balance || 0);

  const hasBudget = budget > 0;
  const ratio = hasBudget ? expenses / budget : 0;
  const remaining = Math.max(budget - expenses, 0);
  const over = hasBudget && expenses > budget;
  const percent = Math.min(Math.round(ratio * 100), 100);

  return (
    <section className="hero brand-surface" aria-label="Solde disponible">
      <div className="hero__top">
        <div>
          <p className="hero__eyebrow">Solde disponible</p>
          <p className="hero__amount tnum">{formatMoney(balance, currency)}</p>
          <p className="hero__period">{monthLabel}</p>
        </div>

        <div className="hero__flows">
          <div className="hero__flow">
            <span className="hero__flow-icon hero__flow-icon--in" aria-hidden="true">
              <LuArrowDownRight />
            </span>
            <span>
              <span className="hero__flow-label">Revenus</span>
              <span className="hero__flow-value tnum">{formatMoney(income, currency)}</span>
            </span>
            {Number.isFinite(incomeDelta) && (
              <span className="hero__flow-delta">{formatDelta(incomeDelta)}</span>
            )}
          </div>

          <div className="hero__flow">
            <span className="hero__flow-icon hero__flow-icon--out" aria-hidden="true">
              <LuArrowUpRight />
            </span>
            <span>
              <span className="hero__flow-label">Dépenses</span>
              <span className="hero__flow-value tnum">{formatMoney(expenses, currency)}</span>
            </span>
            {Number.isFinite(expenseDelta) && (
              <span className="hero__flow-delta">{formatDelta(expenseDelta)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="hero__budget">
        {hasBudget ? (
          <>
            <div className="hero__budget-head">
              <span className="hero__budget-label">
                <LuTarget aria-hidden="true" />
                Budget utilisé · {percent}%
              </span>
              <span className="hero__budget-value tnum">
                {over
                  ? `Dépassé de ${formatMoney(expenses - budget, currency)}`
                  : `${formatMoney(remaining, currency)} restants`}
              </span>
            </div>
            <ProgressBar
              value={ratio}
              tone={over ? 'expense' : 'accent'}
              height={8}
              label={`Budget consommé : ${percent}%`}
              className="hero__progress"
            />
          </>
        ) : (
          <p className="hero__budget-empty">
            <LuInfo aria-hidden="true" />
            Aucun budget défini pour ce mois.{' '}
            <Link to="/budget" className="hero__budget-link">
              Définir un budget
            </Link>
          </p>
        )}
      </div>
    </section>
  );
};

function formatDelta(value) {
  const sign = value >= 0 ? '+' : '−';
  return `${sign}${Math.abs(value).toFixed(0)}% vs mois dernier`;
}

export default BalanceHero;
