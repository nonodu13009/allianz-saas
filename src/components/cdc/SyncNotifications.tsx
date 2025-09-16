// Notifications pour les erreurs et statuts de synchronisation CDC

"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SyncStatus, cdcPersistence } from '@/lib/cdc-persistence'
import { 
  AlertTriangle, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  X
} from 'lucide-react'

interface SyncNotificationsProps {
  syncStatus: SyncStatus
  syncStats: {
    total: number
    synced: number
    pending: number
    errors: number
    offline: number
  }
  isOnline: boolean
  onRefresh: () => void
}

export function SyncNotifications({
  syncStatus,
  syncStats,
  isOnline,
  onRefresh
}: SyncNotificationsProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'error' | 'warning' | 'info' | 'success'
    title: string
    message: string
    dismissible: boolean
  }>>([])

  // Génération des notifications basées sur le statut
  useEffect(() => {
    const newNotifications = []

    // Notification hors ligne
    if (!isOnline) {
      newNotifications.push({
        id: 'offline',
        type: 'warning' as const,
        title: 'Mode hors ligne',
        message: 'Les données sont mises en cache localement. La synchronisation reprendra automatiquement dès la reconnexion.',
        dismissible: false
      })
    }

    // Notification d'erreurs de synchronisation
    if (syncStats.errors > 0) {
      newNotifications.push({
        id: 'sync-errors',
        type: 'error' as const,
        title: `${syncStats.errors} erreur${syncStats.errors > 1 ? 's' : ''} de synchronisation`,
        message: 'Certaines données n\'ont pas pu être synchronisées. Cliquez sur "Réessayer" pour tenter une nouvelle synchronisation.',
        dismissible: true
      })
    }

    // Notification de données en attente
    if (syncStats.pending > 0 && isOnline) {
      newNotifications.push({
        id: 'pending-sync',
        type: 'info' as const,
        title: `${syncStats.pending} donnée${syncStats.pending > 1 ? 's' : ''} en attente`,
        message: 'La synchronisation est en cours. Vos données seront sauvegardées automatiquement.',
        dismissible: true
      })
    }

    // Notification de succès (temporaire)
    if (syncStatus === SyncStatus.SYNCED && isOnline && syncStats.total > 0) {
      newNotifications.push({
        id: 'sync-success',
        type: 'success' as const,
        title: 'Synchronisation réussie',
        message: `Toutes vos données (${syncStats.total}) sont synchronisées et sauvegardées.`,
        dismissible: true
      })
    }

    setNotifications(newNotifications)
  }, [syncStatus, syncStats, isOnline])

  // Auto-dismiss des notifications de succès
  useEffect(() => {
    const successNotification = notifications.find(n => n.id === 'sync-success')
    if (successNotification) {
      const timer = setTimeout(() => {
        dismissNotification(successNotification.id)
      }, 5000) // Auto-dismiss après 5 secondes

      return () => clearTimeout(timer)
    }
  }, [notifications])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      case 'warning':
        return <WifiOff className="h-4 w-4" />
      case 'info':
        return <Clock className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      case 'success':
        return 'default'
      default:
        return 'default'
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Alert 
          key={notification.id}
          variant={getNotificationVariant(notification.type)}
          className="relative"
        >
          <div className="flex items-start gap-3">
            {getNotificationIcon(notification.type)}
            
            <div className="flex-1">
              <AlertTitle className="text-sm font-medium">
                {notification.title}
              </AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {notification.message}
              </AlertDescription>
              
              {/* Actions pour les notifications d'erreur */}
              {notification.type === 'error' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="h-7 px-3 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Réessayer
                  </Button>
                </div>
              )}
            </div>

            {/* Bouton de fermeture */}
            {notification.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 absolute top-2 right-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  )
}

// Composant compact pour la barre de navigation
export function SyncNotificationsCompact({
  syncStatus,
  syncStats,
  isOnline,
  onRefresh
}: SyncNotificationsProps) {
  // Affiche seulement les erreurs critiques
  if (!isOnline) {
    return (
      <Alert variant="default" className="py-2">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Mode hors ligne
        </AlertDescription>
      </Alert>
    )
  }

  if (syncStats.errors > 0) {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {syncStats.errors} erreur{syncStats.errors > 1 ? 's' : ''}
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-6 w-6 p-0 ml-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </Alert>
    )
  }

  return null
}
