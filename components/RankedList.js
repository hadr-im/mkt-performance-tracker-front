'use client';

import { EmptyState, Meter, BRAND } from './ChartConfig';

/**
 * Ranked bar list — used wherever "top N by count" appears, so universities,
 * fields of study and referrals all read identically across pages.
 */
export default function RankedList({
  items = [],
  nameKey = 'name',
  valueKey = 'count',
  color = BRAND,
  colorOf,
  max,
  emptyMessage = 'Nothing to show for this range.',
  numbered = true,
  barHeight = 5,
}) {
  if (!items.length) return <EmptyState message={emptyMessage} />;

  const top = max ?? Math.max(...items.map(i => i[valueKey] ?? 0), 1);

  return (
    <ol className="space-y-[18px]">
      {items.map((item, i) => {
        const name = item[nameKey];
        const value = item[valueKey] ?? 0;
        const c = colorOf ? colorOf(item, i) : color;
        return (
          <li key={`${name}-${i}`} className="flex items-center gap-2.5">
            {numbered && (
              <span className="tnum w-4 shrink-0 text-right text-2xs font-bold text-ink-4">
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-ink" title={name}>{name}</span>
                <span className="tnum shrink-0 font-display text-sm font-extrabold" style={{ color: c }}>
                  {value.toLocaleString()}
                </span>
              </div>
              <Meter value={value} max={top} color={c} height={barHeight} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
