// Hook pour la persistance de la navigation et des filtres
// Mémorise le mois sélectionné, les filtres actifs, etc.

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUIPersistence } from '@/lib/ui-persistence'

interface NavigationState {
  currentYearMonth: string
  selectedDay?: number
  filters: Record<string, any>
}

interface UseNavigationPersistenceOptions {
  userId: string
  context: 'cdc' | 'sante_ind' | 'sante_coll'
  defaultYearMonth?: string
  autoSave?: boolean
}

export function useNavigationPersistence({
  userId,
  context,
  defaultYearMonth,
  autoSave = true
}: UseNavigationPersistenceOptions) {
  const { saveUIState, getUIState } = useUIPersistence()
  
  // État initial avec récupération des données sauvegardées
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    const savedState = getUIState()
    const now = new Date()
    const defaultMonth = defaultYearMonth || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    
    return {
      currentYearMonth: savedState.currentYearMonth || defaultMonth,
      selectedDay: savedState.selectedDay,
      filters: savedState[`${context}Filters`] || {}
    }
  })

  // Sauvegarde automatique de l'état
  const saveNavigationState = useCallback((newState: Partial<NavigationState>) => {
    if (!autoSave) return

    const updatedState = { ...navigationState, ...newState }
    setNavigationState(updatedState)

    // Sauvegarder dans localStorage
    const uiState = getUIState()
    saveUIState({
      currentYearMonth: updatedState.currentYearMonth,
      selectedDay: updatedState.selectedDay,
      [`${context}Filters`]: updatedState.filters
    })
  }, [autoSave, navigationState, getUIState, saveUIState, context])

  // Changement de mois
  const setCurrentYearMonth = useCallback((yearMonth: string) => {
    saveNavigationState({ 
      currentYearMonth: yearMonth,
      selectedDay: undefined // Reset du jour sélectionné
    })
  }, [saveNavigationState])

  // Changement de jour sélectionné
  const setSelectedDay = useCallback((day?: number) => {
    saveNavigationState({ selectedDay: day })
  }, [saveNavigationState])

  // Mise à jour des filtres
  const setFilters = useCallback((filters: Record<string, any>) => {
    saveNavigationState({ filters })
  }, [saveNavigationState])

  // Reset des filtres
  const resetFilters = useCallback(() => {
    saveNavigationState({ 
      filters: {},
      selectedDay: undefined
    })
  }, [saveNavigationState])

  // Navigation vers le mois précédent
  const goToPreviousMonth = useCallback(() => {
    const [year, month] = navigationState.currentYearMonth.split('-').map(Number)
    const newDate = new Date(year, month - 2, 1) // month - 2 car month est 1-indexé
    const newYearMonth = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`
    setCurrentYearMonth(newYearMonth)
  }, [navigationState.currentYearMonth, setCurrentYearMonth])

  // Navigation vers le mois suivant
  const goToNextMonth = useCallback(() => {
    const [year, month] = navigationState.currentYearMonth.split('-').map(Number)
    const newDate = new Date(year, month, 1) // month car month est 1-indexé
    const newYearMonth = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`
    setCurrentYearMonth(newYearMonth)
  }, [navigationState.currentYearMonth, setCurrentYearMonth])

  // Retour au mois actuel
  const goToCurrentMonth = useCallback(() => {
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    setCurrentYearMonth(currentYearMonth)
  }, [setCurrentYearMonth])

  // Vérifier si on est sur le mois actuel
  const isCurrentMonth = useCallback(() => {
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    return navigationState.currentYearMonth === currentYearMonth
  }, [navigationState.currentYearMonth])

  // Parsing de l'année et du mois
  const [currentYear, currentMonth] = navigationState.currentYearMonth.split('-').map(Number)

  // Sauvegarde automatique au changement d'état
  useEffect(() => {
    if (autoSave) {
      const uiState = getUIState()
      saveUIState({
        currentYearMonth: navigationState.currentYearMonth,
        selectedDay: navigationState.selectedDay,
        [`${context}Filters`]: navigationState.filters
      })
    }
  }, [navigationState, autoSave, getUIState, saveUIState, context])

  return {
    // État
    currentYearMonth: navigationState.currentYearMonth,
    currentYear,
    currentMonth,
    selectedDay: navigationState.selectedDay,
    filters: navigationState.filters,
    
    // Actions de navigation
    setCurrentYearMonth,
    setSelectedDay,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    
    // Actions de filtres
    setFilters,
    resetFilters,
    
    // Utilitaires
    isCurrentMonth: isCurrentMonth(),
    hasActiveFilters: Object.keys(navigationState.filters).length > 0,
    
    // Navigation complète
    navigation: {
      currentYear,
      currentMonth,
      currentYearMonth: navigationState.currentYearMonth,
      canGoPrevious: true, // Toujours possible
      canGoNext: true, // Toujours possible
      isCurrentMonth: isCurrentMonth()
    }
  }
}
