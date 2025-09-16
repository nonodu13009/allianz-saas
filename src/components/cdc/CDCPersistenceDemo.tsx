// Démonstration du système de persistance CDC
// Composant de test pour valider le fonctionnement

"use client"

import { useState } from 'react'
import { ActivityType, ProductType } from '@/types/cdc'
import { useCDCActivities } from '@/hooks/use-cdc-activities'
import { SyncStatusDetailed } from '@/components/cdc/SyncStatusIndicator'
import { SyncNotifications } from '@/components/cdc/SyncNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Activity,
  Database,
  Wifi
} from 'lucide-react'

export function CDCPersistenceDemo() {
  const currentYearMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  
  const {
    activities,
    loading,
    error,
    saveActivity,
    updateActivity,
    deleteActivity,
    refreshActivities,
    syncStatus,
    syncStats,
    isOnline,
    hasPendingChanges
  } = useCDCActivities({ 
    yearMonth: currentYearMonth,
    autoSync: true,
    syncInterval: 10000 // 10 secondes pour la démo
  })

  // Test de sauvegarde d'une activité AN
  const handleSaveAN = async () => {
    try {
      await saveActivity({
        type: ActivityType.AN,
        clientName: 'TEST CLIENT',
        productType: ProductType.AUTO_MOTO,
        contractNumber: 'TEST-2024-001',
        dateEffet: new Date().toISOString().split('T')[0],
        primeAnnuelle: 1000,
        commissionPotentielle: 10,
        userId: 'demo-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        dateSaisie: new Date().toISOString()
      })
      console.log('✅ Activité AN sauvegardée')
    } catch (error) {
      console.error('❌ Erreur sauvegarde AN:', error)
    }
  }

  // Test de sauvegarde d'une activité Process
  const handleSaveProcess = async () => {
    try {
      await saveActivity({
        type: ActivityType.M3,
        clientName: 'TEST PROCESS',
        comment: 'Test de processus M+3',
        userId: 'demo-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        dateSaisie: new Date().toISOString()
      })
      console.log('✅ Activité Process sauvegardée')
    } catch (error) {
      console.error('❌ Erreur sauvegarde Process:', error)
    }
  }

  // Test de mise à jour
  const handleUpdateFirst = async () => {
    if (activities.length > 0) {
      try {
        const firstActivity = activities[0]
        await updateActivity(firstActivity.id, {
          clientName: `${firstActivity.clientName} - MODIFIÉ`
        })
        console.log('✅ Activité mise à jour')
      } catch (error) {
        console.error('❌ Erreur mise à jour:', error)
      }
    }
  }

  // Test de suppression
  const handleDeleteFirst = async () => {
    if (activities.length > 0) {
      try {
        const firstActivity = activities[0]
        await deleteActivity(firstActivity.id)
        console.log('✅ Activité supprimée')
      } catch (error) {
        console.error('❌ Erreur suppression:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Démonstration Persistance CDC
          </CardTitle>
          <CardDescription>
            Test du système Firebase First + Cache local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de synchronisation */}
          <div className="flex items-center justify-between">
            <SyncStatusDetailed />
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </div>

          {/* Notifications */}
          <SyncNotifications
            syncStatus={syncStatus}
            syncStats={syncStats}
            isOnline={isOnline}
            onRefresh={refreshActivities}
          />
        </CardContent>
      </Card>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={handleSaveAN} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter AN
            </Button>
            
            <Button onClick={handleSaveProcess} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Process
            </Button>
            
            <Button onClick={handleUpdateFirst} disabled={loading || activities.length === 0}>
              <Activity className="h-4 w-4 mr-2" />
              Modifier 1er
            </Button>
            
            <Button onClick={handleDeleteFirst} disabled={loading || activities.length === 0} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer 1er
            </Button>
          </div>
          
          <div className="mt-4">
            <Button onClick={refreshActivities} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
              <div className="text-sm text-gray-600">Synchronisé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncStats.pending}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{syncStats.errors}</div>
              <div className="text-sm text-gray-600">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{syncStats.offline}</div>
              <div className="text-sm text-gray-600">Hors ligne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des activités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activités ({activities.length})</span>
            {hasPendingChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Changements en attente
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Erreur: {error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {activity.type}
                      </Badge>
                      <span className="font-medium">{activity.clientName}</span>
                      {activity._syncMetadata && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            activity._syncMetadata.status === 'synced' ? 'bg-green-100 text-green-800' :
                            activity._syncMetadata.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            activity._syncMetadata.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {activity._syncMetadata.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.productType && `${activity.productType} - `}
                      {activity.commissionPotentielle && `${activity.commissionPotentielle}€ - `}
                      {new Date(activity.dateSaisie).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
