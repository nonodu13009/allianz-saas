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
  TrendingUp, 
  Users, 
  FileText, 
  Euro,
  Target,
  Percent,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle,
  AlertCircle,
  XCircle
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
      suffix: ''
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
      suffix: ''
    },
    
    // Taux de commission
    {
      title: 'Taux Commission',
      value: formatPercentage(calculatedKPIs.tauxCommission),
      icon: Percent,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      description: 'Taux applicable selon seuils',
      suffix: ''
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
      suffix: ''
    },
    
    // Affaires nouvelles
    {
      title: 'Affaires Nouvelles',
      value: calculatedKPIs.nombreAffairesNouvelles,
      icon: TrendingUp,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      description: 'Nouvelles affaires',
      suffix: 'affaire' + (calculatedKPIs.nombreAffairesNouvelles > 1 ? 's' : '')
    },
    
    // Révisions
    {
      title: 'Révisions',
      value: calculatedKPIs.nombreRevisions,
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: 'Contrats révisés',
      suffix: 'révision' + (calculatedKPIs.nombreRevisions > 1 ? 's' : '')
    },
    
    // Adhésions groupe
    {
      title: 'Adhésions Groupe',
      value: calculatedKPIs.nombreAdhesionsGroupe,
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      description: 'Adhésions à un groupe',
      suffix: 'adhésion' + (calculatedKPIs.nombreAdhesionsGroupe > 1 ? 's' : '')
    },
    
    // Transferts
    {
      title: 'Transferts',
      value: calculatedKPIs.nombreCourtageVersAllianz + calculatedKPIs.nombreAllianzVersCourtage,
      icon: Target,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      description: 'Transferts totaux',
      suffix: 'transfert' + ((calculatedKPIs.nombreCourtageVersAllianz + calculatedKPIs.nombreAllianzVersCourtage) > 1 ? 's' : '')
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              
              <CardContent>
                <div className="space-y-2">
                  {/* Valeur principale */}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${kpi.textColor}`}>
                      {kpi.value}
                    </span>
                    {kpi.suffix && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
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

      {/* Critère qualitatif */}
      <div className={`rounded-2xl p-6 border ${
        calculatedKPIs.critereQualitatifAtteint 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {calculatedKPIs.critereQualitatifAtteint ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className={calculatedKPIs.critereQualitatifAtteint ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}>
            Critère Qualitatif
          </span>
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              calculatedKPIs.critereQualitatifAtteint ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className={`text-sm ${
              calculatedKPIs.critereQualitatifAtteint ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              Minimum 4 révisions
            </span>
          </div>
          
          <Badge variant="outline" className={`text-xs ${
            calculatedKPIs.critereQualitatifAtteint 
              ? 'border-green-300 text-green-700' 
              : 'border-yellow-300 text-yellow-700'
          }`}>
            {calculatedKPIs.nombreRevisions} / 4
          </Badge>
          
          {calculatedKPIs.critereQualitatifAtteint ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
              ✅ Atteint
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
              ⏳ En cours
            </Badge>
          )}
        </div>
      </div>

      {/* Graphique de progression des commissions */}
      <CommissionProgressChart 
        currentCA={calculatedKPIs.productionPondere}
        currentMonth={monthName}
      />

      {/* Détail des actes par type */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Détail des Actes par Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{calculatedKPIs.nombreAffairesNouvelles}</div>
            <div className="text-sm text-emerald-600">Affaires Nouvelles</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{calculatedKPIs.nombreRevisions}</div>
            <div className="text-sm text-blue-600">Révisions</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{calculatedKPIs.nombreAdhesionsGroupe}</div>
            <div className="text-sm text-purple-600">Adhésions Groupe</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{calculatedKPIs.nombreCourtageVersAllianz}</div>
            <div className="text-sm text-orange-600">C→A</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{calculatedKPIs.nombreAllianzVersCourtage}</div>
            <div className="text-sm text-red-600">A→C</div>
          </div>
        </div>
      </div>
    </div>
  )
}
