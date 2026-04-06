'use client';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

const ACCENT_COLORS = {
  blue: { bg: 'rgba(67, 24, 255, 0.1)', border: 'rgba(67, 24, 255, 0.2)', icon: '#4318FF', glow: 'rgba(67, 24, 255, 0.2)' },
  cyan: { bg: 'rgba(0, 117, 255, 0.1)', border: 'rgba(0, 117, 255, 0.2)', icon: '#0075FF', glow: 'rgba(0, 117, 255, 0.2)' },
  green: { bg: 'rgba(1, 181, 116, 0.1)', border: 'rgba(1, 181, 116, 0.2)', icon: '#01B574', glow: 'rgba(1, 181, 116, 0.2)' },
  orange: { bg: 'rgba(255, 181, 71, 0.1)', border: 'rgba(255, 181, 71, 0.2)', icon: '#FFB547', glow: 'rgba(255, 181, 71, 0.2)' },
  red: { bg: 'rgba(238, 93, 80, 0.1)', border: 'rgba(238, 93, 80, 0.2)', icon: '#EE5D50', glow: 'rgba(238, 93, 80, 0.2)' },
  purple: { bg: 'rgba(67, 24, 255, 0.1)', border: 'rgba(67, 24, 255, 0.2)', icon: '#4318FF', glow: 'rgba(67, 24, 255, 0.2)' },
};

export default function KPICard({ label, value, suffix = '', prefix = '', icon, color = 'blue', sub, animate = true }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animatedValue = useCountUp(numericValue);
  const displayed = animate ? animatedValue : numericValue;
  const c = ACCENT_COLORS[color] || ACCENT_COLORS.blue;

  return (
    <div
      className="relative rounded-[20px] p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {label}
        </p>
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-slow" style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 15px ${c.glow}` }}>
            <span style={{ color: c.icon }}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold leading-none" style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {prefix}{typeof value === 'number' ? displayed.toLocaleString() : value}{suffix}
        </p>
        {sub && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: '#A0AEC0' }}>{sub}</p>
        )}
      </div>

      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] -z-10 pointer-events-none" />
    </div>
  );
}
