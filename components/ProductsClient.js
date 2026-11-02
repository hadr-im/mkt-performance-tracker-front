'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Users, GraduationCap, UsersRound, Megaphone } from 'lucide-react';

import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import PageHeader from './PageHeader';
import RankedList from './RankedList';
import ScopedCard from './ScopedCard';
import { ChartCard } from './ChartConfig';
import { fetchApi } from '../lib/api';
import {
  ChartTooltip, LoadingState, ErrorState, EmptyState, Meter, ProductLogo,
  axisStyle, gridStyle, tooltipStyle, PRODUCTS, PRODUCT_ORDER, getProduct,
  formatDayTick, formatDayFull, truncate,
} from './ChartConfig';

/** Pick a product out of a scoped payload. */
const findProd = (d, key) => (d.products || []).find(p => p.shortName === key);

export default function ProductsClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchApi('/api/products', {
        member: filters.member, dateFrom: filters.dateFrom, dateTo: filters.dateTo,
      }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { products, totalSignups } = data;
  const ordered = PRODUCT_ORDER.map(k => products.find(p => p.shortName === k)).filter(Boolean);
  const meta = active ? getProduct(active) : null;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Products"
        subtitle="Global Volunteer, Global Talent and Global Teaching"
      />

      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {ordered.map(p => {
          const m = PRODUCTS[p.shortName];
          if (!m) return null;
          const on = active === p.shortName;
          const pct = totalSignups > 0 ? (p.signups / totalSignups) * 100 : 0;
          return (
            <button
              key={p.shortName}
              type="button"
              onClick={() => setActive(on ? null : p.shortName)}
              aria-pressed={on}
              className="card card-interactive p-4 text-left sm:p-5"
              style={on ? { borderColor: m.color, boxShadow: `0 0 0 3px ${m.color}22` } : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-md2" style={{ background: m.soft }}>
                  <ProductLogo product={m} size={27} />
                </span>
                <span
                  className="tnum rounded-full px-2.5 py-1 text-2xs font-extrabold"
                  style={{ background: m.soft, color: m.ink }}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>
              <p className="mt-3.5 text-2xs font-bold uppercase tracking-wider text-ink-3">{m.label}</p>
              <p className="tnum mt-1 font-display text-3xl font-extrabold leading-none text-ink">
                {p.signups.toLocaleString()}
              </p>
              <Meter value={p.signups} max={totalSignups || 1} color={m.color} height={5} className="mt-3.5" />
            </button>
          );
        })}
      </div>

      <ScopedCard
        title="Signups Over Time by Product"
        sub={active ? `Highlighting ${meta?.label}` : 'All three products'}
        endpoint="/api/products" className="mt-4" skeletonHeight={290}
      >
        {d => (
          (d.combinedTimeSeries || []).length === 0 ? (
            <EmptyState message="No signups in this range." />
          ) : (
            <div className="w-full" style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.combinedTimeSeries} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    {PRODUCT_ORDER.map(k => (
                      <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRODUCTS[k].color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={PRODUCTS[k].color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="date" {...axisStyle} tickFormatter={formatDayTick} minTickGap={34} />
                  <YAxis {...axisStyle} width={44} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip formatLabel={formatDayFull} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11.5, fontWeight: 600, paddingTop: 8 }}
                    iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color: '#44546A' }}>{PRODUCTS[v]?.label || v}</span>}
                  />
                  {PRODUCT_ORDER.map(k => {
                    const dim = active && active !== k;
                    return (
                      <Area
                        key={k} type="monotone" dataKey={k} name={k}
                        stroke={PRODUCTS[k].color}
                        strokeWidth={dim ? 1.2 : 2}
                        strokeOpacity={dim ? 0.28 : 1}
                        fill={dim ? 'transparent' : `url(#grad-${k})`}
                        dot={false}
                        activeDot={{ r: 5, stroke: 'rgb(var(--c-surface))', strokeWidth: 2 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        )}
      </ScopedCard>

      {active && meta ? (
        <>
          <div className="stagger mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(() => {
              const prod = findProd(data, active) || {};
              return (
                <>
                  <KPICard label="Signups" value={prod.signups ?? 0} icon={Users} tone="brand" />
                  <KPICard label="Members" value={prod.memberCount ?? 0} icon={UsersRound} tone="violet" sub="Drove these signups" />
                  <KPICard
                    label="Top University" value={prod.topUniversity || '—'}
                    icon={GraduationCap} tone="gta" animate={false}
                    sub={`${(prod.universities?.[0]?.count || 0).toLocaleString()} signups`}
                  />
                  <KPICard
                    label="Top Referral" value={truncate(prod.topReferral || '—', 22)}
                    icon={Megaphone} tone="gte" animate={false}
                  />
                </>
              );
            })()}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ScopedCard
              title={`${meta.label} · Top Universities`}
              endpoint="/api/products" skeletonHeight={420}
            >
              {d => {
                const prod = findProd(d, active);
                return (
                  <RankedList
                    items={prod?.universities || []}
                    color={meta.color}
                    emptyMessage="No universities for this product."
                  />
                );
              }}
            </ScopedCard>

            <ScopedCard
              title={`${meta.label} · Fields of Study`}
              endpoint="/api/products" skeletonHeight={420}
            >
              {d => (
                <RankedList
                  items={findProd(d, active)?.fields || []}
                  nameKey="field"
                  color={meta.color}
                  numbered={false}
                  emptyMessage="No field data for this product."
                />
              )}
            </ScopedCard>

            <ScopedCard
              title={`${meta.label} · Year of Study`}
              endpoint="/api/products" skeletonHeight={248}
            >
              {d => {
                const prod = findProd(d, active);
                const years = (prod?.yearOfStudy || []).slice(0, 6);
                return years.length === 0 ? (
                  <EmptyState message="No year-of-study data." />
                ) : (
                  <div className="w-full" style={{ height: 248 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={years} margin={{ top: 8, right: 6, left: -22, bottom: 4 }}>
                        <CartesianGrid {...gridStyle} />
                        <XAxis
                          dataKey="year" {...axisStyle} interval={0}
                          tick={{ ...axisStyle.tick, fontSize: 9.5 }}
                          tickFormatter={v => truncate(v, 12)}
                        />
                        <YAxis {...axisStyle} width={44} allowDecimals={false} />
                        <Tooltip cursor={tooltipStyle.cursor} content={<ChartTooltip total={prod?.signups} />} />
                        <Bar dataKey="count" name="Signups" fill={meta.color} radius={[4, 4, 0, 0]} maxBarSize={52} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              }}
            </ScopedCard>

            <ScopedCard
              title={`${meta.label} · Referral Sources`}
              endpoint="/api/products" skeletonHeight={280}
            >
              {d => {
                const prod = findProd(d, active);
                return (
                  <RankedList
                    items={(prod?.referrals || []).slice(0, 7)}
                    nameKey="source"
                    color={meta.color}
                    numbered={false}
                    emptyMessage="No referral data."
                  />
                );
              }}
            </ScopedCard>
          </div>
        </>
      ) : (
        <ChartCard className="mt-4">
          <EmptyState
            title="Select a product"
            message="Choose Global Volunteer, Global Talent or Global Teaching above to see its universities, fields of study, year of study and referral sources."
          />
        </ChartCard>
      )}
    </div>
  );
}
