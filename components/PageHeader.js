'use client';

import { UserRound, CalendarRange } from 'lucide-react';
import { useFilters } from './FilterContext';
import { Badge, formatDayFull } from './ChartConfig';
import { semesterOf } from '../lib/semesters';

/** Page title plus chips echoing the filters currently narrowing the data. */
export default function PageHeader({ title, subtitle, action }) {
  const { filters } = useFilters();
  const { member, dateFrom, dateTo } = filters;

  let range = '';
  if (dateFrom && dateTo) {
    const s = semesterOf(dateFrom);
    range = s && s.from === dateFrom && s.to === dateTo
      ? `${s.name} · ${s.hint}`
      : `${formatDayFull(dateFrom)} – ${formatDayFull(dateTo)}`;
  } else if (dateFrom) range = `From ${formatDayFull(dateFrom)}`;
  else if (dateTo) range = `Until ${formatDayFull(dateTo)}`;

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}

        {(member || range) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {member && <Badge tone="brand" icon={UserRound}>{member}</Badge>}
            {range && <Badge tone="neutral" icon={CalendarRange}>{range}</Badge>}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
