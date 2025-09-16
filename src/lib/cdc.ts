// Utilitaires et services pour le module CDC Commercial
// Basé sur les spécifications du CDC commercial

import { 
  Activity, 
  ActivityType, 
  ProductType, 
  CommissionRate, 
  COMMISSION_RATES,
  CDCFilter,
  MonthNavigation,
  TimelineData,
  CDCKPI,
  DayStats
} from '@/types/cdc'

// ============================================================================
// FONCTIONS DE CAPITALISATION DES NOMS
// ============================================================================

/**
 * Capitalise intelligemment un nom de client
 * Gère les prénoms composés, apostrophes, etc.
 * Appliquée uniquement à l'enregistrement (pas en temps réel)
 */
export function capitalizeClientName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  const result = name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Gestion des prénoms composés (jean-michel -> Jean-Michel)
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => capitalizeFirstLetter(part))
          .join('-')
      }
      
      // Gestion des apostrophes (d'arc -> D'Arc)
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part, index) => 
            index === 0 ? capitalizeFirstLetter(part) : part
          )
          .join("'")
      }
      
      return capitalizeFirstLetter(word)
    })
    .join(' ')

  return result
}

/**
 * Capitalise la première lettre d'un mot
 */
function capitalizeFirstLetter(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ============================================================================
// FONCTIONS DE CALCUL DES COMMISSIONS
// ============================================================================

/**
 * Calcule la commission potentielle selon le barème par type de produit
 * @param productType - Type de produit
 * @param primeAnnuelle - Prime annuelle (pour IARD PRO DIVERS)
 * @param versementLibre - Versement libre (pour PU / VL)
 * @returns Commission en euros (entier)
 */
export function calculateCommission(
  productType: ProductType,
  primeAnnuelle?: number,
  versementLibre?: number
): number {
  const rate = COMMISSION_RATES[productType]
  if (!rate) {
    console.warn(`Taux de commission non trouvé pour ${productType}`)
    return 0
  }

  // Cas spécial PU / VL : 1% du versement libre
  if (productType === ProductType.PU_VL && versementLibre) {
    return Math.round(versementLibre * 0.01)
  }

  // Cas spécial IARD PRO DIVERS : 20€ + 10€ par tranche de 1000€
  if (productType === ProductType.IARD_PRO_DIVERS && primeAnnuelle) {
    const tranches = Math.floor(primeAnnuelle / 1000)
    return rate.baseRate + (rate.trancheRate || 0) * tranches
  }

  // Cas pourcentage (ex: AUTO_MOTO)
  if (rate.isPercentage && primeAnnuelle && rate.percentageRate) {
    return Math.round(primeAnnuelle * (rate.percentageRate / 100))
  }

  // Cas standard : taux fixe
  return rate.baseRate
}

/**
 * Vérifie si un produit nécessite une prime annuelle
 */
export function requiresPrimeAnnuelle(productType: ProductType): boolean {
  return productType !== ProductType.PU_VL
}

/**
 * Vérifie si un produit nécessite un versement libre
 */
export function requiresVersementLibre(productType: ProductType): boolean {
  return productType === ProductType.PU_VL
}

// ============================================================================
// FONCTIONS DE FORMATAGE
// ============================================================================

/**
 * Formate un montant en euros (entier) au format français
 * @param amount - Montant en euros
 * @returns Montant formaté (ex: "1 234 €")
 */
export function formatEuroInt(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 €'
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Vérifie les conditions pour les commissions réelles
 * @param commissionsPotentielles - Montant des commissions potentielles
 * @param nombreProcess - Nombre de process
 * @param ratio - Ratio en pourcentage
 * @returns Objet avec les conditions et le statut
 */
export function checkCommissionReellesConditions(
  commissionsPotentielles: number,
  nombreProcess: number,
  ratio: number
): {
  condition1: boolean // Commissions potentielles >= 200€
  condition2: boolean // Process >= 15
  condition3: boolean // Ratio >= 100%
  allConditionsMet: boolean
  message: string
} {
  const condition1 = commissionsPotentielles >= 200
  const condition2 = nombreProcess >= 15
  const condition3 = ratio >= 100
  const allConditionsMet = condition1 && condition2 && condition3
  
  let message = ''
  if (allConditionsMet) {
    message = 'Toutes les conditions sont remplies - Commissions réelles versées'
  } else {
    const missingConditions = []
    if (!condition1) missingConditions.push('Commissions potentielles < 200€')
    if (!condition2) missingConditions.push('Process < 15')
    if (!condition3) missingConditions.push('Ratio < 100%')
    message = `Conditions manquantes: ${missingConditions.join(', ')}`
  }
  
  return {
    condition1,
    condition2,
    condition3,
    allConditionsMet,
    message
  }
}

/**
 * Formate un pourcentage au format français
 * @param value - Valeur du pourcentage
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Pourcentage formaté (ex: "85 %")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 %'
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

/**
 * Formate une date au format français
 * @param date - Date ISO string ou Date object
 * @returns Date formatée (ex: "15 septembre 2025")
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide'
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj)
}

/**
 * Formate une date courte au format français
 * @param date - Date ISO string ou Date object
 * @returns Date formatée (ex: "15/09/2025")
 */
export function formatDateShort(date: string | Date | undefined | null): string {
  if (!date) {
    return 'Date non définie'
  }
  
  // Conversion sécurisée en Date
  let dateObj: Date
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    // Si ce n'est ni string ni Date, essayer de convertir
    dateObj = new Date(date as any)
  }
  
  // Vérification que l'objet Date est valide
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Date invalide'
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

// ============================================================================
// FONCTIONS DE NAVIGATION MENSUELLE
// ============================================================================

/**
 * Crée un objet de navigation mensuelle
 * @param year - Année
 * @param month - Mois (1-12)
 * @returns Objet de navigation
 */
export function createMonthNavigation(year: number, month: number): MonthNavigation {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  return {
    currentYear: year,
    currentMonth: month,
    currentYearMonth: `${year}-${month.toString().padStart(2, '0')}`,
    canGoPrevious: !(year === currentYear && month === currentMonth),
    canGoNext: !(year === currentYear && month === currentMonth)
  }
}

/**
 * Obtient le mois précédent
 * @param year - Année actuelle
 * @param month - Mois actuel (1-12)
 * @returns Objet avec année et mois précédents
 */
export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 }
  }
  return { year, month: month - 1 }
}

/**
 * Obtient le mois suivant
 * @param year - Année actuelle
 * @param month - Mois actuel (1-12)
 * @returns Objet avec année et mois suivants
 */
export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 }
  }
  return { year, month: month + 1 }
}

/**
 * Obtient le mois courant
 * @returns Objet avec année et mois courants
 */
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  }
}

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

/**
 * Valide une activité CDC
 * @param activity - Activité à valider
 * @returns Liste des erreurs de validation
 */
export function validateActivity(activity: Partial<Activity>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validation du nom client
  if (!activity.clientName || activity.clientName.trim().length === 0) {
    errors.push('Le nom du client est obligatoire')
  }
  
  // Validation du type d'activité
  if (!activity.type || !Object.values(ActivityType).includes(activity.type)) {
    errors.push('Le type d\'activité est obligatoire')
  }
  
  // Validation spécifique aux Affaires Nouvelles
  if (activity.type === ActivityType.AN) {
    if (!activity.productType || !Object.values(ProductType).includes(activity.productType)) {
      errors.push('Le type de produit est obligatoire pour les affaires nouvelles')
    }
    
    // Validation de la prime annuelle
    if (requiresPrimeAnnuelle(activity.productType!)) {
      if (!activity.primeAnnuelle || activity.primeAnnuelle <= 0) {
        errors.push('La prime annuelle est obligatoire et doit être positive')
      }
    }
    
    // Validation du versement libre
    if (requiresVersementLibre(activity.productType!)) {
      if (!activity.versementLibre || activity.versementLibre <= 0) {
        errors.push('Le versement libre est obligatoire et doit être positif')
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valide un nom de client
 * @param name - Nom à valider
 * @returns true si valide, false sinon
 */
export function validateClientName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false
  }
  
  const trimmed = name.trim()
  if (trimmed.length === 0) {
    return false
  }
  
  // Vérifier qu'il n'y a pas que des espaces
  if (trimmed.length !== name.length) {
    return false
  }
  
  return true
}

// ============================================================================
// FONCTIONS DE CALCUL DES KPIs
// ============================================================================

/**
 * Calcule les KPIs pour un mois donné
 * @param activities - Liste des activités du mois
 * @param yearMonth - Mois au format YYYY-MM
 * @param userId - ID de l'utilisateur
 * @returns KPIs calculés
 */
export function calculateKPIs(
  activities: Activity[], 
  yearMonth: string, 
  userId: string
): CDCKPI {
  const anActivities = activities.filter(a => a.type === ActivityType.AN)
  const processActivities = activities.filter(a => a.type !== ActivityType.AN)
  
  // Compteurs de base
  const nombreAffairesNouvelles = anActivities.length
  const nombreAutoMoto = anActivities.filter(a => a.productType === ProductType.AUTO_MOTO).length
  const nombreAutres = nombreAffairesNouvelles - nombreAutoMoto
  const nombreProcess = processActivities.length
  
  // Détail des process
  const nombreM3 = processActivities.filter(a => a.type === ActivityType.M3).length
  const nombrePretermeAuto = processActivities.filter(a => a.type === ActivityType.PRETERME_AUTO).length
  const nombrePretermeIrd = processActivities.filter(a => a.type === ActivityType.PRETERME_IRD).length
  
  // Calcul du CA d'affaire cumulé
  const caAffaireCumule = anActivities.reduce((total, activity) => {
    if (activity.primeAnnuelle) {
      return total + activity.primeAnnuelle
    }
    if (activity.versementLibre) {
      return total + activity.versementLibre
    }
    return total
  }, 0)
  
  // Calcul des commissions potentielles
  const commissionsPotentielles = anActivities.reduce((total, activity) => {
    return total + (activity.commissionPotentielle || 0)
  }, 0)
  
  // Calcul du ratio
  const ratio = nombreAutoMoto === 0 ? 100 : Math.round((nombreAutres / nombreAutoMoto) * 100)
  
  // Calcul des commissions réelles
  const commissionsReelles = (
    commissionsPotentielles >= 200 && 
    nombreProcess >= 15 && 
    ratio >= 100
  ) ? commissionsPotentielles : 0
  
  return {
    yearMonth,
    userId,
    nombreAffairesNouvelles,
    nombreAutoMoto,
    nombreAutres,
    nombreProcess,
    nombreM3,
    nombrePretermeAuto,
    nombrePretermeIrd,
    caAffaireCumule,
    commissionsPotentielles,
    commissionsReelles,
    ratio,
    calculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ============================================================================
// FONCTIONS DE TIMELINE
// ============================================================================

/**
 * Génère les données de timeline pour un mois
 * @param activities - Liste des activités du mois
 * @param year - Année
 * @param month - Mois (1-12)
 * @returns Données de timeline par jour
 */
export function generateTimelineData(
  activities: Activity[], 
  year: number, 
  month: number
): TimelineData[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const timeline: TimelineData[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.dateSaisie)
      return activityDate.getDate() === day
    })
    
    const anCount = dayActivities.filter(a => a.type === ActivityType.AN).length
    const processCount = dayActivities.filter(a => a.type !== ActivityType.AN).length
    
    timeline.push({
      day,
      totalActivities: dayActivities.length,
      anCount,
      processCount,
      hasData: dayActivities.length > 0
    })
  }
  
  return timeline
}

// ============================================================================
// FONCTIONS DE FILTRAGE
// ============================================================================

/**
 * Filtre les activités selon les critères
 * @param activities - Liste des activités
 * @param filter - Critères de filtrage
 * @returns Activités filtrées
 */
export function filterActivities(activities: Activity[], filter: CDCFilter): Activity[] {
  let filtered = activities
  
  // Filtre par type
  if (filter.type === 'AN') {
    filtered = filtered.filter(a => a.type === ActivityType.AN)
  } else if (filter.type === 'Process') {
    filtered = filtered.filter(a => a.type !== ActivityType.AN)
  }
  
  // Filtre par produit (pour les AN) ou par type de process (pour les Process)
  if (filter.product) {
    if (filter.type === 'AN') {
      // Filtre par type de produit pour les AN
      filtered = filtered.filter(a => a.productType === filter.product)
    } else if (filter.type === 'Process') {
      // Filtre par type de process
      filtered = filtered.filter(a => a.type === filter.product)
    }
  }
  
  // Filtre par jour
  if (filter.day) {
    filtered = filtered.filter(a => {
      const activityDate = new Date(a.dateSaisie)
      return activityDate.getDate() === filter.day
    })
  }
  
  return filtered
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Obtient le nom du mois en français
 * @param month - Mois (1-12)
 * @returns Nom du mois
 */
export function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return months[month - 1] || 'Mois invalide'
}

/**
 * Obtient le nom du jour en français
 * @param day - Jour de la semaine (0-6)
 * @returns Nom du jour
 */
export function getDayName(day: number): string {
  const days = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ]
  return days[day] || 'Jour invalide'
}

/**
 * Vérifie si une date est aujourd'hui
 * @param date - Date à vérifier
 * @returns true si c'est aujourd'hui
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear()
}

/**
 * Vérifie si une date est dans le futur
 * @param date - Date à vérifier
 * @returns true si c'est dans le futur
 */
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return dateObj > today
}

/**
 * Obtient les statistiques d'un jour
 * @param activities - Liste des activités
 * @param day - Jour du mois
 * @returns Statistiques du jour
 */
export function getDayStats(activities: Activity[], day: number): DayStats {
  const dayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.dateSaisie)
    return activityDate.getDate() === day
  })
  
  const anCount = dayActivities.filter(a => a.type === ActivityType.AN).length
  const processCount = dayActivities.filter(a => a.type !== ActivityType.AN).length
  
  return {
    day,
    activities: dayActivities,
    totalCount: dayActivities.length,
    anCount,
    processCount
  }
}

/**
 * Génère un ID unique pour une activité
 * @returns ID unique
 */
export function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Génère un ID unique pour un verrou
 * @param userId - ID de l'utilisateur
 * @param yearMonth - Mois au format YYYY-MM
 * @returns ID unique
 */
export function generateLockId(userId: string, yearMonth: string): string {
  return `${userId}_${yearMonth}`
}
