// Composant d'affichage des KPIs mensuels Santé Individuelle
// Basé sur les spécifications du CDC Santé Individuelle

"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      hasInfo: false
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
      hasInfo: false
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
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              {/* Effet de fond animé */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 text-${kpi.color}-600`} />
                  {kpi.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Valeur principale - Alignement parfait */}
                  <div className="h-16 flex items-end justify-start">
                    <span className={`text-3xl font-bold ${kpi.textColor} leading-none`}>
                      {kpi.value}
                    </span>
                    {kpi.suffix && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 mb-1">
                        {kpi.suffix}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {kpi.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Graphique de progression des commissions */}
      <CommissionProgressChart 
        currentCA={calculatedKPIs.productionPondere}
        currentMonth={monthName}
      />
    </div>
  )
}
