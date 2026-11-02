'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useFilters } from './FilterContext';
import MemberPicker from './ui/MemberPicker';
import DateField from './ui/DateField';
import ThemeToggle from './ui/ThemeToggle';
import { fetchApi } from '../lib/api';
import { semestersInRange, matchSemester } from '../lib/semesters';

export default function FilterBar() {
  const { filters, updateFilter, setDateRange, resetFilters } = useFilters();
  const [roster, setRoster] = useState([]);
  const [bounds, setBounds] = useState({ min: '', max: '' });

  useEffect(() => {
    let cancelled = false;
    fetchApi('/api/members')
      .then(d => { if (!cancelled) setRoster(d.roster || []); })
      .catch(() => { });
    fetchApi('/api/overview')
      .then(d => {
        if (cancelled) return;
        const s = d.timeSeriesData || [];
        if (s.length) setBounds({ min: s[0].date, max: s[s.length - 1].date });
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, []);

  /* Clamp each semester to the data that actually exists.
   *
   * S2 runs Aug -> Jan, so mid-season its nominal end sits months in the
   * future — past the "To" picker's own maximum, and confusing to read back.
   * Clamping makes the buttons set a range you can see in the charts. */
  const semesters = semestersInRange(bounds.min, bounds.max).map(s => ({
    ...s,
    from: bounds.min && s.from < bounds.min ? bounds.min : s.from,
    to: bounds.max && s.to > bounds.max ? bounds.max : s.to,
  }));

  const active = matchSemester(filters.dateFrom, filters.dateTo, semesters);
  const hasFilters = Boolean(filters.member || filters.dateFrom || filters.dateTo);

  // Shared button shape so every control in the bar matches.
  const btn = 'inline-flex h-10 min-h-[40px] items-center gap-1.5 rounded-md2 border px-3 text-sm font-semibold transition-colors duration-200 ease-out2';
  const btnIdle = 'border-line bg-surface text-ink-2 hover:border-line-2 hover:bg-surface-2';
  const btnOn = 'border-brand bg-brand text-white';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-2 px-4 py-3 pl-[4.25rem] sm:px-5 sm:pl-[4.5rem] lg:h-[var(--header-h)] lg:flex-nowrap lg:px-6 lg:py-0 lg:pl-6 2xl:px-8">
        <MemberPicker
          value={filters.member}
          roster={roster}
          onChange={v => updateFilter('member', v)}
        />

        <DateField
          label="From"
          value={filters.dateFrom}
          maxKey={filters.dateTo || bounds.max}
          onChange={v => setDateRange(v, filters.dateTo)}
        />

        {/* The end date can never precede the start date. */}
        <DateField
          label="To"
          value={filters.dateTo}
          minKey={filters.dateFrom}
          maxKey={bounds.max}
          onChange={v => setDateRange(filters.dateFrom, v)}
        />

        {semesters.length > 0 && (
          <>
            <span className="mx-0.5 hidden h-6 w-px bg-line-2 sm:block" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Semester">
              {semesters.map(s => {
                const on = active?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDateRange(on ? '' : s.from, on ? '' : s.to)}
                    aria-pressed={on}
                    title={`${s.name} · ${s.hint}`}
                    className={`${btn} ${on ? btnOn : btnIdle}`}
                  >
                    {s.short}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className={`${btn} ${btnIdle}`}
          >
            <RotateCcw size={14} strokeWidth={2.4} />
            <span className="hidden xs:inline">Clear</span>
          </button>
        )}

        {/* Logo and theme switch live at the far right. The logo fills the
            header's full height with no padding of its own. */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/"
            aria-label="Go to overview"
            className="-my-1 flex shrink-0 items-center lg:-my-0 lg:h-full"
          >
            <Image
              src="/assets/logo.png"
              alt="Thunderball"
              width={100}
              height={100}
              priority
              className="h-9 w-auto object-contain lg:h-12"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
