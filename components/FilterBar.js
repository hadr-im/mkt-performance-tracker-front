'use client';
import { useEffect, useState } from 'react';
import { useFilters } from './FilterContext';

import { fetchApi } from '../lib/api';

export default function FilterBar() {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.member || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sync searchTerm with filter changes
  useEffect(() => {
    setSearchTerm(filters.member || '');
  }, [filters.member]);

  const filteredMembers = members.filter(m =>
    m.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Performance limit

  useEffect(() => {
    fetchApi('/api/members')
      .then(d => {
        setMembers(d.allMembers || []);
        setLastUpdated(new Date());
      })
      .catch(() => { });
  }, []);


  const hasFilters = filters.member || filters.dateFrom || filters.dateTo;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 sm:gap-4 pl-14 sm:pl-16 pr-4 md:px-8 py-4 flex-wrap min-w-0 transition-all duration-300"
      style={{
        background: 'rgba(11, 20, 55, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Member filter (Search Bar) */}
      <div className="flex items-center gap-2 relative">
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Member</label>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search member..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              if (!e.target.value) updateFilter('member', '');
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Allow click to fire
            className="text-sm rounded-xl px-4 py-2 outline-none transition-all placeholder:text-[#A0AEC0]/50"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${filters.member ? '#4318FF' : 'rgba(255, 255, 255, 0.15)'}`,
              color: '#FFFFFF',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              width: '100%',
              maxWidth: '200px',
              minWidth: '130px',
              boxShadow: filters.member ? '0 0 15px rgba(67, 24, 255, 0.2)' : 'none',
            }}
          />

          {/* Dropdown results */}
          {isDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl shadow-2xl z-50 py-2"
              style={{
                background: 'rgba(11, 20, 55, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
              }}
            >
              <div
                onClick={() => { updateFilter('member', ''); setSearchTerm(''); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                All Members
              </div>
              {filteredMembers.map(m => (
                <div
                  key={m}
                  onClick={() => { updateFilter('member', m); setSearchTerm(m); setIsDropdownOpen(false); }}
                  className="px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 hover:pl-6"
                  style={{
                    color: filters.member === m ? '#FFFFFF' : '#A0AEC0',
                    background: filters.member === m ? 'linear-gradient(135deg, rgba(67, 24, 255, 0.2), transparent)' : 'transparent',
                    borderLeft: filters.member === m ? '3px solid #4318FF' : '3px solid transparent',
                  }}
                >
                  {m}
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="px-4 py-6 text-center text-xs font-medium" style={{ color: '#A0AEC0' }}>No members found</div>
              )}
            </div>
          )}

          {/* Search Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>
      </div>

      {/* Date from */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => updateFilter('dateFrom', e.target.value)}
          className="text-xs sm:text-sm rounded-xl px-3 py-2 outline-none transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${filters.dateFrom ? '#4318FF' : 'rgba(255, 255, 255, 0.15)'}`,
            color: '#FFFFFF',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            maxWidth: '140px',
            boxShadow: filters.dateFrom ? '0 0 15px rgba(67, 24, 255, 0.2)' : 'none',
          }}
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => updateFilter('dateTo', e.target.value)}
          className="text-xs sm:text-sm rounded-xl px-3 py-2 outline-none transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${filters.dateTo ? '#4318FF' : 'rgba(255, 255, 255, 0.15)'}`,
            color: '#FFFFFF',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            maxWidth: '140px',
            boxShadow: filters.dateTo ? '0 0 15px rgba(67, 24, 255, 0.2)' : 'none',
          }}
        />
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(238, 93, 80, 0.1)', color: '#EE5D50', border: '1px solid rgba(238, 93, 80, 0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}

      {/* Spacer + Last updated */}
      <div className="ml-auto flex items-center gap-3">
        {lastUpdated && (
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block opacity-40" style={{ color: '#A0AEC0' }}>
            Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(1, 181, 116, 0.1)', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_#01B574]" style={{ background: '#01B574' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#01B574', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Live</span>
        </div>
      </div>
    </header>
  );
}
