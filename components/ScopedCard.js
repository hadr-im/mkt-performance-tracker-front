'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ChartCard } from './ChartConfig';
import CardRangeFilter from './ui/CardRangeFilter';
import { useFilters } from './FilterContext';
import { fetchApi } from '../lib/api';
import { rangeToDates, DEFAULT_RANGE } from '../lib/ranges';

/**
 * A chart card that owns its own date scope.
 *
 * The dropdown in the corner sets a date range for this card alone; the page's
 * member filter still applies. When the scope is "All time" the card follows
 * the page's own date range, so the top filter bar keeps working until a card
 * is deliberately narrowed.
 *
 * Identical (endpoint, range, member) combinations share one request —
 * fetchApi dedupes in-flight calls and caches by URL — so a page full of
 * cards on the same scope costs a single round trip.
 */
export default function ScopedCard({
  title,
  sub,
  endpoint,
  children,              // (data, meta) => ReactNode
  defaultRange = DEFAULT_RANGE,
  skeletonHeight = 240,
  className = '',
  pad = true,
  extraAction = null,
}) {
  const { filters } = useFilters();
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scoped = range && range !== 'all';
  const { from, to } = useMemo(() => rangeToDates(range), [range]);

  // A card left on "All time" inherits the page filter.
  const dateFrom = scoped ? from : filters.dateFrom;
  const dateTo = scoped ? to : filters.dateTo;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchApi(endpoint, { member: filters.member, dateFrom, dateTo })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [endpoint, filters.member, dateFrom, dateTo]);

  const action = (
    <div className="flex shrink-0 items-center gap-2">
      {extraAction}
      <CardRangeFilter value={range} onChange={setRange} />
    </div>
  );

  let body;
  if (error) {
    body = (
      <div className="flex items-center gap-2 rounded-md2 bg-gv-soft px-3 py-4 text-xs font-semibold text-gv-ink">
        <AlertCircle size={15} strokeWidth={2.3} className="shrink-0" />
        {error}
      </div>
    );
  } else if (loading && !data) {
    body = <div className="skeleton w-full" style={{ height: skeletonHeight }} />;
  } else if (!data) {
    body = null;
  } else {
    body = children(data, { range, scoped, dateFrom, dateTo });
  }

  return (
    <ChartCard title={title} sub={sub} action={action} className={className} pad={pad}>
      {/* h-full so children can stretch to the card height, which lets a
          chart grow into whatever space a taller sibling card creates. */}
      <div
        className={`flex h-full flex-col ${loading && data ? 'opacity-60 transition-opacity duration-200' : ''}`}
      >
        {body}
      </div>
    </ChartCard>
  );
}
