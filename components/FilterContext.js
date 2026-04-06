'use client';
import { createContext, useContext, useState } from 'react';

const FilterContext = createContext({});

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    member: '',
    dateFrom: '',
    dateTo: '',
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({ member: '', dateFrom: '', dateTo: '' });

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
