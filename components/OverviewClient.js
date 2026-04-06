'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import {
  ChartCard, Badge, LoadingState, ErrorState,
  tooltipStyle, axisStyle, gridStyle, PALETTE, PRODUCT_COLORS, getDeptColor
} from './ChartConfig';

import { fetchApi } from '../lib/api';

const KPI_ICONS = {
  signups: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  new: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  leads: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  conversion: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  days: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  unis: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle.contentStyle} className="px-3 py-2 shadow-2xl">
      <p style={tooltipStyle.labelStyle} className="mb-2 font-bold uppercase tracking-wider text-[11px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function OverviewClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const hasFilters = filters.member || filters.dateFrom || filters.dateTo;
    
    // Use initialData if no filters are active
    if (!hasFilters && initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi('/api/overview', {
        member: filters.member,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters, initialData]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { kpis, byProduct, timeSeriesData, memberPerformance, topUniversities, referralBreakdown } = data;

  const productData = Object.entries(byProduct).map(([name, value]) => ({
    name: name.replace(' Internship', ''),
    fullName: name,
    value,
  }));

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extra-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
          Campaign Overview
        </h1>
        <p className="text-sm mt-2 font-medium" style={{ color: '#A0AEC0' }}>
          Physical campaigns performance · Season 2025–2026
          {filters.member && <span className="ml-3"><Badge color="blue">👤 {filters.member}</Badge></span>}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Signups" value={kpis.totalSignups} icon={KPI_ICONS.signups} color="blue" sub="All submissions" />
        <KPICard label="New Accounts" value={kpis.newAccounts} icon={KPI_ICONS.new} color="green" sub="✅ Created" />

        {!filters.member && (
          <>
            <KPICard label="Applicants" value={kpis.totalApplicants} icon={KPI_ICONS.leads} color="cyan" sub="Unique people" />
            <KPICard label="Conversion" value={kpis.conversionRate} suffix="%" icon={KPI_ICONS.conversion} color="purple" sub="Signups → Applicants" />
          </>
        )}

        <KPICard label="Active Days" value={kpis.activeDays} icon={KPI_ICONS.days} color="orange" sub="Campaign days" />
        <KPICard label="Existing Accts" value={kpis.existingAccounts} icon={KPI_ICONS.unis} color="red" sub="⚠️ Already exist" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Signups over time */}
        <ChartCard title="Signups Over Time" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4318FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" {...axisStyle} tickFormatter={d => d.slice(5)} />
              <YAxis {...axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Signups" stroke="#4318FF" strokeWidth={3} fill="url(#blueGrad)" dot={false} activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#4318FF', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Product pie */}
        <ChartCard title="Product Split">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={productData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {productData.map((entry, i) => (
                  <Cell key={i} fill={PRODUCT_COLORS[entry.fullName] || PALETTE[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n, p) => [v, p.payload.fullName]}
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {productData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRODUCT_COLORS[p.fullName] || PALETTE[i], boxShadow: `0 0 10px ${PRODUCT_COLORS[p.fullName] || PALETTE[i]}55` }} />
                  <span style={{ color: '#A0AEC0' }} className="font-medium text-[11px]">{p.name}</span>
                </div>
                <span className="font-bold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{p.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Member performance */}
        <ChartCard title="Member Performance (Signups)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={memberPerformance.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" {...axisStyle} />
              <YAxis type="category" dataKey="name" {...axisStyle} width={110} tick={{ ...axisStyle.tick, fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="signups" name="Signups" radius={[0, 4, 4, 0]}>
                {memberPerformance.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getDeptColor(entry.department)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Universities */}
        <ChartCard title="Top Universities by Signups">
          <div className="space-y-2.5">
            {topUniversities.slice(0, 8).map((uni, i) => {
              const max = topUniversities[0]?.count || 1;
              const pct = (uni.count / max) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-4 text-right" style={{ color: '#A0AEC0' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-bold truncate" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{uni.name}</span>
                      <span className="text-[11px] font-extra-bold ml-2" style={{ color: '#0075FF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{uni.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, #4318FF, #0075FF)`,
                        boxShadow: '0 0 10px rgba(67, 24, 255, 0.4)',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Referral breakdown */}
      <ChartCard title="Referral Sources">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={referralBreakdown.slice(0, 6)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="source" {...axisStyle} tick={{ ...axisStyle.tick, fontSize: 10 }} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Signups" radius={[6, 6, 0, 0]}>
              {referralBreakdown.slice(0, 6).map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
