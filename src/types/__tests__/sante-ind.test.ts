/**
 * Tests unitaires pour les types CDC Santé Individuelle
 */

import {
  ActeType,
  Compagnie,
  SanteIndActivity,
  CA_PONDERE_RATES,
  COMMISSION_THRESHOLDS,
  CommissionThreshold,
  KPIMensuel,
  SanteIndLock,
  LockStatus,
  SanteIndFilter,
  SanteIndSort,
  SanteIndActivityForm,
  ValidationResult,
  MonthNavigation,
  SanteIndUIState,
  ModalState,
  SanteIndApiResponse,
  SanteIndActivitiesResponse,
  SanteIndActivityCreate,
  SanteIndActivityUpdate,
  ACTE_TYPE_LABELS,
  COMPAGNIE_LABELS,
  MINIMUM_REVISIONS_REQUIRED
} from '../sante-ind'

describe('Types CDC Santé Individuelle', () => {
  
  // ============================================================================
  // TESTS DES TYPES DE BASE
  // ============================================================================
  
  describe('Types de base', () => {
    test('ActeType doit avoir les bonnes valeurs', () => {
      const acteTypes: ActeType[] = [
        'affaire_nouvelle',
        'revision',
        'adhesion_groupe',
        'courtage_vers_allianz',
        'allianz_vers_courtage'
      ]
      
      acteTypes.forEach(type => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })
    
    test('Compagnie doit avoir les bonnes valeurs', () => {
      const compagnies: Compagnie[] = ['Allianz', 'Courtage']
      
      compagnies.forEach(compagnie => {
        expect(typeof compagnie).toBe('string')
        expect(['Allianz', 'Courtage']).toContain(compagnie)
      })
    })
  })
  
  // ============================================================================
  // TESTS DE LA GRILLE DE PONDÉRATION
  // ============================================================================
  
  describe('Grille de pondération', () => {
    test('CA_PONDERE_RATES doit avoir tous les types d\'actes', () => {
      const expectedTypes: ActeType[] = [
        'affaire_nouvelle',
        'revision',
        'adhesion_groupe',
        'courtage_vers_allianz',
        'allianz_vers_courtage'
      ]
      
      expectedTypes.forEach(type => {
        expect(CA_PONDERE_RATES).toHaveProperty(type)
        expect(typeof CA_PONDERE_RATES[type]).toBe('number')
        expect(CA_PONDERE_RATES[type]).toBeGreaterThanOrEqual(0)
        expect(CA_PONDERE_RATES[type]).toBeLessThanOrEqual(1)
      })
    })
    
    test('Les taux de pondération doivent être corrects', () => {
      expect(CA_PONDERE_RATES.affaire_nouvelle).toBe(1.00) // 100%
      expect(CA_PONDERE_RATES.revision).toBe(0.50) // 50%
      expect(CA_PONDERE_RATES.adhesion_groupe).toBe(0.50) // 50%
      expect(CA_PONDERE_RATES.courtage_vers_allianz).toBe(0.75) // 75%
      expect(CA_PONDERE_RATES.allianz_vers_courtage).toBe(0.50) // 50%
    })
  })
  
  // ============================================================================
  // TESTS DES SEUILS DE COMMISSION
  // ============================================================================
  
  describe('Seuils de commission', () => {
    test('COMMISSION_THRESHOLDS doit avoir 5 seuils', () => {
      expect(COMMISSION_THRESHOLDS).toHaveLength(5)
    })
    
    test('Les seuils doivent être dans l\'ordre croissant', () => {
      for (let i = 0; i < COMMISSION_THRESHOLDS.length - 1; i++) {
        const current = COMMISSION_THRESHOLDS[i]
        const next = COMMISSION_THRESHOLDS[i + 1]
        
        expect(current.min).toBeLessThanOrEqual(next.min)
        if (current.max && next.max) {
          expect(current.max).toBeLessThanOrEqual(next.max)
        }
      }
    })
    
    test('Les taux de commission doivent être progressifs', () => {
      const expectedRates = [0.00, 0.02, 0.03, 0.04, 0.06]
      
      COMMISSION_THRESHOLDS.forEach((threshold, index) => {
        expect(threshold.rate).toBe(expectedRates[index])
      })
    })
    
    test('Le dernier seuil doit être "et plus"', () => {
      const lastThreshold = COMMISSION_THRESHOLDS[COMMISSION_THRESHOLDS.length - 1]
      expect(lastThreshold.max).toBeUndefined()
      expect(lastThreshold.min).toBe(22000)
      expect(lastThreshold.rate).toBe(0.06)
    })
  })
  
  // ============================================================================
  // TESTS DES INTERFACES
  // ============================================================================
  
  describe('Interface SanteIndActivity', () => {
    test('Doit avoir tous les champs requis', () => {
      const activity: SanteIndActivity = {
        id: 'test-id',
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
      
      expect(activity).toHaveProperty('id')
      expect(activity).toHaveProperty('userId')
      expect(activity).toHaveProperty('yearMonth')
      expect(activity).toHaveProperty('dateSaisie')
      expect(activity).toHaveProperty('natureActe')
      expect(activity).toHaveProperty('nomClient')
      expect(activity).toHaveProperty('numeroContrat')
      expect(activity).toHaveProperty('dateEffet')
      expect(activity).toHaveProperty('ca')
      expect(activity).toHaveProperty('caPondere')
      expect(activity).toHaveProperty('createdAt')
      expect(activity).toHaveProperty('updatedAt')
    })
    
    test('Compagnie doit être optionnel', () => {
      const activityWithoutCompagnie: SanteIndActivity = {
        id: 'test-id',
        userId: 'user-123',
        yearMonth: '2025-09',
        dateSaisie: '2025-09-17T10:00:00Z',
        natureActe: 'revision',
        nomClient: 'Jean Dupont',
        numeroContrat: 'CTR-123456',
        dateEffet: '2025-09-01T00:00:00Z',
        ca: 500,
        caPondere: 250,
        createdAt: '2025-09-17T10:00:00Z',
        updatedAt: '2025-09-17T10:00:00Z'
      }
      
      expect(activityWithoutCompagnie.compagnie).toBeUndefined()
    })
  })
  
  describe('Interface KPIMensuel', () => {
    test('Doit avoir tous les champs requis', () => {
      const kpi: KPIMensuel = {
        productionBrute: 10000,
        productionPondere: 7500,
        tauxCommission: 0.03,
        commissionEstimee: 225,
        volumes: {
          affaire_nouvelle: 2,
          revision: 5,
          adhesion_groupe: 1,
          courtage_vers_allianz: 1,
          allianz_vers_courtage: 0
        },
        nombreRevisions: 5,
        minimumRevisionsAtteint: true
      }
      
      expect(kpi).toHaveProperty('productionBrute')
      expect(kpi).toHaveProperty('productionPondere')
      expect(kpi).toHaveProperty('tauxCommission')
      expect(kpi).toHaveProperty('commissionEstimee')
      expect(kpi).toHaveProperty('volumes')
      expect(kpi).toHaveProperty('nombreRevisions')
      expect(kpi).toHaveProperty('minimumRevisionsAtteint')
      
      // Vérifier la structure des volumes
      expect(kpi.volumes).toHaveProperty('affaire_nouvelle')
      expect(kpi.volumes).toHaveProperty('revision')
      expect(kpi.volumes).toHaveProperty('adhesion_groupe')
      expect(kpi.volumes).toHaveProperty('courtage_vers_allianz')
      expect(kpi.volumes).toHaveProperty('allianz_vers_courtage')
    })
  })
  
  describe('Interface SanteIndLock', () => {
    test('Doit avoir tous les champs requis', () => {
      const lock: SanteIndLock = {
        id: 'lock-123',
        userId: 'user-123',
        yearMonth: '2025-09',
        isLocked: true,
        lockedBy: 'admin-456',
        lockedAt: '2025-09-17T10:00:00Z',
        reason: 'Paie de septembre'
      }
      
      expect(lock).toHaveProperty('id')
      expect(lock).toHaveProperty('userId')
      expect(lock).toHaveProperty('yearMonth')
      expect(lock).toHaveProperty('isLocked')
      expect(lock).toHaveProperty('lockedBy')
      expect(lock).toHaveProperty('lockedAt')
      expect(lock).toHaveProperty('reason')
      
      expect(typeof lock.isLocked).toBe('boolean')
    })
  })
  
  // ============================================================================
  // TESTS DES CONSTANTES
  // ============================================================================
  
  describe('Constantes', () => {
    test('ACTE_TYPE_LABELS doit avoir tous les types', () => {
      const expectedTypes: ActeType[] = [
        'affaire_nouvelle',
        'revision',
        'adhesion_groupe',
        'courtage_vers_allianz',
        'allianz_vers_courtage'
      ]
      
      expectedTypes.forEach(type => {
        expect(ACTE_TYPE_LABELS).toHaveProperty(type)
        expect(typeof ACTE_TYPE_LABELS[type]).toBe('string')
        expect(ACTE_TYPE_LABELS[type].length).toBeGreaterThan(0)
      })
    })
    
    test('COMPAGNIE_LABELS doit avoir toutes les compagnies', () => {
      expect(COMPAGNIE_LABELS).toHaveProperty('Allianz')
      expect(COMPAGNIE_LABELS).toHaveProperty('Courtage')
      expect(COMPAGNIE_LABELS.Allianz).toBe('Allianz')
      expect(COMPAGNIE_LABELS.Courtage).toBe('Courtage')
    })
    
    test('MINIMUM_REVISIONS_REQUIRED doit être 4', () => {
      expect(MINIMUM_REVISIONS_REQUIRED).toBe(4)
    })
  })
  
  // ============================================================================
  // TESTS DES TYPES UTILITAIRES
  // ============================================================================
  
  describe('Types utilitaires', () => {
    test('SanteIndActivityCreate doit exclure les champs calculés', () => {
      const createData: SanteIndActivityCreate = {
        userId: 'user-123',
        yearMonth: '2025-09',
        dateSaisie: '2025-09-17T10:00:00Z',
        natureActe: 'affaire_nouvelle',
        nomClient: 'Jean Dupont',
        numeroContrat: 'CTR-123456',
        dateEffet: '2025-09-01T00:00:00Z',
        ca: 1000,
        compagnie: 'Allianz'
      }
      
      expect(createData).not.toHaveProperty('id')
      expect(createData).not.toHaveProperty('createdAt')
      expect(createData).not.toHaveProperty('updatedAt')
      expect(createData).not.toHaveProperty('caPondere')
    })
    
    test('SanteIndActivityUpdate doit être partiel', () => {
      const updateData: SanteIndActivityUpdate = {
        nomClient: 'Jean Michel Dupont',
        ca: 1500
      }
      
      expect(updateData).toHaveProperty('nomClient')
      expect(updateData).toHaveProperty('ca')
      expect(updateData).not.toHaveProperty('id')
      expect(updateData).not.toHaveProperty('userId')
      expect(updateData).not.toHaveProperty('yearMonth')
    })
  })
  
  // ============================================================================
  // TESTS DES FILTRES ET TRI
  // ============================================================================
  
  describe('Filtres et tri', () => {
    test('SanteIndFilter doit permettre tous les filtres optionnels', () => {
      const filter: SanteIndFilter = {
        natureActe: 'revision',
        compagnie: 'Allianz',
        dateDebut: '2025-09-01',
        dateFin: '2025-09-30',
        nomClient: 'Dupont'
      }
      
      expect(filter).toHaveProperty('natureActe')
      expect(filter).toHaveProperty('compagnie')
      expect(filter).toHaveProperty('dateDebut')
      expect(filter).toHaveProperty('dateFin')
      expect(filter).toHaveProperty('nomClient')
    })
    
    test('SanteIndSort doit avoir field et direction', () => {
      const sort: SanteIndSort = {
        field: 'dateSaisie',
        direction: 'desc'
      }
      
      expect(sort).toHaveProperty('field')
      expect(sort).toHaveProperty('direction')
      expect(['asc', 'desc']).toContain(sort.direction)
    })
  })
})
