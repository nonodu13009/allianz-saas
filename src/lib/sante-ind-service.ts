/**
 * Service CDC Santé Individuelle - Logique métier centralisée
 * Basé sur les spécifications de docs/cdc_sante_ind.md
 */

import {
  ActeType,
  Compagnie,
  SanteIndActivity,
  SanteIndActivityCreate,
  SanteIndActivityUpdate,
  CA_PONDERE_RATES,
  COMMISSION_THRESHOLDS,
  KPIMensuel,
  ProductionStats,
  SanteIndLock,
  LockStatus,
  SanteIndFilter,
  SanteIndSort,
  ValidationResult,
  ValidationError,
  MonthNavigation,
  MINIMUM_REVISIONS_REQUIRED
} from '../types/sante-ind'

// ============================================================================
// CALCULS MÉTIER - CA PONDÉRÉ
// ============================================================================

/**
 * Calcule le CA pondéré selon la grille de pondération
 * @param acteType Type d'acte commercial
 * @param ca CA brut en euros (entier)
 * @returns CA pondéré arrondi en euros
 */
export function calculateCAPondere(acteType: ActeType, ca: number): number {
  if (ca < 0 || !Number.isInteger(ca)) {
    throw new Error('CA doit être un entier positif')
  }
  
  const taux = CA_PONDERE_RATES[acteType]
  if (taux === undefined) {
    throw new Error(`Type d'acte non reconnu: ${acteType}`)
  }
  
  return roundToEuro(ca * taux)
}

/**
 * Arrondit un montant à l'euro près
 * @param amount Montant à arrondir
 * @returns Montant arrondi en euros
 */
export function roundToEuro(amount: number): number {
  return Math.round(amount)
}

// ============================================================================
// CALCULS MÉTIER - COMMISSIONS
// ============================================================================

/**
 * Détermine le taux de commission applicable selon le CA pondéré total
 * @param caPondereTotal CA pondéré total du mois
 * @returns Taux de commission (0.00 à 0.06)
 */
export function getCommissionRate(caPondereTotal: number): number {
  if (caPondereTotal < 0) {
    throw new Error('CA pondéré ne peut pas être négatif')
  }
  
  // Trouver le seuil applicable (le plus élevé dont le minimum est <= caPondereTotal)
  let applicableRate = 0.00
  
  for (const threshold of COMMISSION_THRESHOLDS) {
    if (caPondereTotal >= threshold.min) {
      if (threshold.max === undefined || caPondereTotal < threshold.max) {
        applicableRate = threshold.rate
      }
    }
  }
  
  return applicableRate
}

/**
 * Calcule la commission estimée
 * @param caPondereTotal CA pondéré total du mois
 * @returns Commission estimée en euros
 */
export function calculateCommission(caPondereTotal: number): number {
  const rate = getCommissionRate(caPondereTotal)
  return roundToEuro(caPondereTotal * rate)
}

/**
 * Obtient la description du seuil de commission
 * @param caPondereTotal CA pondéré total du mois
 * @returns Description du seuil
 */
export function getCommissionThresholdDescription(caPondereTotal: number): string {
  const rate = getCommissionRate(caPondereTotal)
  const percentage = Math.round(rate * 100)
  
  // Trouver le seuil correspondant
  for (const threshold of COMMISSION_THRESHOLDS) {
    if (caPondereTotal >= threshold.min) {
      if (threshold.max === undefined || caPondereTotal < threshold.max) {
        if (threshold.max === undefined) {
          return `≥ ${threshold.min.toLocaleString()} € → ${percentage}%`
        } else {
          return `${threshold.min.toLocaleString()} - ${(threshold.max - 1).toLocaleString()} € → ${percentage}%`
        }
      }
    }
  }
  
  return `0 - ${(COMMISSION_THRESHOLDS[0].max! - 1).toLocaleString()} € → 0%`
}

// ============================================================================
// KPIs MENSUELS
// ============================================================================

/**
 * Calcule les KPIs mensuels à partir des activités
 * @param activities Liste des activités du mois
 * @returns KPIs mensuels calculés
 */
export function calculateKPIMensuel(activities: SanteIndActivity[]): KPIMensuel {
  if (!activities || activities.length === 0) {
    return {
      productionBrute: 0,
      productionPondere: 0,
      tauxCommission: 0,
      commissionEstimee: 0,
      volumes: {
        affaire_nouvelle: 0,
        revision: 0,
        adhesion_groupe: 0,
        courtage_vers_allianz: 0,
        allianz_vers_courtage: 0
      },
      nombreRevisions: 0,
      minimumRevisionsAtteint: false
    }
  }
  
  // Calculs de base
  const productionBrute = activities.reduce((sum, activity) => sum + activity.ca, 0)
  const productionPondere = activities.reduce((sum, activity) => sum + activity.caPondere, 0)
  
  // Taux de commission et commission estimée
  const tauxCommission = getCommissionRate(productionPondere)
  const commissionEstimee = calculateCommission(productionPondere)
  
  // Volumes par type d'acte
  const volumes = {
    affaire_nouvelle: activities.filter(a => a.natureActe === 'affaire_nouvelle').length,
    revision: activities.filter(a => a.natureActe === 'revision').length,
    adhesion_groupe: activities.filter(a => a.natureActe === 'adhesion_groupe').length,
    courtage_vers_allianz: activities.filter(a => a.natureActe === 'courtage_vers_allianz').length,
    allianz_vers_courtage: activities.filter(a => a.natureActe === 'allianz_vers_courtage').length
  }
  
  // Critère qualitatif
  const nombreRevisions = volumes.revision
  const minimumRevisionsAtteint = nombreRevisions >= MINIMUM_REVISIONS_REQUIRED
  
  return {
    productionBrute,
    productionPondere,
    tauxCommission,
    commissionEstimee,
    volumes,
    nombreRevisions,
    minimumRevisionsAtteint
  }
}

/**
 * Calcule les statistiques de production
 * @param activities Liste des activités du mois
 * @returns Statistiques de production
 */
export function calculateProductionStats(activities: SanteIndActivity[]): ProductionStats {
  if (!activities || activities.length === 0) {
    return {
      totalActivites: 0,
      totalCA: 0,
      totalCAPondere: 0,
      moyenneCA: 0,
      moyenneCAPondere: 0
    }
  }
  
  const totalActivites = activities.length
  const totalCA = activities.reduce((sum, activity) => sum + activity.ca, 0)
  const totalCAPondere = activities.reduce((sum, activity) => sum + activity.caPondere, 0)
  const moyenneCA = roundToEuro(totalCA / totalActivites)
  const moyenneCAPondere = roundToEuro(totalCAPondere / totalActivites)
  
  // Dates du premier et dernier acte
  const dates = activities.map(a => new Date(a.dateSaisie)).sort((a, b) => a.getTime() - b.getTime())
  const premierActe = dates.length > 0 ? dates[0].toISOString() : undefined
  const dernierActe = dates.length > 0 ? dates[dates.length - 1].toISOString() : undefined
  
  return {
    totalActivites,
    totalCA,
    totalCAPondere,
    moyenneCA,
    moyenneCAPondere,
    premierActe,
    dernierActe
  }
}

// ============================================================================
// VALIDATION DES DONNÉES
// ============================================================================

/**
 * Valide une activité Santé Individuelle
 * @param activity Activité à valider
 * @returns Résultat de validation
 */
export function validateSanteIndActivity(activity: Partial<SanteIndActivity>): ValidationResult {
  const errors: ValidationError[] = []
  
  // Validation des champs obligatoires
  if (!activity.natureActe) {
    errors.push({ field: 'natureActe', message: 'La nature de l\'acte est obligatoire' })
  }
  
  if (!activity.nomClient || activity.nomClient.trim().length === 0) {
    errors.push({ field: 'nomClient', message: 'Le nom du client est obligatoire' })
  }
  
  if (!activity.numeroContrat || activity.numeroContrat.trim().length === 0) {
    errors.push({ field: 'numeroContrat', message: 'Le numéro de contrat est obligatoire' })
  }
  
  if (!activity.dateEffet) {
    errors.push({ field: 'dateEffet', message: 'La date d\'effet est obligatoire' })
  }
  
  if (activity.ca === undefined || activity.ca === null) {
    errors.push({ field: 'ca', message: 'Le CA est obligatoire' })
  }
  
  // Validation du CA
  if (activity.ca !== undefined && activity.ca !== null) {
    if (!Number.isInteger(activity.ca)) {
      errors.push({ field: 'ca', message: 'Le CA doit être un entier en euros' })
    }
    if (activity.ca < 0) {
      errors.push({ field: 'ca', message: 'Le CA ne peut pas être négatif' })
    }
    if (activity.ca > 1000000) {
      errors.push({ field: 'ca', message: 'Le CA ne peut pas dépasser 1 000 000 €' })
    }
  }
  
  // Validation de la compagnie pour "Affaire nouvelle"
  if (activity.natureActe === 'affaire_nouvelle') {
    if (!activity.compagnie) {
      errors.push({ field: 'compagnie', message: 'La compagnie est obligatoire pour une affaire nouvelle' })
    } else if (!['Allianz', 'Courtage'].includes(activity.compagnie)) {
      errors.push({ field: 'compagnie', message: 'La compagnie doit être Allianz ou Courtage' })
    }
  }
  
  // Validation des dates
  if (activity.dateEffet && activity.dateSaisie) {
    const dateEffet = new Date(activity.dateEffet)
    const dateSaisie = new Date(activity.dateSaisie)
    
    if (isNaN(dateEffet.getTime())) {
      errors.push({ field: 'dateEffet', message: 'La date d\'effet n\'est pas valide' })
    }
    
    if (isNaN(dateSaisie.getTime())) {
      errors.push({ field: 'dateSaisie', message: 'La date de saisie n\'est pas valide' })
    }
    
    // Date d'effet ne peut pas être dans le futur par rapport à la date de saisie
    if (!isNaN(dateEffet.getTime()) && !isNaN(dateSaisie.getTime()) && dateEffet > dateSaisie) {
      errors.push({ field: 'dateEffet', message: 'La date d\'effet ne peut pas être postérieure à la date de saisie' })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valide un formulaire d'activité
 * @param form Formulaire à valider
 * @returns Résultat de validation
 */
export function validateSanteIndActivityForm(form: Partial<SanteIndActivityCreate>): ValidationResult {
  // Convertir le formulaire en activité partielle pour la validation
  const activity: Partial<SanteIndActivity> = {
    ...form,
    dateSaisie: new Date().toISOString(), // Date de saisie automatique
    caPondere: form.ca && form.natureActe ? calculateCAPondere(form.natureActe, form.ca) : undefined
  }
  
  return validateSanteIndActivity(activity)
}

// ============================================================================
// CAPITALISATION DES NOMS
// ============================================================================

/**
 * Capitalise intelligemment un nom de client
 * Gère les prénoms composés et les apostrophes
 * @param name Nom à capitaliser
 * @returns Nom capitalisé
 */
export function capitalizeClientName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }
  
  return name
    .trim()
    .split(' ')
    .map(word => {
      if (!word) return word
      
      // Gérer les prénoms composés (Jean-Michel)
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => capitalizeWord(part))
          .join('-')
      }
      
      // Gérer les apostrophes (d'Arc)
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part, index) => index === 0 ? capitalizeWord(part) : part.toLowerCase())
          .join("'")
      }
      
      return capitalizeWord(word)
    })
    .join(' ')
}

/**
 * Capitalise un mot (première lettre en majuscule, reste en minuscule)
 * @param word Mot à capitaliser
 * @returns Mot capitalisé
 */
function capitalizeWord(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

// ============================================================================
// FILTRAGE ET TRI
// ============================================================================

/**
 * Filtre les activités selon les critères
 * @param activities Liste des activités
 * @param filter Critères de filtrage
 * @returns Activités filtrées
 */
export function filterActivities(
  activities: SanteIndActivity[],
  filter: SanteIndFilter
): SanteIndActivity[] {
  return activities.filter(activity => {
    // Filtre par type d'acte
    if (filter.natureActe && activity.natureActe !== filter.natureActe) {
      return false
    }
    
    // Filtre par compagnie
    if (filter.compagnie && activity.compagnie !== filter.compagnie) {
      return false
    }
    
    // Filtre par nom de client (recherche partielle insensible à la casse)
    if (filter.nomClient) {
      const searchTerm = filter.nomClient.toLowerCase()
      const clientName = activity.nomClient.toLowerCase()
      if (!clientName.includes(searchTerm)) {
        return false
      }
    }
    
    // Filtre par dates
    if (filter.dateDebut) {
      const activityDate = new Date(activity.dateSaisie)
      const debutDate = new Date(filter.dateDebut)
      if (activityDate < debutDate) {
        return false
      }
    }
    
    if (filter.dateFin) {
      const activityDate = new Date(activity.dateSaisie)
      const finDate = new Date(filter.dateFin)
      if (activityDate > finDate) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Trie les activités selon les critères
 * @param activities Liste des activités
 * @param sort Critères de tri
 * @returns Activités triées
 */
export function sortActivities(
  activities: SanteIndActivity[],
  sort: SanteIndSort
): SanteIndActivity[] {
  return [...activities].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sort.field) {
      case 'dateSaisie':
        aValue = new Date(a.dateSaisie).getTime()
        bValue = new Date(b.dateSaisie).getTime()
        break
      case 'dateEffet':
        aValue = new Date(a.dateEffet).getTime()
        bValue = new Date(b.dateEffet).getTime()
        break
      case 'nomClient':
        aValue = a.nomClient.toLowerCase()
        bValue = b.nomClient.toLowerCase()
        break
      case 'numeroContrat':
        aValue = a.numeroContrat.toLowerCase()
        bValue = b.numeroContrat.toLowerCase()
        break
      case 'natureActe':
        aValue = a.natureActe
        bValue = b.natureActe
        break
      case 'ca':
        aValue = a.ca
        bValue = b.ca
        break
      case 'caPondere':
        aValue = a.caPondere
        bValue = b.caPondere
        break
      case 'compagnie':
        aValue = a.compagnie || ''
        bValue = b.compagnie || ''
        break
      default:
        return 0
    }
    
    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1
    }
    return 0
  })
}

// ============================================================================
// NAVIGATION MENSUELLE
// ============================================================================

/**
 * Crée un objet de navigation mensuelle
 * @param year Année
 * @param month Mois (1-12)
 * @returns Objet de navigation mensuelle
 */
export function createMonthNavigation(year: number, month: number): MonthNavigation {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
  const isCurrentMonth = year === currentYear && month === currentMonth
  
  // Limites de navigation (pas plus de 2 ans dans le passé, pas dans le futur)
  const minYear = currentYear - 2
  const canGoPrevious = year > minYear || (year === minYear && month > 1)
  const canGoNext = year < currentYear || (year === currentYear && month < currentMonth)
  
  return {
    currentYear: year,
    currentMonth: month,
    currentYearMonth: yearMonth,
    canGoPrevious,
    canGoNext,
    isCurrentMonth
  }
}

/**
 * Navigue vers le mois précédent
 * @param year Année actuelle
 * @param month Mois actuel (1-12)
 * @returns Nouvelle navigation mensuelle
 */
export function navigateToPreviousMonth(year: number, month: number): MonthNavigation {
  let newYear = year
  let newMonth = month - 1
  
  if (newMonth < 1) {
    newMonth = 12
    newYear = year - 1
  }
  
  return createMonthNavigation(newYear, newMonth)
}

/**
 * Navigue vers le mois suivant
 * @param year Année actuelle
 * @param month Mois actuel (1-12)
 * @returns Nouvelle navigation mensuelle
 */
export function navigateToNextMonth(year: number, month: number): MonthNavigation {
  let newYear = year
  let newMonth = month + 1
  
  if (newMonth > 12) {
    newMonth = 1
    newYear = year + 1
  }
  
  return createMonthNavigation(newYear, newMonth)
}

// ============================================================================
// UTILITAIRES DE FORMATAGE
// ============================================================================

/**
 * Formate un montant en euros
 * @param amount Montant en euros
 * @returns Montant formaté (ex: "1 234 €")
 */
export function formatEuro(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} €`
}

/**
 * Formate un montant en euros (entier)
 * @param amount Montant en euros
 * @returns Montant formaté (ex: "1 234 €")
 */
export function formatEuroInt(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error('Le montant doit être un entier')
  }
  return `${amount.toLocaleString('fr-FR')} €`
}

/**
 * Formate un pourcentage
 * @param rate Taux (0.00 à 1.00)
 * @returns Pourcentage formaté (ex: "3 %")
 */
export function formatPercentage(rate: number): string {
  const percentage = Math.round(rate * 100)
  return `${percentage} %`
}

/**
 * Formate une date courte
 * @param dateString Date ISO
 * @returns Date formatée (ex: "17/09/2025")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Date invalide'
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formate une date complète
 * @param dateString Date ISO
 * @returns Date formatée (ex: "17 septembre 2025")
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Date invalide'
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// ============================================================================
// EXPORT DU SERVICE PRINCIPAL
// ============================================================================

export const santeIndService = {
  // Calculs métier
  calculateCAPondere,
  roundToEuro,
  getCommissionRate,
  calculateCommission,
  getCommissionThresholdDescription,
  
  // KPIs
  calculateKPIMensuel,
  calculateProductionStats,
  
  // Validation
  validateSanteIndActivity,
  validateSanteIndActivityForm,
  
  // Capitalisation
  capitalizeClientName,
  
  // Filtrage et tri
  filterActivities,
  sortActivities,
  
  // Navigation
  createMonthNavigation,
  navigateToPreviousMonth,
  navigateToNextMonth,
  
  // Formatage
  formatEuro,
  formatEuroInt,
  formatPercentage,
  formatDateShort,
  formatDateLong
} as const
