'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NavigationContextType {
  currentMonth: string; // Format: "YYYY-MM"
  setCurrentMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isLoading: boolean;
  isCurrentMonth: (month: string) => boolean;
  getCurrentMonthDisplay: () => string; // Format: "septembre 2025"
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  // État pour le mois actuel sélectionné
  const [currentMonth, setCurrentMonthState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialisation du mois actuel au chargement
  useEffect(() => {
    const initializeMonth = () => {
      // Utiliser la date réelle du système
      const now = new Date();
      const currentMonthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Vérifier s'il y a un mois sauvegardé dans localStorage
      const savedMonth = localStorage.getItem('commercial-current-month');
      if (savedMonth) {
        setCurrentMonthState(savedMonth);
      } else {
        setCurrentMonthState(currentMonthString);
        localStorage.setItem('commercial-current-month', currentMonthString);
      }
    };

    initializeMonth();
  }, []);

  // Fonction pour définir le mois actuel avec persistence
  const setCurrentMonth = (month: string) => {
    setCurrentMonthState(month);
    localStorage.setItem('commercial-current-month', month);
  };

  // Navigation vers le mois précédent
  const goToPreviousMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    
    if (newMonth === 0) {
      newMonth = 12;
      newYear = year - 1;
    }
    
    const newMonthString = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
    
    // Simuler un délai de chargement pour l'UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Navigation vers le mois suivant
  const goToNextMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    
    if (newMonth === 13) {
      newMonth = 1;
      newYear = year + 1;
    }
    
    const newMonthString = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
    
    // Simuler un délai de chargement pour l'UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Retour au mois actuel (date réelle)
  const goToCurrentMonth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const now = new Date();
    const currentMonthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(currentMonthString);
    
    // Simuler un délai de chargement pour l'UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Vérifier si le mois donné est le mois actuel (date réelle)
  const isCurrentMonth = (month: string) => {
    const now = new Date();
    const currentMonthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return month === currentMonthString;
  };

  // Obtenir l'affichage du mois en français
  const getCurrentMonthDisplay = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };

  const value: NavigationContextType = {
    currentMonth,
    setCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isLoading,
    isCurrentMonth,
    getCurrentMonthDisplay,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
