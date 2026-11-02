'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FilterContext = createContext(null);

const EMPTY = { member: '', dateFrom: '', dateTo: '' };

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(EMPTY);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  /** Both ends move together, so the data reloads once rather than twice. */
  const setDateRange = useCallback((dateFrom, dateTo) => {
    setFilters(prev =>
      prev.dateFrom === dateFrom && prev.dateTo === dateTo
        ? prev
        : { ...prev, dateFrom: dateFrom || '', dateTo: dateTo || '' }
    );
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY), []);

  const value = useMemo(
    () => ({ filters, updateFilter, setDateRange, resetFilters }),
    [filters, updateFilter, setDateRange, resetFilters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside <FilterProvider>');
  return ctx;
}
