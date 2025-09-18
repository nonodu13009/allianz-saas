// Composant d'affichage des KPIs mensuels Santé Individuelle
// Basé sur les spécifications du CDC Santé Individuelle

"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
  Info,
  X
} from 'lucide-react'

interface SanteIndKPIsProps {
  activities: SanteIndActivity[]
  yearMonth: string
  filter?: SanteIndFilter
  kpis?: SanteIndKPI
  loading?: boolean
}

export function SanteIndKPIs({ activities, yearMonth, filter, kpis, loading = false }: SanteIndKPIsProps) {
  // États pour les modales d'information
  const [ponderationModalOpen, setPonderationModalOpen] = useState(false)
  const [commissionModalOpen, setCommissionModalOpen] = useState(false)

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
      hasInfo: true,
      infoAction: () => {
        console.log('🔄 Ouverture modale pondération')
        setPonderationModalOpen(true)
      }
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
      hasInfo: true,
      infoAction: () => {
        console.log('🔄 Ouverture modale commission')
        setCommissionModalOpen(true)
      }
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
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 text-${kpi.color}-600`} />
                    {kpi.title}
                  </div>
                  {kpi.hasInfo && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        kpi.infoAction?.()
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Informations"
                    >
                      <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Valeur principale - Alignement horizontal fixe */}
                  <div className="h-12 flex items-end">
                    <span className={`text-2xl font-bold ${kpi.textColor}`}>
                      {kpi.value}
                    </span>
                    {kpi.suffix && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
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

      {/* Modale d'information - Règles de pondération */}
      <Dialog open={ponderationModalOpen} onOpenChange={setPonderationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Règles de Pondération
            </DialogTitle>
            <DialogDescription>
              Grille de pondération appliquée au chiffre d'affaires brut
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">
                📊 Grille de Pondération
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">Affaire Nouvelle</span>
                  <Badge className="bg-emerald-100 text-emerald-800">100%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">Révision</span>
                  <Badge className="bg-blue-100 text-blue-800">75%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">Adhésion Groupe</span>
                  <Badge className="bg-purple-100 text-purple-800">50%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">Courtage → Allianz</span>
                  <Badge className="bg-orange-100 text-orange-800">100%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">Allianz → Courtage</span>
                  <Badge className="bg-red-100 text-red-800">100%</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Calcul de la Production Pondérée
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Production Pondérée = CA Brut × Taux de Pondération</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Exemple : Une révision de 10,000€ = 10,000€ × 75% = 7,500€ de production pondérée
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setPonderationModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale d'information - Règles de commission */}
      <Dialog open={commissionModalOpen} onOpenChange={setCommissionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-purple-600" />
              Règles de Commission
            </DialogTitle>
            <DialogDescription>
              Calcul des commissions basé sur la production pondérée et le critère qualitatif
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                📈 Seuils de Commission
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">&lt; 10,000€</span>
                  <Badge className="bg-gray-100 text-gray-800">0%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">10,000€ - 13,999€</span>
                  <Badge className="bg-blue-100 text-blue-800">2%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">14,000€ - 17,999€</span>
                  <Badge className="bg-green-100 text-green-800">3%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">18,000€ - 21,999€</span>
                  <Badge className="bg-orange-100 text-orange-800">4%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <span className="font-medium">≥ 22,000€</span>
                  <Badge className="bg-purple-100 text-purple-800">6%</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚖️ Critère Qualitatif
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                <strong>Minimum 4 révisions par mois</strong>
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  calculatedKPIs.critereQualitatifAtteint ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm">
                  {calculatedKPIs.nombreRevisions} / 4 révisions
                  {calculatedKPIs.critereQualitatifAtteint ? ' ✅ Atteint' : ' ⏳ En cours'}
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💰 Calcul de la Commission Réelle
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Commission Réelle = Taux de Commission × Production Pondérée</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Le critère qualitatif doit être atteint pour valider la commission
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setCommissionModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
