'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SanteIndNavigationContextType {
  currentMonth: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isLoading: boolean;
  isCurrentMonth: (month: string) => boolean;
  getCurrentMonthDisplay: () => string;
  isMonthLocked: boolean; // Nouveau: état de verrouillage du mois
}

const SanteIndNavigationContext = createContext<SanteIndNavigationContextType | undefined>(undefined);

export function SanteIndNavigationProvider({ children }: { children: ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMonthLocked, setIsMonthLocked] = useState(false); // Nouveau: état de verrouillage

  // Initialiser le mois actuel
  const initializeMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthString = `${year}-${month}`;
    setCurrentMonth(monthString);
  };

  // Charger le mois depuis localStorage au montage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedMonth = localStorage.getItem('sante-ind-current-month');
    if (savedMonth) {
      setCurrentMonth(savedMonth);
    } else {
      initializeMonth();
    }
  }, []);

  // Sauvegarder le mois dans localStorage quand il change
  useEffect(() => {
    if (currentMonth && typeof window !== 'undefined') {
      localStorage.setItem('sante-ind-current-month', currentMonth);
    }
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    
    const newMonthString = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
    
    setTimeout(() => setIsLoading(false), 300);
  };

  const goToNextMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }
    
    const newMonthString = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
    
    setTimeout(() => setIsLoading(false), 300);
  };

  const goToCurrentMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    initializeMonth();
    setTimeout(() => setIsLoading(false), 300);
  };

  const isCurrentMonth = (month: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthString = `${currentYear}-${currentMonthNum}`;
    return month === currentMonthString;
  };

  const getCurrentMonthDisplay = () => {
    if (!currentMonth) return '';
    
    const [year, month] = currentMonth.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${year}`;
  };

  return (
    <SanteIndNavigationContext.Provider
      value={{
        currentMonth,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,
        isLoading,
        isCurrentMonth,
        getCurrentMonthDisplay,
        isMonthLocked, // Nouveau: état de verrouillage
      }}
    >
      {children}
    </SanteIndNavigationContext.Provider>
  );
}

export function useSanteIndNavigation() {
  const context = useContext(SanteIndNavigationContext);
  if (!context) {
    throw new Error('useSanteIndNavigation must be used within a SanteIndNavigationProvider');
  }
  return context;
}
