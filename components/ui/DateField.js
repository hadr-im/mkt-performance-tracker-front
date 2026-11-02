'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

/* Single-date field. Values are 'YYYY-MM-DD' strings built from local
   calendar fields, so nothing shifts across timezones. */

const pad = n => String(n).padStart(2, '0');
const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => {
  if (!k) return null;
  const [y, m, d] = String(k).split('-').map(Number);
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

/**
 * @param {string}  value     selected 'YYYY-MM-DD' (or '')
 * @param {string}  minKey    earliest selectable day — the "to" field passes
 *                            the chosen "from" date here, so an end date can
 *                            never precede its start
 * @param {string}  maxKey    latest selectable day
 */
export default function DateField({
  value, onChange, label, placeholder = 'Any date', minKey, maxKey, align = 'left',
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(
    () => fromKey(value) || fromKey(minKey) || fromKey(maxKey) || new Date()
  );
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setView(fromKey(value) || fromKey(minKey) || fromKey(maxKey) || new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const grid = useMemo(() => buildGrid(view), [view]);
  const selected = fromKey(value);
  const min = fromKey(minKey);
  const max = fromKey(maxKey);

  const text = selected
    ? `${selected.getDate()} ${SHORT[selected.getMonth()]} ${selected.getFullYear()}`
    : placeholder;

  const disabledDay = d => (min && d < min) || (max && d > max);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${selected ? text : 'not set'}`}
        className={`inline-flex h-10 min-h-[40px] items-center gap-2 rounded-md2 border px-3 text-sm font-semibold transition-colors duration-200 ease-out2
          ${value
            ? 'border-brand/45 bg-brand-50 text-brand-700'
            : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:bg-surface-2'}`}
      >
        <CalendarDays size={15} strokeWidth={2.2} className={value ? 'text-brand' : 'text-ink-4'} />
        <span className="text-2xs font-bold uppercase tracking-wider text-ink-4">{label}</span>
        <span className="tnum whitespace-nowrap">{text}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${label} date`}
            onClick={e => { e.stopPropagation(); onChange(''); }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onChange(''); }
            }}
            className="-mr-1 grid h-5 w-5 place-items-center rounded-full text-ink-3 transition hover:bg-surface hover:text-ink"
          >
            <X size={12} strokeWidth={2.8} />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Choose ${label} date`}
          className={`animate-pop absolute top-full z-[60] mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-lg2 border border-line bg-surface shadow-e4
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
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

          <div className="p-3">
            <div className="mb-1 grid grid-cols-7">
              {DOW.map(d => (
                <span key={d} className="py-1 text-center text-2xs font-bold uppercase text-ink-4">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((d, i) => {
                const other = d.getMonth() !== view.getMonth();
                const off = disabledDay(d);
                const sel = selected && toKey(d) === toKey(selected);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={off}
                    aria-pressed={Boolean(sel)}
                    onClick={() => { onChange(toKey(d)); setOpen(false); }}
                    aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}
                    className={`tnum h-9 rounded-sm2 text-sm font-semibold transition-colors duration-150 ease-out2
                      ${sel ? 'bg-brand text-white shadow-e2' : ''}
                      ${!sel && !off ? 'hover:bg-surface-2' : ''}
                      ${off ? 'cursor-not-allowed text-ink-4/35' : other ? 'text-ink-4' : sel ? '' : 'text-ink'}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {minKey && (
            <p className="border-t border-line px-3 py-2 text-2xs font-medium text-ink-3">
              Earliest selectable: {(() => {
                const m = fromKey(minKey);
                return `${m.getDate()} ${SHORT[m.getMonth()]} ${m.getFullYear()}`;
              })()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
