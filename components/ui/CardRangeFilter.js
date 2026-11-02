'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { RANGE_OPTIONS, rangeLabel } from '../../lib/ranges';

/** Compact date-scope dropdown, sits in a card's top-right corner. */
export default function CardRangeFilter({ value, onChange, label = 'Date range' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listRef = useRef(null);

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

  const active = value && value !== 'all';

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${rangeLabel(value)}`}
        className={`inline-flex h-8 items-center gap-1.5 rounded-sm2 border px-2.5 text-xs font-bold transition-colors duration-200 ease-out2
          ${active
            ? 'border-brand/40 bg-brand-50 text-brand-700'
            : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:bg-surface-2'}`}
      >
        {rangeLabel(value)}
        <ChevronDown
          size={13}
          strokeWidth={2.6}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          ref={listRef}
          aria-label={label}
          className="animate-pop absolute right-0 top-full z-[60] mt-1.5 w-[11rem] overflow-hidden rounded-md2 border border-line bg-surface py-1 shadow-e4"
        >
          {RANGE_OPTIONS.map(opt => {
            const on = (value || 'all') === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => { onChange(opt.id); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors
                    ${on ? 'text-brand-700' : 'text-ink-2 hover:bg-surface-2'}`}
                >
                  {opt.label}
                  {on && <Check size={13} strokeWidth={3} className="ml-auto text-brand" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
