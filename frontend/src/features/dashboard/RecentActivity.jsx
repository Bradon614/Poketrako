import { Link } from 'react-router-dom';
import { LuArrowRight, LuInbox } from 'react-icons/lu';
import { EmptyState, SectionCard, SkeletonRows } from '../../components/ui';
import { formatMoney } from '../../currency';
import { formatRelative } from '../../lib/dates';
import { getCategoryVisual } from '../../lib/categoryVisual';
import { TransactionRow } from '../transactions/TransactionRow';

/**
 * RecentActivity — the latest movements, expenses and incomes merged.
 *
 * Kept to a single column of rows (no table): the eye follows one line per
 * movement, with the amount right-aligned so figures can be compared without
 * reading the labels.
 */

const RecentActivity = ({ items = [], currency, loading = false, onOpenExpense, onOpenIncome }) => {
  const hasItems = items.length > 0;

  return (
    <SectionCard
      title="Activité récente"
      subtitle={hasItems ? 'Vos derniers mouvements, tous types confondus' : undefined}
      action={
        <Link to="/expenses" className="section-card__link">
          Tout voir
          <LuArrowRight aria-hidden="true" />
        </Link>
      }
      padded={false}
    >
      {loading ? (
        <SkeletonRows rows={5} />
      ) : hasItems ? (
        <ul className="tx-list">
          {items.map((entry) => {
            const isExpense = entry.kind === 'expense';
            const data = entry.data;
            const title = isExpense
              ? data.category?.name || data.description || 'Sans catégorie'
              : data.source;
            const visual = isExpense
              ? getCategoryVisual(data.category?.name || data.description)
              : { icon: undefined, color: 'var(--c-income)' };

            return (
              <TransactionRow
                key={`${entry.kind}-${data.id}`}
                kind={entry.kind}
                title={title}
                meta={formatRelative(data.date || data.creationDate)}
                description={isExpense && data.category ? data.description : undefined}
                badge={isExpense && data.type === 'RECURRING' ? { recurring: true } : undefined}
                amountLabel={`${isExpense ? '−' : '+'}${formatMoney(data.amount, currency)}`}
                icon={isExpense ? visual.icon : undefined}
                color={visual.color}
                receipt={isExpense ? data.receiptUpload : undefined}
                onOpen={() => (isExpense ? onOpenExpense(data) : onOpenIncome(data))}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={LuInbox}
          title="Aucun mouvement pour l'instant"
          message="Ajoutez une première dépense ou un revenu : votre activité apparaîtra ici."
          className="state--compact"
        />
      )}
    </SectionCard>
  );
};

export default RecentActivity;
