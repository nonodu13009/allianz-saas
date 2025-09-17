// Service CDC unifié et cohérent
// Une seule source de vérité, une seule logique

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
  serverTimestamp
} from 'firebase/firestore'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { calculateCommission } from '@/lib/cdc'

export class CDCService {
  private static instance: CDCService

  static getInstance(): CDCService {
    if (!CDCService.instance) {
      CDCService.instance = new CDCService()
    }
    return CDCService.instance
  }

  /**
   * Validation cohérente (utilisée partout)
   */
  private validateActivity(activity: Partial<Activity>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!activity.clientName || activity.clientName.trim().length === 0) {
      errors.push('Le nom du client est obligatoire')
    }

    if (!activity.type || !Object.values(ActivityType).includes(activity.type)) {
      errors.push('Le type d\'activité est obligatoire')
    }

    if (!activity.dateSaisie) {
      errors.push('La date de saisie est obligatoire')
    }

    if (!activity.yearMonth) {
      errors.push('Le mois/année est obligatoire')
    }

    // Validation spécifique AN
    if (activity.type === ActivityType.AN) {
      if (!activity.productType || !Object.values(ProductType).includes(activity.productType)) {
        errors.push('Le type de produit est obligatoire pour les affaires nouvelles')
      }

      // PU/VL nécessite versement libre
      if (activity.productType === ProductType.PU_VL) {
        if (!activity.versementLibre || activity.versementLibre <= 0) {
          errors.push('Le versement libre est obligatoire pour PU/VL')
        }
      } else {
        // Autres produits nécessitent prime annuelle
        if (!activity.primeAnnuelle || activity.primeAnnuelle <= 0) {
          errors.push('La prime annuelle est obligatoire pour ce type de produit')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Normalisation des données (cohérente partout)
   */
  private normalizeActivity(activity: Partial<Activity>): Partial<Activity> {
    const normalized = { ...activity }

    // Nettoyage du nom client
    if (normalized.clientName) {
      normalized.clientName = normalized.clientName.trim()
    }

    // Conversion des nombres (null au lieu de undefined pour Firebase)
    if (normalized.primeAnnuelle === undefined) {
      normalized.primeAnnuelle = null
    }
    if (normalized.versementLibre === undefined) {
      normalized.versementLibre = null
    }

    // Dates en ISO string
    if (normalized.dateSaisie) {
      normalized.dateSaisie = new Date(normalized.dateSaisie).toISOString()
    }
    if (normalized.dateEffet) {
      normalized.dateEffet = new Date(normalized.dateEffet).toISOString()
    }

    return normalized
  }

  /**
   * Récupération des activités pour un mois
   */
  async getActivities(yearMonth: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'cdcActivities'),
        where('yearMonth', '==', yearMonth)
        // orderBy temporairement supprimé pour éviter l'erreur d'index
      )

      const snapshot = await getDocs(q)
      const activities: Activity[] = []

      snapshot.forEach(doc => {
        const data = doc.data()
        
        // Normalisation des timestamps Firestore
        const normalizedData = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          dateSaisie: data.dateSaisie?.toDate?.()?.toISOString() || data.dateSaisie,
          dateEffet: data.dateEffet?.toDate?.()?.toISOString() || data.dateEffet
        }
        
        activities.push({
          ...normalizedData as Activity,
          id: doc.id
        })
      })

      // Tri local par date de saisie (descendant)
      activities.sort((a, b) => {
        const dateA = new Date(a.dateSaisie).getTime()
        const dateB = new Date(b.dateSaisie).getTime()
        return dateB - dateA
      })

      return activities
    } catch (error) {
      console.error('Erreur récupération activités:', error)
      throw error
    }
  }

  /**
   * Sauvegarde d'une activité
   */
  async saveActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    try {
      // Validation
      const validation = this.validateActivity(activity)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Normalisation
      const normalized = this.normalizeActivity(activity)

      // Calcul de la commission
      const commission = calculateCommission(
        normalized.productType!,
        normalized.primeAnnuelle || undefined,
        normalized.versementLibre || undefined
      )

      const activityWithCommission = {
        ...normalized,
        commissionPotentielle: commission
      }

      // Sauvegarde Firebase
      console.log('🔥 Tentative de sauvegarde Firebase:', activityWithCommission)
      
      const docRef = await addDoc(collection(db, 'cdcActivities'), {
        ...activityWithCommission,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Activité sauvegardée Firebase avec ID:', docRef.id)

      return {
        ...activityWithCommission,
        id: docRef.id
      } as Activity

    } catch (error) {
      console.error('Erreur sauvegarde activité:', error)
      throw error
    }
  }

  /**
   * Mise à jour d'une activité
   */
  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    try {
      // Validation
      const validation = this.validateActivity(updates)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Normalisation
      const normalized = this.normalizeActivity(updates)

      // Calcul de la commission si nécessaire
      if (normalized.productType || normalized.primeAnnuelle !== undefined || normalized.versementLibre !== undefined) {
        const commission = calculateCommission(
          normalized.productType!,
          normalized.primeAnnuelle || undefined,
          normalized.versementLibre || undefined
        )
        normalized.commissionPotentielle = commission
      }

      // Mise à jour Firebase
      await updateDoc(doc(db, 'cdcActivities', id), {
        ...normalized,
        updatedAt: serverTimestamp()
      })

      // Récupération de l'activité mise à jour
      const updatedDoc = await getDoc(doc(db, 'cdcActivities', id))
      if (!updatedDoc.exists()) {
        throw new Error('Activité non trouvée après mise à jour')
      }

      return {
        ...updatedDoc.data() as Activity,
        id: updatedDoc.id
      }

    } catch (error) {
      console.error('Erreur mise à jour activité:', error)
      throw error
    }
  }

  /**
   * Suppression d'une activité
   */
  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cdcActivities', id))
    } catch (error) {
      console.error('Erreur suppression activité:', error)
      throw error
    }
  }
}

// Instance singleton
export const cdcService = CDCService.getInstance()
