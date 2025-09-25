'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersContextType {
  filters: {
    actType: string[];
  };
  setFilters: (filters: { actType: string[] }) => void;
  resetFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}

interface FiltersSystemProps {
  children: ReactNode;
}

export function FiltersSystem({ children }: FiltersSystemProps) {
  const [filters, setFilters] = useState({
    actType: [] as string[]
  });

  const resetFilters = () => {
    setFilters({
      actType: []
    });
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, resetFilters }}>
      <div className="space-y-6">
        {children}
      </div>
    </FiltersContext.Provider>
  );
}
