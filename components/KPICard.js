'use client';

import { useEffect, useRef, useState } from 'react';

/** Count-up that honours reduced-motion and never animates non-numerics. */
function useCountUp(target, enabled, duration = 750) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const frame = useRef(null);

  useEffect(() => {
    if (!enabled) { setValue(target); return; }
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || target === 0) { setValue(target); return; }

    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => frame.current && cancelAnimationFrame(frame.current);
  }, [target, enabled, duration]);

  return value;
}

// Icon chip + hover accent per tile. Both sides are theme variables, so a
// tile tints softly on white and softly on navy without a second palette.
const mix = hex => `color-mix(in srgb, ${hex} var(--tint), rgb(var(--c-surface)))`;

const TONES = {
  brand: { fg: 'rgb(var(--c-brand-ink))', bg: mix('#037EF3') },
  gv: { fg: 'rgb(var(--c-gv-ink))', bg: mix('#F85A40') },
  gta: { fg: 'rgb(var(--c-gta-ink))', bg: mix('#0CB9C1') },
  gte: { fg: 'rgb(var(--c-gte-ink))', bg: mix('#F48924') },
  violet: { fg: 'rgb(var(--c-violet-ink))', bg: mix('#7B5BD6') },
  good: { fg: 'rgb(var(--c-good-ink))', bg: mix('#0E8F5F') },
  neutral: { fg: 'rgb(var(--c-ink-2))', bg: 'rgb(var(--c-surface-2))' },
};

export default function KPICard({
  label, value, suffix = '', prefix = '',
  icon: Icon, tone = 'brand', sub, animate = true,
}) {
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  const shown = useCountUp(isNumber ? value : 0, animate && isNumber);
  const t = TONES[tone] || TONES.brand;

  return (
    <article
      className="card group relative overflow-hidden p-4 transition-colors duration-200 ease-out2"
    >
      {/* The accent shows on hover instead of sitting permanently at the
          bottom edge, so a row of tiles reads calmly at rest. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out2 group-hover:opacity-50"
        style={{ background: t.bg }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg2 opacity-0 ring-1 ring-current ring-inset transition-opacity duration-200 ease-out2 group-hover:opacity-100"
        style={{ color: t.fg }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <p className="text-2xs font-bold uppercase tracking-wider text-ink-3">{label}</p>
        {Icon && (
          <span
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-md2"
            style={{ background: t.bg, color: t.fg }}
            aria-hidden="true"
          >
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>

      {isNumber ? (
        <p className="tnum relative mt-2.5 font-display text-3xl font-extrabold leading-none text-ink">
          {prefix}{shown.toLocaleString()}
          {suffix && <span className="text-xl font-bold text-ink-2">{suffix}</span>}
        </p>
      ) : (
        <p
          className="relative mt-2.5 truncate font-display text-xl font-extrabold leading-tight text-ink"
          title={String(value)}
        >
          {prefix}{value}{suffix}
        </p>
      )}

      {sub && <p className="relative mt-1.5 truncate text-xs text-ink-3">{sub}</p>}
    </article>
  );
}
