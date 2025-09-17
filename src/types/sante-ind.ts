/**
 * Types et interfaces pour le module CDC Santé Individuelle
 * Basé sur les spécifications de docs/cdc_sante_ind.md
 */

// ============================================================================
// TYPES D'ACTES COMMERCIAUX
// ============================================================================

export type ActeType = 
  | 'affaire_nouvelle'
  | 'revision'
  | 'adhesion_groupe'
  | 'courtage_vers_allianz'
  | 'allianz_vers_courtage'

export type Compagnie = 'Allianz' | 'Courtage'

// ============================================================================
// INTERFACE PRINCIPALE - ACTIVITÉ SANTÉ INDIVIDUELLE
// ============================================================================

export interface SanteIndActivity {
  // Identifiants
  id: string
  userId: string
  yearMonth: string // Format: "2025-09"
  
  // Données de l'activité
  dateSaisie: string // ISO date string
  natureActe: ActeType
  nomClient: string // Capitalisé automatiquement
  numeroContrat: string
  dateEffet: string // ISO date string
  ca: number // Entier en euros
  caPondere: number // Calculé automatiquement selon grille
  
  // Champs conditionnels
  compagnie?: Compagnie // Requis si natureActe === 'affaire_nouvelle'
  
  // Métadonnées Firebase
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

// ============================================================================
// GRILLE DE PONDÉRATION (CA → CA PONDÉRÉ)
// ============================================================================

export const CA_PONDERE_RATES: Record<ActeType, number> = {
  affaire_nouvelle: 1.00,      // 100%
  revision: 0.50,              // 50%
  adhesion_groupe: 0.50,       // 50%
  courtage_vers_allianz: 0.75, // 75%
  allianz_vers_courtage: 0.50  // 50%
} as const

// ============================================================================
// SEUILS DE COMMISSION (TABLEAU PROGRESSIF)
// ============================================================================

export interface CommissionThreshold {
  min: number // Montant minimum (inclus)
  max?: number // Montant maximum (exclus, undefined pour "et plus")
  rate: number // Taux de commission (0.00 à 0.06)
}

export const COMMISSION_THRESHOLDS: CommissionThreshold[] = [
  { min: 0, max: 10000, rate: 0.00 },      // < 10 000 € → 0%
  { min: 10000, max: 14000, rate: 0.02 },  // 10 000 - 13 999 € → 2%
  { min: 14000, max: 18000, rate: 0.03 },  // 14 000 - 17 999 € → 3%
  { min: 18000, max: 22000, rate: 0.04 },  // 18 000 - 21 999 € → 4%
  { min: 22000, rate: 0.06 }               // ≥ 22 000 € → 6%
] as const

// ============================================================================
// KPIs MENSUELS
// ============================================================================

export interface KPIMensuel {
  // Production
  productionBrute: number // Somme des CA du mois
  productionPondere: number // Somme des CA pondéré du mois
  
  // Commission
  tauxCommission: number // Taux applicable (0/2/3/4/6%)
  commissionEstimee: number // Calculée sur la production pondérée
  
  // Volumes par type d'acte
  volumes: {
    affaire_nouvelle: number
    revision: number
    adhesion_groupe: number
    courtage_vers_allianz: number
    allianz_vers_courtage: number
  }
  
  // Critère qualitatif
  nombreRevisions: number
  minimumRevisionsAtteint: boolean // >= 4 révisions
}

// ============================================================================
// STATISTIQUES DE PRODUCTION
// ============================================================================

export interface ProductionStats {
  totalActivites: number
  totalCA: number
  totalCAPondere: number
  moyenneCA: number
  moyenneCAPondere: number
  premierActe?: string // Date du premier acte du mois
  dernierActe?: string // Date du dernier acte du mois
}

// ============================================================================
// SYSTÈME DE VERROUILLAGE
// ============================================================================

export interface SanteIndLock {
  id: string
  userId: string
  yearMonth: string // Format: "2025-09"
  isLocked: boolean
  lockedBy: string // Admin user ID
  lockedAt: string // ISO timestamp
  reason?: string // Raison du verrouillage
}

export type LockStatus = 'unlocked' | 'locked' | 'unknown'

// ============================================================================
// FILTRES ET TRI
// ============================================================================

export interface SanteIndFilter {
  natureActe?: ActeType
  compagnie?: Compagnie
  dateDebut?: string // ISO date
  dateFin?: string // ISO date
  nomClient?: string // Recherche partielle
}

export type SanteIndSortField = 
  | 'dateSaisie'
  | 'nomClient'
  | 'natureActe'
  | 'numeroContrat'
  | 'dateEffet'
  | 'ca'
  | 'caPondere'
  | 'compagnie'

export type SortDirection = 'asc' | 'desc'

export interface SanteIndSort {
  field: SanteIndSortField
  direction: SortDirection
}

// ============================================================================
// FORMULAIRES ET VALIDATION
// ============================================================================

export interface SanteIndActivityForm {
  natureActe: ActeType
  nomClient: string
  numeroContrat: string
  dateEffet: string
  ca: number
  compagnie?: Compagnie
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// ============================================================================
// NAVIGATION MENSUELLE
// ============================================================================

export interface MonthNavigation {
  currentYear: number
  currentMonth: number // 1-12
  currentYearMonth: string // "2025-09"
  canGoPrevious: boolean
  canGoNext: boolean
  isCurrentMonth: boolean
}

// ============================================================================
// ÉTATS D'INTERFACE
// ============================================================================

export interface SanteIndUIState {
  isLoading: boolean
  isSaving: boolean
  isDeleting: boolean
  error?: string
  successMessage?: string
}

export interface ModalState {
  isOpen: boolean
  type: ActeType | null
  activityId?: string // Pour édition
}

// ============================================================================
// RÉPONSES API
// ============================================================================

export interface SanteIndApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SanteIndActivitiesResponse {
  activities: SanteIndActivity[]
  totalCount: number
  hasMore: boolean
  lockStatus: LockStatus
}

// ============================================================================
// UTILITAIRES DE TYPE
// ============================================================================

export type SanteIndActivityCreate = Omit<SanteIndActivity, 'id' | 'createdAt' | 'updatedAt' | 'caPondere'>
export type SanteIndActivityUpdate = Partial<Pick<SanteIndActivity, 'nomClient' | 'numeroContrat' | 'dateEffet' | 'ca' | 'compagnie'>>

// ============================================================================
// CONSTANTES
// ============================================================================

export const ACTE_TYPE_LABELS: Record<ActeType, string> = {
  affaire_nouvelle: 'Affaire nouvelle',
  revision: 'Révision',
  adhesion_groupe: 'Adhésion groupe',
  courtage_vers_allianz: 'Courtage → Allianz',
  allianz_vers_courtage: 'Allianz → Courtage'
} as const

export const COMPAGNIE_LABELS: Record<Compagnie, string> = {
  Allianz: 'Allianz',
  Courtage: 'Courtage'
} as const

export const MINIMUM_REVISIONS_REQUIRED = 4

// ============================================================================
// TYPES POUR LES TESTS
// ============================================================================

export interface SanteIndTestData {
  activities: SanteIndActivity[]
  locks: SanteIndLock[]
  expectedKPIs: KPIMensuel
  expectedStats: ProductionStats
}
