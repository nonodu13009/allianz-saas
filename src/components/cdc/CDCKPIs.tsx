// Composant d'affichage des KPIs mensuels CDC
// Basé sur les spécifications du CDC commercial

"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, CDCKPI, ActivityType, ProductType, CDCFilter } from '@/types/cdc'
import { calculateKPIs, formatEuroInt, formatPercentage, filterActivities } from '@/lib/cdc'
import { 
  TrendingUp, 
  Users, 
  Car, 
  FileText, 
  Euro,
  Target,
  Percent,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

interface CDCKPIsProps {
  activities: Activity[]
  yearMonth: string
  filter?: CDCFilter
  kpis?: CDCKPI
  loading?: boolean
}

export function CDCKPIs({ activities, yearMonth, filter, kpis, loading = false }: CDCKPIsProps) {
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
    // Nombre d'affaires nouvelles
    {
      title: 'Affaires Nouvelles',
      value: calculatedKPIs.nombreAffairesNouvelles,
      icon: TrendingUp,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      description: 'Nouvelles affaires enregistrées',
      suffix: 'affaire' + (calculatedKPIs.nombreAffairesNouvelles > 1 ? 's' : '')
    },
    
    // Nombre AUTO/MOTO
    {
      title: 'AUTO/MOTO',
      value: calculatedKPIs.nombreAutoMoto,
      icon: Car,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: 'Contrats automobile et moto',
      suffix: 'contrat' + (calculatedKPIs.nombreAutoMoto > 1 ? 's' : '')
    },
    
    // Nombre autres
    {
      title: 'Autres Produits',
      value: calculatedKPIs.nombreAutres,
      icon: FileText,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      description: 'Autres types de contrats',
      suffix: 'contrat' + (calculatedKPIs.nombreAutres > 1 ? 's' : '')
    },
    
    // Nombre de process
    {
      title: 'Process Total',
      value: calculatedKPIs.nombreProcess,
      icon: Users,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      description: 'Processus commerciaux',
      suffix: 'process' + (calculatedKPIs.nombreProcess > 1 ? '' : '')
    },
    
    // CA d'affaire cumulé
    {
      title: 'CA Cumulé',
      value: formatEuroInt(calculatedKPIs.caAffaireCumule),
      icon: Euro,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      description: 'Chiffre d\'affaires total',
      suffix: ''
    },
    
    // Ratio
    {
      title: 'Ratio',
      value: formatPercentage(calculatedKPIs.ratio),
      icon: Percent,
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      description: 'Autres / AUTO/MOTO',
      suffix: ''
    },
    
    // Commissions potentielles
    {
      title: 'Commissions Potentielles',
      value: formatEuroInt(calculatedKPIs.commissionsPotentielles),
      icon: Target,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      description: 'Commissions calculées',
      suffix: ''
    },
    
    // Commissions réelles
    {
      title: 'Commissions Réelles',
      value: formatEuroInt(calculatedKPIs.commissionsReelles),
      icon: BarChart3,
      color: calculatedKPIs.commissionsReelles > 0 ? 'emerald' : 'gray',
      gradient: calculatedKPIs.commissionsReelles > 0 ? 'from-emerald-500 to-green-600' : 'from-gray-500 to-gray-600',
      bgColor: calculatedKPIs.commissionsReelles > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      textColor: calculatedKPIs.commissionsReelles > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300',
      description: calculatedKPIs.commissionsReelles > 0 ? 'Commissions validées' : 'Conditions non remplies',
      suffix: ''
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
                  
                  {/* Indicateur de statut pour les commissions réelles */}
                  {kpi.title === 'Commissions Réelles' && (
                    <div className="mt-2">
                      {calculatedKPIs.commissionsReelles > 0 ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          ✅ Validé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                          ⏳ En attente
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Détail des conditions pour les commissions réelles */}
      {calculatedKPIs.commissionsReelles === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conditions pour les Commissions Réelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${calculatedKPIs.commissionsPotentielles >= 200 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Commissions ≥ 200€
              </span>
              <Badge variant="outline" className="text-xs">
                {formatEuroInt(calculatedKPIs.commissionsPotentielles)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${calculatedKPIs.nombreProcess >= 15 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Process ≥ 15
              </span>
              <Badge variant="outline" className="text-xs">
                {calculatedKPIs.nombreProcess}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${calculatedKPIs.ratio >= 100 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Ratio ≥ 100%
              </span>
              <Badge variant="outline" className="text-xs">
                {formatPercentage(calculatedKPIs.ratio)}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Détail des process */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Détail des Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{calculatedKPIs.nombreM3}</div>
            <div className="text-sm text-blue-600">M+3</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{calculatedKPIs.nombrePretermeAuto}</div>
            <div className="text-sm text-orange-600">Préterme Auto</div>
          </div>
          <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="text-2xl font-bold text-violet-600">{calculatedKPIs.nombrePretermeIrd}</div>
            <div className="text-sm text-violet-600">Préterme IRD</div>
          </div>
        </div>
      </div>
    </div>
  )
}
