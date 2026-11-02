'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Users, GraduationCap, CalendarDays, TrendingUp, Target, UserCheck, Megaphone,
} from 'lucide-react';

import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import PageHeader from './PageHeader';
import ScopedCard from './ScopedCard';
import ProductSplit from './ProductSplit';
import RankedList from './RankedList';
import { fetchApi } from '../lib/api';
import {
  ChartTooltip, LoadingState, ErrorState, EmptyState, DeptBadge, Meter,
  axisStyle, gridStyle, tooltipStyle, BRAND, PALETTE,
  formatDayTick, formatDayFull, truncate, getDeptColor,
} from './ChartConfig';

export default function OverviewClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchApi('/api/overview', {
        member: filters.member, dateFrom: filters.dateFrom, dateTo: filters.dateTo,
      }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { kpis } = data;
  const hasApplications = data.availability?.applications ?? true;
  const avgPerDay = kpis.activeDays > 0 ? Math.round(kpis.totalSignups / kpis.activeDays) : 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Campaign Overview"
        subtitle="Physical campaign performance across all universities"
      />

      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard label="Total Signups" value={kpis.totalSignups} icon={Users} tone="brand" sub="All submissions" />
        <KPICard label="Universities" value={kpis.totalUniversities ?? 0} icon={GraduationCap} tone="gta" sub="Reached" />
        <KPICard label="Active Days" value={kpis.activeDays} icon={CalendarDays} tone="gte" sub="With at least one signup" />
        <KPICard label="Avg / Active Day" value={avgPerDay} icon={TrendingUp} tone="violet" sub="Signups per campaign day" />
        {hasApplications && (
          <>
            <KPICard label="Applicants" value={kpis.totalApplicants} icon={UserCheck} tone="good" sub="Unique people" />
            <KPICard label="Conversion" value={kpis.conversionRate} suffix="%" icon={Target} tone="gv" sub="Signups to applicants" />
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <ScopedCard
          title="Signups Over Time"
          endpoint="/api/overview"
          className="lg:col-span-3"
          skeletonHeight={300}
        >
          {d => (
            d.timeSeriesData.length === 0
              ? <EmptyState message="No signups in this range." />
              : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.timeSeriesData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ovTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={BRAND} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...gridStyle} />
                      <XAxis dataKey="date" {...axisStyle} tickFormatter={formatDayTick} minTickGap={34} />
                      <YAxis {...axisStyle} width={44} allowDecimals={false} />
                      <Tooltip
                        cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: '4 4' }}
                        content={<ChartTooltip formatLabel={formatDayFull} />}
                      />
                      <Area
                        type="monotone" dataKey="count" name="Signups"
                        stroke={BRAND} strokeWidth={2} fill="url(#ovTrend)"
                        dot={false}
                        activeDot={{ r: 5, fill: BRAND, stroke: 'rgb(var(--c-surface))', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
          )}
        </ScopedCard>

        <ScopedCard title="Product Split" endpoint="/api/overview" skeletonHeight={420}>
          {d => <ProductSplit byProduct={d.byProduct} total={d.kpis.totalSignups} bare />}
        </ScopedCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScopedCard
          title="Top Members"
          sub="By signups, coloured by department"
          endpoint="/api/overview"
          skeletonHeight={300}
        >
          {d => {
            const top = d.memberPerformance.slice(0, 8);
            const max = top[0]?.signups || 1;
            return top.length === 0 ? (
              <EmptyState message="No member activity in this range." />
            ) : (
              <ol className="space-y-[18px]">
                {top.map((m, i) => {
                  const color = getDeptColor(m.department);
                  return (
                    <li key={m.name} className="flex items-center gap-2.5">
                      <span className="tnum w-4 shrink-0 text-right text-2xs font-bold text-ink-4">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-ink">{m.name}</span>
                            {m.department && m.department !== 'Unknown' && <DeptBadge department={m.department} />}
                          </span>
                          <span className="tnum shrink-0 font-display text-sm font-extrabold" style={{ color }}>
                            {m.signups.toLocaleString()}
                          </span>
                        </div>
                        <Meter value={m.signups} max={max} color={color} height={5} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            );
          }}
        </ScopedCard>

        <ScopedCard
          title="Top Universities"
          sub="By total signups"
          endpoint="/api/overview"
          skeletonHeight={300}
        >
          {d => <RankedList items={d.topUniversities.slice(0, 8)} color={BRAND} barHeight={5} />}
        </ScopedCard>
      </div>

      <ScopedCard
        title="Referral Sources"
        sub="How students heard about the campaign"
        endpoint="/api/overview"
        className="mt-4"
        skeletonHeight={320}
      >
        {d => (
          d.referralBreakdown.length === 0 ? (
            <EmptyState message="No referral data in this range." icon={Megaphone} />
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={d.referralBreakdown.slice(0, 7)}
                  margin={{ top: 8, right: 6, left: -22, bottom: 8 }}
                >
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    dataKey="source" {...axisStyle} interval={0}
                    tickFormatter={v => truncate(v, 16)}
                    tickMargin={8}
                  />
                  <YAxis {...axisStyle} width={44} allowDecimals={false} />
                  <Tooltip cursor={tooltipStyle.cursor} content={<ChartTooltip total={d.kpis.totalSignups} />} />
                  <Bar dataKey="count" name="Signups" radius={[4, 4, 0, 0]} maxBarSize={72}>
                    {d.referralBreakdown.slice(0, 7).map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        )}
      </ScopedCard>
    </div>
  );
}
