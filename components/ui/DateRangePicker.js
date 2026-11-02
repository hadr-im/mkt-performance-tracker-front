'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { semestersInRange, matchSemester } from '../../lib/semesters';

/* Dates travel as 'YYYY-MM-DD' strings — the shape the API filters on — and
   are built from local calendar fields, so nothing shifts across timezones. */

const pad = n => String(n).padStart(2, '0');
const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => {
  if (!k) return null;
  const [y, m, d] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildGrid(view) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function DateRangePicker({ from, to, onChange, minKey, maxKey }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => fromKey(from) || fromKey(maxKey) || new Date());
  const [anchor, setAnchor] = useState(null);
  const rootRef = useRef(null);

  const semesters = useMemo(() => semestersInRange(minKey, maxKey), [minKey, maxKey]);
  const activeSemester = matchSemester(from, to, semesters);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!rootRef.current?.contains(e.target)) { setOpen(false); setAnchor(null); } };
    const onKey = e => { if (e.key === 'Escape') { setOpen(false); setAnchor(null); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setView(fromKey(from) || fromKey(maxKey) || new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const grid = useMemo(() => buildGrid(view), [view]);
  const fromD = fromKey(from);
  const toD = fromKey(to);
  const min = fromKey(minKey);
  const max = fromKey(maxKey);
  const hasValue = Boolean(from || to);

  const label = (() => {
    if (activeSemester) return activeSemester.short;
    if (!from && !to) return 'All time';
    const f = fromD; const t = toD;
    const fmt = d => `${d.getDate()} ${SHORT[d.getMonth()]}`;
    const fmtY = d => `${d.getDate()} ${SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    if (f && t) return `${fmt(f)} – ${fmtY(t)}`;
    if (f) return `From ${fmtY(f)}`;
    return `Until ${fmtY(t)}`;
  })();

  const pick = day => {
    const k = toKey(day);
    if (!anchor) {
      setAnchor(k);
      onChange({ from: k, to: '' });
      return;
    }
    const [a, b] = anchor <= k ? [anchor, k] : [k, anchor];
    onChange({ from: a, to: b });
    setAnchor(null);
    setOpen(false);
  };

  const outOfBounds = d => (min && d < min) || (max && d > max);
  const inRange = d => {
    if (!fromD) return false;
    const endD = toD || (anchor ? fromKey(anchor) : null);
    if (!endD) return false;
    const lo = fromD <= endD ? fromD : endD;
    const hi = fromD <= endD ? endD : fromD;
    return d >= lo && d <= hi;
  };
  const isEdge = d =>
    (fromD && toKey(d) === toKey(fromD)) || (toD && toKey(d) === toKey(toD));

  const clear = () => { onChange({ from: '', to: '' }); setAnchor(null); };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Date range: ${label}`}
        className={`inline-flex h-10 min-h-[40px] items-center gap-2 rounded-md2 border px-3 text-sm font-semibold transition-colors duration-200 ease-out2
          ${hasValue
            ? 'border-brand/45 bg-brand-50 text-brand-700'
            : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:bg-surface-2'}`}
      >
        <CalendarDays size={15} strokeWidth={2.2} className={hasValue ? 'text-brand' : 'text-ink-4'} />
        <span className="whitespace-nowrap">{label}</span>
        {hasValue && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date range"
            onClick={e => { e.stopPropagation(); clear(); }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); clear(); }
            }}
            className="-mr-1 ml-0.5 grid h-5 w-5 place-items-center rounded-full text-ink-3 transition hover:bg-surface hover:text-ink"
          >
            <X size={12} strokeWidth={2.8} />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date range"
          className="animate-pop absolute left-0 top-full z-[60] mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-lg2 border border-line bg-surface shadow-e4"
        >
          {/* Semesters */}
          <div className="border-b border-line p-3">
            <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-ink-4">Semester</p>
            <div className="flex flex-wrap gap-1.5">
              {semesters.map(s => {
                const on = activeSemester?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { onChange({ from: s.from, to: s.to }); setAnchor(null); setOpen(false); }}
                    title={`${s.name} · ${s.hint}`}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 ease-out2
                      ${on ? 'bg-brand text-white' : 'bg-surface-2 text-ink-2 hover:bg-brand-50 hover:text-brand-700'}`}
                  >
                    {on && <Check size={11} strokeWidth={3} />}
                    {s.short}
                    <span className={`font-medium ${on ? 'text-white/70' : 'text-ink-4'}`}>· {s.hint}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => { clear(); setOpen(false); }}
                className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 ease-out2
                  ${!hasValue ? 'bg-brand text-white' : 'bg-surface-2 text-ink-2 hover:bg-brand-50 hover:text-brand-700'}`}
              >
                All time
              </button>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between px-3 pt-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-sm2 text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <p className="font-display text-sm font-bold text-ink">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-sm2 text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <div className="mb-1 grid grid-cols-7">
              {DOW.map(d => (
                <span key={d} className="py-1 text-center text-2xs font-bold uppercase text-ink-4">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((d, i) => {
                const other = d.getMonth() !== view.getMonth();
                const disabled = outOfBounds(d);
                const selected = isEdge(d);
                const within = inRange(d) && !selected;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(d)}
                    aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}
                    aria-pressed={selected}
                    className={`tnum relative h-9 text-sm font-semibold transition-colors duration-150 ease-out2
                      ${within ? 'bg-brand-50' : ''}
                      ${selected ? 'z-10 rounded-sm2 bg-brand text-white shadow-e2' : ''}
                      ${!selected && !within && !disabled ? 'rounded-sm2 hover:bg-surface-2' : ''}
                      ${disabled
                        ? 'cursor-not-allowed text-ink-4/40'
                        : other ? 'text-ink-4' : selected ? '' : 'text-ink'}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
            <p className="truncate text-xs font-medium text-ink-3">
              {anchor ? 'Now pick the end date' : 'Click a start then an end date'}
            </p>
            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
