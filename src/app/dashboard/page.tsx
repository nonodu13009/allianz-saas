"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { KPIETPCard } from '@/components/dashboard/kpi-etp-card'
import { KPIRatioCard } from '@/components/dashboard/kpi-ratio-card'
import { CDCButtons } from '@/components/cdc/CDCButtons'
import { ModalAN } from '@/components/cdc/ModalAN'
import { ModalProcess } from '@/components/cdc/ModalProcess'
import { ActivityTable } from '@/components/cdc/ActivityTable'
import { CDCKPIs } from '@/components/cdc/CDCKPIs'
import { CDCTimeline } from '@/components/cdc/CDCTimeline'
import { CDCFilters } from '@/components/cdc/CDCFilters'
import { ActivityType, Activity, CDCFilter } from '@/types/cdc'
import { cdcService } from '@/lib/cdc-service'
import { 
  ModalActe, 
  SanteIndButtons, 
  SanteIndKPIs, 
  SanteIndTable, 
  SanteIndTimeline 
} from '@/components/sante-ind'
import { useSanteIndActivities } from '@/hooks/use-sante-ind-activities'
import { SanteIndActeType } from '@/types/sante-ind'

const getRoleSpecificContent = (role: string) => {
  switch (role) {
    case 'administrateur':
      return {
        description: 'Gestion complète du système Allianz SaaS'
      }
    case 'cdc_commercial':
      return {
        description: 'Gestion des activités commerciales et des clients'
      }
    case 'cdc_sante_coll':
      return {
        description: 'Gestion des contrats de santé collective'
      }
    case 'cdc_sante_ind':
      return {
        description: 'Gestion des contrats de santé individuelle'
      }
    case 'cdc_sinistre':
      return {
        description: 'Gestion et suivi des sinistres'
      }
    default:
      return {
        description: 'Bienvenue sur votre tableau de bord'
      }
  }
}

export default function DashboardPage() {
  const { user } = useAuth()

  // États pour les modales CDC
  const [modalANOpen, setModalANOpen] = useState(false)
  const [modalProcessOpen, setModalProcessOpen] = useState(false)
  const [selectedProcessType, setSelectedProcessType] = useState<ActivityType | null>(null)
  const [loading, setLoading] = useState(false)
  
  // États pour les modales Santé Individuelle
  const [modalActeOpen, setModalActeOpen] = useState(false)
  const [selectedActeType, setSelectedActeType] = useState<SanteIndActeType | null>(null)
  const [santeIndLoading, setSanteIndLoading] = useState(false)
  
  // États pour le tableau des activités
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  // État local simple pour les activités
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)
  
  // Hook Santé Individuelle
  const {
    activities: santeIndActivities,
    kpis: santeIndKPIs,
    loading: santeIndActivitiesLoading,
    error: santeIndError,
    saveActivity: saveSanteIndActivity,
    updateActivity: updateSanteIndActivity,
    deleteActivity: deleteSanteIndActivity,
    refreshActivities: refreshSanteIndActivities,
    navigation: santeIndNavigation,
    filters: santeIndFilters,
    setFilters: setSanteIndFilters,
    filteredActivities: filteredSanteIndActivities,
    isMonthLocked: isSanteIndMonthLocked
  } = useSanteIndActivities({
    yearMonth: currentYearMonth,
    userId: user?.uid || '',
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Chargement des activités au montage et changement de mois
  useEffect(() => {
    loadActivities()
  }, [currentYearMonth])

  const loadActivities = async () => {
    setActivitiesLoading(true)
    setActivitiesError(null)
    try {
      const loadedActivities = await cdcService.getActivities(currentYearMonth)
      setActivities(loadedActivities)
    } catch (error) {
      console.error('Erreur chargement activités:', error)
      setActivitiesError('Erreur lors du chargement des activités')
    } finally {
      setActivitiesLoading(false)
    }
  }
  const [isMonthLocked, setIsMonthLocked] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | undefined>()
  const [currentFilter, setCurrentFilter] = useState<CDCFilter>({
    type: 'all',
    product: undefined,
    day: undefined
  })

  // Charger le statut de verrouillage au montage du composant
  useEffect(() => {
    const loadLockStatus = async () => {
      if (!user || !user.uid) return

      try {
        // TEMPORAIRE : Déverrouiller le mois pour le développement
        // TODO : Restaurer le système de verrouillage après développement
        setIsMonthLocked(false)
        
        // Code original commenté :
        // const { lock, isLocked } = await CDCLockService.getLockStatus(user.uid, currentYearMonth)
        // setLockData(lock)
        // setIsMonthLocked(isLocked)
      } catch (error) {
        console.error('Erreur lors du chargement du statut de verrouillage:', error)
        // En cas d'erreur, considérer le mois comme déverrouillé
        setIsMonthLocked(false)
      }
    }

    loadLockStatus()
  }, [user, currentYearMonth])

  // Parsing de l'année et du mois courant
  const [currentYear, currentMonth] = currentYearMonth.split('-').map(Number)

  if (!user) return null

  const roleContent = getRoleSpecificContent(user.role)

  // Gestionnaire pour les clics sur les boutons CDC
  const handleCDCButtonClick = (type: ActivityType) => {
    if (type === ActivityType.AN) {
      setModalANOpen(true)
    } else {
      setSelectedProcessType(type)
      setModalProcessOpen(true)
    }
  }

  // Gestionnaires pour Santé Individuelle
  const handleSanteIndButtonClick = (type: SanteIndActeType) => {
    setSelectedActeType(type)
    setModalActeOpen(true)
  }

  const handleSaveSanteIndActivity = async (activityData: Record<string, unknown>) => {
    setSanteIndLoading(true)
    try {
      // Ajouter les champs obligatoires
      const completeActivityData = {
        ...activityData,
        userId: user?.uid || 'unknown',
        yearMonth: currentYearMonth,
        isLocked: false // Par défaut, le mois est ouvert
      }
      
      console.log('🔄 Tentative de sauvegarde Santé Individuelle:', completeActivityData)
      
      const savedActivity = await saveSanteIndActivity(completeActivityData)
      console.log('✅ Activité Santé Individuelle sauvegardée:', savedActivity)
      setModalActeOpen(false)
      setSelectedActeType(null)
    } catch (error) {
      console.error('❌ Erreur sauvegarde Santé Individuelle:', error)
    } finally {
      setSanteIndLoading(false)
    }
  }

  const handleEditSanteIndActivity = async (activity: Record<string, unknown>) => {
    try {
      await updateSanteIndActivity(activity.id, activity)
      console.log('✅ Activité Santé Individuelle mise à jour')
    } catch (error) {
      console.error('❌ Erreur mise à jour Santé Individuelle:', error)
    }
  }

  const handleDeleteSanteIndActivity = async (activity: Record<string, unknown>) => {
    try {
      await deleteSanteIndActivity(activity.id)
      console.log('✅ Activité Santé Individuelle supprimée')
    } catch (error) {
      console.error('❌ Erreur suppression Santé Individuelle:', error)
    }
  }

  const handleViewSanteIndActivity = (activity: Record<string, unknown>) => {
    console.log('Visualisation activité Santé Individuelle:', activity)
  }

  const handleSanteIndTimelineDayClick = (day: number | undefined) => {
    setSanteIndFilters(prev => ({ ...prev, day }))
  }

  const handleSanteIndTimelineMonthChange = (year: number, month: number) => {
    const newYearMonth = `${year}-${month.toString().padStart(2, '0')}`
    console.log('🔄 Changement de mois Santé Individuelle:', newYearMonth)
    setCurrentYearMonth(newYearMonth)
  }


  // Gestionnaire pour la sauvegarde des activités
  const handleSaveActivity = async (activityData: Record<string, unknown>) => {
    setLoading(true)
    try {
      // Créer l'activité avec les données complètes
      const newActivity = {
        ...activityData,
        userId: user?.uid || 'unknown',
        yearMonth: currentYearMonth,
        isLocked: false // Par défaut, le mois est ouvert
      }
      
      console.log('🔄 Tentative de sauvegarde:', newActivity)
      
      // Sauvegarder via le service unifié
      const savedActivity = await cdcService.saveActivity(newActivity)
      
      console.log('✅ Activité sauvegardée avec succès:', savedActivity)
      
      // Mettre à jour l'état local
      setActivities(prev => [savedActivity, ...prev])
      
      // Fermer les modales
      setModalANOpen(false)
      setModalProcessOpen(false)
      setSelectedProcessType(null)
      
      console.log('✅ Activité sauvegardée avec succès dans Firebase')
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      console.error('❌ Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
        activityData
      })
      setActivitiesError(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  // Gestionnaires pour le tableau des activités
  const handleEditActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const updatedActivity = await cdcService.updateActivity(id, updates)
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a))
      console.log('✅ Activité mise à jour avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      setActivitiesError('Erreur lors de la mise à jour de l\'activité')
    }
  }

  const handleDeleteActivity = async (id: string) => {
    try {
      await cdcService.deleteActivity(id)
      setActivities(prev => prev.filter(a => a.id !== id))
      console.log('✅ Activité supprimée avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      setActivitiesError('Erreur lors de la suppression de l\'activité')
    }
  }

  const handleViewActivity = (activity: Activity) => {
    console.log('Visualisation de l\'activité:', activity)
    // TODO: Ouvrir la modale de visualisation
  }

  // Gestionnaires pour la timeline
  const handleTimelineDayClick = (day: number | undefined) => {
    setSelectedDay(day)
    // Mettre à jour le filtre avec le jour sélectionné
    setCurrentFilter(prev => ({
      ...prev,
      day
    }))
    console.log('Jour sélectionné dans la timeline:', day)
    // TODO: Filtrer le tableau selon le jour sélectionné
  }

  const handleTimelineMonthChange = (year: number, month: number) => {
    const newYearMonth = `${year}-${month.toString().padStart(2, '0')}`
    setCurrentYearMonth(newYearMonth)
    setSelectedDay(undefined) // Reset la sélection de jour
    setCurrentFilter(prev => ({ ...prev, day: undefined })) // Reset le filtre jour
    console.log('Changement de mois:', newYearMonth)
    // TODO: Charger les activités du nouveau mois
  }

  // Gestionnaires pour les filtres
  const handleFilterChange = (filter: CDCFilter) => {
    setCurrentFilter(filter)
    console.log('Filtre changé:', filter)
    // TODO: Appliquer le filtre aux données
  }

  const handleDayFilterChange = (day: number | undefined) => {
    setSelectedDay(day)
    setCurrentFilter(prev => ({ ...prev, day }))
    console.log('Filtre jour changé:', day)
  }

  // Dashboard spécial pour les administrateurs
  if (user.role === 'administrateur') {
    return (
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* En-tête de bienvenue - Pleine largeur */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Effets de fond animés */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 animate-fade-in">
                Bonjour, {user.firstName} ! 👋
              </h1>
              <p className="text-blue-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {roleContent.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Connecté en tant que {user.roleFront || user.role}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Dashboard Administrateur</span>
                </div>
              </div>
            </div>
          </div>

                    {/* KPIs - Cartes compactes responsive */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                        <KPIETPCard />
                      </div>
                      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                        <KPIRatioCard />
                      </div>
                    </div>

        </div>
      </DashboardLayout>
    )
  }

  // Dashboard spécial pour les CDC Santé Individuelle
  if (user.role === 'cdc_sante_ind') {
    return (
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Message de bienvenue - Pleine largeur */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Effets de fond animés */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 animate-fade-in">
                Bonjour, {user.firstName} ! 👋
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {roleContent.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Connecté en tant que {user.roleFront || user.role}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Espace CDC Santé Individuelle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Santé Individuelle */}
          <SanteIndTimeline
            activities={santeIndActivities}
            year={currentYear}
            month={currentMonth}
            filter={santeIndFilters}
            onDayClick={handleSanteIndTimelineDayClick}
            onMonthChange={handleSanteIndTimelineMonthChange}
            loading={santeIndActivitiesLoading}
          />

          {/* KPIs Santé Individuelle */}
          <SanteIndKPIs
            activities={santeIndActivities}
            yearMonth={currentYearMonth}
            filter={santeIndFilters}
            kpis={santeIndKPIs}
            loading={santeIndActivitiesLoading}
          />

          {/* Zone Santé Individuelle - Boutons de saisie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <SanteIndButtons
              onButtonClick={handleSanteIndButtonClick}
              isLocked={isSanteIndMonthLocked}
              disabled={santeIndLoading}
            />
          </div>

          {/* Affichage des erreurs */}
          {santeIndError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 text-red-600">⚠️</div>
                <span className="text-sm text-red-700 dark:text-red-300">{santeIndError}</span>
                <button
                  onClick={refreshSanteIndActivities}
                  className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Tableau des activités Santé Individuelle */}
          <SanteIndTable
            activities={filteredSanteIndActivities}
            yearMonth={currentYearMonth}
            filter={santeIndFilters}
            isLocked={isSanteIndMonthLocked}
            onEdit={handleEditSanteIndActivity}
            onDelete={handleDeleteSanteIndActivity}
            onView={handleViewSanteIndActivity}
            loading={santeIndActivitiesLoading}
          />

          {/* Modale Santé Individuelle */}
          {selectedActeType && (
            <ModalActe
              isOpen={modalActeOpen}
              onClose={() => {
                setModalActeOpen(false)
                setSelectedActeType(null)
              }}
              onSave={handleSaveSanteIndActivity}
              acteType={selectedActeType}
              loading={santeIndLoading}
              isLocked={isSanteIndMonthLocked}
            />
          )}
        </div>
      </DashboardLayout>
    )
  }

  // Dashboard spécial pour les CDC Commercial
  if (user.role === 'cdc_commercial') {
    return (
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Message de bienvenue - Pleine largeur */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Effets de fond animés */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 animate-fade-in">
                Bonjour, {user.firstName} ! 👋
              </h1>
              <p className="text-blue-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {roleContent.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Connecté en tant que {user.roleFront || user.role}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Espace CDC Commercial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline CDC */}
          <CDCTimeline
            activities={activities}
            year={currentYear}
            month={currentMonth}
            filter={currentFilter}
            onDayClick={handleTimelineDayClick}
            onMonthChange={handleTimelineMonthChange}
            loading={loading}
          />

          {/* Filtres CDC */}
          <CDCFilters
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            selectedDay={selectedDay}
            onDayFilterChange={handleDayFilterChange}
            yearMonth={currentYearMonth}
          />

          {/* KPIs CDC */}
          <CDCKPIs
            activities={activities}
            yearMonth={currentYearMonth}
            filter={currentFilter}
            loading={loading}
          />

              {/* Système de verrouillage - Temporairement désactivé */}
              {/* <CDCLockComponent
                yearMonth={currentYearMonth}
                isLocked={isMonthLocked}
                onLockToggle={handleLockToggle}
                loading={false}
              /> */}

              {/* Zone CDC Commercial - Boutons de saisie */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <CDCButtons
                  onButtonClick={handleCDCButtonClick}
                  isLocked={isMonthLocked}
                  disabled={loading}
                />
                
              </div>


          {/* Affichage des erreurs d'activités */}
          {activitiesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 text-red-600">⚠️</div>
                <span className="text-sm text-red-700 dark:text-red-300">{activitiesError}</span>
                <button
                  onClick={loadActivities}
                  className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Tableau des activités */}
          <ActivityTable
            activities={activities}
            yearMonth={currentYearMonth}
            filter={currentFilter}
            isLocked={isMonthLocked}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            onView={handleViewActivity}
            loading={activitiesLoading}
          />
        </div>

            {/* Modales CDC */}
            <ModalAN
              isOpen={modalANOpen}
              onClose={() => setModalANOpen(false)}
              onSave={handleSaveActivity}
              loading={loading}
              isLocked={isMonthLocked}
            />

            {selectedProcessType && (
              <ModalProcess
                isOpen={modalProcessOpen}
                onClose={() => {
                  setModalProcessOpen(false)
                  setSelectedProcessType(null)
                }}
                onSave={handleSaveActivity}
                processType={selectedProcessType}
                loading={loading}
                isLocked={isMonthLocked}
              />
            )}
      </DashboardLayout>
    )
  }

  // Dashboard standard pour les autres rôles
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-4">
        {/* Bannière de bienvenue centrée */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 sm:p-6 lg:p-8 text-white text-center max-w-2xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Bonjour, {user.firstName} ! 👋
          </h1>
          <p className="text-blue-100 text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
            {roleContent.description}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm sm:text-base lg:text-lg text-blue-100">
              Connecté en tant que {user.roleFront || user.role}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}