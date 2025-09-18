// Composant d'affichage des KPIs mensuels Santé Individuelle
// Basé sur les spécifications du CDC Santé Individuelle

"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SanteIndActivity, SanteIndKPI, SanteIndActeType, SanteIndFilter } from '@/types/sante-ind'
import { calculateKPIs, formatEuroInt, formatPercentage, filterActivities } from '@/lib/sante-ind'
import { CommissionProgressChart } from './CommissionProgressChart'
import { 
  Euro,
  Target,
  Percent,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface SanteIndKPIsProps {
  activities: SanteIndActivity[]
  yearMonth: string
  filter?: SanteIndFilter
  kpis?: SanteIndKPI
  loading?: boolean
}

export function SanteIndKPIs({ activities, yearMonth, filter, kpis, loading = false }: SanteIndKPIsProps) {
  // État pour les modales
  const [ponderationModalOpen, setPonderationModalOpen] = useState(false)
  const [commissionModalOpen, setCommissionModalOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [commissionHoverTimeout, setCommissionHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  // Fonctions de gestion du survol avec délai
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    const timeout = setTimeout(() => {
      setPonderationModalOpen(true)
    }, 500) // Délai de 500ms avant d'ouvrir
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // Pas de timeout automatique - la modale reste ouverte
    // Elle ne se fermera que si on survole la modale puis qu'on la quitte
  }

  // Fonctions de gestion du survol pour la modale des commissions
  const handleCommissionMouseEnter = () => {
    if (commissionHoverTimeout) {
      clearTimeout(commissionHoverTimeout)
    }
    const timeout = setTimeout(() => {
      setCommissionModalOpen(true)
    }, 500) // Délai de 500ms avant d'ouvrir
    setCommissionHoverTimeout(timeout)
  }

  const handleCommissionMouseLeave = () => {
    if (commissionHoverTimeout) {
      clearTimeout(commissionHoverTimeout)
      setCommissionHoverTimeout(null)
    }
    // Pas de timeout automatique - la modale reste ouverte
  }

  // Calcul des KPIs si non fournis
  const calculatedKPIs = useMemo(() => {
    if (kpis) return kpis
    if (!activities.length) return null
    
    // Appliquer les filtres aux activités
    const filteredActivities = filter ? filterActivities(activities, filter) : activities
    
    // Simulation d'un userId (à récupérer du contexte auth)
    const userId = 'current-user'
    return calculateKPIs(filteredActivities, yearMonth, userId)
  }, [activities, yearMonth, filter, kpis])

  // Parsing de l'année et du mois
  const [year, month] = yearMonth.split('-').map(Number)
  const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!calculatedKPIs) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les KPIs seront calculés dès qu'il y aura des activités
          </p>
        </div>
      </div>
    )
  }

  const kpiCards = [
    // Production brute
    {
      title: 'Production Brute',
      value: formatEuroInt(calculatedKPIs.productionBrute),
      icon: Euro,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: 'Chiffre d\'affaires total',
      suffix: '',
      hasInfo: false
    },
    
    // Production pondérée
    {
      title: 'Production Pondérée',
      value: formatEuroInt(calculatedKPIs.productionPondere),
      icon: Target,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      description: 'CA pondéré selon grille',
      suffix: '',
      hasInfo: false,
      showModal: true
    },
    
    // Commission estimée
    {
      title: 'Commission Estimée',
      value: formatEuroInt(calculatedKPIs.commissionEstimee),
      icon: BarChart3,
      color: calculatedKPIs.commissionEstimee > 0 ? 'yellow' : 'gray',
      gradient: calculatedKPIs.commissionEstimee > 0 ? 'from-yellow-500 to-orange-600' : 'from-gray-500 to-gray-600',
      bgColor: calculatedKPIs.commissionEstimee > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      textColor: calculatedKPIs.commissionEstimee > 0 ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300',
      description: 'Commission calculée',
      suffix: '',
      hasInfo: false
    },
    
    // Commission réelle
    {
      title: 'Commission Réelle',
      value: formatEuroInt(calculatedKPIs.commissionEstimee), // TODO: Remplacer par commission réelle quand disponible
      icon: Percent,
      color: calculatedKPIs.commissionEstimee > 0 ? 'purple' : 'gray',
      gradient: calculatedKPIs.commissionEstimee > 0 ? 'from-purple-500 to-violet-600' : 'from-gray-500 to-gray-600',
      bgColor: calculatedKPIs.commissionEstimee > 0 ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      textColor: calculatedKPIs.commissionEstimee > 0 ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300',
      description: 'Commission finale',
      suffix: '',
      hasInfo: false,
      showModal: true
    },

    // Suivi des révisions
    {
      title: 'Révisions',
      value: `${calculatedKPIs.nombreRevisions}/4`,
      icon: FileText,
      color: calculatedKPIs.critereQualitatifAtteint ? 'green' : calculatedKPIs.nombreRevisions >= 2 ? 'orange' : 'red',
      gradient: calculatedKPIs.critereQualitatifAtteint ? 'from-green-500 to-emerald-600' : calculatedKPIs.nombreRevisions >= 2 ? 'from-orange-500 to-yellow-600' : 'from-red-500 to-pink-600',
      bgColor: calculatedKPIs.critereQualitatifAtteint ? 'bg-green-50 dark:bg-green-900/20' : calculatedKPIs.nombreRevisions >= 2 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-red-50 dark:bg-red-900/20',
      textColor: calculatedKPIs.critereQualitatifAtteint ? 'text-green-700 dark:text-green-300' : calculatedKPIs.nombreRevisions >= 2 ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300',
      description: calculatedKPIs.critereQualitatifAtteint ? 'Objectif atteint ✅' : calculatedKPIs.nombreRevisions >= 2 ? `En cours (${4 - calculatedKPIs.nombreRevisions} restantes)` : `Démarrage (${4 - calculatedKPIs.nombreRevisions} à faire)`,
      suffix: '',
      hasInfo: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* En-tête des KPIs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              KPIs Mensuels
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Métriques de performance pour {monthName}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              <Calendar className="h-3 w-3 mr-1" />
              {monthName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Grille des KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon
          
          return (
            <Card 
              key={index} 
              className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              onMouseEnter={kpi.showModal ? (kpi.title === 'Production Pondérée' ? handleMouseEnter : handleCommissionMouseEnter) : undefined}
              onMouseLeave={kpi.showModal ? (kpi.title === 'Production Pondérée' ? handleMouseLeave : handleCommissionMouseLeave) : undefined}
            >
              {/* Effet de fond animé */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Structure en grille pour alignement parfait */}
              <div className="grid grid-rows-[auto_1fr_auto] h-full p-6">
                {/* Titre - Hauteur fixe */}
                <div className="h-8 flex items-center">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 text-${kpi.color}-600`} />
                    {kpi.title}
                  </CardTitle>
                </div>
                
                {/* Valeur principale - Zone flexible pour alignement */}
                <div className="flex items-end justify-start">
                  <span className={`text-3xl font-bold ${kpi.textColor} leading-none`}>
                    {kpi.value}
                  </span>
                  {kpi.suffix && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 mb-1">
                      {kpi.suffix}
                    </span>
                  )}
                </div>
                
                {/* Description - Hauteur fixe */}
                <div className="h-6 flex items-start">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {kpi.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Graphique de progression des commissions */}
      <CommissionProgressChart 
        currentCA={calculatedKPIs.productionPondere}
        currentMonth={monthName}
      />

      {/* Modale de pondération au survol */}
      <Dialog open={ponderationModalOpen} onOpenChange={setPonderationModalOpen}>
        <DialogContent 
          className="max-w-md"
          onMouseEnter={() => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout)
              setHoverTimeout(null)
            }
          }}
          onMouseLeave={() => {
            // Délai plus long pour permettre de revenir sur la carte
            const timeout = setTimeout(() => {
              setPonderationModalOpen(false)
            }, 1000) // 1 seconde pour permettre de revenir
            setHoverTimeout(timeout)
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Coefficients de Pondération
            </DialogTitle>
            <DialogDescription>
              Grille de pondération appliquée au chiffre d'affaires brut
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded border">
                <span className="font-medium text-sm">Affaire Nouvelle</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">100%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                <span className="font-medium text-sm">Révision</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">75%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded border">
                <span className="font-medium text-sm">Adhésion Groupe</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs">50%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded border">
                <span className="font-medium text-sm">Courtage → Allianz</span>
                <Badge className="bg-orange-100 text-orange-800 text-xs">100%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                <span className="font-medium text-sm">Allianz → Courtage</span>
                <Badge className="bg-red-100 text-red-800 text-xs">100%</Badge>
              </div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 mt-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                <strong>Production Pondérée = CA Brut × Coefficient</strong>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale des commissions au survol */}
      <Dialog open={commissionModalOpen} onOpenChange={setCommissionModalOpen}>
        <DialogContent 
          className="max-w-lg"
          onMouseEnter={() => {
            if (commissionHoverTimeout) {
              clearTimeout(commissionHoverTimeout)
              setCommissionHoverTimeout(null)
            }
          }}
          onMouseLeave={() => {
            // Délai plus long pour permettre de revenir sur la carte
            const timeout = setTimeout(() => {
              setCommissionModalOpen(false)
            }, 1000) // 1 seconde pour permettre de revenir
            setCommissionHoverTimeout(timeout)
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-purple-600" />
              Tableau des Commissions Réelles
            </DialogTitle>
            <DialogDescription>
              Grille de commission basée sur le CA pondéré et le critère qualité
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tableau des seuils */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Seuils de CA Pondéré</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                  <span className="font-medium text-sm">0€ - 10 000€</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">0%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                  <span className="font-medium text-sm">10 000€ - 25 000€</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">2%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                  <span className="font-medium text-sm">25 000€ - 50 000€</span>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">4%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded border">
                  <span className="font-medium text-sm">50 000€+</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">6%</Badge>
                </div>
              </div>
            </div>

            {/* Critère qualité */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <h4 className="font-medium text-sm text-orange-700 dark:text-orange-300 mb-2">Critère Qualité</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-orange-600 dark:text-orange-400">Minimum 4 révisions</span>
                <Badge className="bg-orange-100 text-orange-800 text-xs">Obligatoire</Badge>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Sans ce critère, la commission reste à 0%
              </p>
            </div>

            {/* Formule */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                <strong>Commission Réelle = CA Pondéré × Taux × Critère Qualité</strong>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
