/**
 * Tests unitaires pour le service CDC Santé Individuelle
 */

import {
  santeIndService,
  calculateCAPondere,
  roundToEuro,
  getCommissionRate,
  calculateCommission,
  getCommissionThresholdDescription,
  calculateKPIMensuel,
  calculateProductionStats,
  validateSanteIndActivity,
  validateSanteIndActivityForm,
  capitalizeClientName,
  filterActivities,
  sortActivities,
  createMonthNavigation,
  navigateToPreviousMonth,
  navigateToNextMonth,
  formatEuro,
  formatEuroInt,
  formatPercentage,
  formatDateShort,
  formatDateLong
} from '../sante-ind-service'

import {
  ActeType,
  Compagnie,
  SanteIndActivity,
  SanteIndFilter,
  SanteIndSort,
  SanteIndActivityCreate,
  MINIMUM_REVISIONS_REQUIRED
} from '../../types/sante-ind'

// ============================================================================
// DONNÉES DE TEST
// ============================================================================

const mockActivity: SanteIndActivity = {
  id: 'test-1',
  userId: 'user-123',
  yearMonth: '2025-09',
  dateSaisie: '2025-09-17T10:00:00Z',
  natureActe: 'affaire_nouvelle',
  nomClient: 'Jean Dupont',
  numeroContrat: 'CTR-123456',
  dateEffet: '2025-09-01T00:00:00Z',
  ca: 1000,
  caPondere: 1000,
  compagnie: 'Allianz',
  createdAt: '2025-09-17T10:00:00Z',
  updatedAt: '2025-09-17T10:00:00Z'
}

const mockActivities: SanteIndActivity[] = [
  {
    id: 'test-1',
    userId: 'user-123',
    yearMonth: '2025-09',
    dateSaisie: '2025-09-01T10:00:00Z',
    natureActe: 'affaire_nouvelle',
    nomClient: 'Jean Dupont',
    numeroContrat: 'CTR-001',
    dateEffet: '2025-09-01T00:00:00Z',
    ca: 5000,
    caPondere: 5000,
    compagnie: 'Allianz',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  },
  {
    id: 'test-2',
    userId: 'user-123',
    yearMonth: '2025-09',
    dateSaisie: '2025-09-02T10:00:00Z',
    natureActe: 'revision',
    nomClient: 'Marie Martin',
    numeroContrat: 'CTR-002',
    dateEffet: '2025-09-01T00:00:00Z',
    ca: 2000,
    caPondere: 1000,
    createdAt: '2025-09-02T10:00:00Z',
    updatedAt: '2025-09-02T10:00:00Z'
  },
  {
    id: 'test-3',
    userId: 'user-123',
    yearMonth: '2025-09',
    dateSaisie: '2025-09-03T10:00:00Z',
    natureActe: 'revision',
    nomClient: 'Pierre Durand',
    numeroContrat: 'CTR-003',
    dateEffet: '2025-09-01T00:00:00Z',
    ca: 3000,
    caPondere: 1500,
    createdAt: '2025-09-03T10:00:00Z',
    updatedAt: '2025-09-03T10:00:00Z'
  }
]

// ============================================================================
// TESTS DES CALCULS MÉTIER - CA PONDÉRÉ
// ============================================================================

describe('Calculs métier - CA pondéré', () => {
  
  describe('calculateCAPondere', () => {
    test('doit calculer correctement pour chaque type d\'acte', () => {
      expect(calculateCAPondere('affaire_nouvelle', 1000)).toBe(1000) // 100%
      expect(calculateCAPondere('revision', 1000)).toBe(500) // 50%
      expect(calculateCAPondere('adhesion_groupe', 1000)).toBe(500) // 50%
      expect(calculateCAPondere('courtage_vers_allianz', 1000)).toBe(750) // 75%
      expect(calculateCAPondere('allianz_vers_courtage', 1000)).toBe(500) // 50%
    })
    
    test('doit lever une erreur pour un CA négatif', () => {
      expect(() => calculateCAPondere('affaire_nouvelle', -100)).toThrow('CA doit être un entier positif')
    })
    
    test('doit lever une erreur pour un CA non entier', () => {
      expect(() => calculateCAPondere('affaire_nouvelle', 100.5)).toThrow('CA doit être un entier positif')
    })
    
    test('doit lever une erreur pour un type d\'acte invalide', () => {
      expect(() => calculateCAPondere('invalid_type' as ActeType, 1000)).toThrow('Type d\'acte non reconnu')
    })
  })
  
  describe('roundToEuro', () => {
    test('doit arrondir correctement', () => {
      expect(roundToEuro(1000.4)).toBe(1000)
      expect(roundToEuro(1000.5)).toBe(1001)
      expect(roundToEuro(1000.6)).toBe(1001)
      expect(roundToEuro(999.9)).toBe(1000)
    })
  })
})

// ============================================================================
// TESTS DES CALCULS MÉTIER - COMMISSIONS
// ============================================================================

describe('Calculs métier - Commissions', () => {
  
  describe('getCommissionRate', () => {
    test('doit retourner les bons taux selon les seuils', () => {
      expect(getCommissionRate(5000)).toBe(0.00) // < 10k → 0%
      expect(getCommissionRate(10000)).toBe(0.02) // 10-14k → 2%
      expect(getCommissionRate(12000)).toBe(0.02) // 10-14k → 2%
      expect(getCommissionRate(15000)).toBe(0.03) // 14-18k → 3%
      expect(getCommissionRate(18000)).toBe(0.04) // 18-22k → 4%
      expect(getCommissionRate(25000)).toBe(0.06) // ≥ 22k → 6%
    })
    
    test('doit lever une erreur pour un CA négatif', () => {
      expect(() => getCommissionRate(-100)).toThrow('CA pondéré ne peut pas être négatif')
    })
  })
  
  describe('calculateCommission', () => {
    test('doit calculer correctement les commissions', () => {
      expect(calculateCommission(5000)).toBe(0) // 0%
      expect(calculateCommission(12000)).toBe(240) // 2%
      expect(calculateCommission(15000)).toBe(450) // 3%
      expect(calculateCommission(20000)).toBe(800) // 4%
      expect(calculateCommission(25000)).toBe(1500) // 6%
    })
  })
  
  describe('getCommissionThresholdDescription', () => {
    test('doit retourner les bonnes descriptions', () => {
      expect(getCommissionThresholdDescription(5000)).toContain('0 - 9 999 € → 0%')
      expect(getCommissionThresholdDescription(12000)).toContain('10 000 - 13 999 € → 2%')
      expect(getCommissionThresholdDescription(25000)).toContain('≥ 22 000 € → 6%')
    })
  })
})

// ============================================================================
// TESTS DES KPIs MENSUELS
// ============================================================================

describe('KPIs mensuels', () => {
  
  describe('calculateKPIMensuel', () => {
    test('doit calculer correctement les KPIs avec des activités', () => {
      const kpi = calculateKPIMensuel(mockActivities)
      
      expect(kpi.productionBrute).toBe(10000) // 5000 + 2000 + 3000
      expect(kpi.productionPondere).toBe(7500) // 5000 + 1000 + 1500
      expect(kpi.tauxCommission).toBe(0.02) // 7500 → 2%
      expect(kpi.commissionEstimee).toBe(150) // 7500 * 0.02
      expect(kpi.volumes.affaire_nouvelle).toBe(1)
      expect(kpi.volumes.revision).toBe(2)
      expect(kpi.volumes.adhesion_groupe).toBe(0)
      expect(kpi.nombreRevisions).toBe(2)
      expect(kpi.minimumRevisionsAtteint).toBe(false) // 2 < 4
    })
    
    test('doit retourner des KPIs vides pour une liste vide', () => {
      const kpi = calculateKPIMensuel([])
      
      expect(kpi.productionBrute).toBe(0)
      expect(kpi.productionPondere).toBe(0)
      expect(kpi.tauxCommission).toBe(0)
      expect(kpi.commissionEstimee).toBe(0)
      expect(kpi.volumes.affaire_nouvelle).toBe(0)
      expect(kpi.nombreRevisions).toBe(0)
      expect(kpi.minimumRevisionsAtteint).toBe(false)
    })
    
    test('doit détecter le minimum de révisions atteint', () => {
      const activitiesWithManyRevisions = [
        ...mockActivities,
        { ...mockActivities[1], id: 'test-4', nomClient: 'Client 4' },
        { ...mockActivities[1], id: 'test-5', nomClient: 'Client 5' },
        { ...mockActivities[1], id: 'test-6', nomClient: 'Client 6' }
      ]
      
      const kpi = calculateKPIMensuel(activitiesWithManyRevisions)
      expect(kpi.nombreRevisions).toBe(6)
      expect(kpi.minimumRevisionsAtteint).toBe(true) // 6 >= 4
    })
  })
  
  describe('calculateProductionStats', () => {
    test('doit calculer correctement les statistiques', () => {
      const stats = calculateProductionStats(mockActivities)
      
      expect(stats.totalActivites).toBe(3)
      expect(stats.totalCA).toBe(10000)
      expect(stats.totalCAPondere).toBe(7500)
      expect(stats.moyenneCA).toBe(3333) // 10000/3 arrondi
      expect(stats.moyenneCAPondere).toBe(2500) // 7500/3 arrondi
      expect(stats.premierActe).toBe('2025-09-01T10:00:00.000Z')
      expect(stats.dernierActe).toBe('2025-09-03T10:00:00.000Z')
    })
    
    test('doit retourner des stats vides pour une liste vide', () => {
      const stats = calculateProductionStats([])
      
      expect(stats.totalActivites).toBe(0)
      expect(stats.totalCA).toBe(0)
      expect(stats.totalCAPondere).toBe(0)
      expect(stats.moyenneCA).toBe(0)
      expect(stats.moyenneCAPondere).toBe(0)
      expect(stats.premierActe).toBeUndefined()
      expect(stats.dernierActe).toBeUndefined()
    })
  })
})

// ============================================================================
// TESTS DE VALIDATION
// ============================================================================

describe('Validation', () => {
  
  describe('validateSanteIndActivity', () => {
    test('doit valider une activité correcte', () => {
      const result = validateSanteIndActivity(mockActivity)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    test('doit détecter les champs manquants', () => {
      const result = validateSanteIndActivity({})
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.field === 'natureActe')).toBe(true)
      expect(result.errors.some(e => e.field === 'nomClient')).toBe(true)
      expect(result.errors.some(e => e.field === 'numeroContrat')).toBe(true)
    })
    
    test('doit valider la compagnie pour affaire nouvelle', () => {
      const activityWithoutCompagnie = { ...mockActivity, compagnie: undefined }
      const result = validateSanteIndActivity(activityWithoutCompagnie)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'compagnie')).toBe(true)
    })
    
    test('doit valider le CA', () => {
      const invalidCA = { ...mockActivity, ca: -100 }
      const result = validateSanteIndActivity(invalidCA)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'ca' && e.message.includes('négatif'))).toBe(true)
    })
    
    test('doit valider les dates', () => {
      const invalidDates = { 
        ...mockActivity, 
        dateEffet: '2025-09-20T00:00:00Z', // Après date de saisie
        dateSaisie: '2025-09-17T10:00:00Z'
      }
      const result = validateSanteIndActivity(invalidDates)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'dateEffet' && e.message.includes('postérieure'))).toBe(true)
    })
  })
  
  describe('validateSanteIndActivityForm', () => {
    test('doit valider un formulaire correct', () => {
      const form: SanteIndActivityCreate = {
        userId: 'user-123',
        yearMonth: '2025-09',
        dateSaisie: '2025-09-17T10:00:00Z',
        natureActe: 'affaire_nouvelle',
        nomClient: 'Jean Dupont',
        numeroContrat: 'CTR-123',
        dateEffet: '2025-09-01T00:00:00Z',
        ca: 1000,
        compagnie: 'Allianz'
      }
      
      const result = validateSanteIndActivityForm(form)
      expect(result.isValid).toBe(true)
    })
  })
})

// ============================================================================
// TESTS DE CAPITALISATION
// ============================================================================

describe('Capitalisation des noms', () => {
  
  describe('capitalizeClientName', () => {
    test('doit capitaliser un nom simple', () => {
      expect(capitalizeClientName('jean dupont')).toBe('Jean Dupont')
      expect(capitalizeClientName('MARIE MARTIN')).toBe('Marie Martin')
      expect(capitalizeClientName('pierre durand')).toBe('Pierre Durand')
    })
    
    test('doit gérer les prénoms composés', () => {
      expect(capitalizeClientName('jean-michel dupont')).toBe('Jean-Michel Dupont')
      expect(capitalizeClientName('anne-sophie martin')).toBe('Anne-Sophie Martin')
      expect(capitalizeClientName('louis-philippe durand')).toBe('Louis-Philippe Durand')
    })
    
    test('doit gérer les apostrophes', () => {
      expect(capitalizeClientName("jeanne d'arc")).toBe("Jeanne D'Arc")
      expect(capitalizeClientName("marie d'anjou")).toBe("Marie D'Anjou")
      expect(capitalizeClientName("l'ocean")).toBe("L'Ocean")
    })
    
    test('doit gérer les cas mixtes', () => {
      expect(capitalizeClientName('jean-michel d\'anjou')).toBe("Jean-Michel D'Anjou")
      expect(capitalizeClientName('anne-sophie l\'enfant')).toBe("Anne-Sophie L'Enfant")
    })
    
    test('doit gérer les cas limites', () => {
      expect(capitalizeClientName('')).toBe('')
      expect(capitalizeClientName('  ')).toBe('')
      expect(capitalizeClientName('jean')).toBe('Jean')
      expect(capitalizeClientName('JEAN')).toBe('Jean')
    })
  })
})

// ============================================================================
// TESTS DE FILTRAGE ET TRI
// ============================================================================

describe('Filtrage et tri', () => {
  
  describe('filterActivities', () => {
    test('doit filtrer par type d\'acte', () => {
      const filter: SanteIndFilter = { natureActe: 'revision' }
      const filtered = filterActivities(mockActivities, filter)
      expect(filtered).toHaveLength(2)
      expect(filtered.every(a => a.natureActe === 'revision')).toBe(true)
    })
    
    test('doit filtrer par nom de client', () => {
      const filter: SanteIndFilter = { nomClient: 'Marie' }
      const filtered = filterActivities(mockActivities, filter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].nomClient).toBe('Marie Martin')
    })
    
    test('doit filtrer par compagnie', () => {
      const filter: SanteIndFilter = { compagnie: 'Allianz' }
      const filtered = filterActivities(mockActivities, filter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].compagnie).toBe('Allianz')
    })
    
    test('doit filtrer par dates', () => {
      const filter: SanteIndFilter = { 
        dateDebut: '2025-09-02',
        dateFin: '2025-09-02'
      }
      const filtered = filterActivities(mockActivities, filter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].nomClient).toBe('Marie Martin')
    })
  })
  
  describe('sortActivities', () => {
    test('doit trier par date de saisie', () => {
      const sort: SanteIndSort = { field: 'dateSaisie', direction: 'desc' }
      const sorted = sortActivities(mockActivities, sort)
      expect(sorted[0].nomClient).toBe('Pierre Durand') // Plus récent
      expect(sorted[2].nomClient).toBe('Jean Dupont') // Plus ancien
    })
    
    test('doit trier par CA', () => {
      const sort: SanteIndSort = { field: 'ca', direction: 'asc' }
      const sorted = sortActivities(mockActivities, sort)
      expect(sorted[0].ca).toBe(2000)
      expect(sorted[1].ca).toBe(3000)
      expect(sorted[2].ca).toBe(5000)
    })
    
    test('doit trier par nom de client', () => {
      const sort: SanteIndSort = { field: 'nomClient', direction: 'asc' }
      const sorted = sortActivities(mockActivities, sort)
      expect(sorted[0].nomClient).toBe('Jean Dupont')
      expect(sorted[1].nomClient).toBe('Marie Martin')
      expect(sorted[2].nomClient).toBe('Pierre Durand')
    })
  })
})

// ============================================================================
// TESTS DE NAVIGATION MENSUELLE
// ============================================================================

describe('Navigation mensuelle', () => {
  
  describe('createMonthNavigation', () => {
    test('doit créer une navigation pour le mois courant', () => {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      const nav = createMonthNavigation(year, month)
      
      expect(nav.currentYear).toBe(year)
      expect(nav.currentMonth).toBe(month)
      expect(nav.isCurrentMonth).toBe(true)
      expect(nav.canGoPrevious).toBe(true)
      expect(nav.canGoNext).toBe(false)
    })
    
    test('doit créer une navigation pour un mois passé', () => {
      const nav = createMonthNavigation(2024, 6)
      
      expect(nav.currentYear).toBe(2024)
      expect(nav.currentMonth).toBe(6)
      expect(nav.currentYearMonth).toBe('2024-06')
      expect(nav.isCurrentMonth).toBe(false)
      expect(nav.canGoPrevious).toBe(true)
      expect(nav.canGoNext).toBe(true)
    })
  })
  
  describe('navigateToPreviousMonth', () => {
    test('doit naviguer vers le mois précédent', () => {
      const nav = navigateToPreviousMonth(2025, 3)
      expect(nav.currentYear).toBe(2025)
      expect(nav.currentMonth).toBe(2)
    })
    
    test('doit gérer le passage d\'année', () => {
      const nav = navigateToPreviousMonth(2025, 1)
      expect(nav.currentYear).toBe(2024)
      expect(nav.currentMonth).toBe(12)
    })
  })
  
  describe('navigateToNextMonth', () => {
    test('doit naviguer vers le mois suivant', () => {
      const nav = navigateToNextMonth(2025, 3)
      expect(nav.currentYear).toBe(2025)
      expect(nav.currentMonth).toBe(4)
    })
    
    test('doit gérer le passage d\'année', () => {
      const nav = navigateToNextMonth(2025, 12)
      expect(nav.currentYear).toBe(2026)
      expect(nav.currentMonth).toBe(1)
    })
  })
})

// ============================================================================
// TESTS DE FORMATAGE
// ============================================================================

describe('Formatage', () => {
  
  describe('formatEuro', () => {
    test('doit formater correctement les montants', () => {
      expect(formatEuro(1000)).toBe('1 000 €')
      expect(formatEuro(1234567)).toBe('1 234 567 €')
      expect(formatEuro(0)).toBe('0 €')
    })
  })
  
  describe('formatEuroInt', () => {
    test('doit formater les entiers', () => {
      expect(formatEuroInt(1000)).toBe('1 000 €')
      expect(formatEuroInt(1234567)).toBe('1 234 567 €')
    })
    
    test('doit lever une erreur pour les décimales', () => {
      expect(() => formatEuroInt(1000.5)).toThrow('Le montant doit être un entier')
    })
  })
  
  describe('formatPercentage', () => {
    test('doit formater les pourcentages', () => {
      expect(formatPercentage(0.03)).toBe('3 %')
      expect(formatPercentage(0.125)).toBe('13 %')
      expect(formatPercentage(0)).toBe('0 %')
    })
  })
  
  describe('formatDateShort', () => {
    test('doit formater les dates courtes', () => {
      expect(formatDateShort('2025-09-17T10:00:00Z')).toBe('17/09/2025')
      expect(formatDateShort('2025-01-01T00:00:00Z')).toBe('01/01/2025')
    })
    
    test('doit gérer les dates invalides', () => {
      expect(formatDateShort('invalid-date')).toBe('Date invalide')
    })
  })
  
  describe('formatDateLong', () => {
    test('doit formater les dates longues', () => {
      expect(formatDateLong('2025-09-17T10:00:00Z')).toBe('17 septembre 2025')
      expect(formatDateLong('2025-01-01T00:00:00Z')).toBe('1 janvier 2025')
    })
    
    test('doit gérer les dates invalides', () => {
      expect(formatDateLong('invalid-date')).toBe('Date invalide')
    })
  })
})

// ============================================================================
// TESTS DU SERVICE PRINCIPAL
// ============================================================================

describe('Service principal', () => {
  
  test('doit exporter toutes les fonctions', () => {
    expect(santeIndService.calculateCAPondere).toBeDefined()
    expect(santeIndService.roundToEuro).toBeDefined()
    expect(santeIndService.getCommissionRate).toBeDefined()
    expect(santeIndService.calculateCommission).toBeDefined()
    expect(santeIndService.calculateKPIMensuel).toBeDefined()
    expect(santeIndService.validateSanteIndActivity).toBeDefined()
    expect(santeIndService.capitalizeClientName).toBeDefined()
    expect(santeIndService.filterActivities).toBeDefined()
    expect(santeIndService.sortActivities).toBeDefined()
    expect(santeIndService.formatEuro).toBeDefined()
    expect(santeIndService.formatDateShort).toBeDefined()
  })
})
