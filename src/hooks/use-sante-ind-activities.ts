"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

import {
  SanteIndActivity,
  SanteIndActivityCreate,
  SanteIndFilter,
  SanteIndSort,
  LockStatus,
  MonthNavigation,
  KPIMensuel,
  ProductionStats
} from '../types/sante-ind'

import {
  santeIndService,
  createMonthNavigation,
  calculateKPIMensuel,
  calculateProductionStats,
  filterActivities,
  sortActivities
} from '../lib/sante-ind-service'

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface UseSanteIndActivitiesOptions {
  yearMonth?: string
  autoLoad?: boolean
}

interface UseSanteIndActivitiesReturn {
  // Données
  activities: SanteIndActivity[]
  filteredActivities: SanteIndActivity[]
  kpi: KPIMensuel
  stats: ProductionStats
  lockStatus: LockStatus
  
  // Navigation
  navigation: MonthNavigation
  
  // États
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Filtres et tri
  filter: SanteIndFilter
  sort: SanteIndSort
  
  // Actions
  loadActivities: () => Promise<void>
  saveActivity: (activity: SanteIndActivityCreate) => Promise<SanteIndActivity>
  updateActivity: (id: string, activity: Partial<SanteIndActivity>) => Promise<SanteIndActivity>
  deleteActivity: (id: string) => Promise<void>
  refreshData: () => Promise<void>
  
  // Navigation
  navigateToMonth: (year: number, month: number) => void
  navigateToPreviousMonth: () => void
  navigateToNextMonth: () => void
  resetToCurrentMonth: () => void
  
  // Filtres et tri
  setFilter: (filter: SanteIndFilter) => void
  setSort: (sort: SanteIndSort) => void
  clearFilters: () => void
  
  // Utilitaires
  getActivityById: (id: string) => SanteIndActivity | undefined
  getActivitiesByType: (type: string) => SanteIndActivity[]
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useSanteIndActivities(options: UseSanteIndActivitiesOptions = {}): UseSanteIndActivitiesReturn {
  const { user } = useAuth()
  const { yearMonth, autoLoad = true } = options
  
  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  // Données
  const [activities, setActivities] = useState<SanteIndActivity[]>([])
  const [lockStatus, setLockStatus] = useState<LockStatus>('unlocked')
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Navigation
  const [currentDate] = useState(new Date())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1)
  const [navigation, setNavigation] = useState<MonthNavigation>(() => 
    createMonthNavigation(currentYear, currentMonth)
  )
  
  // Filtres et tri
  const [filter, setFilter] = useState<SanteIndFilter>({})
  const [sort, setSort] = useState<SanteIndSort>({
    field: 'dateSaisie',
    direction: 'desc'
  })

  // ============================================================================
  // CALCULS DÉRIVÉS
  // ============================================================================
  
  // Activités filtrées et triées
  const filteredActivities = useCallback(() => {
    let result = activities
    
    // Appliquer les filtres
    if (Object.keys(filter).length > 0) {
      result = filterActivities(result, filter)
    }
    
    // Appliquer le tri
    result = sortActivities(result, sort)
    
    return result
  }, [activities, filter, sort])

  // KPIs calculés
  const kpi = useCallback(() => {
    return calculateKPIMensuel(activities)
  }, [activities])

  // Statistiques calculées
  const stats = useCallback(() => {
    return calculateProductionStats(activities)
  }, [activities])

  // ============================================================================
  // EFFETS
  // ============================================================================
  
  // Mettre à jour la navigation
  useEffect(() => {
    const newNavigation = createMonthNavigation(currentYear, currentMonth)
    setNavigation(newNavigation)
  }, [currentYear, currentMonth])

  // Charger automatiquement les données
  useEffect(() => {
    if (autoLoad && user) {
      loadActivities()
    }
  }, [autoLoad, user, currentYear, currentMonth])

  // ============================================================================
  // FONCTIONS DE CHARGEMENT
  // ============================================================================
  
  const loadActivities = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const currentYearMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
      const targetYearMonth = yearMonth || currentYearMonth
      
      // TODO: Implémenter les appels API Firebase
      // const [activitiesData, lockData] = await Promise.all([
      //   fetchActivities(user.uid, targetYearMonth),
      //   fetchLockStatus(targetYearMonth)
      // ])
      
      // Simulation temporaire
      const mockActivities: SanteIndActivity[] = []
      const mockLockStatus: LockStatus = 'unlocked'
      
      setActivities(mockActivities)
      setLockStatus(mockLockStatus)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur lors du chargement des activités:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, currentYear, currentMonth, yearMonth])

  // ============================================================================
  // FONCTIONS DE SAUVEGARDE
  // ============================================================================
  
  const saveActivity = useCallback(async (activityData: SanteIndActivityCreate): Promise<SanteIndActivity> => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    setIsSaving(true)
    setError(null)
    
    try {
      // TODO: Implémenter l'appel API de sauvegarde
      // const savedActivity = await createActivity(activityData)
      
      // Simulation temporaire
      const newActivity: SanteIndActivity = {
        ...activityData,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setActivities(prev => [newActivity, ...prev])
      return newActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError(errorMessage)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [user])

  const updateActivity = useCallback(async (id: string, updates: Partial<SanteIndActivity>): Promise<SanteIndActivity> => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    setIsSaving(true)
    setError(null)
    
    try {
      // TODO: Implémenter l'appel API de mise à jour
      // const updatedActivity = await updateActivityAPI(id, updates)
      
      // Simulation temporaire
      const updatedActivity: SanteIndActivity = {
        ...activities.find(a => a.id === id)!,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      setActivities(prev => 
        prev.map(a => a.id === id ? updatedActivity : a)
      )
      
      return updatedActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [user, activities])

  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    setIsSaving(true)
    setError(null)
    
    try {
      // TODO: Implémenter l'appel API de suppression
      // await deleteActivityAPI(id)
      
      // Simulation temporaire
      setActivities(prev => prev.filter(a => a.id !== id))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [user])

  // ============================================================================
  // FONCTIONS DE NAVIGATION
  // ============================================================================
  
  const navigateToMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year)
    setCurrentMonth(month)
  }, [])

  const navigateToPreviousMonth = useCallback(() => {
    const newNavigation = santeIndService.navigateToPreviousMonth(currentYear, currentMonth)
    setCurrentYear(newNavigation.currentYear)
    setCurrentMonth(newNavigation.currentMonth)
  }, [currentYear, currentMonth])

  const navigateToNextMonth = useCallback(() => {
    const newNavigation = santeIndService.navigateToNextMonth(currentYear, currentMonth)
    setCurrentYear(newNavigation.currentYear)
    setCurrentMonth(newNavigation.currentMonth)
  }, [currentYear, currentMonth])

  const resetToCurrentMonth = useCallback(() => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
  }, [])

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================
  
  const refreshData = useCallback(async () => {
    await loadActivities()
  }, [loadActivities])

  const clearFilters = useCallback(() => {
    setFilter({})
    setSort({
      field: 'dateSaisie',
      direction: 'desc'
    })
  }, [])

  const getActivityById = useCallback((id: string): SanteIndActivity | undefined => {
    return activities.find(a => a.id === id)
  }, [activities])

  const getActivitiesByType = useCallback((type: string): SanteIndActivity[] => {
    return activities.filter(a => a.natureActe === type)
  }, [activities])

  // ============================================================================
  // RETOUR DU HOOK
  // ============================================================================
  
  return {
    // Données
    activities,
    filteredActivities: filteredActivities(),
    kpi: kpi(),
    stats: stats(),
    lockStatus,
    
    // Navigation
    navigation,
    
    // États
    isLoading,
    isSaving,
    error,
    
    // Filtres et tri
    filter,
    sort,
    
    // Actions
    loadActivities,
    saveActivity,
    updateActivity,
    deleteActivity,
    refreshData,
    
    // Navigation
    navigateToMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    resetToCurrentMonth,
    
    // Filtres et tri
    setFilter,
    setSort,
    clearFilters,
    
    // Utilitaires
    getActivityById,
    getActivitiesByType
  }
}
