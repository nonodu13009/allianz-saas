// Types pour le module CDC Santé Collective
// Basé sur les spécifications du CDC Santé Collective

// Types d'actes commerciaux Santé Collective (10 types)
export enum SanteCollActeType {
  AN_COLLECTIVE_SANTE = 'AN Collective en Santé',
  AN_COLLECTIVE_PREVOYANCE = 'AN Collective en Prévoyance',
  AN_COLLECTIVE_RETRAITE = 'AN Collective en Retraite',
  AN_INDIVIDUELLE_SANTE = 'AN Individuelle en Santé',
  AN_INDIVIDUELLE_PREVOYANCE = 'AN Individuelle en Prévoyance',
  AN_INDIVIDUELLE_RETRAITE = 'AN Individuelle en Retraite',
  ADHESION_RENFORT_COLLECTIVE = 'Adhésion/Renfort en Collective',
  REVISION_COLLECTIVE = 'Révision Collective',
  COURTAGE_VERS_ALLIANZ = 'Courtage → Allianz',
  ALLIANZ_VERS_COURTAGE = 'Allianz → Courtage'
}

// Types d'origines pour les activités (3 types)
export enum SanteCollOrigine {
  PROSPECTION = 'Prospection',
  REACTIF = 'Réactif',
  PROACTIF = 'Proactif'
}

// Types de compagnies pour les Affaires Nouvelles
export enum CompagnieType {
  ALLIANZ = 'Allianz',
  UNIM_UNICED = 'Unim/Uniced',
  COURTAGE = 'Courtage'
}

// Interface pour une activité Santé Collective
export interface SanteCollActivity {
  id: string
  userId: string
  type: SanteCollActeType
  clientName: string
  contractNumber: string
  dateEffet: string // ISO date string
  ca: number // Entier en euros
  caPondere: number // Calculé automatiquement selon grille
  dateSaisie: string // ISO date string
  yearMonth: string // Format: YYYY-MM
  
  // Champs spécifiques aux Affaires Nouvelles
  compagnie?: CompagnieType
  origine?: SanteCollOrigine
  
  // Métadonnées
  createdAt: string
  updatedAt: string
}

// Interface pour le verrouillage mensuel
export interface SanteCollLock {
  id: string // Format: {userId}_{yearMonth}
  userId: string
  yearMonth: string // Format: YYYY-MM
  isLocked: boolean
  lockedAt?: string // ISO date string
  lockedBy?: string // ID de l'administrateur qui a verrouillé
  createdAt: string
  updatedAt: string
}

// Interface pour les KPIs mensuels
export interface SanteCollKPI {
  yearMonth: string // Format: YYYY-MM
  userId: string
  
  // Compteurs par type d'acte
  nombreAffairesNouvelles: number
  nombreRevisions: number
  nombreAdhesionsGroupe: number
  nombreTransfertsCourtage: number
  nombreResiliations: number
  nombreModificationsContrat: number
  nombreRenouvellements: number
  nombreExtensionsGarantie: number
  nombreChangementsTarif: number
  nombreAutresActes: number
  
  // Montants
  productionBrute: number // Somme des CA
  productionPondere: number // Somme des CA pondérés
  
  // Commission
  tauxCommission: number // 0, 2, 3, 4, ou 6%
  commissionEstimee: number // Calculée selon seuils
  
  // Critère qualitatif
  critereQualitatifAtteint: boolean // Minimum 4 révisions
  
  // Métadonnées
  calculatedAt: string
  updatedAt: string
}

// Interface pour les filtres
export interface SanteCollFilter {
  type: 'all' | SanteCollActeType
  origine?: SanteCollOrigine
  compagnie?: CompagnieType
  day?: number // Pour filtrer par jour du mois
}

// Interface pour la navigation mensuelle
export interface SanteCollMonthNavigation {
  currentYear: number
  currentMonth: number // 1-12
  currentYearMonth: string // Format: YYYY-MM
  canGoPrevious: boolean
  canGoNext: boolean
}

// Interface pour les données de la timeline
export interface SanteCollTimelineData {
  day: number
  totalActivities: number
  acteCounts: Record<SanteCollActeType, number>
  hasData: boolean
}

// Interface pour les statistiques d'un jour
export interface SanteCollDayStats {
  day: number
  activities: SanteCollActivity[]
  totalCount: number
  acteCounts: Record<SanteCollActeType, number>
}

// Grille de pondération par type d'acte
export const PONDERATION_RATES: Record<SanteCollActeType, number> = {
  [SanteCollActeType.AN_COLLECTIVE_SANTE]: 1.00,           // COLL AN SANTE
  [SanteCollActeType.AN_COLLECTIVE_PREVOYANCE]: 1.00,      // COLL AN PCE
  [SanteCollActeType.AN_COLLECTIVE_RETRAITE]: 1.00,        // COLL AN RETRAITE
  [SanteCollActeType.AN_INDIVIDUELLE_SANTE]: 1.00,          // IND AN SANTE
  [SanteCollActeType.AN_INDIVIDUELLE_PREVOYANCE]: 1.00,    // IND AN PCE
  [SanteCollActeType.AN_INDIVIDUELLE_RETRAITE]: 1.00,      // IND AN VIE & RETRAITE
  [SanteCollActeType.ADHESION_RENFORT_COLLECTIVE]: 0.50,    // COLL ADHESION + RENFORT
  [SanteCollActeType.REVISION_COLLECTIVE]: 0.75,           // REVISION GAMME ANCIENNE
  [SanteCollActeType.COURTAGE_VERS_ALLIANZ]: 0.75,         // COURTAGE->ALLIANZ
  [SanteCollActeType.ALLIANZ_VERS_COURTAGE]: 0.50          // ALLIANZ->COURTAGE
}

// Seuils de commission selon production pondérée
export interface CommissionSeuil {
  min: number
  max?: number // undefined pour le dernier seuil
  taux: number // Pourcentage (0, 2, 3, 4, 6)
}

export const COMMISSION_SEUILS: CommissionSeuil[] = [
  { min: 0, max: 9999, taux: 0 }, // < 10 000 € → 0%
  { min: 10000, max: 13999, taux: 2 }, // 10 000 - 13 999 € → 2%
  { min: 14000, max: 17999, taux: 3 }, // 14 000 - 17 999 € → 3%
  { min: 18000, max: 21999, taux: 4 }, // 18 000 - 21 999 € → 4%
  { min: 22000, taux: 6 } // ≥ 22 000 € → 6%
]

// Interface pour les erreurs de validation
export interface SanteCollValidationError {
  field: string
  message: string
  code: string
}

// Interface pour les réponses API
export interface SanteCollResponse<T> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: SanteCollValidationError[]
}

// Alias pour la compatibilité avec l'API
export type SanteCollApiResponse<T = any> = SanteCollResponse<T>

// Interface pour la création d'activité
export interface SanteCollActivityCreate extends Omit<SanteCollActivity, 'id' | 'createdAt' | 'updatedAt' | 'caPondere'> {
  caPondere?: number // Optionnel car calculé automatiquement
}

// Interface pour les paramètres de requête
export interface SanteCollQueryParams {
  yearMonth?: string
  userId?: string
  type?: SanteCollActeType
  origine?: SanteCollOrigine
  compagnie?: CompagnieType
  day?: number
  limit?: number
  offset?: number
}

// Interface pour les statistiques de performance
export interface SanteCollPerformanceStats {
  totalActivities: number
  totalProductionBrute: number
  totalProductionPondere: number
  totalCommissions: number
  averagePerDay: number
  bestDay: number
  bestDayCount: number
}

// Interface pour les objectifs mensuels
export interface SanteCollMonthlyGoals {
  yearMonth: string
  userId: string
  targetProductionBrute: number
  targetProductionPondere: number
  targetCommissions: number
  targetRevisions: number // Minimum 4
  createdAt: string
  updatedAt: string
}

// Interface pour les notifications
export interface SanteCollNotification {
  id: string
  userId: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  expiresAt?: string
}

// Interface pour les préférences utilisateur
export interface SanteCollPreferences {
  userId: string
  defaultCompagnie?: CompagnieType
  defaultOrigine?: SanteCollOrigine
  autoSave: boolean
  notificationsEnabled: boolean
  theme: 'light' | 'dark' | 'auto'
  createdAt: string
  updatedAt: string
}

// Interface pour les exports
export interface SanteCollExport {
  yearMonth: string
  userId: string
  format: 'csv' | 'excel' | 'pdf'
  data: SanteCollActivity[]
  kpis: SanteCollKPI
  generatedAt: string
  fileSize: number
  downloadUrl: string
}

// Interface pour les audits
export interface SanteCollAudit {
  id: string
  activityId: string
  action: 'create' | 'update' | 'delete'
  userId: string
  timestamp: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Interface pour les rapports
export interface SanteCollReport {
  id: string
  yearMonth: string
  userId: string
  type: 'monthly' | 'weekly' | 'daily'
  data: {
    activities: SanteCollActivity[]
    kpis: SanteCollKPI
    timeline: SanteCollTimelineData[]
    stats: SanteCollPerformanceStats
  }
  generatedAt: string
  expiresAt: string
}

// Interface pour les données de la modale
export interface SanteCollModalData {
  type: SanteCollActeType
  clientName: string
  contractNumber: string
  dateEffet: string
  ca: number
  compagnie?: CompagnieType // Seulement pour Affaire nouvelle
  origine?: SanteCollOrigine // Pour toutes les activités
}

// Interface pour les données de la table
export interface SanteCollTableData {
  activities: SanteCollActivity[]
  isLoading: boolean
  error?: string
  isLocked: boolean
  lockDate?: string
}

// Interface pour les données du dashboard
export interface SanteCollDashboardData {
  currentMonth: SanteCollMonthNavigation
  kpis: SanteCollKPI
  tableData: SanteCollTableData
  timelineData: SanteCollTimelineData[]
  filters: SanteCollFilter
}

// Interface pour les calculs de commission
export interface CommissionCalculation {
  productionPondere: number
  tauxApplicable: number
  commissionEstimee: number
  seuilAtteint: CommissionSeuil
  prochainSeuil?: CommissionSeuil
  ecartProchainSeuil?: number
}

// Interface pour les statistiques de production
export interface ProductionStats {
  totalBrute: number
  totalPondere: number
  moyenneParActe: number
  repartitionParType: Record<SanteCollActeType, {
    count: number
    brut: number
    pondere: number
    pourcentage: number
  }>
  repartitionParOrigine: Record<SanteCollOrigine, {
    count: number
    brut: number
    pondere: number
    pourcentage: number
  }>
  repartitionParCompagnie: Record<CompagnieType, {
    count: number
    brut: number
    pondere: number
    pourcentage: number
  }>
}

// Interface pour les alertes de critère qualitatif
export interface QualiteAlert {
  type: 'warning' | 'error' | 'success'
  message: string
  currentRevisions: number
  requiredRevisions: number
  isBlocking: boolean
}

// Interface pour les données de synchronisation
export interface SanteCollSyncData {
  lastSync: string
  pendingChanges: number
  isOnline: boolean
  hasError: boolean
  errorMessage?: string
}

// Interface pour les paramètres de configuration
export interface SanteCollConfig {
  version: string
  minRevisionsForQuality: number
  defaultCurrency: string
  dateFormat: string
  timeFormat: string
  autoSaveInterval: number
  maxRetries: number
}
