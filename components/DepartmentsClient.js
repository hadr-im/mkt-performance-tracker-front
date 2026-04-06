'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
} from 'recharts';
import { useFilters } from './FilterContext';
import KPICard from './KPICard';
import {
  ChartCard, SectionTitle, Badge, LoadingState, ErrorState,
  tooltipStyle, axisStyle, gridStyle, PALETTE, getDeptColor
} from './ChartConfig';

import { fetchApi } from '../lib/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle.contentStyle} className="px-3 py-2">
      <p style={tooltipStyle.labelStyle} className="mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function DepartmentsClient({ initialData }) {
  const { filters } = useFilters();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(initialData?.departments?.[0]?.department || null);

  const load = useCallback(async () => {
    const hasFilters = filters.member || filters.dateFrom || filters.dateTo;
    
    if (!hasFilters && initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const d = await fetchApi('/api/departments', {
        member: filters.member,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      setData(d);
      setSelectedDept(prev => !prev && d.departments?.length ? d.departments[0].department : prev);
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

  const { departments, memberBreakdown, deptTimeSeries, allDepts, signupsByMember } = data;

  const activeDeptMembers = memberBreakdown.filter(m => !selectedDept || m.department === selectedDept);
  const activeDept = departments.find(d => d.department === selectedDept);

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-extra-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Departments</h1>
        <p className="text-sm mt-2 font-medium" style={{ color: '#A0AEC0' }}>Sign-up performance broken down by department</p>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {departments.map((dept, i) => (
          <button
            key={dept.department}
            onClick={() => setSelectedDept(dept.department === selectedDept ? null : dept.department)}
            className="rounded-[20px] p-5 md:p-6 text-left transition-all duration-300 hover:-translate-y-1 group"
            style={{
              background: selectedDept === dept.department ? 'linear-gradient(135deg, #4318FF, #0075FF)' : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: selectedDept === dept.department ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: selectedDept === dept.department ? '0 10px 30px rgba(67, 24, 255, 0.3)' : '0 4px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm" style={{ background: selectedDept === dept.department ? 'rgba(255,255,255,0.2)' : `${getDeptColor(dept.department)}22`, color: selectedDept === dept.department ? '#FFFFFF' : getDeptColor(dept.department), border: '1px solid currentColor', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
                {dept.department}
              </span>
              <span className="hidden md:inline text-[11px] font-bold" style={{ color: selectedDept === dept.department ? 'rgba(255,255,255,0.8)' : '#A0AEC0' }}>{dept.members} members</span>
            </div>
            <p className="text-2xl md:text-4xl font-extra-bold mb-1" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{dept.signups.toLocaleString()}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: selectedDept === dept.department ? 'rgba(255,255,255,0.6)' : '#A0AEC0' }}>Total Signups</p>
          </button>
        ))}
      </div>

      {/* SU vs Leads by dept */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Signups by Department">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departments} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="department" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="signups" name="Signups" fill="#2EA3F2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Dept time series */}
        <ChartCard title="Signups Over Time by Department">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={deptTimeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" {...axisStyle} tickFormatter={d => d.slice(5)} />
              <YAxis {...axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#A0AEC0', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', paddingTop: '10px' }} />
              {allDepts.map((dept, i) => {
                const isFocused = !selectedDept || selectedDept === dept;
                return (
                  <Line
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    name={dept}
                    stroke={getDeptColor(dept)}
                    strokeWidth={isFocused ? 2.5 : 0.8}
                    strokeOpacity={isFocused ? 1 : 0.08}
                    dot={false}
                    activeDot={{ r: isFocused ? 4 : 0 }}
                    connectNulls={true}
                    animationDuration={300}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Member table */}
      <ChartCard title={selectedDept ? `Members · ${selectedDept}` : 'All Members'}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Member', 'Department', 'Signups', 'Active Days'].map(col => (
                  <th key={col} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A0AEC0', fontFamily: 'Space Grotesk, sans-serif' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeDeptMembers.map((m, i) => (
                <tr key={i} className="transition-all duration-200 hover:bg-white/[0.03]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="py-4 px-4 font-bold text-[13px]" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{m.name}</td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-extra-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ background: `${getDeptColor(m.department)}15`, color: getDeptColor(m.department), borderColor: `${getDeptColor(m.department)}33` }}>{m.department}</span>
                  </td>
                  <td className="py-4 px-4 font-extra-bold text-[15px]" style={{ color: '#FFFFFF', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{m.signups}</td>
                  <td className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A0AEC0' }}>{m.activeDays}d active</td>
                </tr>
              ))}
              {activeDeptMembers.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm font-bold tracking-widest uppercase" style={{ color: '#A0AEC0' }}>No synchronized data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
