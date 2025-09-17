// Wrapper pour intégrer progressivement la persistance CDC
// Permet de basculer entre l'ancien système et le nouveau

"use client"

import { useState, useEffect } from 'react'
import { Activity, ActivityType, CDCFilter } from '@/types/cdc'
import { useCDCActivities } from '@/hooks/use-cdc-activities'
import { SyncStatusDetailed } from '@/components/cdc/SyncStatusIndicator'

interface CDCDashboardWrapperProps {
  currentYearMonth: string
  children: (props: {
    activities: Activity[]
    loading: boolean
    error: string | null
    saveActivity: (activity: Omit<Activity, 'id'>) => Promise<Activity>
    updateActivity: (id: string, updates: Partial<Activity>) => Promise<Activity>
    deleteActivity: (id: string) => Promise<void>
    refreshActivities: () => Promise<void>
    syncStatus: any
    syncStats: any
    isOnline: boolean
    hasPendingChanges: boolean
  }) => React.ReactNode
}

export function CDCDashboardWrapper({ 
  currentYearMonth, 
  children 
}: CDCDashboardWrapperProps) {
  const [usePersistence, setUsePersistence] = useState(false)

  // Hook de persistance
  const persistenceHook = useCDCActivities({ 
    yearMonth: currentYearMonth,
    autoSync: true,
    syncInterval: 30000
  })

  // États pour l'ancien système (fallback)
  const [fallbackActivities, setFallbackActivities] = useState<Activity[]>([])
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const [fallbackError, setFallbackError] = useState<string | null>(null)

  // Fonctions fallback
  const fallbackSaveActivity = async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    setFallbackLoading(true)
    try {
      const newActivity: Activity = {
        ...activity,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Simulation de délai
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFallbackActivities(prev => [newActivity, ...prev])
      return newActivity
    } finally {
      setFallbackLoading(false)
    }
  }

  const fallbackUpdateActivity = async (id: string, updates: Partial<Activity>): Promise<Activity> => {
    setFallbackLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedActivity = fallbackActivities.find(a => a.id === id)
      if (!updatedActivity) throw new Error('Activité non trouvée')
      
      const newActivity = { ...updatedActivity, ...updates, updatedAt: new Date().toISOString() }
      
      setFallbackActivities(prev => 
        prev.map(a => a.id === id ? newActivity : a)
      )
      
      return newActivity
    } finally {
      setFallbackLoading(false)
    }
  }

  const fallbackDeleteActivity = async (id: string): Promise<void> => {
    setFallbackLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setFallbackActivities(prev => prev.filter(a => a.id !== id))
    } finally {
      setFallbackLoading(false)
    }
  }

  const fallbackRefreshActivities = async (): Promise<void> => {
    setFallbackLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Pas de changement, juste simulation
    } finally {
      setFallbackLoading(false)
    }
  }

  // Données mock pour le fallback
  useEffect(() => {
    if (!usePersistence) {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      const createDateMetadata = (day: number) => {
        const date = new Date(currentYear, currentMonth, day).toISOString()
        return {
          dateSaisie: date,
          createdAt: date,
          updatedAt: date
        }
      }

      const testActivities: Activity[] = [
        {
          id: 'mock-1',
          type: ActivityType.AN,
          clientName: 'DUPONT JEAN',
          productType: 'AUTO_MOTO' as any,
          contractNumber: 'AUTO-2024-001',
          dateEffet: '2024-01-15',
          primeAnnuelle: 1200,
          commissionPotentielle: 10,
          userId: 'test-user',
          yearMonth: currentYearMonth,
          isLocked: false,
          ...createDateMetadata(1)
        },
        {
          id: 'mock-2',
          type: ActivityType.AN,
          clientName: 'MARTIN MARIE',
          productType: 'AUTO_MOTO' as any,
          contractNumber: 'AUTO-2024-002',
          dateEffet: '2024-02-20',
          primeAnnuelle: 850,
          commissionPotentielle: 10,
          userId: 'test-user',
          yearMonth: currentYearMonth,
          isLocked: false,
          ...createDateMetadata(2)
        },
        {
          id: 'mock-3',
          type: ActivityType.M3,
          clientName: 'LEROY FRANÇOIS',
          comment: 'Prise de contact suite à souscription - Suivi M+3',
          userId: 'test-user',
          yearMonth: currentYearMonth,
          isLocked: false,
          ...createDateMetadata(3)
        }
      ]

      setFallbackActivities(testActivities)
    }
  }, [usePersistence, currentYearMonth])

  // Props à passer aux enfants
  const props = usePersistence ? {
    activities: persistenceHook.activities,
    loading: persistenceHook.loading,
    error: persistenceHook.error,
    saveActivity: persistenceHook.saveActivity,
    updateActivity: persistenceHook.updateActivity,
    deleteActivity: persistenceHook.deleteActivity,
    refreshActivities: persistenceHook.refreshActivities,
    syncStatus: persistenceHook.syncStatus,
    syncStats: persistenceHook.syncStats,
    isOnline: persistenceHook.isOnline,
    hasPendingChanges: persistenceHook.hasPendingChanges
  } : {
    activities: fallbackActivities,
    loading: fallbackLoading,
    error: fallbackError,
    saveActivity: fallbackSaveActivity,
    updateActivity: fallbackUpdateActivity,
    deleteActivity: fallbackDeleteActivity,
    refreshActivities: fallbackRefreshActivities,
    syncStatus: { status: 'synced' },
    syncStats: { total: fallbackActivities.length, synced: fallbackActivities.length, pending: 0, errors: 0, offline: 0 },
    isOnline: true,
    hasPendingChanges: false
  }

  return (
    <div className="space-y-4">
      {/* Toggle de persistance */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={usePersistence}
              onChange={(e) => setUsePersistence(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">
              Activer la persistance Firebase
            </span>
          </label>
          
          {usePersistence && (
            <SyncStatusDetailed />
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          {usePersistence ? 'Firebase + Cache local' : 'Mode local uniquement'}
        </div>
      </div>

      {/* Contenu principal */}
      {children(props)}
    </div>
  )
}
