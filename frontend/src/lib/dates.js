/**
 * Date helpers shared by the transaction lists, filters and charts.
 * All user-facing output is French, matching the rest of the UI.
 */

export function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, { short = false } = {}) {
  const date = parseDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: short ? 'short' : '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMonthLabel(value) {
  const date = parseDate(value);
  if (!date) return '';
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "Aujourd'hui", "Hier", "Il y a 3 jours", "Il y a 2 mois". */
export function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return '—';
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  }
  const years = Math.floor(diffDays / 365);
  return `Il y a ${years} an${years > 1 ? 's' : ''}`;
}

/** ISO yyyy-mm-dd for <input type="date"> and API params. */
export function toISODate(date) {
  const d = parseDate(date) ?? new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addMonths(date, count) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + count);
  return d;
}

/** True when both dates fall in the same calendar month. */
export function isSameMonth(a, b) {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

/**
 * Preset ranges for the period filter. `value` is what the UI stores; the
 * resolver turns it into { start, end } ISO dates for the API.
 */
export const PERIOD_PRESETS = [
  { value: 'this-month', label: 'Ce mois' },
  { value: 'last-month', label: 'Mois dernier' },
  { value: 'last-3-months', label: '3 mois' },
  { value: 'this-year', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
];

export function resolvePeriod(period, reference = new Date()) {
  switch (period) {
    case 'this-month':
      return { start: toISODate(startOfMonth(reference)), end: toISODate(endOfMonth(reference)) };
    case 'last-month': {
      const previous = addMonths(reference, -1);
      return { start: toISODate(startOfMonth(previous)), end: toISODate(endOfMonth(previous)) };
    }
    case 'last-3-months':
      return { start: toISODate(startOfMonth(addMonths(reference, -2))), end: toISODate(endOfMonth(reference)) };
    case 'this-year':
      return { start: toISODate(new Date(reference.getFullYear(), 0, 1)), end: toISODate(new Date(reference.getFullYear(), 11, 31)) };
    case 'custom':
      return null;
    default:
      return {};
  }
}
