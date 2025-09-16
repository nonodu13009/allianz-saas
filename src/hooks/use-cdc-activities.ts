// Hook personnalisé pour la gestion des activités CDC avec persistance
// Intègre le service de persistance avec React

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { ActivityWithSync, SyncStatus, cdcPersistence } from '@/lib/cdc-persistence'

interface UseCDCActivitiesOptions {
  yearMonth: string
  autoSync?: boolean
  syncInterval?: number // en millisecondes
}

interface UseCDCActivitiesReturn {
  // Données
  activities: ActivityWithSync[]
  loading: boolean
  error: string | null
  
  // Actions
  saveActivity: (activity: Omit<Activity, 'id'>) => Promise<ActivityWithSync>
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<ActivityWithSync>
  deleteActivity: (id: string) => Promise<void>
  refreshActivities: () => Promise<void>
  
  // États de synchronisation
  syncStatus: SyncStatus
  syncStats: {
    total: number
    synced: number
    pending: number
    errors: number
    offline: number
  }
  
  // Utilitaires
  isOnline: boolean
  hasPendingChanges: boolean
}

export function useCDCActivities({
  yearMonth,
  autoSync = true,
  syncInterval = 30000 // 30 secondes
}: UseCDCActivitiesOptions): UseCDCActivitiesReturn {
  
  // États
  const [activities, setActivities] = useState<ActivityWithSync[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.SYNCED)
  const [syncStats, setSyncStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    errors: 0,
    offline: 0
  })
  const [isOnline, setIsOnline] = useState(true)

  // Refs pour éviter les re-renders inutiles
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Génération d'ID temporaire
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Chargement initial des activités
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const loadedActivities = await cdcPersistence.getActivities(yearMonth)
      setActivities(loadedActivities)
      
      // Mise à jour des stats
      const stats = await cdcPersistence.getSyncStats()
      setSyncStats(stats)
      
      // Détermination du statut principal
      const hasErrors = stats.errors > 0
      const hasPending = stats.pending > 0
      
      if (hasErrors) {
        setSyncStatus(SyncStatus.ERROR)
      } else if (hasPending) {
        setSyncStatus(SyncStatus.PENDING)
      } else {
        setSyncStatus(SyncStatus.SYNCED)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur chargement activités:', err)
    } finally {
      setLoading(false)
    }
  }, [yearMonth])

  // Sauvegarde d'une nouvelle activité
  const saveActivity = useCallback(async (activityData: Omit<Activity, 'id'>): Promise<ActivityWithSync> => {
    try {
      setError(null)
      
      // Création de l'activité avec ID temporaire
      const newActivity: Activity = {
        ...activityData,
        id: generateTempId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Sauvegarde avec optimistic update
      const savedActivity = await cdcPersistence.saveActivity(newActivity)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => [savedActivity, ...prev])
      
      // Mise à jour des stats
      const stats = await cdcPersistence.getSyncStats()
      setSyncStats(stats)
      
      return savedActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError(errorMessage)
      throw err
    }
  }, [generateTempId])

  // Mise à jour d'une activité existante
  const updateActivity = useCallback(async (
    id: string, 
    updates: Partial<Activity>
  ): Promise<ActivityWithSync> => {
    try {
      setError(null)
      
      // Recherche de l'activité existante
      const existingActivity = activities.find(a => a.id === id)
      if (!existingActivity) {
        throw new Error('Activité non trouvée')
      }
      
      // Création de l'activité mise à jour
      const updatedActivity: Activity = {
        ...existingActivity,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // Sauvegarde
      const savedActivity = await cdcPersistence.saveActivity(updatedActivity)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => 
        prev.map(a => a.id === id ? savedActivity : a)
      )
      
      // Mise à jour des stats
      const stats = await cdcPersistence.getSyncStats()
      setSyncStats(stats)
      
      return savedActivity
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw err
    }
  }, [activities])

  // Suppression d'une activité
  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      
      // Suppression avec optimistic update
      await cdcPersistence.deleteActivity(id)
      
      // Mise à jour immédiate de l'état local
      setActivities(prev => prev.filter(a => a.id !== id))
      
      // Mise à jour des stats
      const stats = await cdcPersistence.getSyncStats()
      setSyncStats(stats)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Actualisation manuelle
  const refreshActivities = useCallback(async () => {
    await loadActivities()
  }, [loadActivities])

  // Synchronisation automatique
  const syncActivities = useCallback(async () => {
    try {
      await cdcPersistence.syncPendingChanges()
      await loadActivities()
    } catch (err) {
      console.error('Erreur sync automatique:', err)
    }
  }, [loadActivities])

  // Gestion de la connectivité
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus(prev => prev === SyncStatus.OFFLINE ? SyncStatus.SYNCED : prev)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus(SyncStatus.OFFLINE)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Chargement initial (seulement si yearMonth est défini)
  useEffect(() => {
    if (yearMonth) {
      loadActivities()
    }
  }, [loadActivities, yearMonth])

  // Synchronisation automatique
  useEffect(() => {
    if (autoSync && isOnline) {
      syncIntervalRef.current = setInterval(syncActivities, syncInterval)
      
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [autoSync, isOnline, syncActivities, syncInterval])

  // Nettoyage
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [])

  // Calcul des dérivés
  const hasPendingChanges = syncStats.pending > 0 || syncStats.errors > 0

  return {
    // Données
    activities,
    loading,
    error,
    
    // Actions
    saveActivity,
    updateActivity,
    deleteActivity,
    refreshActivities,
    
    // États de synchronisation
    syncStatus,
    syncStats,
    
    // Utilitaires
    isOnline,
    hasPendingChanges
  }
}

// Hook simplifié pour les cas d'usage basiques
export function useCDCActivitiesSimple(yearMonth: string) {
  return useCDCActivities({ 
    yearMonth, 
    autoSync: true,
    syncInterval: 30000
  })
}

// Hook pour les cas nécessitant un contrôle fin
export function useCDCActivitiesAdvanced(options: UseCDCActivitiesOptions) {
  return useCDCActivities(options)
}
