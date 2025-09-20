// Hook personnalisé pour la gestion des activités Santé Collective
// Inspiré de useSanteIndActivities avec adaptations spécifiques

"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  SanteCollActivity, 
  SanteCollKPI, 
  SanteCollFilter, 
  SanteCollMonthNavigation,
  SanteCollActeType,
  SanteCollOrigine,
  CompagnieType,
  COMMISSION_SEUILS
} from '@/types/sante-coll'

interface UseSanteCollActivitiesOptions {
  yearMonth: string
  userId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseSanteCollActivitiesReturn {
  // Données
  activities: SanteCollActivity[]
  kpis: SanteCollKPI | null
  filteredActivities: SanteCollActivity[]
  
  // États
  loading: boolean
  error: string | null
  isMonthLocked: boolean
  
  // Navigation
  navigation: SanteCollMonthNavigation
  
  // Filtres
  filters: SanteCollFilter
  setFilters: (filters: SanteCollFilter) => void
  
  // Actions CRUD
  saveActivity: (activity: Omit<SanteCollActivity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SanteCollActivity>
  updateActivity: (id: string, updates: Partial<SanteCollActivity>) => Promise<SanteCollActivity>
  deleteActivity: (id: string) => Promise<void>
  
  // Utilitaires
  refreshActivities: () => Promise<void>
  lockMonth: (isLocked: boolean) => Promise<void>
}

export function useSanteCollActivities({
  yearMonth,
  userId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 secondes
}: UseSanteCollActivitiesOptions): UseSanteCollActivitiesReturn {
  
  // États
  const [activities, setActivities] = useState<SanteCollActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMonthLocked, setIsMonthLocked] = useState(false)
  const [filters, setFilters] = useState<SanteCollFilter>({ type: 'all' })

  // Parsing de l'année et du mois
  const [currentYear, currentMonth] = yearMonth.split('-').map(Number)

  // Navigation mensuelle
  const navigation: SanteCollMonthNavigation = useMemo(() => ({
    currentYear,
    currentMonth,
    currentYearMonth: yearMonth,
    canGoPrevious: true, // Toujours possible
    canGoNext: true // Toujours possible
  }), [currentYear, currentMonth, yearMonth])

  // Calcul des KPIs
  const kpis: SanteCollKPI | null = useMemo(() => {
    if (!activities.length) return null

    const monthActivities = activities.filter(a => a.yearMonth === yearMonth)
    
    // Compteurs par type d'acte
    const nombreAffairesNouvelles = monthActivities.filter(a => a.type === SanteCollActeType.AFFAIRE_NOUVELLE).length
    const nombreRevisions = monthActivities.filter(a => a.type === SanteCollActeType.REVISION).length
    const nombreAdhesionsGroupe = monthActivities.filter(a => a.type === SanteCollActeType.ADHESION_GROUPE).length
    const nombreTransfertsCourtage = monthActivities.filter(a => a.type === SanteCollActeType.TRANSFERT_COURTAGE).length

    // Montants
    const productionBrute = monthActivities.reduce((sum, a) => sum + a.ca, 0)
    const productionPondere = monthActivities.reduce((sum, a) => sum + a.caPondere, 0)

    // Commission selon seuils
    const seuilApplicable = COMMISSION_SEUILS.find(seuil => 
      productionPondere >= seuil.min && (seuil.max === undefined || productionPondere <= seuil.max)
    ) || COMMISSION_SEUILS[0]

    const tauxCommission = seuilApplicable.taux
    const commissionEstimee = productionPondere * (tauxCommission / 100)

    // Critère qualitatif (minimum 4 révisions)
    const critereQualitatifAtteint = nombreRevisions >= 4

    return {
      yearMonth,
      userId,
      nombreAffairesNouvelles,
      nombreRevisions,
      nombreAdhesionsGroupe,
      nombreTransfertsCourtage,
      productionBrute,
      productionPondere,
      tauxCommission,
      commissionEstimee,
      critereQualitatifAtteint,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }, [activities, yearMonth, userId])

  // Filtrage des activités
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filtre par type
      if (filters.type !== 'all' && activity.type !== filters.type) {
        return false
      }

      // Filtre par origine
      if (filters.origine && activity.origine !== filters.origine) {
        return false
      }

      // Filtre par compagnie
      if (filters.compagnie && activity.compagnie !== filters.compagnie) {
        return false
      }

      // Filtre par jour
      if (filters.day) {
        const activityDay = new Date(activity.dateSaisie).getDate()
        if (activityDay !== filters.day) {
          return false
        }
      }

      return true
    })
  }, [activities, filters])

  // Chargement des activités
  const loadActivities = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams({
        userId,
        yearMonth
      })

      // Ajouter les filtres si spécifiés
      if (filters.type !== 'all') {
        params.append('type', filters.type)
      }
      if (filters.origine) {
        params.append('origine', filters.origine)
      }
      if (filters.compagnie) {
        params.append('compagnie', filters.compagnie)
      }

      const response = await fetch(`/api/sante-coll-activities?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()

      if (result.success) {
        setActivities(result.data || [])
        setError(null) // Clear any previous errors
      } else {
        setError(result.error || 'Erreur lors du chargement des activités')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des activités Santé Collective:', err)
      // En cas d'erreur, on initialise avec un tableau vide plutôt que d'afficher l'erreur
      setActivities([])
      setError('Service temporairement indisponible')
    } finally {
      setLoading(false)
    }
  }, [userId, yearMonth, filters])

  // Vérification du verrouillage mensuel
  const checkLockStatus = useCallback(async () => {
    if (!userId) return

    try {
      const params = new URLSearchParams({ userId, yearMonth })
      const response = await fetch(`/api/sante-coll-activities/lock?${params}`)
      const result = await response.json()

      if (result.success) {
        setIsMonthLocked(result.data.isLocked)
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du verrouillage:', err)
    }
  }, [userId, yearMonth])

  // Sauvegarde d'une activité
  const saveActivity = useCallback(async (activityData: Omit<SanteCollActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SanteCollActivity> => {
    if (isMonthLocked) {
      throw new Error('Ce mois est verrouillé. Aucune modification n\'est autorisée.')
    }

    try {
      const response = await fetch('/api/sante-coll-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })

      const result = await response.json()

      if (result.success) {
        // Mettre à jour la liste locale
        setActivities(prev => [result.data, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      throw err
    }
  }, [isMonthLocked])

  // Mise à jour d'une activité
  const updateActivity = useCallback(async (id: string, updates: Partial<SanteCollActivity>): Promise<SanteCollActivity> => {
    if (isMonthLocked) {
      throw new Error('Ce mois est verrouillé. Aucune modification n\'est autorisée.')
    }

    try {
      const response = await fetch(`/api/sante-coll-activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (result.success) {
        // Mettre à jour la liste locale
        setActivities(prev => prev.map(a => a.id === id ? result.data : a))
        return result.data
      } else {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      throw err
    }
  }, [isMonthLocked])

  // Suppression d'une activité
  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    if (isMonthLocked) {
      throw new Error('Ce mois est verrouillé. Aucune modification n\'est autorisée.')
    }

    try {
      const response = await fetch(`/api/sante-coll-activities/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Mettre à jour la liste locale
        setActivities(prev => prev.filter(a => a.id !== id))
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      throw err
    }
  }, [isMonthLocked])

  // Verrouillage/déverrouillage du mois
  const lockMonth = useCallback(async (locked: boolean): Promise<void> => {
    try {
      const response = await fetch('/api/sante-coll-activities/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          yearMonth,
          isLocked: locked,
          lockedBy: 'system' // TODO: Remplacer par l'ID de l'utilisateur connecté
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsMonthLocked(locked)
      } else {
        throw new Error(result.error || 'Erreur lors du verrouillage')
      }
    } catch (err) {
      console.error('Erreur lors du verrouillage:', err)
      throw err
    }
  }, [userId, yearMonth])

  // Actualisation manuelle
  const refreshActivities = useCallback(async () => {
    await Promise.all([loadActivities(), checkLockStatus()])
  }, [loadActivities, checkLockStatus])

  // Chargement initial et au changement de mois/filtres
  useEffect(() => {
    refreshActivities()
  }, [refreshActivities])

  // Actualisation automatique
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refreshActivities, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshActivities])

  return {
    // Données
    activities,
    kpis,
    filteredActivities,
    
    // États
    loading,
    error,
    isMonthLocked,
    
    // Navigation
    navigation,
    
    // Filtres
    filters,
    setFilters,
    
    // Actions CRUD
    saveActivity,
    updateActivity,
    deleteActivity,
    
    // Utilitaires
    refreshActivities,
    lockMonth
  }
}
