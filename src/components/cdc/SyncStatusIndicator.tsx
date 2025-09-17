// Indicateur de statut de synchronisation CDC
// Affiche l'état de la synchronisation des données

"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SyncStatus, cdcPersistence } from '@/lib/cdc-persistence'
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Database
} from 'lucide-react'

interface SyncStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function SyncStatusIndicator({ 
  className = '', 
  showDetails = false 
}: SyncStatusIndicatorProps) {
  const [syncStats, setSyncStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    errors: 0,
    offline: 0
  })
  const [isOnline, setIsOnline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mise à jour des stats de synchronisation
  const updateSyncStats = async () => {
    try {
      const stats = await cdcPersistence.getSyncStats()
      setSyncStats(stats)
    } catch (error) {
      console.error('Erreur mise à jour stats sync:', error)
    }
  }

  // Vérification de la connectivité
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mise à jour périodique des stats
  useEffect(() => {
    updateSyncStats()
    const interval = setInterval(updateSyncStats, 5000) // Toutes les 5 secondes

    return () => clearInterval(interval)
  }, [])

  // Synchronisation manuelle
  const handleManualSync = async () => {
    setIsRefreshing(true)
    try {
      await cdcPersistence.syncPendingChanges()
      await updateSyncStats()
    } catch (error) {
      console.error('Erreur sync manuel:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Détermination du statut principal
  const getMainStatus = (): SyncStatus => {
    if (!isOnline) return SyncStatus.OFFLINE
    if (syncStats.errors > 0) return SyncStatus.ERROR
    if (syncStats.pending > 0) return SyncStatus.PENDING
    return SyncStatus.SYNCED
  }

  const mainStatus = getMainStatus()

  // Configuration des icônes et couleurs
  const getStatusConfig = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.SYNCED:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Synchronisé'
        }
      case SyncStatus.PENDING:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'En attente'
        }
      case SyncStatus.ERROR:
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Erreur'
        }
      case SyncStatus.OFFLINE:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Hors ligne'
        }
      default:
        return {
          icon: Database,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Inconnu'
        }
    }
  }

  const statusConfig = getStatusConfig(mainStatus)
  const StatusIcon = statusConfig.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicateur principal */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
        <span className={`text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
        
        {/* Indicateur de connectivité */}
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>

      {/* Bouton de synchronisation manuelle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isRefreshing || !isOnline}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>

      {/* Détails (optionnel) */}
      {showDetails && (
        <div className="flex items-center gap-1">
          {syncStats.total > 0 && (
            <Badge variant="outline" className="text-xs">
              {syncStats.synced}/{syncStats.total}
            </Badge>
          )}
          
          {syncStats.pending > 0 && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
              {syncStats.pending} en attente
            </Badge>
          )}
          
          {syncStats.errors > 0 && (
            <Badge variant="destructive" className="text-xs">
              {syncStats.errors} erreur{syncStats.errors > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// Composant compact pour la barre de navigation
export function SyncStatusCompact() {
  return (
    <SyncStatusIndicator 
      className="text-xs"
      showDetails={false}
    />
  )
}

// Composant détaillé pour les pages
export function SyncStatusDetailed({ 
  activities = [], 
  syncStatus = SyncStatus.SYNCED, 
  onRefresh 
}: {
  activities?: any[]
  syncStatus?: SyncStatus
  onRefresh?: () => void
}) {
  return (
    <SyncStatusIndicator 
      className="text-sm"
      showDetails={true}
    />
  )
}
