'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
} from 'recharts';
import {
  Building2, Users, UsersRound, Trophy, TableProperties, Search, X,
} from 'lucide-react';

import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import PageHeader from './PageHeader';
import ScopedCard from './ScopedCard';
import { fetchApi } from '../lib/api';
import {
  ChartCard, ChartTooltip, LoadingState, ErrorState, EmptyState, DeptBadge,
  axisStyle, gridStyle, tooltipStyle, getDeptColor,
  formatDayTick, formatDayFull,
} from './ChartConfig';

const CHIP = 'inline-flex h-9 min-h-[36px] items-center rounded-md2 border px-2.5 text-xs font-bold transition-colors duration-200 ease-out2';

/** Roster table with its own department filter and search. */
function MembersTable({ rows, rosterDepts }) {
  const [dept, setDept] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(m =>
      (!dept || m.department === dept) &&
      (!q || m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q))
    );
  }, [rows, dept, search]);

  return (
    <>
      {/* Filters and search share one row; search sits at the right */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by department">
          <button
            type="button" onClick={() => setDept('')} aria-pressed={!dept}
            className={`${CHIP} ${!dept
              ? 'border-brand bg-brand text-white'
              : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:bg-surface-2'}`}
          >
            All departments
          </button>
          {rosterDepts.map(d => {
            const on = dept === d;
            const color = getDeptColor(d);
            return (
              <button
                key={d} type="button" onClick={() => setDept(on ? '' : d)} aria-pressed={on}
                className={CHIP}
                style={on
                  ? { background: color, borderColor: color, color: 'rgb(var(--c-surface))' }
                  : { background: 'rgb(var(--c-surface))', borderColor: 'rgb(var(--c-line))', color }}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ background: on ? '#fff' : color }} aria-hidden="true" />
                {d}
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto w-full sm:w-64">
          <Search size={14} strokeWidth={2.2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            aria-label="Search members"
            className="h-9 w-full rounded-md2 border border-line bg-surface pl-8 pr-3 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-medium placeholder:text-ink-3 hover:border-line-2 focus:border-brand/45"
          />
        </div>
      </div>

      <p className="mb-2 text-2xs font-semibold text-ink-4">
        {filtered.length} of {rows.length} on the roster
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No members match"
          message={search ? `Nothing matches “${search}”.` : 'No members in this department.'}
          icon={Search}
        />
      ) : (
        <div className="scroll-x">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {['Member', 'Department', 'Signups', 'Active days'].map(c => (
                  <th key={c} scope="col" className="whitespace-nowrap px-2.5 py-3 text-xs font-bold uppercase tracking-wider text-ink-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={`${m.name}-${i}`} className="border-b border-line/70 transition-colors hover:bg-surface-2">
                  <td className="px-2.5 py-2.5 text-sm font-semibold text-ink">{m.name}</td>
                  <td className="px-2.5 py-2.5"><DeptBadge department={m.department} /></td>
                  <td className={`tnum px-2.5 py-2.5 font-display text-sm font-extrabold ${m.signups ? 'text-ink' : 'text-ink-4'}`}>
                    {m.signups.toLocaleString()}
                  </td>
                  <td className={`tnum px-2.5 py-2.5 text-sm ${m.activeDays ? 'text-ink-2' : 'text-ink-4'}`}>
                    {m.activeDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function DepartmentsClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchApi('/api/departments', {
        member: filters.member, dateFrom: filters.dateFrom, dateTo: filters.dateTo,
      }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { departments = [], memberBreakdown = [] } = data;
  const mappingAvailable = data.availability?.departments ?? true;

  if (!mappingAvailable) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Departments" subtitle="Signup performance by department" />
        <ChartCard>
          <EmptyState
            icon={TableProperties}
            title="No department mapping in the spreadsheet"
            message='Add a tab named "Departments" with member names in column A and their department in column B. This page then fills in automatically — no code change needed.'
          />
        </ChartCard>
      </div>
    );
  }

  const known = departments.filter(d => d.department !== 'Unknown');
  const unknown = departments.find(d => d.department === 'Unknown');
  const totalSignups = known.reduce((s, d) => s + d.signups, 0);
  const activeMembers = memberBreakdown.filter(m => m.signups > 0).length;
  const topDept = known[0];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Departments" subtitle="Signup performance by department" />

      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard label="Departments" value={known.length} icon={Building2} tone="brand" />
        <KPICard label="Signups" value={totalSignups} icon={Users} tone="gta" sub="Mapped to a department" />
        <KPICard label="Active Members" value={activeMembers} icon={UsersRound} tone="violet" sub={`of ${memberBreakdown.length} on the roster`} />
        <KPICard
          label="Top Department" value={topDept?.department || '—'}
          icon={Trophy} tone="gte" animate={false}
          sub={`${(topDept?.signups || 0).toLocaleString()} signups`}
        />
      </div>

      {unknown && unknown.signups > 0 && (
        <div className="card mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-gte/30 bg-gte-soft px-4 py-3">
          <TableProperties size={16} strokeWidth={2.2} className="shrink-0 text-gte-ink" />
          <p className="text-sm font-semibold text-gte-ink">
            {unknown.signups.toLocaleString()} signups have no department
          </p>
          <p className="text-xs text-gte-ink/80">
            Their member names are missing from the Departments tab.
          </p>
        </div>
      )}

      <ScopedCard
        title="Signups by Department" endpoint="/api/departments"
        className="mt-4" skeletonHeight={300}
      >
        {d => {
          const rows = (d.departments || []).filter(x => x.department !== 'Unknown');
          const total = rows.reduce((s, x) => s + x.signups, 0);
          return rows.length === 0 ? (
            <EmptyState message="No department data in this range." />
          ) : (
            <div className="w-full" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 8, right: 6, left: -22, bottom: 4 }}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="department" {...axisStyle} interval={0} tick={{ ...axisStyle.tick, fontSize: 11 }} />
                  <YAxis {...axisStyle} width={44} allowDecimals={false} />
                  <Tooltip cursor={tooltipStyle.cursor} content={<ChartTooltip total={total} />} />
                  <Bar dataKey="signups" name="Signups" radius={[4, 4, 0, 0]} maxBarSize={56}>
                    {rows.map(x => <Cell key={x.department} fill={getDeptColor(x.department)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }}
      </ScopedCard>

      <ScopedCard
        title="Signups Over Time" sub="All departments" endpoint="/api/departments"
        className="mt-4" skeletonHeight={320}
      >
        {d => (
          (d.deptTimeSeries || []).length === 0 ? (
            <EmptyState message="No signups in this range." />
          ) : (
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.deptTimeSeries} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    {(d.allDepts || []).map(x => (
                      <linearGradient key={x} id={`dept-${x.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getDeptColor(x)} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={getDeptColor(x)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="date" {...axisStyle} tickFormatter={formatDayTick} minTickGap={34} />
                  <YAxis {...axisStyle} width={44} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip formatLabel={formatDayFull} />} />
                  <Legend wrapperStyle={{ fontSize: 11.5, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={8} />
                  {(d.allDepts || []).map(x => (
                    <Area
                      key={x} type="monotone" dataKey={x} name={x}
                      stroke={getDeptColor(x)} strokeWidth={2}
                      fill={`url(#dept-${x.replace(/\W/g, '')})`}
                      dot={false} activeDot={{ r: 5, stroke: 'rgb(var(--c-surface))', strokeWidth: 2 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        )}
      </ScopedCard>

      <ScopedCard
        title="Members" endpoint="/api/departments"
        className="mt-4" skeletonHeight={360}
      >
        {d => (
          <MembersTable
            rows={d.memberBreakdown || []}
            rosterDepts={d.rosterDepts || []}
          />
        )}
      </ScopedCard>
    </div>
  );
}
