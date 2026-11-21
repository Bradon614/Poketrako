import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { LuLoaderCircle } from 'react-icons/lu';
import './Button.css';

/**
 * Button — the single action primitive.
 *
 * Variants map to intent, not colour: `primary` is the one gradient CTA per
 * view, `secondary` is a frosted action, `quiet` is a low-emphasis inline
 * action, `danger` is destructive. Every variant shares the same size scale,
 * press feedback, loading and focus behaviour.
 */

const VARIANTS = ['primary', 'secondary', 'quiet', 'danger', 'success'];
const SIZES = ['sm', 'md', 'lg'];

function classesFor({ variant, size, fullWidth, iconOnly, className }) {
  return [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    iconOnly ? 'btn--icon' : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');
}

const content = ({ icon, iconRight, loading, children }) => {
  const Icon = icon;
  const IconRight = iconRight;
  return (
  <>
    {loading ? (
      <LuLoaderCircle className="btn__spinner" aria-hidden="true" />
    ) : (
      Icon && <Icon className="btn__icon" aria-hidden="true" />
    )}
    {children != null && children !== false && <span className="btn__label">{children}</span>}
      {IconRight && !loading && <IconRight className="btn__icon btn__icon--right" aria-hidden="true" />}
    </>
  );
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    className = '',
    ...rest
  },
  ref
) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'secondary';
  const safeSize = SIZES.includes(size) ? size : 'md';
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      className={classesFor({ variant: safeVariant, size: safeSize, fullWidth, className })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content({ icon, iconRight, loading, children, size: safeSize })}
    </button>
  );
});

/** Same visual language, but for navigation (renders a react-router Link). */
export function LinkButton({
  children,
  to,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  ...rest
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'secondary';
  const safeSize = SIZES.includes(size) ? size : 'md';

  return (
    <Link
      to={to}
      className={classesFor({ variant: safeVariant, size: safeSize, fullWidth, className })}
      {...rest}
    >
      {content({ icon, iconRight, loading: false, children, size: safeSize })}
    </Link>
  );
}

/**
 * IconButton — square/circular icon-only action. `bare` removes the surface
 * (used inside list rows), `label` is required for accessibility.
 */
export const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    variant = 'quiet',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...rest
  },
  ref
) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'quiet';
  const safeSize = SIZES.includes(size) ? size : 'md';

  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={classesFor({
        variant: safeVariant,
        size: safeSize,
        iconOnly: true,
        className: `iconbtn ${className}`,
      })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LuLoaderCircle className="btn__spinner" aria-hidden="true" /> : Icon && <Icon aria-hidden="true" />}
    </button>
  );
});
