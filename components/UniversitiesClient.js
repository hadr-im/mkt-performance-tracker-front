'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { GraduationCap, Users, Trophy, BarChart3, Search, X } from 'lucide-react';

import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import PageHeader from './PageHeader';
import RankedList from './RankedList';
import ScopedCard from './ScopedCard';
import { fetchApi } from '../lib/api';
import {
  ChartTooltip, LoadingState, ErrorState, EmptyState,
  axisStyle, gridStyle, BRAND, PALETTE, getProduct, ProductLogo,
  formatDayTick, formatDayFull,
} from './ChartConfig';

/**
 * Drop the short code the sheet repeats at the start of the full name:
 *   "EPI: Sousse"                -> "Sousse"
 *   "ISSAT Sousse"               -> "Sousse"
 *   "FLSH: Faculté des Lettres"  -> "Faculté des Lettres"
 */
function describe(fullName, shortName) {
  if (!fullName) return '';
  let s = String(fullName).trim();
  if (shortName && s.toLowerCase().startsWith(String(shortName).toLowerCase())) {
    s = s.slice(shortName.length);
  }
  return s.replace(/^\s*[:\-–—]?\s*/, '').trim();
}

/** Searchable table of every university, with its own date scope. */
function UniversityTable({ universities }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(u =>
      u.name.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q));
  }, [universities, search]);

  return (
    <>
      <div className="mb-3 flex items-center justify-end">
        <div className="relative w-full sm:w-64">
          <Search size={14} strokeWidth={2.2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search universities…"
            aria-label="Search universities"
            className="h-9 w-full rounded-md2 border border-line bg-surface pl-8 pr-8 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-medium placeholder:text-ink-3 hover:border-line-2 focus:border-brand/45"
          />
          {search && (
            <button
              type="button" onClick={() => setSearch('')} aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-3 transition hover:bg-surface-2 hover:text-ink"
            >
              <X size={12} strokeWidth={2.8} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No match" message={`Nothing matches “${search}”.`} icon={Search} />
      ) : (
        <div className="scroll-x">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {['#', 'University', 'Signups', 'Top product', 'Members', 'Top referral'].map(c => (
                  <th key={c} scope="col" className="whitespace-nowrap px-2.5 py-3 text-xs font-bold uppercase tracking-wider text-ink-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const meta = getProduct(u.topProduct);
                const desc = describe(u.fullName, u.name);
                return (
                  <tr key={u.name} className="border-b border-line/70 transition-colors hover:bg-surface-2">
                    <td className="tnum px-2.5 py-2.5 text-2xs font-bold text-ink-4">{i + 1}</td>
                    <td className="px-2.5 py-2.5 align-top">
                      <p className="text-sm font-semibold text-ink">{u.name}</p>
                      {desc && (
                        // Truncated on small screens only; desktop shows it in full.
                        <p
                          className="max-w-[14rem] truncate text-2xs text-ink-4 lg:max-w-none lg:overflow-visible lg:whitespace-normal"
                          title={desc}
                        >
                          {desc}
                        </p>
                      )}
                    </td>
                    <td className="tnum px-2.5 py-2.5 font-display text-sm font-extrabold text-ink">
                      {u.signups.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2.5">
                      {meta ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-2xs font-bold"
                          style={{ background: meta.soft, color: meta.ink }}
                        >
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-surface/70">
                            <ProductLogo product={meta} size={13} />
                          </span>
                          {meta.label}
                        </span>
                      ) : <span className="text-xs text-ink-4">—</span>}
                    </td>
                    <td className="tnum px-2.5 py-2.5 align-top text-sm text-ink-2">{u.memberCount || 0}</td>
                    <td className="px-2.5 py-2.5 align-top text-xs text-ink-2">
                      <span
                        className="block max-w-[11rem] truncate lg:max-w-none lg:overflow-visible lg:whitespace-normal"
                        title={u.topReferral || ''}
                      >
                        {u.topReferral || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function UniversitiesClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchApi('/api/universities', {
        member: filters.member, dateFrom: filters.dateFrom, dateTo: filters.dateTo,
      }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const universities = data.universities ?? [];
  const totalUniversities = data.totalUniversities ?? 0;
  const totalSignups = universities.reduce((s, u) => s + u.signups, 0);
  const avg = totalUniversities > 0 ? Math.round(totalSignups / totalUniversities) : 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Universities"
        subtitle={`Signup distribution across ${totalUniversities} universities`}
      />

      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard label="Universities" value={totalUniversities} icon={GraduationCap} tone="brand" sub="Reached" />
        <KPICard label="Total Signups" value={totalSignups} icon={Users} tone="gta" sub="Across all" />
        <KPICard
          label="Top University" value={universities[0]?.name || '—'}
          icon={Trophy} tone="gte" animate={false}
          sub={`${(universities[0]?.signups || 0).toLocaleString()} signups`}
        />
        <KPICard label="Average" value={avg} icon={BarChart3} tone="violet" sub="Signups per university" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScopedCard
          title="Top 10 Universities" sub="By total signups"
          endpoint="/api/universities" skeletonHeight={420}
        >
          {d => (
            <RankedList
              items={(d.universities || []).slice(0, 10)}
              valueKey="signups"
              color={BRAND}
              emptyMessage="No universities in this range."
            />
          )}
        </ScopedCard>

        <ScopedCard
          title="Fields of Study" sub="Across all universities"
          endpoint="/api/universities" skeletonHeight={420}
        >
          {d => (
            <RankedList
              items={(d.fieldBreakdown || []).slice(0, 8)}
              nameKey="field"
              colorOf={(_, i) => PALETTE[i % PALETTE.length]}
              numbered={false}
              emptyMessage="No field data in this range."
            />
          )}
        </ScopedCard>
      </div>

      <ScopedCard
        title="Daily Signups" sub="All universities combined"
        endpoint="/api/universities" className="mt-4" skeletonHeight={252}
      >
        {d => (
          (d.uniTimeSeries || []).length === 0 ? (
            <EmptyState message="No signups in this range." />
          ) : (
            <div className="w-full" style={{ height: 252 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.uniTimeSeries} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uniTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0CB9C1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0CB9C1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="date" {...axisStyle} tickFormatter={formatDayTick} minTickGap={34} />
                  <YAxis {...axisStyle} width={44} allowDecimals={false} />
                  <Tooltip
                    cursor={{ stroke: '#0CB9C1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<ChartTooltip formatLabel={formatDayFull} />}
                  />
                  <Area
                    type="monotone" dataKey="total" name="Signups"
                    stroke="#0CB9C1" strokeWidth={2} fill="url(#uniTrend)"
                    dot={false} activeDot={{ r: 5, fill: '#0CB9C1', stroke: 'rgb(var(--c-surface))', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        )}
      </ScopedCard>

      <ScopedCard
        title="All Universities" endpoint="/api/universities"
        className="mt-4" skeletonHeight={360}
      >
        {d => <UniversityTable universities={d.universities || []} />}
      </ScopedCard>
    </div>
  );
}
