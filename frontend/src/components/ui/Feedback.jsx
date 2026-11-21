import { LuCircleAlert, LuInbox, LuLoaderCircle, LuRefreshCw } from 'react-icons/lu';
import { Button } from './Button';
import './Feedback.css';

/**
 * Feedback layer: skeletons, spinners, empty states, error states and inline
 * alerts. Centralised so loading and failure look the same everywhere.
 */

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

export function Skeleton({ width = '100%', height = 14, radius = 'var(--r-sm)', className = '' }) {
  return (
    <span
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** A few lines of skeleton text, used while a card's content loads. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <span className={['skeleton-text', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} height={12} width={index === lines - 1 ? '62%' : '100%'} />
      ))}
    </span>
  );
}

/** Placeholder rows for the transaction lists. */
export function SkeletonRows({ rows = 4, withWell = true }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-rows__row" key={index}>
          {withWell && <Skeleton width={42} height={42} radius="var(--r-md)" />}
          <span className="skeleton-rows__text">
            <Skeleton width={`${58 - index * 6}%`} height={13} />
            <Skeleton width="34%" height={11} />
          </span>
          <Skeleton width={78} height={15} />
        </div>
      ))}
    </div>
  );
}

/** Chart placeholder that keeps the final height (no layout shift). */
export function SkeletonChart({ height = 240 }) {
  return (
    <div className="skeleton-chart" style={{ height }} aria-hidden="true">
      {[42, 66, 54, 78, 60].map((value, index) => (
        <Skeleton key={index} width={`${100 / 5 - 3}%`} height={`${value}%`} radius="var(--r-sm)" />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Spinner                                                                     */
/* -------------------------------------------------------------------------- */

export function Spinner({ size = 18, label }) {
  return (
    <span className="spinner" role="status" aria-live="polite">
      <LuLoaderCircle style={{ width: size, height: size }} aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : <span className="sr-only">Chargement…</span>}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* States                                                                      */
/* -------------------------------------------------------------------------- */

export function EmptyState({ title, message, icon, action, className = '' }) {
  const Icon = icon || LuInbox;
  return (
    <div className={['state', className].filter(Boolean).join(' ')}>
      <span className="state__icon" aria-hidden="true">
        <Icon />
      </span>
      <h3 className="state__title">{title}</h3>
      {message && <p className="state__message">{message}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Une erreur est survenue', message, onRetry, className = '' }) {
  return (
    <div className={['state', 'state--error', className].filter(Boolean).join(' ')} role="alert">
      <span className="state__icon" aria-hidden="true">
        <LuCircleAlert />
      </span>
      <h3 className="state__title">{title}</h3>
      {message && <p className="state__message">{message}</p>}
      {onRetry && (
        <div className="state__action">
          <Button variant="secondary" icon={LuRefreshCw} onClick={onRetry}>
            Réessayer
          </Button>
        </div>
      )}
    </div>
  );
}

/** Inline alert banner (budget overrun, session warning, form-level error). */
export function Alert({ tone = 'warning', icon, title, children, action, className = '' }) {
  const Icon = icon || LuCircleAlert;
  return (
    <div className={['alert', `alert--${tone}`, className].filter(Boolean).join(' ')} role="status">
      <Icon className="alert__icon" aria-hidden="true" />
      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__body">{children}</div>
      </div>
      {action && <div className="alert__action">{action}</div>}
    </div>
  );
}
