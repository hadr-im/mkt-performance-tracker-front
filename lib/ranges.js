/**
 * Quick date scopes used by the per-card filter.
 * Ranges are inclusive 'YYYY-MM-DD' strings, matching the API's filters.
 */

const pad = n => String(n).padStart(2, '0');
const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const RANGE_OPTIONS = [
  { id: 'all', label: 'All time', short: 'All time' },
  { id: 'month', label: 'This month', short: 'This month' },
  { id: 'lastMonth', label: 'Last month', short: 'Last month' },
  { id: '3m', label: 'Last 3 months', short: '3 months' },
  { id: '6m', label: 'Last 6 months', short: '6 months' },
];

export const DEFAULT_RANGE = 'all';

/**
 * Resolve a scope id to concrete dates.
 * `anchor` lets callers pin "now" to the newest day in the data rather than
 * the wall clock, so a scope still shows something when the sheet lags.
 */
export function rangeToDates(id, anchor) {
  if (!id || id === 'all') return { from: '', to: '' };

  const today = anchor
    ? (() => {
      const [y, m, d] = anchor.split('-').map(Number);
      return new Date(y, m - 1, d);
    })()
    : new Date();

  const to = key(today);

  if (id === 'month') {
    return { from: key(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  }

  // The previous calendar month in full, not a rolling 30 days.
  if (id === 'lastMonth') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: key(first), to: key(last) };
  }

  const months = id === '3m' ? 3 : id === '6m' ? 6 : 0;
  if (!months) return { from: '', to: '' };

  // Rolling window: same day-of-month N months back, clamped to a valid date.
  const start = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
  return { from: key(start), to };
}

export function rangeLabel(id) {
  return RANGE_OPTIONS.find(o => o.id === id)?.short || 'All time';
}
