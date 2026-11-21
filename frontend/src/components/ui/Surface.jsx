import './Surface.css';

/**
 * Surface primitives.
 *
 *   Card        L1 — solid panel for data that must stay legible
 *   GlassPanel  L2 — frosted panel for toolbars, filters, grouped controls
 *   SectionCard Card with a built-in header (title + action)
 *
 * The distinction is deliberate: financial figures never sit on a blurred
 * surface, chrome does.
 */

export function Card({ children, className = '', inset = false, raised = false, as, ...rest }) {
  const Tag = as || 'section';
  const classes = [
    'surface',
    inset ? 'surface--inset' : '',
    raised ? 'surface--raised' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function GlassPanel({ children, className = '', quiet = false, as, ...rest }) {
  const Tag = as || 'section';
  const classes = [
    'glass',
    quiet ? 'glass--quiet' : 'glass--panel',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
  padded = true,
  ...rest
}) {
  return (
    <Card className={`section-card ${className}`} {...rest}>
      {(title || action) && (
        <header className="section-card__head">
          <div className="section-card__titles">
            {title && <h2 className="section-card__title">{title}</h2>}
            {subtitle && <p className="section-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="section-card__action">{action}</div>}
        </header>
      )}
      <div className={[padded ? 'section-card__body' : '', bodyClassName].filter(Boolean).join(' ')}>
        {children}
      </div>
    </Card>
  );
}
