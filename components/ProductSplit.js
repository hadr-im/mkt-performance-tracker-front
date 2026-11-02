'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ChartCard, EmptyState, ProductLogo, PRODUCTS, PRODUCT_ORDER, tooltipStyle,
} from './ChartConfig';

/** Tooltip showing a slice's count and share. */
function SliceTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const meta = p.payload;
  return (
    <div style={tooltipStyle.contentStyle}>
      <div className="flex items-center gap-2 text-xs">
        <span
          className="inline-block shrink-0 rounded-[3px]"
          style={{ width: 9, height: 9, background: meta.color }}
        />
        <span className="font-semibold text-ink">{meta.label}</span>
        <span className="tnum ml-auto pl-3 font-bold text-ink">
          {p.value.toLocaleString()}
          <span className="ml-1 font-semibold text-ink-4">
            {total > 0 ? `${((p.value / total) * 100).toFixed(1)}%` : ''}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Product share as a donut.
 *
 * The two warm brand hues (GV #F85A40, GTE #F48924) are only ΔE 10.4 apart and
 * every slice in a pie touches its neighbours, so colour alone cannot carry
 * identity. Three things compensate: a 2px white gap between slices, the fixed
 * GV → GTA → GTE order, and a legend of product logos whose silhouettes differ
 * (balloon, globe, book) — recognisable without relying on hue.
 */
export default function ProductSplit({ byProduct = {}, total = 0, className = '', bare = false }) {
  const rows = PRODUCT_ORDER
    .map(key => {
      const meta = PRODUCTS[key];
      return { ...meta, count: byProduct[meta.full] ?? byProduct[key] ?? 0 };
    })
    .filter(r => r.count > 0);

  const sum = rows.reduce((s, r) => s + r.count, 0) || total || 0;

  const Shell = bare
    ? ({ children }) => <>{children}</>
    : ({ children }) => (
      <ChartCard
        title="Product Split"
        sub={sum ? `${sum.toLocaleString()} signups` : undefined}
        className={className}
      >
        {children}
      </ChartCard>
    );

  return (
    <Shell>
      {rows.length === 0 ? (
        <EmptyState message="No product data in this range." />
      ) : (
        <div className="flex h-full flex-col">
          <div className="relative min-h-[228px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="94%"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  stroke="rgb(var(--c-surface))"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {rows.map(r => <Cell key={r.key} fill={r.color} />)}
                </Pie>
                <Tooltip content={<SliceTooltip total={sum} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total sits in the hole rather than taking its own row */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tnum font-display text-3xl font-extrabold leading-none text-ink">
                {sum.toLocaleString()}
              </span>
              <span className="mt-1.5 text-2xs font-bold uppercase tracking-wider text-ink-4">
                Signups
              </span>
            </div>
          </div>

          {/* One centred row of product logo tiles. Counts live in the
              tooltip, so the card stays short enough not to stretch the
              chart beside it. */}
          <ul className="mt-7 flex items-center justify-center gap-3">
            {rows.map(r => (
              <li
                key={r.key}
                title={`${r.label}: ${r.count.toLocaleString()} (${((r.count / sum) * 100).toFixed(1)}%)`}
              >
                <span
                  className="grid h-10 w-[60px] place-items-center rounded-md2"
                  style={{ background: r.soft }}
                >
                  <ProductLogo product={r} size={24} />
                </span>
                <span className="sr-only">
                  {r.label}: {r.count.toLocaleString()} signups
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Shell>
  );
}
