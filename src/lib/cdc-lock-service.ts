// Service pour la gestion du verrouillage mensuel CDC
// Interface avec l'API de verrouillage

import { CDCLock } from '@/types/cdc'

export class CDCLockService {
  private static readonly API_BASE = '/api/cdc-activities/lock'

  /**
   * Vérifie le statut de verrouillage d'un mois
   * @param userId - ID de l'utilisateur
   * @param yearMonth - Mois au format YYYY-MM
   * @returns Statut de verrouillage
   */
  static async getLockStatus(userId: string, yearMonth: string): Promise<{
    lock: CDCLock
    isLocked: boolean
  }> {
    try {
      const response = await fetch(
        `${this.API_BASE}?userId=${encodeURIComponent(userId)}&yearMonth=${encodeURIComponent(yearMonth)}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la vérification du verrouillage')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la vérification du verrouillage')
      }

      return result.data
    } catch (error) {
      console.error('Erreur CDCLockService.getLockStatus:', error)
      throw error
    }
  }

  /**
   * Verrouille ou déverrouille un mois
   * @param userId - ID de l'utilisateur
   * @param yearMonth - Mois au format YYYY-MM
   * @param isLocked - Nouveau statut de verrouillage
   * @param lockedBy - Utilisateur qui effectue l'action (optionnel)
   * @returns Nouveau statut de verrouillage
   */
  static async toggleLock(
    userId: string, 
    yearMonth: string, 
    isLocked: boolean, 
    lockedBy?: string
  ): Promise<{
    lock: CDCLock
    message: string
  }> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          yearMonth,
          isLocked,
          lockedBy: lockedBy || userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du changement de verrouillage')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du changement de verrouillage')
      }

      return result.data
    } catch (error) {
      console.error('Erreur CDCLockService.toggleLock:', error)
      throw error
    }
  }

  /**
   * Vérifie si un mois est verrouillé
   * @param userId - ID de l'utilisateur
   * @param yearMonth - Mois au format YYYY-MM
   * @returns True si le mois est verrouillé
   */
  static async isMonthLocked(userId: string, yearMonth: string): Promise<boolean> {
    try {
      const { isLocked } = await this.getLockStatus(userId, yearMonth)
      return isLocked
    } catch (error) {
      console.error('Erreur CDCLockService.isMonthLocked:', error)
      // En cas d'erreur, on considère que le mois n'est pas verrouillé
      return false
    }
  }

  /**
   * Formate une date de verrouillage pour l'affichage
   * @param dateString - Date au format ISO
   * @returns Date formatée en français
   */
  static formatLockDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Erreur formatage date:', error)
      return 'Date inconnue'
    }
  }

  /**
   * Détermine le statut d'un mois (futur, actuel, passé)
   * @param yearMonth - Mois au format YYYY-MM
   * @returns Statut du mois
   */
  static getMonthStatus(yearMonth: string): 'future' | 'current' | 'past' {
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const [year, month] = yearMonth.split('-').map(Number)
      
      if (year > currentYear || (year === currentYear && month > currentMonth)) {
        return 'future'
      } else if (year === currentYear && month === currentMonth) {
        return 'current'
      } else {
        return 'past'
      }
    } catch (error) {
      console.error('Erreur détermination statut mois:', error)
      return 'past'
    }
  }

  /**
   * Génère un message d'avertissement pour les mois futurs
   * @param yearMonth - Mois au format YYYY-MM
   * @returns Message d'avertissement ou null
   */
  static getFutureMonthWarning(yearMonth: string): string | null {
    const status = this.getMonthStatus(yearMonth)
    if (status === 'future') {
      return 'Verrouillage non recommandé pour les mois futurs'
    }
    return null
  }
}
