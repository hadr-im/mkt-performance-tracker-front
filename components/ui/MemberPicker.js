'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Check, Users, UserRoundX } from 'lucide-react';
import { getDeptColor } from '../ChartConfig';

function initials(name = '') {
  const parts = String(name).trim().replace(/[()]/g, '').split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/**
 * Member filter. The list comes from the Departments sheet only, so it shows
 * exactly the people the organisation tracks. Each row carries its department
 * and signup count, so a member with no activity is visible rather than
 * looking like a broken filter.
 */
export default function MemberPicker({ value, roster = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? roster.filter(m =>
        m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q))
      : roster;
    // Most active first when browsing; keep natural order while searching.
    return q ? list.slice(0, 80) : [...list].sort((a, b) => b.signups - a.signups).slice(0, 200);
  }, [roster, query]);

  const selected = roster.find(m => m.name === value);

  useEffect(() => { setCursor(0); }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!rootRef.current?.contains(e.target)) close(); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.querySelector(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const close = () => { setOpen(false); setQuery(''); };
  const choose = name => { onChange(name); close(); };

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setOpen(true);
      setCursor(c => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && results[cursor]) choose(results[cursor].name);
    } else if (e.key === 'Escape') {
      e.preventDefault(); close(); inputRef.current?.blur();
    } else if (e.key === 'Backspace' && !query && value) {
      onChange('');
    }
  };

  const selColor = selected ? getDeptColor(selected.department) : '#037EF3';

  return (
    <div className="relative" ref={rootRef}>
      <div
        className={`flex h-10 min-h-[40px] items-center gap-2 rounded-md2 border pl-2.5 pr-1.5 transition-colors duration-200 ease-out2
          ${open || value
            ? 'border-brand/45 bg-brand-50'
            : 'border-line bg-surface hover:border-line-2 hover:bg-surface-2'}`}
      >
        {value && !open ? (
          <span
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-2xs font-extrabold text-white"
            style={{ background: selColor }}
            aria-hidden="true"
          >
            {initials(value)}
          </span>
        ) : (
          <Search size={15} strokeWidth={2.2} className="shrink-0 text-ink-4" />
        )}

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="member-listbox"
          aria-autocomplete="list"
          aria-label="Filter by member"
          placeholder={value || 'All members'}
          value={open ? query : value || ''}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-[9.5rem] min-w-0 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink-3 sm:w-[14rem] lg:w-[16rem]"
        />

        {value && (
          <button
            type="button"
            aria-label="Clear member filter"
            onClick={() => { onChange(''); setQuery(''); }}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-3 transition hover:bg-surface hover:text-ink"
          >
            <X size={13} strokeWidth={2.8} />
          </button>
        )}
      </div>

      {open && (
        <div className="animate-pop absolute left-0 top-full z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg2 border border-line bg-surface shadow-e4">
          <ul id="member-listbox" role="listbox" ref={listRef} className="max-h-[17rem] overflow-y-auto py-1.5">
            <li>
              <button
                type="button"
                onClick={() => choose('')}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-bold transition-colors
                  ${!value ? 'text-brand-700' : 'text-ink-2 hover:bg-surface-2'}`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-ink-3">
                  <Users size={14} strokeWidth={2.2} />
                </span>
                All members
                <span className="tnum ml-auto text-xs font-semibold text-ink-4">{roster.length}</span>
                {!value && <Check size={14} strokeWidth={3} className="text-brand" />}
              </button>
            </li>

            {results.length > 0 && <li className="mx-3 my-1 border-t border-line" aria-hidden="true" />}

            {results.map((m, i) => {
              const active = i === cursor;
              const isSel = m.name === value;
              const color = getDeptColor(m.department);
              return (
                <li key={m.name}>
                  <button
                    type="button"
                    data-idx={i}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(m.name)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors
                      ${active ? 'bg-surface-2' : ''}`}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-2xs font-extrabold text-white"
                      style={{ background: color }}
                      aria-hidden="true"
                    >
                      {initials(m.name)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-semibold ${isSel ? 'text-brand-700' : 'text-ink'}`}>
                        {m.name}
                      </span>
                      <span className="block text-2xs font-semibold" style={{ color }}>
                        {m.department}
                      </span>
                    </span>

                    <span className={`tnum shrink-0 text-xs font-bold ${m.signups ? 'text-ink-2' : 'text-ink-4'}`}>
                      {m.signups}
                    </span>
                    {isSel && <Check size={14} strokeWidth={3} className="shrink-0 text-brand" />}
                  </button>
                </li>
              );
            })}

            {results.length === 0 && (
              <li className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
                <UserRoundX size={20} strokeWidth={2} className="text-ink-4" />
                <p className="text-sm font-semibold text-ink-2">No member matches</p>
                <p className="text-xs text-ink-3">&ldquo;{query}&rdquo;</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
