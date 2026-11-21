import { Link } from 'react-router-dom';
import { LuChartPie, LuArrowRight } from 'react-icons/lu';
import { CategoryBar, EmptyState, SectionCard, SkeletonRows } from '../../components/ui';
import { formatMoney } from '../../currency';

/**
 * CategoryBreakdown — where the month's money actually went.
 *
 * Ranked rows with a share bar each; the long tail is folded into an "Autres"
 * bucket so the card stays readable instead of turning into a table.
 */

const MAX_ROWS = 5;

const CategoryBreakdown = ({ breakdown = [], total = 0, currency, loading = false, monthLabel }) => {
  const top = breakdown.slice(0, MAX_ROWS);
  const rest = breakdown.slice(MAX_ROWS);
  const restTotal = rest.reduce((sum, entry) => sum + entry.total, 0);

  return (
    <SectionCard
      title="Répartition par catégorie"
      subtitle={total > 0 ? `${formatMoney(total, currency)} dépensés · ${monthLabel || 'ce mois'}` : monthLabel}
      action={
        <Link to="/expenses" className="section-card__link">
          Voir tout
          <LuArrowRight aria-hidden="true" />
        </Link>
      }
    >
      {loading ? (
        <SkeletonRows rows={5} withWell={false} />
      ) : breakdown.length === 0 ? (
        <EmptyState
          icon={LuChartPie}
          title="Aucune dépense ce mois"
          message="Vos catégories apparaîtront ici dès la première dépense enregistrée."
          className="state--compact"
        />
      ) : (
        <>
          {top.map((entry) => (
            <CategoryBar
              key={entry.name}
              name={entry.name}
              icon={entry.icon}
              color={entry.color}
              amount={formatMoney(entry.total, currency)}
              percent={total > 0 ? (entry.total / total) * 100 : 0}
            />
          ))}

          {rest.length > 0 && (
            <CategoryBar
              name={`Autres (${rest.length})`}
              amount={formatMoney(restTotal, currency)}
              percent={total > 0 ? (restTotal / total) * 100 : 0}
              color="var(--c-text-3)"
            />
          )}
        </>
      )}
    </SectionCard>
  );
};

export default CategoryBreakdown;
