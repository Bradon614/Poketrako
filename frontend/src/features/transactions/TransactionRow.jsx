import { Badge, IconButton } from '../../components/ui';
import { LuChevronRight, LuPaperclip, LuRepeat, LuFileText } from 'react-icons/lu';
import { receiptUrl } from '../../api';
import './transactions.css';

/**
 * TransactionRow — one expense or income.
 *
 * Shared by the dashboard's recent activity and both list pages, so hierarchy
 * (what → when → how much) is identical everywhere.
 *
 * The row is a real button for the primary action (open/edit) with the
 * secondary actions as siblings, which keeps keyboard order natural — no
 * stretched-link overlay, no nested interactive elements.
 */

export function TransactionRow({
  kind,
  title,
  meta,
  badge,
  description,
  amountLabel,
  amountTone,
  icon,
  color,
  receipt,
  onOpen,
  actions,
  className = '',
}) {
  const Icon = icon;
  const tone = amountTone || (kind === 'income' ? 'income' : 'expense');
  const isRecurring = badge?.recurring;

  return (
    <li className={['tx-row', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="tx-row__main"
        onClick={onOpen}
        aria-label={`${title}, ${amountLabel}. ${onOpen ? 'Ouvrir le détail' : ''}`.trim()}
      >
        <span
          className="tx-row__well"
          style={{ background: `${color}1f`, color }}
          aria-hidden="true"
        >
          {Icon && <Icon />}
        </span>

        <span className="tx-row__body">
          <span className="tx-row__title">
            {title}
            {isRecurring && (
              <Badge tone="accent" icon={LuRepeat}>
                Récurrente
              </Badge>
            )}
            {badge?.label && !isRecurring && <Badge tone={badge.tone}>{badge.label}</Badge>}
          </span>
          <span className="tx-row__meta">
            <span>{meta}</span>
            {description && <span className="tx-row__description">{description}</span>}
          </span>
        </span>

        <span className={`tx-row__amount tx-row__amount--${tone} tnum`}>{amountLabel}</span>
        <LuChevronRight className="tx-row__chevron" aria-hidden="true" />
      </button>

      <div className="tx-row__actions">
        {receipt && (
          <>
            <a
              className="btn btn--quiet btn--icon btn--sm"
              href={receiptUrl(receipt)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir le justificatif"
              title="Voir le justificatif"
            >
              <LuPaperclip aria-hidden="true" />
            </a>
            <span className="sr-only">Justificatif : {receipt.filename}</span>
          </>
        )}
        {actions}
      </div>
    </li>
  );
}

/** Empty/absent receipt placeholder used by the expense form. */
export function ReceiptHint({ receipt, onRemove, onOpen }) {
  if (!receipt) return null;
  return (
    <div className="receipt-hint">
      <span className="receipt-hint__icon" aria-hidden="true">
        <LuFileText />
      </span>
      <span className="receipt-hint__text">
        <strong>{receipt.filename}</strong>
        <em>
          {receipt.contentType}
          {receipt.size ? ` · ${Math.round(receipt.size / 1024)} Ko` : ''}
        </em>
      </span>
      <div className="receipt-hint__actions">
        <IconButton icon={LuPaperclip} label="Ouvrir le justificatif" size="sm" onClick={onOpen} />
        {onRemove && <IconButton icon={LuFileText} label="Supprimer le justificatif" size="sm" variant="danger" onClick={onRemove} />}
      </div>
    </div>
  );
}
