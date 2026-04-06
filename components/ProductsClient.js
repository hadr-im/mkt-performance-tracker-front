'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import {
  ChartCard, LoadingState, ErrorState, SectionTitle,
  tooltipStyle, axisStyle, gridStyle, PALETTE, PRODUCT_COLORS, Badge
} from './ChartConfig';

import { fetchApi } from '../lib/api';

const PROD_CONFIG = {
  'Volunteering': { color: '#EE5D50', gradient: 'volGrad', icon: '🌍', desc: 'Global volunteering experience abroad' },
  'Professional': { color: '#0075FF', gradient: 'proGrad', icon: '💼', desc: 'Professional internship abroad' },
  'Teaching': { color: '#FFB547', gradient: 'teachGrad', icon: '📚', desc: 'Teaching internship abroad' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle.contentStyle} className="px-3 py-2">
      <p style={tooltipStyle.labelStyle} className="mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#F5F7FA' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function ProductsClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [activeProduct, setActiveProduct] = useState(initialData?.products?.[0]?.shortName || null);

  const load = useCallback(async () => {
    const hasFilters = filters.member || filters.dateFrom || filters.dateTo;
    
    if (!hasFilters && initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const d = await fetchApi('/api/products', {
        member: filters.member,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      setData(d);
      setActiveProduct(prev => !prev && d.products?.length ? d.products[0]?.shortName : prev);
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

  const { products, productShare, combinedTimeSeries, totalSignups } = data;
  const activeProd = products.find(p => p.shortName === activeProduct);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extra-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Products</h1>
        <p className="text-sm mt-2 font-medium" style={{ color: '#A0AEC0' }}>Volunteering · Professional · Teaching — signup breakdown and analysis</p>
      </div>

      {/* Product selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {products.map((p) => {
          const cfg = PROD_CONFIG[p.shortName] || {};
          const isActive = activeProduct === p.shortName;
          const pct = totalSignups > 0 ? ((p.signups / totalSignups) * 100).toFixed(1) : 0;
          return (
            <button
              key={p.shortName}
              onClick={() => setActiveProduct(isActive ? null : p.shortName)}
              className="rounded-[20px] p-6 text-left transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              style={{
                background: isActive ? 'linear-gradient(135deg, #4318FF, #0075FF)' : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 10px 30px rgba(67, 24, 255, 0.3)' : '0 4px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cfg.icon}</span>
                <span className="text-xs font-extra-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : `${cfg.color}15`, color: isActive ? '#FFFFFF' : cfg.color, border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : cfg.color}33`, fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{pct}%</span>
              </div>
              <p className="text-[11px] font-extra-bold uppercase tracking-widest mb-1" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : cfg.color, fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{p.shortName}</p>
              <p className="text-4xl font-extra-bold mb-1" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{p.signups.toLocaleString()}</p>
              <p className="text-xs font-bold" style={{ color: isActive ? 'rgba(255,255,255,0.5)' : '#A0AEC0' }}>{p.newAccounts} synchronized accounts</p>
              
              <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: isActive ? '#FFFFFF' : cfg.color, boxShadow: isActive ? '0 0 10px rgba(255,255,255,0.5)' : 'none' }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* KPI row for active product */}
      {activeProd && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Total Signups" value={activeProd.signups} color="blue" />
          <KPICard label="New Accounts" value={activeProd.newAccounts} color="green" />
          <KPICard label="Members" value={activeProd.memberCount} color="cyan" sub="who drove signups" />
          <KPICard label="Top Uni" value={activeProd.topUniversity || '—'} color="purple" animate={false} sub={`${activeProd.universities[0]?.count || 0} signups`} />
        </div>
      )}

      {/* Combined time series */}
      <ChartCard title="Signups Over Time — All Products">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={combinedTimeSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EE5D50" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EE5D50" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0075FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0075FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="teachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB547" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFB547" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} tickFormatter={d => d.slice(5)} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#A0AEC0', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }} />
            {products.map((p) => {
              const cfg = PROD_CONFIG[p.shortName] || {};
              return (
                <Area key={p.shortName} type="monotone" dataKey={p.shortName} name={p.shortName}
                  stroke={cfg.color} strokeWidth={2} fill={`url(#${cfg.gradient})`} dot={false} activeDot={{ r: 3 }} />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Active product deep dive */}
      {activeProd && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top unis for this product */}
          <ChartCard title={`${activeProd.shortName} · Top Universities`}>
            <div className="space-y-2.5">
              {activeProd.universities.map((u, i) => {
                const max = activeProd.universities[0]?.count || 1;
                const pct = (u.count / max) * 100;
                const cfg = PROD_CONFIG[activeProd.shortName] || {};
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-4 text-right" style={{ color: '#A0AEC0' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>{u.name}</span>
                        <span className="text-xs font-bold" style={{ color: cfg.color, fontFamily: 'Space Grotesk, sans-serif' }}>{u.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Field of study for this product */}
          <ChartCard title={`${activeProd.shortName} · Fields of Study`}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activeProd.fields} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} horizontal={false} />
                <XAxis type="number" {...axisStyle} />
                <YAxis type="category" dataKey="field" {...axisStyle} width={120} tick={{ ...axisStyle.tick, fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Signups" fill={PROD_CONFIG[activeProd.shortName]?.color || '#2EA3F2'} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Year of study */}
          <ChartCard title={`${activeProd.shortName} · Year of Study`}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeProd.yearOfStudy} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="year" {...axisStyle} tick={{ ...axisStyle.tick, fontSize: 9 }} />
                <YAxis {...axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Signups" radius={[4, 4, 0, 0]} fill={PROD_CONFIG[activeProd.shortName]?.color || '#2EA3F2'} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Referral sources */}
          <ChartCard title={`${activeProd.shortName} · Referral Sources`}>
            <div className="space-y-2">
              {activeProd.referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm font-medium" style={{ color: '#A0AEC0' }}>{r.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{
                        width: `${(r.count / (activeProd.referrals[0]?.count || 1)) * 100}%`,
                        background: PROD_CONFIG[activeProd.shortName]?.color || '#4318FF',
                        boxShadow: `0 0 10px ${PROD_CONFIG[activeProd.shortName]?.color || '#4318FF'}44`,
                      }} />
                    </div>
                    <span className="text-xs font-extra-bold w-8 text-right" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Product comparison */}
      <ChartCard title="Product Comparison Overview">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={productShare} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Signups" radius={[8, 8, 0, 0]}>
              {productShare.map((p, i) => (
                <Cell key={i} fill={PROD_CONFIG[p.name]?.color || PALETTE[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
