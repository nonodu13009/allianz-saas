// Types pour le module CDC Santé Individuelle
// Basé sur les spécifications du CDC Santé Individuelle

// Types d'actes commerciaux Santé Individuelle
export enum SanteIndActeType {
  AFFAIRE_NOUVELLE = 'Affaire nouvelle',
  REVISION = 'Révision',
  ADHESION_GROUPE = 'Adhésion groupe',
  COURTAGE_VERS_ALLIANZ = 'Courtage → Allianz',
  ALLIANZ_VERS_COURTAGE = 'Allianz → Courtage'
}

// Types de compagnies pour les Affaires Nouvelles
export enum CompagnieType {
  ALLIANZ = 'Allianz',
  COURTAGE = 'Courtage'
}

// Interface pour une activité Santé Individuelle
export interface SanteIndActivity {
  id: string
  userId: string
  type: SanteIndActeType
  clientName: string
  contractNumber: string
  dateEffet: string // ISO date string
  ca: number // Entier en euros
  caPondere: number // Calculé automatiquement selon grille
  dateSaisie: string // ISO date string
  yearMonth: string // Format: YYYY-MM
  
  // Champs spécifiques aux Affaires Nouvelles
  compagnie?: CompagnieType
  
  // Métadonnées
  createdAt: string
  updatedAt: string
}

// Interface pour le verrouillage mensuel
export interface SanteIndLock {
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
export interface SanteIndKPI {
  yearMonth: string // Format: YYYY-MM
  userId: string
  
  // Compteurs par type d'acte
  nombreAffairesNouvelles: number
  nombreRevisions: number
  nombreAdhesionsGroupe: number
  nombreCourtageVersAllianz: number
  nombreAllianzVersCourtage: number
  
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
export interface SanteIndFilter {
  type: 'all' | SanteIndActeType
  day?: number // Pour filtrer par jour du mois
  compagnie?: CompagnieType // Pour filtrer par compagnie
}

// Interface pour la navigation mensuelle
export interface SanteIndMonthNavigation {
  currentYear: number
  currentMonth: number // 1-12
  currentYearMonth: string // Format: YYYY-MM
  canGoPrevious: boolean
  canGoNext: boolean
}

// Interface pour les données de la timeline
export interface SanteIndTimelineData {
  day: number
  totalActivities: number
  acteCounts: Record<SanteIndActeType, number>
  hasData: boolean
}

// Interface pour les statistiques d'un jour
export interface SanteIndDayStats {
  day: number
  activities: SanteIndActivity[]
  totalCount: number
  acteCounts: Record<SanteIndActeType, number>
}

// Grille de pondération par type d'acte
export const PONDERATION_RATES: Record<SanteIndActeType, number> = {
  [SanteIndActeType.AFFAIRE_NOUVELLE]: 1.00, // 100%
  [SanteIndActeType.REVISION]: 0.50, // 50%
  [SanteIndActeType.ADHESION_GROUPE]: 0.50, // 50%
  [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: 0.75, // 75%
  [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: 0.50 // 50%
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
export interface SanteIndValidationError {
  field: string
  message: string
  code: string
}

// Interface pour les réponses API
export interface SanteIndResponse<T> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: SanteIndValidationError[]
}

// Interface pour les paramètres de requête
export interface SanteIndQueryParams {
  yearMonth?: string
  userId?: string
  type?: SanteIndActeType
  compagnie?: CompagnieType
  day?: number
  limit?: number
  offset?: number
}

// Interface pour les statistiques de performance
export interface SanteIndPerformanceStats {
  totalActivities: number
  totalProductionBrute: number
  totalProductionPondere: number
  totalCommissions: number
  averagePerDay: number
  bestDay: number
  bestDayCount: number
}

// Interface pour les objectifs mensuels
export interface SanteIndMonthlyGoals {
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
export interface SanteIndNotification {
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
export interface SanteIndPreferences {
  userId: string
  defaultCompagnie?: CompagnieType
  autoSave: boolean
  notificationsEnabled: boolean
  theme: 'light' | 'dark' | 'auto'
  createdAt: string
  updatedAt: string
}

// Interface pour les exports
export interface SanteIndExport {
  yearMonth: string
  userId: string
  format: 'csv' | 'excel' | 'pdf'
  data: SanteIndActivity[]
  kpis: SanteIndKPI
  generatedAt: string
  fileSize: number
  downloadUrl: string
}

// Interface pour les audits
export interface SanteIndAudit {
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
export interface SanteIndReport {
  id: string
  yearMonth: string
  userId: string
  type: 'monthly' | 'weekly' | 'daily'
  data: {
    activities: SanteIndActivity[]
    kpis: SanteIndKPI
    timeline: SanteIndTimelineData[]
    stats: SanteIndPerformanceStats
  }
  generatedAt: string
  expiresAt: string
}

// Interface pour les données de la modale
export interface SanteIndModalData {
  type: SanteIndActeType
  clientName: string
  contractNumber: string
  dateEffet: string
  ca: number
  compagnie?: CompagnieType // Seulement pour Affaire nouvelle
}

// Interface pour les données de la table
export interface SanteIndTableData {
  activities: SanteIndActivity[]
  isLoading: boolean
  error?: string
  isLocked: boolean
  lockDate?: string
}

// Interface pour les données du dashboard
export interface SanteIndDashboardData {
  currentMonth: SanteIndMonthNavigation
  kpis: SanteIndKPI
  tableData: SanteIndTableData
  timelineData: SanteIndTimelineData[]
  filters: SanteIndFilter
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
  repartitionParType: Record<SanteIndActeType, {
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
export interface SanteIndSyncData {
  lastSync: string
  pendingChanges: number
  isOnline: boolean
  hasError: boolean
  errorMessage?: string
}

// Interface pour les paramètres de configuration
export interface SanteIndConfig {
  version: string
  minRevisionsForQuality: number
  defaultCurrency: string
  dateFormat: string
  timeFormat: string
  autoSaveInterval: number
  maxRetries: number
}
