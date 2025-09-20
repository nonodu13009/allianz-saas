// Types pour le module CDC Commercial
// Basé sur les spécifications du CDC commercial

// Types d'activité CDC
export enum ActivityType {
  AN = 'AN', // Affaires Nouvelles
  M3 = 'M+3', // Process M+3
  PRETERME_AUTO = 'Préterme Auto', // Process Préterme Auto
  PRETERME_IRD = 'Préterme IRD' // Process Préterme IRD
}

// Types de produits pour les Affaires Nouvelles
export enum ProductType {
  AUTO_MOTO = 'AUTO/MOTO',
  IARD_PART_DIVERS = 'IARD PART DIVERS',
  IARD_PRO_DIVERS = 'IARD PRO DIVERS',
  PJ = 'PJ',
  GAV = 'GAV',
  SANTE_PREV = 'SANTE/PREV',
  NOP_50EUR = 'NOP 50EUR',
  EPARGNE_RETRAITE = 'EPARGNE/RETRAITE',
  PU_VL = 'PU / VL'
}

// Interface pour une activité CDC
export interface Activity {
  id: string
  userId: string
  type: ActivityType
  clientName: string
  comment?: string
  dateSaisie: string // ISO date string
  yearMonth: string // Format: YYYY-MM
  
  // Champs spécifiques aux Affaires Nouvelles
  productType?: ProductType
  contractNumber?: string
  dateEffet?: string // ISO date string
  primeAnnuelle?: number // Entier en euros
  versementLibre?: number // Entier en euros
  commissionPotentielle?: number // Calculé automatiquement
  
  // Métadonnées
  createdAt: string
  updatedAt: string
}

// Interface pour le verrouillage mensuel
export interface CDCLock {
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
export interface CDCKPI {
  yearMonth: string // Format: YYYY-MM
  userId: string
  
  // Compteurs
  nombreAffairesNouvelles: number
  nombreAutoMoto: number
  nombreAutres: number
  nombreProcess: number
  nombreM3: number
  nombrePretermeAuto: number
  nombrePretermeIrd: number
  
  // Montants
  caAffaireCumule: number // Entier en euros
  commissionsPotentielles: number // Entier en euros
  commissionsReelles: number // Entier en euros
  
  // Ratios
  ratio: number // Pourcentage (autres/AUTO/MOTO)
  
  // Métadonnées
  calculatedAt: string
  updatedAt: string
}

// Interface pour les filtres
export interface CDCFilter {
  type: 'all' | 'AN' | 'Process'
  product?: ProductType | ActivityType // Pour filtrer les AN par produit ou les Process par type
  day?: number // Pour filtrer par jour du mois
}

// Interface pour la navigation mensuelle
export interface MonthNavigation {
  currentYear: number
  currentMonth: number // 1-12
  currentYearMonth: string // Format: YYYY-MM
  canGoPrevious: boolean
  canGoNext: boolean
}

// Interface pour les données de la timeline
export interface TimelineData {
  day: number
  totalActivities: number
  anCount: number
  processCount: number
  hasData: boolean
}

// Interface pour les statistiques d'un jour
export interface DayStats {
  day: number
  activities: Activity[]
  totalCount: number
  anCount: number
  processCount: number
}

// Interface pour les barèmes de commission
export interface CommissionRate {
  productType: ProductType
  baseRate: number // Taux de base en euros
  isPercentage?: boolean // Si true, applique un pourcentage
  percentageRate?: number // Pourcentage (ex: 1 pour 1%)
  hasTranches?: boolean // Si true, applique des tranches
  trancheAmount?: number // Montant de chaque tranche (ex: 1000)
  trancheRate?: number // Taux par tranche (ex: 10)
}

// Configuration des barèmes de commission selon docs/cdc_commercial.md
export const COMMISSION_RATES: Record<ProductType, CommissionRate> = {
  [ProductType.AUTO_MOTO]: {
    productType: ProductType.AUTO_MOTO,
    baseRate: 10, // 10 € fixe
    isPercentage: false
  },
  [ProductType.IARD_PART_DIVERS]: {
    productType: ProductType.IARD_PART_DIVERS,
    baseRate: 20, // 20 € fixe
    isPercentage: false
  },
  [ProductType.IARD_PRO_DIVERS]: {
    productType: ProductType.IARD_PRO_DIVERS,
    baseRate: 20, // 20 € + 10 € par tranche de 1000 €
    isPercentage: false,
    hasTranches: true,
    trancheAmount: 1000,
    trancheRate: 10
  },
  [ProductType.PJ]: {
    productType: ProductType.PJ,
    baseRate: 30, // 30 € fixe
    isPercentage: false
  },
  [ProductType.GAV]: {
    productType: ProductType.GAV,
    baseRate: 40, // 40 € fixe
    isPercentage: false
  },
  [ProductType.SANTE_PREV]: {
    productType: ProductType.SANTE_PREV,
    baseRate: 50, // 50 € fixe
    isPercentage: false
  },
  [ProductType.NOP_50EUR]: {
    productType: ProductType.NOP_50EUR,
    baseRate: 10, // 10 € fixe
    isPercentage: false
  },
  [ProductType.EPARGNE_RETRAITE]: {
    productType: ProductType.EPARGNE_RETRAITE,
    baseRate: 50, // 50 € fixe
    isPercentage: false
  },
  [ProductType.PU_VL]: {
    productType: ProductType.PU_VL,
    baseRate: 0,
    isPercentage: true,
    percentageRate: 1 // 1% du versement libre
  }
}

// Interface pour les erreurs de validation
export interface CDCValidationError {
  field: string
  message: string
  code: string
}

// Interface pour les réponses API
export interface CDCResponse<T> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: CDCValidationError[]
}

// Interface pour les paramètres de requête
export interface CDCQueryParams {
  yearMonth?: string
  userId?: string
  type?: ActivityType
  productType?: ProductType
  day?: number
  limit?: number
  offset?: number
}

// Interface pour les statistiques de performance
export interface PerformanceStats {
  totalActivities: number
  totalCA: number
  totalCommissions: number
  averagePerDay: number
  bestDay: number
  bestDayCount: number
}

// Interface pour les objectifs mensuels
export interface MonthlyGoals {
  yearMonth: string
  userId: string
  targetAN: number
  targetProcess: number
  targetCA: number
  targetCommissions: number
  createdAt: string
  updatedAt: string
}

// Interface pour les notifications
export interface CDCNotification {
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
export interface CDCPreferences {
  userId: string
  defaultProductType?: ProductType
  autoSave: boolean
  notificationsEnabled: boolean
  theme: 'light' | 'dark' | 'auto'
  createdAt: string
  updatedAt: string
}

// Interface pour les exports
export interface CDCExport {
  yearMonth: string
  userId: string
  format: 'csv' | 'excel' | 'pdf'
  data: Activity[]
  kpis: CDCKPI
  generatedAt: string
  fileSize: number
  downloadUrl: string
}

// Interface pour les audits
export interface CDCAudit {
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
export interface CDCReport {
  id: string
  yearMonth: string
  userId: string
  type: 'monthly' | 'weekly' | 'daily'
  data: {
    activities: Activity[]
    kpis: CDCKPI
    timeline: TimelineData[]
    stats: PerformanceStats
  }
  generatedAt: string
  expiresAt: string
}
