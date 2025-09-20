// Composant KPIs pour le dashboard CDC Santé Collective
// Affichage des indicateurs clés de performance

"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SanteCollActivity, SanteCollKPI } from '@/types/sante-coll'
import { formatEuroInt, formatEuroDecimal, calculateCommission } from '@/lib/sante-coll'
import { 
  TrendingUp, 
  Target, 
  Euro, 
  FileText
} from 'lucide-react'

interface SanteCollKPIsProps {
  activities: SanteCollActivity[]
  yearMonth: string
  kpis: SanteCollKPI | null
  loading?: boolean
}

export function SanteCollKPIs({ 
  activities, 
  yearMonth, 
  kpis, 
  loading = false 
}: SanteCollKPIsProps) {
  
  // Parsing de l'année et du mois
  const [year, month] = yearMonth.split('-').map(Number)
  
  // KPIs par défaut si pas de données
  const defaultKPIs: SanteCollKPI = {
    productionBrute: 0,
    productionPondere: 0,
    nombreAffairesNouvelles: 0,
    nombreRevisions: 0,
    nombreAdhesionsGroupe: 0,
    nombreTransfertsCourtage: 0,
    critereQualitatifAtteint: false
  }

  const displayKPIs = kpis || defaultKPIs
  
  // Calcul de la commission
  const commissionCalculation = calculateCommission(displayKPIs.productionPondere)

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            KPIs Santé Collective
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-gray-600 dark:text-gray-400">Chargement des KPIs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          KPIs Santé Collective - {month}/{year}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Grille de cartes KPIs compactes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Production brute */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <Euro className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                Production
              </Badge>
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
              {formatEuroInt(displayKPIs.productionBrute)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Production brute
            </div>
          </div>

          {/* Production pondérée */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                Pondérée
              </Badge>
            </div>
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              {formatEuroInt(displayKPIs.productionPondere)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              Production pondérée
            </div>
          </div>

          {/* Commission */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                {commissionCalculation?.tauxApplicable || 0}%
              </Badge>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-1">
              {formatEuroDecimal(commissionCalculation?.commissionEstimee || 0)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Commission estimée
            </div>
          </div>

          {/* Total activités */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                Total
              </Badge>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {displayKPIs.nombreAffairesNouvelles + displayKPIs.nombreRevisions + displayKPIs.nombreAdhesionsGroupe + displayKPIs.nombreTransfertsCourtage}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Activités totales
            </div>
          </div>
        </div>

        {/* Cartes des types d'activités */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Affaires nouvelles */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-600 text-lg">✨</span>
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Affaires nouvelles</span>
            </div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              {displayKPIs.nombreAffairesNouvelles}
            </div>
          </div>

          {/* Révisions */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600 text-lg">📝</span>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Révisions</span>
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {displayKPIs.nombreRevisions}
            </div>
          </div>

          {/* Adhésions groupe */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-600 text-lg">👥</span>
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Adhésions groupe</span>
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {displayKPIs.nombreAdhesionsGroupe}
            </div>
          </div>

          {/* Transferts */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-orange-600 text-lg">🔄</span>
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Transferts</span>
            </div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {displayKPIs.nombreTransfertsCourtage}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
