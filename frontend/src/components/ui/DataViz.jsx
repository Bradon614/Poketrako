import './DataViz.css';

/**
 * Data visualisation primitives.
 *
 * Deliberately lightweight (no chart library): a progress bar, an SVG ring
 * for budget consumption, a category breakdown row and a stat tile. The heavy
 * charting (cash-flow bars) stays on Chart.js.
 */

const TONE_VARS = {
  accent: 'var(--c-accent)',
  income: 'var(--c-income)',
  expense: 'var(--c-expense)',
  warning: 'var(--c-warning)',
};

export function ProgressBar({ value, tone = 'accent', height = 8, label, className = '' }) {
  const percent = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  const color = TONE_VARS[tone] || TONE_VARS.accent;

  return (
    <div
      className={['progress', className].filter(Boolean).join(' ')}
      style={{ '--progress-value': `${percent}%`, '--progress-color': color, '--progress-height': `${height}px` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label}
    >
      <span className="progress__track">
        <span className="progress__fill" />
      </span>
    </div>
  );
}

/**
 * ProgressRing — used for "budget used". The value is rendered in the middle
 * so the ring reads as a single object rather than a chart.
 */
export function ProgressRing({ value, size = 132, stroke = 11, label, sublabel, tone = 'accent' }) {
  const percent = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * percent;
  const color = TONE_VARS[tone] || TONE_VARS.accent;

  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(percent * 100)}% ${label || ''}`.trim()}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__content">
        <span className="ring__number tnum">{Math.round(percent * 100)}%</span>
        {sublabel && <span className="ring__sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}

/** One row of the category breakdown: icon well, name, share bar, amount. */
export function CategoryBar({ name, amount, percent, color, icon }) {
  const Icon = icon;
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="cat-row">
      <span className="cat-row__well" style={{ background: `${color}1f`, color }} aria-hidden="true">
        {Icon ? <Icon /> : <span className="cat-row__dot" style={{ background: color }} />}
      </span>
      <div className="cat-row__body">
        <div className="cat-row__head">
          <span className="cat-row__name">{name}</span>
          <span className="cat-row__amount tnum">{amount}</span>
        </div>
        <span className="cat-row__track">
          <span className="cat-row__fill" style={{ width: `${safePercent}%`, background: color }} />
        </span>
      </div>
    </div>
  );
}

/** Compact metric tile (used for secondary KPIs). */
export function StatTile({ label, value, icon, tone = 'neutral', hint, delta }) {
  const Icon = icon;
  return (
    <div className="tile">
      {Icon && (
        <span className={`tile__well tile__well--${tone}`} aria-hidden="true">
          <Icon />
        </span>
      )}
      <div className="tile__body">
        <span className="tile__label">{label}</span>
        <span className="tile__value tnum">{value}</span>
        {(hint || delta) && (
          <span className="tile__foot">
            {hint && <span className="tile__hint">{hint}</span>}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
