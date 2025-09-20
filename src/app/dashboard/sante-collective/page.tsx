// Dashboard CDC Santé Collective
// Page dédiée pour les utilisateurs avec le rôle cdc_sante_coll

"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { 
  SanteCollFilters,
  SanteCollTimeline,
  SanteCollKPIs,
  SanteCollTable,
  SanteCollButtons,
  ModalActe
} from '@/components/sante-coll'
import { useSanteCollActivities } from '@/hooks/use-sante-coll-activities'
import { SanteCollActeType, SanteCollOrigine, CompagnieType } from '@/types/sante-coll'

export default function SanteCollDashboardPage() {
  const { user } = useAuth()
  
  // Navigation mensuelle
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  
  const [currentYear, currentMonth] = currentYearMonth.split('-').map(Number)
  const [selectedDay, setSelectedDay] = useState<number | undefined>()
  
  // États pour les modales
  const [modalActeOpen, setModalActeOpen] = useState(false)
  const [selectedActeType, setSelectedActeType] = useState<SanteCollActeType | null>(null)
  const [editingActivity, setEditingActivity] = useState<any>(null)

  // Hook pour les activités Santé Collective
  const {
    activities,
    kpis,
    filteredActivities,
    loading,
    error,
    isMonthLocked,
    filters,
    setFilters,
    saveActivity,
    updateActivity,
    deleteActivity,
    refreshActivities,
    lockMonth
  } = useSanteCollActivities({
    yearMonth: currentYearMonth,
    userId: user?.uid || '',
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Gestionnaires de navigation
  const handleNavigate = (year: number, month: number) => {
    setCurrentYearMonth(`${year}-${month.toString().padStart(2, '0')}`)
    setSelectedDay(undefined) // Reset du jour sélectionné
  }

  const handleResetToCurrent = () => {
    const now = new Date()
    setCurrentYearMonth(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`)
    setSelectedDay(undefined)
  }

  // Gestionnaires des filtres
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleDayFilterChange = (day: number | undefined) => {
    setSelectedDay(day)
    setFilters(prev => ({ ...prev, day }))
  }

  // Gestionnaires des actions CRUD
  const handleButtonClick = (acteType: SanteCollActeType) => {
    setSelectedActeType(acteType)
    setEditingActivity(null)
    setModalActeOpen(true)
  }

  const handleSaveActivity = async (activityData: any) => {
    try {
      if (editingActivity) {
        // Modification
        await updateActivity(editingActivity.id, activityData)
      } else {
        // Création
        await saveActivity(activityData)
      }
      setModalActeOpen(false)
      setSelectedActeType(null)
      setEditingActivity(null)
      // TODO: Afficher un toast de succès
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      // TODO: Afficher un toast d'erreur
    }
  }

  const handleEditActivity = async (activity: any) => {
    try {
      setEditingActivity(activity)
      setSelectedActeType(activity.type)
      setModalActeOpen(true)
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error)
    }
  }

  const handleDeleteActivity = async (activity: any) => {
    try {
      await deleteActivity(activity.id)
      // TODO: Afficher un toast de succès
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      // TODO: Afficher un toast d'erreur
    }
  }

  const handleViewActivity = (activity: any) => {
    // TODO: Ouvrir la modale de visualisation
    console.log('Visualisation de l\'activité:', activity)
  }

  const handleCloseModal = () => {
    setModalActeOpen(false)
    setSelectedActeType(null)
    setEditingActivity(null)
  }

  // Gestionnaire de la timeline
  const handleTimelineDayClick = (day: number) => {
    setSelectedDay(day)
    setFilters(prev => ({ ...prev, day }))
  }

  const handleTimelineMonthChange = (year: number, month: number) => {
    handleNavigate(year, month)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Message de bienvenue - Pleine largeur */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 animate-fade-in">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="text-blue-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Gestion des contrats de santé collective
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">Connecté en tant que {user?.roleFront || user?.role}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">Espace CDC Santé Collective</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Santé Collective */}
        <SanteCollTimeline
          activities={activities}
          year={currentYear}
          month={currentMonth}
          filter={filters}
          onDayClick={handleTimelineDayClick}
          onMonthChange={handleTimelineMonthChange}
          loading={loading}
        />

        {/* Filtres Santé Collective */}
        <SanteCollFilters
          currentFilter={filters}
          onFilterChange={handleFilterChange}
          selectedDay={selectedDay}
          onDayFilterChange={handleDayFilterChange}
          yearMonth={currentYearMonth}
          activitiesCount={activities.length}
          filteredCount={filteredActivities.length}
        />

        {/* KPIs Santé Collective */}
        <SanteCollKPIs
          activities={activities}
          yearMonth={currentYearMonth}
          kpis={kpis}
          loading={loading}
        />

        {/* Boutons de saisie */}
        <SanteCollButtons
          onButtonClick={handleButtonClick}
          isLocked={isMonthLocked}
          disabled={loading}
          isLoading={loading}
        />

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 text-red-600">⚠️</div>
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              <button
                onClick={refreshActivities}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Tableau des activités Santé Collective */}
        <SanteCollTable
          activities={filteredActivities}
          yearMonth={currentYearMonth}
          filter={filters}
          isLocked={isMonthLocked}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          onView={handleViewActivity}
          loading={loading}
        />

        {/* Modale de saisie */}
        {selectedActeType && (
          <ModalActe
            isOpen={modalActeOpen}
            onClose={handleCloseModal}
            onSave={handleSaveActivity}
            acteType={selectedActeType}
            loading={loading}
            isLocked={isMonthLocked}
            existingActivity={editingActivity}
            yearMonth={currentYearMonth}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
