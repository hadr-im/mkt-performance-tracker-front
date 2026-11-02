'use client';

import Image from 'next/image';
import { AlertCircle, Inbox } from 'lucide-react';

/* ===========================================================================
   Palette — AIESEC brand, fixed.
   The two warm product hues (GV #F85A40, GTE #F48924) sit only ΔE 10.4 apart
   in normal vision, so they are never placed adjacent and identity never
   rests on colour alone: products always carry a logo and a text label.
   =========================================================================== */

export const BRAND = '#037EF3';

/** An accent blended into the current surface, so tints follow the theme. */
export const tint = (hex, amount = 'var(--tint)') =>
  `color-mix(in srgb, ${hex} ${amount}, rgb(var(--c-surface)))`;

/** Readable text colour for an accent, lifted in dark mode. */
export const INK = {
  brand: 'rgb(var(--c-brand-ink))',
  gv: 'rgb(var(--c-gv-ink))',
  gta: 'rgb(var(--c-gta-ink))',
  gte: 'rgb(var(--c-gte-ink))',
};

export const PRODUCTS = {
  Volunteering: {
    key: 'Volunteering', full: 'Volunteering Internship', label: 'Global Volunteer',
    color: '#F85A40', ink: INK.gv, soft: tint('#F85A40'), logo: '/assets/GV LOGO.png',
  },
  Professional: {
    key: 'Professional', full: 'Professional Internship', label: 'Global Talent',
    color: '#0CB9C1', ink: INK.gta, soft: tint('#0CB9C1'), logo: '/assets/GTA LOGO.png',
  },
  Teaching: {
    key: 'Teaching', full: 'Teaching Internship', label: 'Global Teaching',
    color: '#F48924', ink: INK.gte, soft: tint('#F48924'), logo: '/assets/GTE LOGO.png',
  },
};

/** Fixed render order — the teal separates the two warm hues. */
export const PRODUCT_ORDER = ['Volunteering', 'Professional', 'Teaching'];

export const PRODUCT_COLORS = Object.fromEntries(
  Object.values(PRODUCTS).flatMap(p => [[p.full, p.color], [p.key, p.color]])
);

export function getProduct(name = '') {
  const short = String(name).replace(/\s*Internship$/i, '').trim();
  return PRODUCTS[short] || null;
}

/** Categorical ramp; adjacent pairs pass CVD and normal-vision separation. */
export const PALETTE = ['#037EF3', '#F85A40', '#0CB9C1', '#F48924', '#7B5BD6', '#1F9D55'];

export function ProductLogo({ product, size = 28, className = '' }) {
  const p = typeof product === 'string' ? getProduct(product) : product;
  if (!p) return null;
  return (
    <Image
      src={p.logo}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

/* ---------- Department colours (stable per name) ---------- */

const DEPT_COLORS = {
  MKT: '#037EF3', Marketing: '#037EF3',
  OGV: '#F85A40', IGV: '#C2341F',
  OGTa: '#0CB9C1', IGT: '#06696E',
  OGTe: '#F48924',
  BD: '#7B5BD6',
  TM: '#1F9D55',
  PM: '#C2410C',
  IM: '#475569',
  F: '#64748B', Finance: '#64748B',
};

export function getDeptColor(dept) {
  if (!dept) return BRAND;
  if (DEPT_COLORS[dept]) return DEPT_COLORS[dept];
  const hit = Object.keys(DEPT_COLORS).find(k => k.toUpperCase() === String(dept).toUpperCase());
  if (hit) return DEPT_COLORS[hit];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/* ---------- Recharts chrome: recessive grid, readable axes ---------- */

export const axisStyle = {
  tick: { fill: 'rgb(var(--c-axis))', fontSize: 11, fontWeight: 600 },
  axisLine: { stroke: 'rgb(var(--c-line))' },
  tickLine: false,
};

export const gridStyle = {
  stroke: 'rgb(var(--c-grid))',
  strokeDasharray: '3 3',
  vertical: false,
};

export const tooltipStyle = {
  contentStyle: {
    background: 'rgb(var(--c-surface))',
    border: '1px solid rgb(var(--c-line))',
    borderRadius: 12,
    color: 'rgb(var(--c-ink))',
    fontSize: 12,
    boxShadow: 'var(--e-4)',
    padding: '10px 12px',
  },
  labelStyle: { color: 'rgb(var(--c-ink-2))', fontWeight: 700, marginBottom: 6 },
  cursor: { fill: 'rgba(3,126,243,.06)' },
};

/** Shared tooltip: text wears ink tokens, the chip carries identity. */
export function ChartTooltip({ active, payload, label, formatLabel, total, showTotal = true }) {
  if (!active || !payload?.length) return null;

  // With several series, the day's combined figure is the thing you actually
  // want and it is tedious to add up by eye — so it gets its own row.
  const rowTotal = payload.reduce(
    (sum, p) => sum + (typeof p.value === 'number' ? p.value : 0),
    0
  );
  const withTotal = showTotal && payload.length > 1;

  return (
    <div style={tooltipStyle.contentStyle}>
      {label !== undefined && (
        <p style={tooltipStyle.labelStyle} className="text-2xs">
          {formatLabel ? formatLabel(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block shrink-0 rounded-[3px]"
              style={{ width: 9, height: 9, background: p.color || p.payload?.fill || BRAND }}
            />
            <span className="text-ink-2">{p.name}</span>
            <span className="tnum ml-auto pl-3 font-bold text-ink">
              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
              {total > 0 && typeof p.value === 'number' && (
                <span className="ml-1 font-semibold text-ink-4">
                  {((p.value / total) * 100).toFixed(1)}%
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {withTotal && (
        <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-xs">
          <span className="font-bold text-ink">Total</span>
          <span className="tnum ml-auto pl-3 font-extrabold text-ink">
            {rowTotal.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Layout primitives ---------- */

export function Card({ children, className = '', as: Tag = 'section', ...rest }) {
  return <Tag className={`card ${className}`} {...rest}>{children}</Tag>;
}

export function ChartCard({ title, sub, action, children, className = '', pad = true }) {
  return (
    <section className={`card flex flex-col ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pb-3.5 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            {title && <h3 className="font-display text-lg font-bold text-ink">{title}</h3>}
            {sub && <p className="mt-1 text-sm text-ink-3">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={`min-w-0 flex-1 ${pad ? 'px-4 pb-4 sm:px-5 sm:pb-5' : ''}`}>{children}</div>
    </section>
  );
}

const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand/20',
  gv: 'bg-gv-soft text-gv-ink ring-gv/25',
  gta: 'bg-gta-soft text-gta-ink ring-gta/25',
  gte: 'bg-gte-soft text-gte-ink ring-gte/25',
  neutral: 'bg-surface-2 text-ink-2 ring-line-2',
  good: 'bg-good-soft text-good ring-good/25',
};

export function Badge({ children, tone = 'neutral', icon: Icon, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-bold ring-1 ring-inset ${TONES[tone] || TONES.neutral} ${className}`}>
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

/** Department chip — colour plus the label, never colour alone. */
export function DeptBadge({ department, className = '' }) {
  if (!department) return null;
  const color = getDeptColor(department);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-bold ${className}`}
      style={{ background: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {department}
    </span>
  );
}

export function Meter({ value, max, color = BRAND, className = '', height = 6 }) {
  const pct = max > 0 ? Math.max(1.5, (value / max) * 100) : 0;
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-surface-3 ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out2"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/* ---------- States ---------- */

export function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="skeleton h-8 w-60" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[104px]" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="skeleton h-80 lg:col-span-2" />
        <div className="skeleton h-80" />
      </div>
      <div className="skeleton h-72" />
      <span className="sr-only">Loading dashboard data</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center" role="alert">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-gv-soft text-gv">
        <AlertCircle size={24} strokeWidth={2.2} />
      </span>
      <p className="font-display text-lg font-bold text-ink">Could not load the data</p>
      <p className="max-w-md text-sm text-ink-2">{message || 'The dashboard API did not respond.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 min-h-[44px] rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-600"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No data', message, icon: Icon = Inbox, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 px-6 py-12 text-center ${className}`}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-ink-4">
        <Icon size={20} strokeWidth={2} />
      </span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {message && <p className="max-w-sm text-sm leading-relaxed text-ink-3">{message}</p>}
      {action}
    </div>
  );
}

/* ---------- Formatters ---------- */

const M_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const M_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDayTick(key) {
  if (!key || key.length < 10) return key;
  const [, m, d] = key.split('-');
  return `${Number(d)} ${M_SHORT[Number(m) - 1] || ''}`;
}

export function formatDayFull(key) {
  if (!key || key.length < 10) return key;
  const [y, m, d] = key.split('-');
  return `${Number(d)} ${M_LONG[Number(m) - 1] || ''} ${y}`;
}

export function compact(n) {
  if (typeof n !== 'number') return n;
  return n >= 10000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n.toLocaleString();
}

/** Truncate long category labels on an axis. */
export const truncate = (v, max = 15) =>
  typeof v === 'string' && v.length > max ? `${v.slice(0, max - 1)}…` : v;
