// Utilitaires et services pour le module CDC Santé Individuelle
// Basé sur les spécifications du CDC Santé Individuelle

import { 
  SanteIndActivity, 
  SanteIndActeType, 
  CompagnieType,
  SanteIndFilter,
  SanteIndMonthNavigation,
  SanteIndTimelineData,
  SanteIndKPI,
  SanteIndDayStats,
  PONDERATION_RATES,
  COMMISSION_SEUILS,
  CommissionCalculation,
  ProductionStats,
  QualiteAlert
} from '@/types/sante-ind'

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
// FONCTIONS DE CALCUL DU CA PONDÉRÉ
// ============================================================================

/**
 * Calcule le CA pondéré selon la grille de pondération
 * @param type - Type d'acte commercial
 * @param ca - CA brut en euros
 * @returns CA pondéré en euros (entier)
 */
export function calculateCAPondere(type: SanteIndActeType, ca: number): number {
  const taux = PONDERATION_RATES[type]
  return Math.round(ca * taux)
}

/**
 * Obtient le taux de pondération pour un type d'acte
 * @param type - Type d'acte commercial
 * @returns Taux de pondération (0.5, 0.75, 1.0)
 */
export function getPonderationRate(type: SanteIndActeType): number {
  return PONDERATION_RATES[type]
}

/**
 * Obtient le libellé du taux de pondération
 * @param type - Type d'acte commercial
 * @returns Libellé du taux (ex: "100%", "75%", "50%")
 */
export function getPonderationLabel(type: SanteIndActeType): string {
  const taux = PONDERATION_RATES[type]
  return `${Math.round(taux * 100)}%`
}

// ============================================================================
// FONCTIONS DE CALCUL DES COMMISSIONS
// ============================================================================

/**
 * Calcule la commission selon les seuils de production pondérée
 * @param productionPondere - Production pondérée mensuelle en euros
 * @returns Calcul de la commission
 */
export function calculateCommission(productionPondere: number): CommissionCalculation {
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
 * Obtient le seuil de commission applicable
 * @param productionPondere - Production pondérée mensuelle en euros
 * @returns Seuil applicable
 */
export function getCommissionSeuil(productionPondere: number) {
  return COMMISSION_SEUILS.find(seuil => {
    if (seuil.max === undefined) {
      return productionPondere >= seuil.min
    }
    return productionPondere >= seuil.min && productionPondere <= seuil.max
  }) || COMMISSION_SEUILS[0]
}

/**
 * Vérifie si le critère qualitatif est atteint (minimum 4 révisions)
 * @param nombreRevisions - Nombre de révisions dans le mois
 * @returns true si le critère est atteint
 */
export function isQualiteCriterionMet(nombreRevisions: number): boolean {
  return nombreRevisions >= 4
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
export function createMonthNavigation(year: number, month: number): SanteIndMonthNavigation {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  return {
    currentYear: year,
    currentMonth: month,
    currentYearMonth: `${year}-${month.toString().padStart(2, '0')}`,
    canGoPrevious: true, // Toujours possible d'aller en arrière
    canGoNext: true // Toujours possible d'aller en avant
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
 * Valide une activité Santé Individuelle
 * @param activity - Activité à valider
 * @returns Liste des erreurs de validation
 */
export function validateSanteIndActivity(activity: Partial<SanteIndActivity>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validation du nom client
  if (!activity.clientName || activity.clientName.trim().length === 0) {
    errors.push('Le nom du client est obligatoire')
  }
  
  // Validation du type d'acte
  if (!activity.type || !Object.values(SanteIndActeType).includes(activity.type)) {
    errors.push('Le type d\'acte est obligatoire')
  }
  
  // Validation du numéro de contrat
  if (!activity.contractNumber || activity.contractNumber.trim().length === 0) {
    errors.push('Le numéro de contrat est obligatoire')
  }
  
  // Validation de la date d'effet
  if (!activity.dateEffet) {
    errors.push('La date d\'effet est obligatoire')
  }
  
  // Validation du CA
  if (!activity.ca || activity.ca <= 0) {
    errors.push('Le CA doit être un montant positif')
  }
  
  // Validation spécifique aux Affaires Nouvelles
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
  activities: SanteIndActivity[], 
  yearMonth: string, 
  userId: string
): SanteIndKPI {
  // Compteurs par type d'acte
  const acteCounts = {
    [SanteIndActeType.AFFAIRE_NOUVELLE]: 0,
    [SanteIndActeType.REVISION]: 0,
    [SanteIndActeType.ADHESION_GROUPE]: 0,
    [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 0,
    [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 0
  }

  let productionBrute = 0
  let productionPondere = 0

  activities.forEach(activity => {
    acteCounts[activity.type]++
    productionBrute += activity.ca
    productionPondere += activity.caPondere
  })

  // Calcul de la commission
  const commissionCalc = calculateCommission(productionPondere)

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
  activities: SanteIndActivity[], 
  year: number, 
  month: number
): SanteIndTimelineData[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const timeline: SanteIndTimelineData[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.dateSaisie)
      return activityDate.getDate() === day
    })
    
    const acteCounts = {
      [SanteIndActeType.AFFAIRE_NOUVELLE]: 0,
      [SanteIndActeType.REVISION]: 0,
      [SanteIndActeType.ADHESION_GROUPE]: 0,
      [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 0,
      [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 0
    }
    
    dayActivities.forEach(activity => {
      acteCounts[activity.type]++
    })
    
    timeline.push({
      day,
      totalActivities: dayActivities.length,
      acteCounts,
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
export function filterActivities(activities: SanteIndActivity[], filter: SanteIndFilter): SanteIndActivity[] {
  let filtered = activities
  
  // Filtre par type d'acte
  if (filter.type !== 'all') {
    filtered = filtered.filter(a => a.type === filter.type)
  }
  
  // Filtre par compagnie (pour les Affaires Nouvelles)
  if (filter.compagnie) {
    filtered = filtered.filter(a => a.compagnie === filter.compagnie)
  }
  
  // Filtre par jour
  if (filter.day !== undefined) {
    filtered = filtered.filter(a => {
      const activityDate = new Date(a.dateSaisie)
      return activityDate.getDate() === filter.day
    })
  }
  
  return filtered
}

// ============================================================================
// FONCTIONS DE STATISTIQUES
// ============================================================================

/**
 * Calcule les statistiques de production
 * @param activities - Liste des activités
 * @returns Statistiques de production
 */
export function calculateProductionStats(activities: SanteIndActivity[]): ProductionStats {
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
 * Génère une alerte pour le critère qualitatif
 * @param nombreRevisions - Nombre de révisions dans le mois
 * @returns Alerte qualité
 */
export function generateQualiteAlert(nombreRevisions: number): QualiteAlert {
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
export function getDayStats(activities: SanteIndActivity[], day: number): SanteIndDayStats {
  const dayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.dateSaisie)
    return activityDate.getDate() === day
  })
  
  const acteCounts = {
    [SanteIndActeType.AFFAIRE_NOUVELLE]: 0,
    [SanteIndActeType.REVISION]: 0,
    [SanteIndActeType.ADHESION_GROUPE]: 0,
    [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 0,
    [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 0
  }
  
  dayActivities.forEach(activity => {
    acteCounts[activity.type]++
  })
  
  return {
    day,
    activities: dayActivities,
    totalCount: dayActivities.length,
    acteCounts
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

/**
 * Obtient le libellé d'un type d'acte
 * @param type - Type d'acte
 * @returns Libellé du type
 */
export function getActeTypeLabel(type: SanteIndActeType): string {
  return type
}

/**
 * Obtient le libellé d'une compagnie
 * @param compagnie - Compagnie
 * @returns Libellé de la compagnie
 */
export function getCompagnieLabel(compagnie: CompagnieType): string {
  return compagnie
}

/**
 * Obtient la couleur associée à un type d'acte
 * @param type - Type d'acte
 * @returns Couleur CSS
 */
export function getActeTypeColor(type: SanteIndActeType): string {
  const colors = {
    [SanteIndActeType.AFFAIRE_NOUVELLE]: 'bg-green-100 text-green-800',
    [SanteIndActeType.REVISION]: 'bg-blue-100 text-blue-800',
    [SanteIndActeType.ADHESION_GROUPE]: 'bg-purple-100 text-purple-800',
    [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 'bg-orange-100 text-orange-800',
    [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 'bg-red-100 text-red-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

/**
 * Obtient l'icône associée à un type d'acte
 * @param type - Type d'acte
 * @returns Nom de l'icône
 */
export function getActeTypeIcon(type: SanteIndActeType): string {
  const icons = {
    [SanteIndActeType.AFFAIRE_NOUVELLE]: 'plus-circle',
    [SanteIndActeType.REVISION]: 'edit',
    [SanteIndActeType.ADHESION_GROUPE]: 'users',
    [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 'arrow-right',
    [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 'arrow-left'
  }
  return icons[type] || 'circle'
}
