'use client';

export const CHART_COLORS = {
  blue: '#4318FF',
  cyan: '#0075FF',
  glow: 'rgba(67, 24, 255, 0.3)',
  navy: '#0B1437',
  green: '#01B574',
  red: '#EE5D50',
  yellow: '#FFB547',
  purple: '#4318FF',
  orange: '#FFB547',
};

export const PRODUCT_COLORS = {
  'Volunteering Internship': '#EE5D50',
  'Volunteering': '#EE5D50',
  'Professional Internship': '#0075FF',
  'Professional': '#0075FF',
  'Teaching Internship': '#FFB547',
  'Teaching': '#FFB547',
};

export const DEPT_COLORS = {
  'Marketing': '#4318FF',
  'MKT': '#4318FF',
  'IM': '#4318FF',
  'LCP': '#4318FF',
  'oGTa': '#FFB547',
  'OGTa': '#FFB547',
  'oGT e': '#FFB547',
  'OGTe': '#FFB547',
  'oGT': '#FFB547',
  'oGV': '#FFB547',
  'OGV': '#FFB547',
  'iGT': '#01B574',
  'IGT': '#01B574',
  'iGV': '#01B574',
  'IGV': '#01B574',
  'Business Development': '#0075FF',
  'BD': '#0075FF',
  'PM&Ewa': '#0075FF',
  'Finance': '#0075FF',
  'F': '#0075FF',
  'Talent Management': '#FFB547',
  'TM': '#FFB547',
};

export function getDeptColor(dept) {
  if (!dept) return '#4318FF';
  if (DEPT_COLORS[dept]) return DEPT_COLORS[dept];
  const upper = dept.toUpperCase();
  if (DEPT_COLORS[upper]) return DEPT_COLORS[upper];

  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export const PALETTE = [
  '#4318FF', '#0075FF', '#01B574', '#EE5D50', '#FFB547',
];

export const chartDefaults = {
  style: { background: 'transparent' },
  margin: { top: 10, right: 10, left: -10, bottom: 0 },
};

export const axisStyle = {
  tick: { fill: '#A0AEC0', fontSize: 11, fontWeight: 'bold', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  axisLine: { stroke: 'rgba(255,255,255,0.1)' },
  tickLine: { stroke: 'transparent' },
};

export const gridStyle = {
  stroke: 'rgba(255,255,255,0.05)',
  strokeDasharray: '4 4',
};

export const tooltipStyle = {
  contentStyle: {
    background: 'rgba(11, 20, 55, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 'bold',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: '#0075FF', fontWeight: 800, marginBottom: '4px' },
  cursor: { fill: 'rgba(67, 24, 255, 0.05)' },
};

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {children}
      </h2>
      {sub && <p className="text-sm mt-1 font-medium" style={{ color: '#A0AEC0' }}>{sub}</p>}
    </div>
  );
}

export function ChartCard({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-[20px] p-5 md:p-6 min-w-0 transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {title && (
        <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </p>
      )}
      <div className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: { bg: 'rgba(67, 24, 255, 0.15)', text: '#FFFFFF', border: 'rgba(67, 24, 255, 0.3)' },
    green: { bg: 'rgba(1, 181, 116, 0.15)', text: '#FFFFFF', border: 'rgba(1, 181, 116, 0.3)' },
    red: { bg: 'rgba(238, 93, 80, 0.15)', text: '#FFFFFF', border: 'rgba(238, 93, 80, 0.3)' },
    purple: { bg: 'rgba(67, 24, 255, 0.15)', text: '#FFFFFF', border: 'rgba(67, 24, 255, 0.3)' },
    yellow: { bg: 'rgba(255, 181, 71, 0.15)', text: '#FFFFFF', border: 'rgba(255, 181, 71, 0.3)' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-[50px] shadow-sm"
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}
    >
      {children}
    </span>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent" style={{ borderTopColor: '#4318FF', animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
        <div className="absolute inset-2 rounded-full border-[3px] border-transparent" style={{ borderTopColor: '#0075FF', animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse' }} />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Synchronizing Data...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(238,93,80,0.3)]" style={{ background: 'rgba(238, 93, 80, 0.1)', border: '1px solid rgba(238, 93, 80, 0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EE5D50" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#EE5D50', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Interface Interrupted</p>
      <p className="text-xs font-medium" style={{ color: '#A0AEC0' }}>{message || 'Verify backend accessibility'}</p>
    </div>
  );
}
