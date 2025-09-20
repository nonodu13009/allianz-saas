"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { SanteIndRouteGuard } from '../../../components/auth/sante-ind-route-guard'

// Composants CDC Santé Individuelle
import {
  NavigationMensuelle,
  KPIsMensuels,
  ActionButtons,
  ProductionTable,
  ModalActe,
  DeleteConfirmationModal,
  ViewDetailsModal
} from '../../../components/sante-ind'

// Types et services
import {
  SanteIndActivity,
  ActeType,
  LockStatus,
  MonthNavigation,
  KPIMensuel,
  ProductionStats,
  SanteIndFilter,
  SanteIndSort
} from '../../../types/sante-ind'

import {
  santeIndService,
  createMonthNavigation,
  navigateToPreviousMonth,
  navigateToNextMonth,
  calculateKPIMensuel,
  calculateProductionStats,
  filterActivities,
  sortActivities
} from '../../../lib/sante-ind-service'

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SanteIndividuelleDashboard() {
  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  const { user } = useAuth()
  
  // Navigation mensuelle
  const [currentDate] = useState(new Date())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1)
  const [navigation, setNavigation] = useState<MonthNavigation>(() => 
    createMonthNavigation(currentYear, currentMonth)
  )
  
  // Données
  const [activities, setActivities] = useState<SanteIndActivity[]>([])
  const [lockStatus, setLockStatus] = useState<LockStatus>('unlocked')
  const [isLoading, setIsLoading] = useState(false)
  
  // KPIs et statistiques
  const [kpi, setKpi] = useState<KPIMensuel>(() => 
    calculateKPIMensuel([])
  )
  const [stats, setStats] = useState<ProductionStats>(() => 
    calculateProductionStats([])
  )
  
  // Filtres et tri
  const [filter, setFilter] = useState<SanteIndFilter>({})
  const [sort, setSort] = useState<SanteIndSort>({
    field: 'dateSaisie',
    direction: 'desc'
  })
  
  // Modales
  const [modalState, setModalState] = useState({
    isOpen: false,
    acteType: null as ActeType | null,
    editingActivity: null as SanteIndActivity | null
  })
  
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    activity: null as SanteIndActivity | null
  })
  
  const [viewModalState, setViewModalState] = useState({
    isOpen: false,
    activity: null as SanteIndActivity | null
  })

  // ============================================================================
  // EFFETS
  // ============================================================================
  
  // Mettre à jour la navigation quand l'année/mois change
  useEffect(() => {
    const newNavigation = createMonthNavigation(currentYear, currentMonth)
    setNavigation(newNavigation)
  }, [currentYear, currentMonth])

  // Calculer les KPIs et statistiques quand les activités changent
  useEffect(() => {
    const newKpi = calculateKPIMensuel(activities)
    const newStats = calculateProductionStats(activities)
    setKpi(newKpi)
    setStats(newStats)
  }, [activities])

  // Charger les données du mois
  useEffect(() => {
    loadMonthData()
  }, [currentYear, currentMonth])

  // ============================================================================
  // FONCTIONS DE CHARGEMENT DES DONNÉES
  // ============================================================================
  
  const loadMonthData = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const yearMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
      
      // TODO: Implémenter les appels API Firebase
      // const activitiesData = await fetchActivities(user.uid, yearMonth)
      // const lockData = await fetchLockStatus(yearMonth)
      
      // Simulation temporaire
      const mockActivities: SanteIndActivity[] = []
      const mockLockStatus: LockStatus = 'unlocked'
      
      setActivities(mockActivities)
      setLockStatus(mockLockStatus)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, currentYear, currentMonth])

  // ============================================================================
  // GESTIONNAIRES DE NAVIGATION
  // ============================================================================
  
  const handleNavigate = (year: number, month: number) => {
    setCurrentYear(year)
    setCurrentMonth(month)
  }

  const handleResetToCurrent = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
  }

  // ============================================================================
  // GESTIONNAIRES DES MODALES
  // ============================================================================
  
  const handleOpenModal = (acteType: ActeType) => {
    setModalState({
      isOpen: true,
      acteType,
      editingActivity: null
    })
  }

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      acteType: null,
      editingActivity: null
    })
  }

  const handleEditActivity = (activity: SanteIndActivity) => {
    setModalState({
      isOpen: true,
      acteType: activity.natureActe,
      editingActivity: activity
    })
  }

  const handleSaveActivity = async (activityData: Omit<SanteIndActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // TODO: Implémenter l'appel API de sauvegarde
      // const savedActivity = await saveActivity(activityData)
      
      // Simulation temporaire
      const newActivity: SanteIndActivity = {
        ...activityData,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      if (modalState.editingActivity) {
        // Modification
        setActivities(prev => 
          prev.map(a => a.id === modalState.editingActivity!.id ? newActivity : a)
        )
      } else {
        // Création
        setActivities(prev => [newActivity, ...prev])
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw error
    }
  }

  const handleViewActivity = (activity: SanteIndActivity) => {
    setViewModalState({
      isOpen: true,
      activity
    })
  }

  const handleCloseViewModal = () => {
    setViewModalState({
      isOpen: false,
      activity: null
    })
  }

  const handleDeleteActivity = (activity: SanteIndActivity) => {
    setDeleteModalState({
      isOpen: true,
      activity
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalState.activity) return
    
    try {
      // TODO: Implémenter l'appel API de suppression
      // await deleteActivity(deleteModalState.activity.id)
      
      // Simulation temporaire
      setActivities(prev => 
        prev.filter(a => a.id !== deleteModalState.activity!.id)
      )
      
      setDeleteModalState({
        isOpen: false,
        activity: null
      })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      activity: null
    })
  }

  // ============================================================================
  // GESTIONNAIRES DES ACTIONS
  // ============================================================================
  
  const handleExport = () => {
    // TODO: Implémenter l'export Excel/PDF
    console.log('Export des données...')
  }

  const handleReset = () => {
    setFilter({})
    setSort({
      field: 'dateSaisie',
      direction: 'desc'
    })
  }

  // ============================================================================
  // RENDU
  // ============================================================================
  

  return (
    <SanteIndRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation mensuelle */}
        <NavigationMensuelle
          navigation={navigation}
          onNavigate={handleNavigate}
          onResetToCurrent={handleResetToCurrent}
          isLoading={isLoading}
        />

        {/* KPIs mensuels */}
        <div className="mt-8">
          <KPIsMensuels
            kpi={kpi}
            stats={stats}
            lockStatus={lockStatus}
            isLoading={isLoading}
          />
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ActionButtons
              lockStatus={lockStatus}
              onOpenModal={handleOpenModal}
              onExport={handleExport}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </div>

          {/* Tableau de production */}
          <div className="lg:col-span-3">
            <ProductionTable
              activities={activities}
              lockStatus={lockStatus}
              isLoading={isLoading}
              onView={handleViewActivity}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
            />
          </div>
        </div>

        {/* Modales */}
        <ModalActe
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSave={handleSaveActivity}
          acteType={modalState.acteType}
          existingActivity={modalState.editingActivity}
          yearMonth={navigation.currentYearMonth}
        />

        <DeleteConfirmationModal
          isOpen={deleteModalState.isOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          activity={deleteModalState.activity}
        />

        <ViewDetailsModal
          isOpen={viewModalState.isOpen}
          onClose={handleCloseViewModal}
          activity={viewModalState.activity}
        />
        </div>
      </div>
    </SanteIndRouteGuard>
  )
}
