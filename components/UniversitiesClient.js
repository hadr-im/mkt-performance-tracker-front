'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import {
  ChartCard, LoadingState, ErrorState,
  tooltipStyle, axisStyle, gridStyle, PALETTE, Badge
} from './ChartConfig';

import { fetchApi } from '../lib/api';

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

export default function UniversitiesClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const hasFilters = filters.member || filters.dateFrom || filters.dateTo;
    
    if (!hasFilters && initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchApi('/api/universities', {
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

  const { universities, uniTimeSeries, fieldBreakdown, totalUniversities } = data;

  const filtered = universities.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUni = universities.find(u => u.name === selected);

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden animate-fade-up">
      <div>
        <h1 className="text-3xl font-extra-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Universities</h1>
        <p className="text-sm mt-2 font-medium" style={{ color: '#A0AEC0' }}>Sign-up distribution and engagement across {totalUniversities} universities</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 [&_p]:truncate">
        <KPICard label="Universities" value={totalUniversities} color="blue"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>}
          sub="Visited" />
        <KPICard label="Top University" value={universities[0]?.name || '—'} color="cyan" animate={false}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
          sub={`${universities[0]?.signups || 0} signups`} />
        <KPICard label="Total Signups" value={universities.reduce((s, u) => s + u.signups, 0)} color="green"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
          sub="Across all unis" />
        <KPICard label="Avg per Uni" value={Math.round(universities.reduce((s, u) => s + u.signups, 0) / (totalUniversities || 1))} color="purple"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
          sub="Signups per uni" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top unis bar */}
        <ChartCard title="Top Universities by Signups">
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={universities.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridStyle} horizontal={false} />
                <XAxis type="number" {...axisStyle} hide />
                <YAxis type="category" dataKey="name" {...axisStyle} width={65} tick={{ ...axisStyle.tick, fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="signups" name="Signups" radius={[0, 4, 4, 0]}>
                  {universities.slice(0, 10).map((entry, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Field of study pie */}
        <ChartCard title="Field of Study Distribution">
          <div className="h-[240px] w-full min-w-0 flex flex-col">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={fieldBreakdown.slice(0, 8)}
                  cx="50%" cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="field"
                >
                  {fieldBreakdown.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 overflow-hidden">
              {fieldBreakdown.slice(0, 6).map((f, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px] sm:text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="truncate max-w-[70px]" style={{ color: '#A0AEC0' }}>{f.field}</span>
                  <span className="font-semibold" style={{ color: '#F5F7FA' }}>{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Signups over time */}
      <ChartCard title="Daily Signups Timeline">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={uniTimeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="uniGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4FD1FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4FD1FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} tickFormatter={d => d.slice(5)} minTickGap={25} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="Total Signups" stroke="#4FD1FF" strokeWidth={2} fill="url(#uniGrad)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* University table */}
      <ChartCard title="All Universities">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search university..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-72 text-sm rounded-lg px-3 py-2 outline-none"
            style={{
              background: '#07071A',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F5F7FA',
              fontFamily: 'var(--font-plus-jakarta), sans-serif',
            }}
          />
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#', 'University', 'Signups', 'Top Product', 'Members', 'Referral'].map(col => (
                  <th key={col} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#A0AEC0', fontFamily: 'Space Grotesk, sans-serif' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors"
                  onClick={() => setSelected(selected === u.name ? null : u.name)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: selected === u.name ? 'rgba(46,163,242,0.05)' : 'transparent',
                  }}
                >
                  <td className="py-3 px-3 text-xs font-mono" style={{ color: '#A0AEC0' }}>{i + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>{u.name}</p>
                    <p className="text-xs truncate max-w-xs" style={{ color: '#A0AEC0' }}>{u.fullName !== u.name ? u.fullName : ''}</p>
                  </td>
                  <td className="py-3 px-3 font-bold" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>{u.signups}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: '#A0AEC0' }}>{u.topProduct?.replace(' Internship', '') || '—'}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: '#A0AEC0' }}>{u.memberCount || 0}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: '#A0AEC0' }}>{u.topReferral || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected uni detail */}
        {selectedUni && (
          <div className="mt-6 p-4 rounded-xl" style={{ background: '#07071A', border: '1px solid rgba(46,163,242,0.2)' }}>
            <p className="font-bold mb-3" style={{ color: '#4FD1FF', fontFamily: 'Space Grotesk, sans-serif' }}>📍 {selectedUni.name} Detail</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(selectedUni.products || {}).map(([prod, cnt]) => (
                <div key={prod} className="p-2 rounded-lg overflow-hidden" style={{ background: 'rgba(46,163,242,0.06)' }}>
                  <p className="truncate" style={{ color: '#A0AEC0' }} title={prod.replace(' Internship', '')}>{prod.replace(' Internship', '')}</p>
                  <p className="font-bold text-base mt-0.5" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>{cnt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
