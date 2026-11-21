import { useRef, useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import { useClickOutside, useEscapeKey } from '../../lib/hooks';
import './Controls.css';

/**
 * Small control primitives shared by the toolbars and pages:
 * SegmentedControl, SearchInput, Switch, Badge, Chip, StatDelta, Tooltip.
 */

/* -------------------------------------------------------------------------- */
/* SegmentedControl — iOS-style switch with a sliding thumb                    */
/* -------------------------------------------------------------------------- */

export function SegmentedControl({ options, value, onChange, label, size = 'md', className = '' }) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div
      className={['segmented', `segmented--${size}`, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={label}
      style={{ '--segments': options.length, '--seg-index': activeIndex }}
    >
      <span className="segmented__thumb" aria-hidden="true" />
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`segmented__item${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {Icon && <Icon className="segmented__icon" aria-hidden="true" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SearchInput                                                                 */
/* -------------------------------------------------------------------------- */

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', label = 'Rechercher', className = '' }) {
  return (
    <div className={['search', className].filter(Boolean).join(' ')}>
      <LuSearch className="search__icon" aria-hidden="true" />
      <input
        type="search"
        className="search__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value && (
        <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Effacer la recherche">
          <LuX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Switch — used by the settings screen                                      */
/* -------------------------------------------------------------------------- */

export function Switch({ checked, onChange, label, description, id }) {
  return (
    <div className="switch-field">
      <div className="switch-field__text">
        <span className="switch-field__label" id={id ? `${id}-label` : undefined}>
          {label}
        </span>
        {description && <span className="switch-field__description">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id ? `${id}-label` : undefined}
        className={`switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge / Chip                                                                */
/* -------------------------------------------------------------------------- */

const TONES = ['neutral', 'accent', 'income', 'expense', 'warning'];

export function Badge({ children, tone = 'neutral', icon, className = '' }) {
  const Icon = icon;
  const safeTone = TONES.includes(tone) ? tone : 'neutral';
  return (
    <span className={['badge', `badge--${safeTone}`, className].filter(Boolean).join(' ')}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Chip({ children, tone = 'neutral', icon, selected = false, onClick, className = '', ...rest }) {
  const Icon = icon;
  const safeTone = TONES.includes(tone) ? tone : 'neutral';
  const classes = [
    'chip',
    `chip--${safeTone}`,
    selected ? 'is-selected' : '',
    onClick ? 'chip--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!onClick) {
    return (
      <span className={classes} {...rest}>
        {Icon && <Icon aria-hidden="true" />}
        {children}
      </span>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={selected} {...rest}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Tooltip — CSS-driven, opened on hover *and* focus                           */
/* -------------------------------------------------------------------------- */

export function Tooltip({ content, children, side = 'top' }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setPinned(false), pinned);
  useEscapeKey(() => setPinned(false), pinned);

  return (
    <span
      className="tooltip"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="tooltip__trigger" onClick={() => setPinned((v) => !v)}>
        {children}
      </span>
      {(open || pinned) && (
        <span role="tooltip" className={['tooltip__bubble', `tooltip__bubble--${side}`].join(' ')}>
          {content}
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* StatDelta — signed variation, used on the dashboard                          */
/* -------------------------------------------------------------------------- */

export function StatDelta({ value, label, invert = false }) {
  const isPositive = value >= 0;
  const good = invert ? !isPositive : isPositive;
  const tone = value === 0 ? 'neutral' : good ? 'income' : 'expense';
  const sign = isPositive ? '+' : '−';

  return (
    <span className={`delta delta--${tone}`}>
      {label ? `${label} ` : ''}
      {sign}
      {Math.abs(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%
    </span>
  );
}
