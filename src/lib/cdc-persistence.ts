// Service de persistance CDC avec Firebase First + Cache local
// Architecture : Firebase (source de vérité) + Cache local (performance)

"use client"

import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { calculateCommission, validateActivity } from '@/lib/cdc'

// États de synchronisation
export enum SyncStatus {
  SYNCED = 'synced',           // ✅ Synchronisé
  PENDING = 'pending',         // ⏳ En attente
  CONFLICT = 'conflict',       // ⚠️ Conflit
  ERROR = 'error',             // ❌ Erreur
  OFFLINE = 'offline'          // 📱 Mode hors ligne
}

// Interface pour les métadonnées de sync
export interface SyncMetadata {
  lastSync: string
  status: SyncStatus
  error?: string
  retryCount: number
  pendingChanges: string[] // IDs des activités en attente
}

// Interface pour les activités avec métadonnées
export interface ActivityWithSync extends Activity {
  _syncMetadata?: SyncMetadata
}

// Clé pour le cache local
const CDC_CACHE_KEY = 'cdc_activities_cache'
const SYNC_METADATA_KEY = 'cdc_sync_metadata'

export class CDCPersistenceService {
  private static instance: CDCPersistenceService
  private listeners: Map<string, () => void> = new Map()
  private retryQueue: Map<string, { activity: Activity, retries: number }> = new Map()

  static getInstance(): CDCPersistenceService {
    if (!CDCPersistenceService.instance) {
      CDCPersistenceService.instance = new CDCPersistenceService()
    }
    return CDCPersistenceService.instance
  }

  // 🔄 Sauvegarde d'une activité avec optimistic updates
  async saveActivity(activity: Activity): Promise<ActivityWithSync> {
    try {
      // Validation locale
      const validation = validateActivity(activity)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Calcul automatique de la commission
      if (activity.type === ActivityType.AN && activity.productType) {
        activity.commissionPotentielle = calculateCommission(
          activity.productType,
          activity.primeAnnuelle,
          activity.versementLibre
        )
      }

      // Optimistic update - mise à jour immédiate du cache local
      const activityWithSync: ActivityWithSync = {
        ...activity,
        _syncMetadata: {
          lastSync: new Date().toISOString(),
          status: SyncStatus.PENDING,
          retryCount: 0,
          pendingChanges: []
        }
      }

      // Mise à jour du cache local immédiatement
      await this.updateLocalCache(activityWithSync)

      // Tentative de sauvegarde Firebase (en arrière-plan)
      this.saveToFirebase(activityWithSync).catch(error => {
        console.error('Erreur sauvegarde Firebase:', error)
        this.handleSyncError(activityWithSync.id, error)
      })

      return activityWithSync

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw error
    }
  }

  // 🔄 Sauvegarde vers Firebase
  private async saveToFirebase(activity: ActivityWithSync): Promise<void> {
    const activityRef = activity.id.startsWith('temp_') 
      ? collection(db, 'cdcActivities')
      : doc(db, 'cdcActivities', activity.id)

    const activityData = {
      ...activity,
      updatedAt: serverTimestamp(),
      _syncMetadata: {
        ...activity._syncMetadata,
        status: SyncStatus.SYNCED,
        lastSync: new Date().toISOString()
      }
    }

    if (activity.id.startsWith('temp_')) {
      // Nouvelle activité
      const docRef = await addDoc(activityRef as any, activityData)
      await this.updateLocalCache({
        ...activity,
        id: docRef.id,
        _syncMetadata: {
          ...activity._syncMetadata!,
          status: SyncStatus.SYNCED,
          lastSync: new Date().toISOString()
        }
      })
    } else {
      // Mise à jour
      await updateDoc(activityRef as any, activityData)
      await this.updateLocalCache({
        ...activity,
        _syncMetadata: {
          ...activity._syncMetadata!,
          status: SyncStatus.SYNCED,
          lastSync: new Date().toISOString()
        }
      })
    }
  }

  // 📱 Récupération des activités avec cache intelligent
  async getActivities(yearMonth: string): Promise<ActivityWithSync[]> {
    try {
      // 1. Récupération du cache local (instantané)
      const cachedActivities = await this.getFromLocalCache(yearMonth)
      
      // 2. Synchronisation Firebase en arrière-plan
      this.syncFromFirebase(yearMonth).catch(error => {
        console.error('Erreur sync Firebase:', error)
      })

      return cachedActivities

    } catch (error) {
      console.error('Erreur lors de la récupération:', error)
      throw error
    }
  }

  // 🔄 Synchronisation depuis Firebase
  private async syncFromFirebase(yearMonth: string): Promise<void> {
    if (!yearMonth) {
      console.warn('⚠️ yearMonth est undefined, impossible de synchroniser')
      return
    }
    
    // Requête simplifiée pour éviter l'index composite
    const q = query(
      collection(db, 'cdcActivities'),
      where('yearMonth', '==', yearMonth)
      // orderBy supprimé temporairement pour éviter l'index composite
    )

    const snapshot = await getDocs(q)
    const firebaseActivities: ActivityWithSync[] = snapshot.docs.map(doc => ({
      ...doc.data() as Activity,
      id: doc.id,
      _syncMetadata: {
        lastSync: new Date().toISOString(),
        status: SyncStatus.SYNCED,
        retryCount: 0,
        pendingChanges: []
      }
    }))

    // Tri local par date de saisie (descendant)
    firebaseActivities.sort((a, b) => 
      new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime()
    )

    // Mise à jour du cache local
    await this.updateLocalCacheBatch(firebaseActivities)
  }

  // 🗑️ Suppression d'une activité
  async deleteActivity(activityId: string): Promise<void> {
    try {
      // Optimistic delete - suppression immédiate du cache local
      await this.deleteFromLocalCache(activityId)

      // Suppression Firebase en arrière-plan
      this.deleteFromFirebase(activityId).catch(error => {
        console.error('Erreur suppression Firebase:', error)
        this.handleSyncError(activityId, error)
      })

    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  }

  // 🗑️ Suppression depuis Firebase
  private async deleteFromFirebase(activityId: string): Promise<void> {
    await deleteDoc(doc(db, 'cdcActivities', activityId))
  }

  // 📱 Gestion du cache local
  private async updateLocalCache(activity: ActivityWithSync): Promise<void> {
    try {
      const cache = await this.getLocalCache()
      const yearMonth = activity.yearMonth

      if (!cache[yearMonth]) {
        cache[yearMonth] = []
      }

      const existingIndex = cache[yearMonth].findIndex(a => a.id === activity.id)
      
      if (existingIndex >= 0) {
        cache[yearMonth][existingIndex] = activity
      } else {
        cache[yearMonth].push(activity)
      }

      // Tri par date
      cache[yearMonth].sort((a, b) => 
        new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime()
      )

      await this.setLocalCache(cache)

    } catch (error) {
      console.error('Erreur mise à jour cache local:', error)
    }
  }

  private async updateLocalCacheBatch(activities: ActivityWithSync[]): Promise<void> {
    try {
      const cache = await this.getLocalCache()
      
      activities.forEach(activity => {
        const yearMonth = activity.yearMonth
        
        if (!cache[yearMonth]) {
          cache[yearMonth] = []
        }

        const existingIndex = cache[yearMonth].findIndex(a => a.id === activity.id)
        
        if (existingIndex >= 0) {
          cache[yearMonth][existingIndex] = activity
        } else {
          cache[yearMonth].push(activity)
        }

        // Tri par date
        cache[yearMonth].sort((a, b) => 
          new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime()
        )
      })

      await this.setLocalCache(cache)

    } catch (error) {
      console.error('Erreur mise à jour batch cache local:', error)
    }
  }

  private async deleteFromLocalCache(activityId: string): Promise<void> {
    try {
      const cache = await this.getLocalCache()
      
      Object.keys(cache).forEach(yearMonth => {
        cache[yearMonth] = cache[yearMonth].filter(a => a.id !== activityId)
      })

      await this.setLocalCache(cache)

    } catch (error) {
      console.error('Erreur suppression cache local:', error)
    }
  }

  private async getFromLocalCache(yearMonth: string): Promise<ActivityWithSync[]> {
    try {
      const cache = await this.getLocalCache()
      return cache[yearMonth] || []
    } catch (error) {
      console.error('Erreur lecture cache local:', error)
      return []
    }
  }

  // 💾 Gestion du stockage local
  private async getLocalCache(): Promise<Record<string, ActivityWithSync[]>> {
    try {
      const cached = localStorage.getItem(CDC_CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.error('Erreur lecture cache localStorage:', error)
      return {}
    }
  }

  private async setLocalCache(cache: Record<string, ActivityWithSync[]>): Promise<void> {
    try {
      localStorage.setItem(CDC_CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Erreur écriture cache localStorage:', error)
    }
  }

  // 🔄 Gestion des erreurs de synchronisation
  private handleSyncError(activityId: string, error: any): void {
    console.error(`Erreur sync pour ${activityId}:`, error)
    
    // Mise à jour du statut d'erreur dans le cache local
    this.updateSyncStatus(activityId, SyncStatus.ERROR, error.message)
    
    // Ajout à la queue de retry
    this.addToRetryQueue(activityId, error)
  }

  private async updateSyncStatus(activityId: string, status: SyncStatus, error?: string): Promise<void> {
    try {
      const cache = await this.getLocalCache()
      
      Object.keys(cache).forEach(yearMonth => {
        const activity = cache[yearMonth].find(a => a.id === activityId)
        if (activity && activity._syncMetadata) {
          activity._syncMetadata.status = status
          if (error) activity._syncMetadata.error = error
          activity._syncMetadata.lastSync = new Date().toISOString()
        }
      })

      await this.setLocalCache(cache)

    } catch (error) {
      console.error('Erreur mise à jour statut sync:', error)
    }
  }

  private addToRetryQueue(activityId: string, error: any): void {
    // Logique de retry avec backoff exponentiel
    const retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 seconde
      maxDelay: 30000  // 30 secondes
    }

    // TODO: Implémenter la queue de retry
    console.log(`Ajout à la queue de retry: ${activityId}`)
  }

  // 🔄 Synchronisation en arrière-plan
  async syncPendingChanges(): Promise<void> {
    try {
      const cache = await this.getLocalCache()
      const pendingActivities = []

      Object.values(cache).flat().forEach(activity => {
        if (activity._syncMetadata?.status === SyncStatus.PENDING ||
            activity._syncMetadata?.status === SyncStatus.ERROR) {
          pendingActivities.push(activity)
        }
      })

      // Synchronisation des activités en attente
      for (const activity of pendingActivities) {
        try {
          await this.saveToFirebase(activity)
        } catch (error) {
          console.error(`Erreur sync ${activity.id}:`, error)
        }
      }

    } catch (error) {
      console.error('Erreur sync pending changes:', error)
    }
  }

  // 📊 Statistiques de synchronisation
  async getSyncStats(): Promise<{
    total: number
    synced: number
    pending: number
    errors: number
    offline: number
  }> {
    try {
      const cache = await this.getLocalCache()
      const allActivities = Object.values(cache).flat()

      return {
        total: allActivities.length,
        synced: allActivities.filter(a => a._syncMetadata?.status === SyncStatus.SYNCED).length,
        pending: allActivities.filter(a => a._syncMetadata?.status === SyncStatus.PENDING).length,
        errors: allActivities.filter(a => a._syncMetadata?.status === SyncStatus.ERROR).length,
        offline: allActivities.filter(a => a._syncMetadata?.status === SyncStatus.OFFLINE).length
      }

    } catch (error) {
      console.error('Erreur stats sync:', error)
      return { total: 0, synced: 0, pending: 0, errors: 0, offline: 0 }
    }
  }

  // 🧹 Nettoyage du cache
  async clearCache(): Promise<void> {
    try {
      localStorage.removeItem(CDC_CACHE_KEY)
      localStorage.removeItem(SYNC_METADATA_KEY)
    } catch (error) {
      console.error('Erreur nettoyage cache:', error)
    }
  }

  // 🔄 Écoute en temps réel (optionnel)
  subscribeToActivities(yearMonth: string, callback: (activities: ActivityWithSync[]) => void): () => void {
    if (!yearMonth) {
      console.warn('⚠️ yearMonth est undefined, impossible de s\'abonner')
      return () => {} // Retourner une fonction vide pour la désinscription
    }
    
    // Requête simplifiée pour éviter l'index composite
    const q = query(
      collection(db, 'cdcActivities'),
      where('yearMonth', '==', yearMonth)
      // orderBy supprimé temporairement pour éviter l'index composite
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities: ActivityWithSync[] = snapshot.docs.map(doc => ({
        ...doc.data() as Activity,
        id: doc.id,
        _syncMetadata: {
          lastSync: new Date().toISOString(),
          status: SyncStatus.SYNCED,
          retryCount: 0,
          pendingChanges: []
        }
      }))

      // Tri local par date de saisie (descendant)
      activities.sort((a, b) => 
        new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime()
      )

      // Mise à jour du cache local
      this.updateLocalCacheBatch(activities)
      
      // Callback
      callback(activities)
    })

    // Stockage de la fonction de désabonnement
    this.listeners.set(yearMonth, unsubscribe)

    // Retour de la fonction de nettoyage
    return () => {
      unsubscribe()
      this.listeners.delete(yearMonth)
    }
  }

  // 🧹 Nettoyage des listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}

// Instance singleton
export const cdcPersistence = CDCPersistenceService.getInstance()
