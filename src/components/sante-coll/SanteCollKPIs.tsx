// Composant KPIs pour le dashboard CDC Santé Collective
// Affichage des indicateurs clés de performance

"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SanteCollActivity, SanteCollKPI } from '@/types/sante-coll'
import { formatEuroInt, formatEuroDecimal, calculateCommission } from '@/lib/sante-coll'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Euro, 
  Users, 
  FileText,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar
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
      
      <CardContent className="space-y-6">
        {/* Production */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Production brute</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatEuroInt(displayKPIs.productionBrute)}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Production pondérée</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatEuroInt(displayKPIs.productionPondere)}
            </div>
          </div>
        </div>

        {/* Commission */}
        {commissionCalculation && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Commission estimée</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatEuroDecimal(commissionCalculation.commissionEstimee)}
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                {commissionCalculation.tauxApplicable}%
              </Badge>
            </div>
            
            {commissionCalculation.prochainSeuil && (
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Prochain seuil: {formatEuroInt(commissionCalculation.prochainSeuil.min)} 
                ({formatEuroInt(commissionCalculation.ecartProchainSeuil!)} restant)
              </div>
            )}
          </div>
        )}

        {/* Activités par type */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Répartition des activités
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✨</span>
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Affaires nouvelles</span>
              </div>
              <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {displayKPIs.nombreAffairesNouvelles}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Révisions</span>
              </div>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {displayKPIs.nombreRevisions}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">👥</span>
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Adhésions groupe</span>
              </div>
              <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {displayKPIs.nombreAdhesionsGroupe}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">🔄</span>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Transferts</span>
              </div>
              <span className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {displayKPIs.nombreTransfertsCourtage}
              </span>
            </div>
          </div>
        </div>

        {/* Critère qualitatif */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {displayKPIs.critereQualitatifAtteint ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Critère qualitatif
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              Minimum 4 révisions requises
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                {displayKPIs.nombreRevisions}/4
              </span>
              {displayKPIs.critereQualitatifAtteint ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Atteint
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  ⚠️ En cours
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            <Progress 
              value={(displayKPIs.nombreRevisions / 4) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* Total des activités */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total des activités
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {displayKPIs.nombreAffairesNouvelles + displayKPIs.nombreRevisions + displayKPIs.nombreAdhesionsGroupe + displayKPIs.nombreTransfertsCourtage}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
