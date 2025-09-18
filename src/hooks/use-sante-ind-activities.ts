// Hook personnalisé pour la gestion des activités Santé Individuelle
// Intègre le service Santé Individuelle avec React

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  SanteIndActivity, 
  SanteIndActeType, 
  CompagnieType,
  SanteIndKPI,
  SanteIndFilter,
  SanteIndMonthNavigation,
  ProductionStats,
  QualiteAlert
} from '@/types/sante-ind'
import { santeIndService } from '@/lib/sante-ind-service'

interface UseSanteIndActivitiesOptions {
  yearMonth: string
  userId: string
  autoRefresh?: boolean
  refreshInterval?: number // en millisecondes
}

interface UseSanteIndActivitiesReturn {
  // Données
  activities: SanteIndActivity[]
  kpis: SanteIndKPI | null
  loading: boolean
  error: string | null
  
  // Actions
  saveActivity: (activity: Omit<SanteIndActivity, 'id'>) => Promise<SanteIndActivity>
  updateActivity: (id: string, updates: Partial<SanteIndActivity>) => Promise<SanteIndActivity>
  deleteActivity: (id: string) => Promise<void>
  refreshActivities: () => Promise<void>
  refreshKPIs: () => Promise<void>
  
  // Navigation mensuelle
  navigation: SanteIndMonthNavigation
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToCurrentMonth: () => void
  
  // Filtres
  filters: SanteIndFilter
  setFilters: (filters: Partial<SanteIndFilter>) => void
  filteredActivities: SanteIndActivity[]
  
  // Statistiques
  productionStats: ProductionStats | null
  qualiteAlert: QualiteAlert | null
  
  // Verrouillage
  isMonthLocked: boolean
  lockLoading: boolean
  
  // Utilitaires
  hasData: boolean
  totalActivities: number
}

export function useSanteIndActivities({
  yearMonth,
  userId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 secondes
}: UseSanteIndActivitiesOptions): UseSanteIndActivitiesReturn {
  
  // États
  const [activities, setActivities] = useState<SanteIndActivity[]>([])
  const [kpis, setKpis] = useState<SanteIndKPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMonthLocked, setIsMonthLocked] = useState(false)
  const [lockLoading, setLockLoading] = useState(false)
  
  // Navigation mensuelle
  const [currentYear, setCurrentYear] = useState(() => {
    const now = new Date()
    return now.getFullYear()
  })
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return now.getMonth() + 1
  })
  
  // Filtres
  const [filters, setFiltersState] = useState<SanteIndFilter>({
    type: 'all'
  })
  
  // Refs pour éviter les re-renders inutiles
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Génération d'ID temporaire
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  // Navigation mensuelle
  const navigation: SanteIndMonthNavigation = {
    currentYear,
    currentMonth,
    currentYearMonth: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
    canGoPrevious: true, // Toujours possible d'aller en arrière
    canGoNext: true // Toujours possible d'aller en avant
  }
  
  // Chargement des activités
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const loadedActivities = await santeIndService.getActivities(yearMonth)
      setActivities(loadedActivities)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur chargement activités Santé Individuelle:', err)
    } finally {
      setLoading(false)
    }
  }, [yearMonth])
  
  // Chargement des KPIs
  const loadKPIs = useCallback(async () => {
    try {
      const calculatedKPIs = await santeIndService.calculateKPIs(yearMonth, userId)
      setKpis(calculatedKPIs)
    } catch (err) {
      console.error('Erreur calcul KPIs Santé Individuelle:', err)
    }
  }, [yearMonth, userId])
  
  // Vérification du verrouillage
  const checkLockStatus = useCallback(async () => {
    try {
      setLockLoading(true)
      const locked = await santeIndService.isMonthLocked(yearMonth, userId)
      setIsMonthLocked(locked)
    } catch (err) {
      console.error('Erreur vérification verrouillage:', err)
    } finally {
      setLockLoading(false)
    }
  }, [yearMonth, userId])
  
  // Sauvegarde d'une nouvelle activité
  const saveActivity = useCallback(async (activityData: Omit<SanteIndActivity, 'id'>): Promise<SanteIndActivity> => {
    try {
      setError(null)
      
      // Vérification du verrouillage
      if (isMonthLocked) {
        throw new Error('Le mois est verrouillé, impossible de modifier les données')
      }
      
      // Création de l'activité avec ID temporaire
      const newActivity: SanteIndActivity = {
        ...activityData,
        id: generateTempId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Sauvegarde
      const savedActivity = await santeIndService.saveActivity(activityData)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => [savedActivity, ...prev])
      
      // Recalcul des KPIs
      await loadKPIs()
      
      return savedActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError(errorMessage)
      throw err
    }
  }, [isMonthLocked, generateTempId, loadKPIs])
  
  // Mise à jour d'une activité existante
  const updateActivity = useCallback(async (
    id: string, 
    updates: Partial<SanteIndActivity>
  ): Promise<SanteIndActivity> => {
    try {
      setError(null)
      
      // Vérification du verrouillage
      if (isMonthLocked) {
        throw new Error('Le mois est verrouillé, impossible de modifier les données')
      }
      
      // Recherche de l'activité existante
      const existingActivity = activities.find(a => a.id === id)
      if (!existingActivity) {
        throw new Error('Activité non trouvée')
      }
      
      // Mise à jour
      const updatedActivity = await santeIndService.updateActivity(id, updates)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => 
        prev.map(a => a.id === id ? updatedActivity : a)
      )
      
      // Recalcul des KPIs
      await loadKPIs()
      
      return updatedActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw err
    }
  }, [isMonthLocked, activities, loadKPIs])
  
  // Suppression d'une activité
  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      
      // Vérification du verrouillage
      if (isMonthLocked) {
        throw new Error('Le mois est verrouillé, impossible de modifier les données')
      }
      
      // Suppression
      await santeIndService.deleteActivity(id)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => prev.filter(a => a.id !== id))
      
      // Recalcul des KPIs
      await loadKPIs()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      throw err
    }
  }, [isMonthLocked, loadKPIs])
  
  // Actualisation manuelle
  const refreshActivities = useCallback(async () => {
    await loadActivities()
    await loadKPIs()
    await checkLockStatus()
  }, [loadActivities, loadKPIs, checkLockStatus])
  
  // Actualisation des KPIs seulement
  const refreshKPIs = useCallback(async () => {
    await loadKPIs()
  }, [loadKPIs])
  
  // Navigation mensuelle
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 1) {
        setCurrentYear(prevYear => prevYear - 1)
        return 12
      }
      return prev - 1
    })
  }, [])
  
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 12) {
        setCurrentYear(prevYear => prevYear + 1)
        return 1
      }
      return prev + 1
    })
  }, [])
  
  const goToCurrentMonth = useCallback(() => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
  }, [])
  
  // Gestion des filtres
  const setFilters = useCallback((newFilters: Partial<SanteIndFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  // Filtrage des activités
  const filteredActivities = activities.filter(activity => {
    if (filters.type !== 'all' && activity.type !== filters.type) {
      return false
    }
    
    if (filters.day !== undefined) {
      const activityDay = new Date(activity.dateSaisie).getDate()
      if (activityDay !== filters.day) {
        return false
      }
    }
    
    if (filters.compagnie !== undefined && activity.compagnie !== filters.compagnie) {
      return false
    }
    
    return true
  })
  
  // Calcul des statistiques de production
  const productionStats = activities.length > 0 
    ? santeIndService.calculateProductionStats(activities)
    : null
  
  // Génération de l'alerte qualité
  const qualiteAlert = kpis 
    ? santeIndService.generateQualiteAlert(kpis.nombreRevisions)
    : null
  
  // Actualisation automatique
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(refreshActivities, refreshInterval)
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [autoRefresh, refreshActivities, refreshInterval])
  
  // Chargement initial
  useEffect(() => {
    if (yearMonth && userId) {
      refreshActivities()
    }
  }, [yearMonth, userId, refreshActivities])
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])
  
  // Calcul des dérivés
  const hasData = activities.length > 0
  const totalActivities = activities.length
  
  return {
    // Données
    activities,
    kpis,
    loading,
    error,
    
    // Actions
    saveActivity,
    updateActivity,
    deleteActivity,
    refreshActivities,
    refreshKPIs,
    
    // Navigation mensuelle
    navigation,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    
    // Filtres
    filters,
    setFilters,
    filteredActivities,
    
    // Statistiques
    productionStats,
    qualiteAlert,
    
    // Verrouillage
    isMonthLocked,
    lockLoading,
    
    // Utilitaires
    hasData,
    totalActivities
  }
}

// Hook simplifié pour les cas d'usage basiques
export function useSanteIndActivitiesSimple(yearMonth: string, userId: string) {
  return useSanteIndActivities({ 
    yearMonth, 
    userId,
    autoRefresh: true,
    refreshInterval: 30000
  })
}

// Hook pour les cas nécessitant un contrôle fin
export function useSanteIndActivitiesAdvanced(options: UseSanteIndActivitiesOptions) {
  return useSanteIndActivities(options)
}
