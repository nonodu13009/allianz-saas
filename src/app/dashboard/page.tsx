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
import { CDCLockComponent } from '@/components/cdc/CDCLock'
import { ActivityType, Activity, CDCFilter, CDCLock, ProductType } from '@/types/cdc'
import { CDCLockService } from '@/lib/cdc-lock-service'

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
  
  // États pour le tableau des activités
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  // Données de test pour démonstration - 15 activités mock
  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Helper pour créer les métadonnées de date
    const createDateMetadata = (day: number) => {
      const date = new Date(currentYear, currentMonth, day).toISOString()
      return {
        dateSaisie: date,
        createdAt: date,
        updatedAt: date
      }
    }
    
    // Données de test simplifiées pour corriger l'erreur
    const testActivities: Activity[] = [
      // AN - AUTO/MOTO (10€ de commission)
      {
        id: 'mock-1',
        type: ActivityType.AN,
        clientName: 'DUPONT JEAN',
        productType: ProductType.AUTO_MOTO,
        contractNumber: 'AUTO-2024-001',
        dateEffet: '2024-01-15',
        primeAnnuelle: 1200,
        commissionPotentielle: 10,
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(1)
      },
      {
        id: 'mock-2',
        type: ActivityType.AN,
        clientName: 'MARTIN MARIE',
        productType: ProductType.AUTO_MOTO,
        contractNumber: 'AUTO-2024-002',
        dateEffet: '2024-02-20',
        primeAnnuelle: 850,
        commissionPotentielle: 10,
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(2)
      },
      {
        id: 'mock-3',
        type: ActivityType.AN,
        clientName: 'BERNARD PIERRE',
        productType: ProductType.IARD_PART_DIVERS,
        contractNumber: 'IARD-2024-001',
        dateEffet: '2024-03-10',
        primeAnnuelle: 450,
        commissionPotentielle: 20,
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(3)
      },
      {
        id: 'mock-4',
        type: ActivityType.AN,
        clientName: 'DUBOIS CLAIRE',
        productType: ProductType.PJ,
        contractNumber: 'PJ-2024-001',
        dateEffet: '2024-04-05',
        primeAnnuelle: 320,
        commissionPotentielle: 30,
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(4)
      },
      {
        id: 'mock-5',
        type: ActivityType.AN,
        clientName: 'ROUSSEAU MICHEL',
        productType: ProductType.SANTE_PREV,
        contractNumber: 'SANTE-2024-001',
        dateEffet: '2024-05-12',
        primeAnnuelle: 680,
        commissionPotentielle: 50,
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(5)
      },
      // Process - M+3
      {
        id: 'mock-6',
        type: ActivityType.M3,
        clientName: 'LEROY FRANÇOIS',
        comment: 'Prise de contact suite à souscription - Suivi M+3',
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(6)
      },
      {
        id: 'mock-7',
        type: ActivityType.M3,
        clientName: 'PETIT LAURENT',
        comment: 'Relance client pour renouvellement',
        userId: user?.uid || 'test-user',
        yearMonth: currentYearMonth,
        isLocked: false,
        ...createDateMetadata(7)
      }
    ]
    
    setActivities(testActivities)
  }, [user, currentYearMonth])
  const [isMonthLocked, setIsMonthLocked] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | undefined>()
  const [currentFilter, setCurrentFilter] = useState<CDCFilter>({
    type: 'all',
    product: undefined,
    day: undefined
  })
  
  // États pour le verrouillage
  const [lockData, setLockData] = useState<CDCLock | null>(null)
  const [lockLoading, setLockLoading] = useState(false)

  // Charger le statut de verrouillage au montage du composant
  useEffect(() => {
    const loadLockStatus = async () => {
      if (!user || !user.uid) return

      try {
        // TEMPORAIRE : Déverrouiller le mois pour le développement
        // TODO : Restaurer le système de verrouillage après développement
        setIsMonthLocked(false)
        setLockData({
          id: `temp_unlock_${user.uid}_${currentYearMonth}`,
          userId: user.uid,
          yearMonth: currentYearMonth,
          isLocked: false,
          lockedBy: null,
          lockedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
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

  // Gestionnaire pour le verrouillage/déverrouillage
  const handleLockToggle = async (locked: boolean) => {
    if (!user || !user.uid) {
      console.error('Utilisateur non authentifié')
      return
    }

    // TEMPORAIRE : Désactiver le système de verrouillage pour le développement
    // TODO : Restaurer le système de verrouillage après développement
    console.log(`Tentative de verrouillage/déverrouillage désactivée temporairement: ${locked}`)
    return
    
    // Code original commenté :
    // setLockLoading(true)
    // try {
    //   console.log('Tentative de verrouillage:', {
    //     userId: user.uid,
    //     yearMonth: currentYearMonth,
    //     locked,
    //     lockedBy: user.firstName + ' ' + user.lastName
    //   })

    //   const result = await CDCLockService.toggleLock(
    //     user.uid,
    //     currentYearMonth,
    //     locked,
    //     user.firstName + ' ' + user.lastName
    //   )
    //   
    //   console.log('Résultat du verrouillage:', result)
    //   setLockData(result.lock)
    //   setIsMonthLocked(result.lock.isLocked)
    // } catch (error) {
    //   console.error('Erreur lors du changement de verrouillage:', error)
    //   throw error
    // } finally {
    //   setLockLoading(false)
    // }
  }

  // Gestionnaire pour la sauvegarde des activités
  const handleSaveActivity = async (activityData: any) => {
    setLoading(true)
    try {
      // Créer l'activité avec les données complètes
      const newActivity = {
        ...activityData,
        id: `activity_${Date.now()}`,
        userId: user?.uid || 'unknown',
        yearMonth: currentYearMonth,
        isLocked: false // Par défaut, le mois est ouvert
      }
      
      // TODO: Appel API pour sauvegarder l'activité
      console.log('Sauvegarde de l\'activité:', newActivity)
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Ajouter l'activité à la liste locale pour mise à jour immédiate
      setActivities(prev => [...prev, newActivity])
      
      // Fermer les modales
      setModalANOpen(false)
      setModalProcessOpen(false)
      setSelectedProcessType(null)
      
      // Afficher un message de succès
      console.log('Activité ajoutée avec succès au tableau et à la timeline')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      // TODO: Afficher un message d'erreur
    } finally {
      setLoading(false)
    }
  }

  // Gestionnaires pour le tableau des activités
  const handleEditActivity = (activity: Activity) => {
    console.log('Édition de l\'activité:', activity)
    // TODO: Ouvrir la modale d'édition
  }

  const handleDeleteActivity = (activity: Activity) => {
    console.log('Suppression de l\'activité:', activity)
    // TODO: Confirmer et supprimer l'activité
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
                lockedBy={lockData?.lockedBy}
                lockedAt={lockData?.lockedAt}
                onLockToggle={handleLockToggle}
                loading={lockLoading}
              /> */}

              {/* Zone CDC Commercial - Boutons de saisie */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <CDCButtons
                  onButtonClick={handleCDCButtonClick}
                  isLocked={isMonthLocked}
                  disabled={loading}
                />
              </div>

          {/* Tableau des activités */}
          <ActivityTable
            activities={activities}
            yearMonth={currentYearMonth}
            filter={currentFilter}
            isLocked={isMonthLocked}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            onView={handleViewActivity}
            loading={loading}
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