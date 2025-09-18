// Service Santé Individuelle unifié et cohérent
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
import { 
  SanteIndActivity, 
  SanteIndActeType, 
  CompagnieType,
  SanteIndKPI,
  SanteIndLock,
  PONDERATION_RATES,
  COMMISSION_SEUILS,
  CommissionCalculation,
  ProductionStats,
  QualiteAlert
} from '@/types/sante-ind'

export class SanteIndService {
  private static instance: SanteIndService

  static getInstance(): SanteIndService {
    if (!SanteIndService.instance) {
      SanteIndService.instance = new SanteIndService()
    }
    return SanteIndService.instance
  }

  /**
   * Validation cohérente (utilisée partout)
   */
  private validateActivity(activity: Partial<SanteIndActivity>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!activity.clientName || activity.clientName.trim().length === 0) {
      errors.push('Le nom du client est obligatoire')
    }

    if (!activity.type || !Object.values(SanteIndActeType).includes(activity.type)) {
      errors.push('Le type d\'acte est obligatoire')
    }

    if (!activity.dateSaisie) {
      errors.push('La date de saisie est obligatoire')
    }

    if (!activity.yearMonth) {
      errors.push('Le mois/année est obligatoire')
    }

    if (!activity.contractNumber || activity.contractNumber.trim().length === 0) {
      errors.push('Le numéro de contrat est obligatoire')
    }

    if (!activity.dateEffet) {
      errors.push('La date d\'effet est obligatoire')
    }

    if (!activity.ca || activity.ca <= 0) {
      errors.push('Le CA doit être un montant positif')
    }

    // Validation spécifique Affaire Nouvelle
    if (activity.type === SanteIndActeType.AFFAIRE_NOUVELLE) {
      if (!activity.compagnie || !Object.values(CompagnieType).includes(activity.compagnie)) {
        errors.push('La compagnie est obligatoire pour les affaires nouvelles')
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
  private normalizeActivity(activity: Partial<SanteIndActivity>): Partial<SanteIndActivity> {
    const normalized = { ...activity }

    // Nettoyage du nom client
    if (normalized.clientName) {
      normalized.clientName = normalized.clientName.trim()
    }

    // Nettoyage du numéro de contrat
    if (normalized.contractNumber) {
      normalized.contractNumber = normalized.contractNumber.trim()
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
   * Capitalisation intelligente du nom client
   */
  private capitalizeClientName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Gestion des prénoms composés (jean-michel -> Jean-Michel)
        if (word.includes('-')) {
          return word.split('-').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join('-')
        }
        // Gestion des apostrophes (d'arc -> D'Arc)
        if (word.includes("'")) {
          return word.split("'").map((part, index) => 
            index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
          ).join("'")
        }
        // Cas normal
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  }

  /**
   * Calcul du CA pondéré selon la grille
   */
  private calculateCAPondere(type: SanteIndActeType, ca: number): number {
    const taux = PONDERATION_RATES[type]
    return Math.round(ca * taux)
  }

  /**
   * Calcul de la commission selon les seuils
   */
  private calculateCommission(productionPondere: number): CommissionCalculation {
    const seuil = COMMISSION_SEUILS.find(seuil => {
      if (seuil.max === undefined) {
        return productionPondere >= seuil.min
      }
      return productionPondere >= seuil.min && productionPondere <= seuil.max
    }) || COMMISSION_SEUILS[0]

    const commissionEstimee = Math.round(productionPondere * (seuil.taux / 100))

    // Trouver le prochain seuil
    const prochainSeuil = COMMISSION_SEUILS.find(s => s.min > productionPondere)
    const ecartProchainSeuil = prochainSeuil ? prochainSeuil.min - productionPondere : 0

    return {
      productionPondere,
      tauxApplicable: seuil.taux,
      commissionEstimee,
      seuilAtteint: seuil,
      prochainSeuil,
      ecartProchainSeuil
    }
  }

  /**
   * Récupération des activités pour un mois
   */
  async getActivities(yearMonth: string): Promise<SanteIndActivity[]> {
    try {
      const q = query(
        collection(db, 'sante_ind_activities'),
        where('yearMonth', '==', yearMonth)
        // orderBy temporairement supprimé pour éviter l'erreur d'index
      )

      const snapshot = await getDocs(q)
      const activities: SanteIndActivity[] = []

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
          ...normalizedData as SanteIndActivity,
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
      console.error('Erreur récupération activités Santé Individuelle:', error)
      throw error
    }
  }

  /**
   * Sauvegarde d'une activité
   */
  async saveActivity(activity: Omit<SanteIndActivity, 'id'>): Promise<SanteIndActivity> {
    try {
      // Validation
      const validation = this.validateActivity(activity)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Normalisation
      const normalized = this.normalizeActivity(activity)

      // Capitalisation du nom client
      if (normalized.clientName) {
        normalized.clientName = this.capitalizeClientName(normalized.clientName)
      }

      // Calcul du CA pondéré
      const caPondere = this.calculateCAPondere(normalized.type!, normalized.ca!)

      const activityWithCalculations = {
        ...normalized,
        caPondere
      }

      // Sauvegarde Firebase
      console.log('🔥 Tentative de sauvegarde Firebase Santé Individuelle:', activityWithCalculations)
      
      const docRef = await addDoc(collection(db, 'sante_ind_activities'), {
        ...activityWithCalculations,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Activité Santé Individuelle sauvegardée Firebase avec ID:', docRef.id)

      return {
        ...activityWithCalculations,
        id: docRef.id
      } as SanteIndActivity

    } catch (error) {
      console.error('Erreur sauvegarde activité Santé Individuelle:', error)
      throw error
    }
  }

  /**
   * Mise à jour d'une activité
   */
  async updateActivity(id: string, updates: Partial<SanteIndActivity>): Promise<SanteIndActivity> {
    try {
      // Validation
      const validation = this.validateActivity(updates)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Normalisation
      const normalized = this.normalizeActivity(updates)

      // Capitalisation du nom client si modifié
      if (normalized.clientName) {
        normalized.clientName = this.capitalizeClientName(normalized.clientName)
      }

      // Recalcul du CA pondéré si nécessaire
      if (normalized.type || normalized.ca !== undefined) {
        const type = normalized.type || updates.type!
        const ca = normalized.ca || updates.ca!
        normalized.caPondere = this.calculateCAPondere(type, ca)
      }

      // Mise à jour Firebase
      await updateDoc(doc(db, 'sante_ind_activities', id), {
        ...normalized,
        updatedAt: serverTimestamp()
      })

      // Récupération de l'activité mise à jour
      const updatedDoc = await getDoc(doc(db, 'sante_ind_activities', id))
      if (!updatedDoc.exists()) {
        throw new Error('Activité non trouvée après mise à jour')
      }

      return {
        ...updatedDoc.data() as SanteIndActivity,
        id: updatedDoc.id
      }

    } catch (error) {
      console.error('Erreur mise à jour activité Santé Individuelle:', error)
      throw error
    }
  }

  /**
   * Suppression d'une activité
   */
  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'sante_ind_activities', id))
    } catch (error) {
      console.error('Erreur suppression activité Santé Individuelle:', error)
      throw error
    }
  }

  /**
   * Calcul des KPIs mensuels
   */
  async calculateKPIs(yearMonth: string, userId: string): Promise<SanteIndKPI> {
    try {
      const activities = await this.getActivities(yearMonth)
      const userActivities = activities.filter(a => a.userId === userId)

      // Compteurs par type
      const acteCounts = {
        [SanteIndActeType.AFFAIRE_NOUVELLE]: 0,
        [SanteIndActeType.REVISION]: 0,
        [SanteIndActeType.ADHESION_GROUPE]: 0,
        [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 0,
        [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 0
      }

      let productionBrute = 0
      let productionPondere = 0

      userActivities.forEach(activity => {
        acteCounts[activity.type]++
        productionBrute += activity.ca
        productionPondere += activity.caPondere
      })

      // Calcul de la commission
      const commissionCalc = this.calculateCommission(productionPondere)

      // Critère qualitatif (minimum 4 révisions)
      const critereQualitatifAtteint = acteCounts[SanteIndActeType.REVISION] >= 4

      return {
        yearMonth,
        userId,
        nombreAffairesNouvelles: acteCounts[SanteIndActeType.AFFAIRE_NOUVELLE],
        nombreRevisions: acteCounts[SanteIndActeType.REVISION],
        nombreAdhesionsGroupe: acteCounts[SanteIndActeType.ADHESION_GROUPE],
        nombreCourtageVersAllianz: acteCounts[SanteIndActeType.COURTAGE_VERS_ALLIANZ],
        nombreAllianzVersCourtage: acteCounts[SanteIndActeType.ALLIANZ_VERS_COURTAGE],
        productionBrute,
        productionPondere,
        tauxCommission: commissionCalc.tauxApplicable,
        commissionEstimee: commissionCalc.commissionEstimee,
        critereQualitatifAtteint,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur calcul KPIs Santé Individuelle:', error)
      throw error
    }
  }

  /**
   * Vérification du verrouillage mensuel
   */
  async isMonthLocked(yearMonth: string, userId: string): Promise<boolean> {
    try {
      const lockId = `${userId}_${yearMonth}`
      const lockDoc = await getDoc(doc(db, 'sante_ind_locks', lockId))
      
      if (!lockDoc.exists()) {
        return false
      }

      const lockData = lockDoc.data() as SanteIndLock
      return lockData.isLocked
    } catch (error) {
      console.error('Erreur vérification verrouillage:', error)
      return false
    }
  }

  /**
   * Calcul des statistiques de production
   */
  calculateProductionStats(activities: SanteIndActivity[]): ProductionStats {
    const totalBrute = activities.reduce((sum, activity) => sum + activity.ca, 0)
    const totalPondere = activities.reduce((sum, activity) => sum + activity.caPondere, 0)
    const moyenneParActe = activities.length > 0 ? Math.round(totalBrute / activities.length) : 0

    const repartitionParType = Object.values(SanteIndActeType).reduce((acc, type) => {
      const typeActivities = activities.filter(a => a.type === type)
      const brut = typeActivities.reduce((sum, activity) => sum + activity.ca, 0)
      const pondere = typeActivities.reduce((sum, activity) => sum + activity.caPondere, 0)
      const pourcentage = totalBrute > 0 ? Math.round((brut / totalBrute) * 100) : 0

      acc[type] = {
        count: typeActivities.length,
        brut,
        pondere,
        pourcentage
      }

      return acc
    }, {} as Record<SanteIndActeType, { count: number; brut: number; pondere: number; pourcentage: number }>)

    return {
      totalBrute,
      totalPondere,
      moyenneParActe,
      repartitionParType
    }
  }

  /**
   * Génération d'alerte pour le critère qualitatif
   */
  generateQualiteAlert(nombreRevisions: number): QualiteAlert {
    const requiredRevisions = 4
    const isBlocking = false // À définir selon les règles métier

    if (nombreRevisions >= requiredRevisions) {
      return {
        type: 'success',
        message: `Critère qualitatif atteint (${nombreRevisions}/${requiredRevisions} révisions)`,
        currentRevisions: nombreRevisions,
        requiredRevisions,
        isBlocking: false
      }
    } else if (nombreRevisions >= requiredRevisions - 1) {
      return {
        type: 'warning',
        message: `Attention: il manque ${requiredRevisions - nombreRevisions} révision(s) pour atteindre le critère qualitatif`,
        currentRevisions: nombreRevisions,
        requiredRevisions,
        isBlocking: false
      }
    } else {
      return {
        type: 'error',
        message: `Critère qualitatif non atteint (${nombreRevisions}/${requiredRevisions} révisions)`,
        currentRevisions: nombreRevisions,
        requiredRevisions,
        isBlocking
      }
    }
  }
}

// Instance singleton
export const santeIndService = SanteIndService.getInstance()
