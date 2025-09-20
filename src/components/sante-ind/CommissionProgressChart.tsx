// Graphique de progression des commissions CDC Santé Individuelle
// Visualise la progression vers les seuils de commission supérieurs

"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatEuroInt } from '@/lib/sante-ind'
import { 
  TrendingUp, 
  Target, 
  ArrowUp, 
  Euro,
  BarChart3,
  Zap
} from 'lucide-react'

interface CommissionProgressChartProps {
  currentCA: number
  currentMonth: string
  className?: string
}

// Seuils de commission progressifs
const COMMISSION_THRESHOLDS = [
  { min: 0, max: 9999, rate: 0, label: '0%', color: 'bg-gray-100 text-gray-600' },
  { min: 10000, max: 13999, rate: 2, label: '2%', color: 'bg-blue-100 text-blue-600' },
  { min: 14000, max: 17999, rate: 3, label: '3%', color: 'bg-green-100 text-green-600' },
  { min: 18000, max: 21999, rate: 4, label: '4%', color: 'bg-orange-100 text-orange-600' },
  { min: 22000, max: Infinity, rate: 6, label: '6%', color: 'bg-purple-100 text-purple-600' }
]

export function CommissionProgressChart({ 
  currentCA, 
  currentMonth, 
  className = '' 
}: CommissionProgressChartProps) {
  
  // Calcul de la progression actuelle
  const progressData = useMemo(() => {
    const currentThreshold = COMMISSION_THRESHOLDS.find(
      threshold => currentCA >= threshold.min && currentCA <= threshold.max
    ) || COMMISSION_THRESHOLDS[0]
    
    const nextThreshold = COMMISSION_THRESHOLDS.find(
      threshold => threshold.min > currentCA
    )
    
    const progressInCurrentThreshold = nextThreshold 
      ? ((currentCA - currentThreshold.min) / (nextThreshold.min - currentThreshold.min)) * 100
      : 100
    
    const remainingToNext = nextThreshold ? nextThreshold.min - currentCA : 0
    
    return {
      currentThreshold,
      nextThreshold,
      progressInCurrentThreshold: Math.min(progressInCurrentThreshold, 100),
      remainingToNext,
      currentRate: currentThreshold.rate
    }
  }, [currentCA])

  return (
    <Card className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Progression des Commissions
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
            {currentMonth}
          </Badge>
        </CardTitle>
        <CardDescription>
          Visualisez votre progression vers les seuils de commission supérieurs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* État actuel */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600" />
              Niveau Actuel
            </h3>
            <Badge className={`${progressData.currentThreshold.color} border-0`}>
              {progressData.currentThreshold.label}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-1">
              {formatEuroInt(currentCA)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              CA Brut du mois
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progression vers le niveau supérieur
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {progressData.progressInCurrentThreshold.toFixed(1)}%
            </span>
          </div>
          
          <Progress 
            value={progressData.progressInCurrentThreshold} 
            className="h-3 bg-slate-200 dark:bg-slate-700"
          />
          
          {progressData.nextThreshold && (
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Prochain seuil: <span className="font-semibold">{progressData.nextThreshold.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Objectif suivant */}
        {progressData.nextThreshold && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUp className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Objectif Suivant
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatEuroInt(progressData.remainingToNext)}
                </div>
                <div className="text-xs text-blue-600">
                  Restant à atteindre
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressData.nextThreshold.label}
                </div>
                <div className="text-xs text-blue-600">
                  Nouveau taux
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seuils de commission */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Seuils de Commission
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {COMMISSION_THRESHOLDS.map((threshold, index) => {
              const isCurrent = threshold.min <= currentCA && currentCA <= threshold.max
              const isPassed = currentCA > threshold.max
              const isFuture = threshold.min > currentCA
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrent 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : isPassed
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isCurrent 
                        ? 'text-emerald-600' 
                        : isPassed
                        ? 'text-green-600'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {threshold.label}
                    </div>
                    <div className={`text-xs ${
                      isCurrent 
                        ? 'text-emerald-600' 
                        : isPassed
                        ? 'text-green-600'
                        : 'text-slate-500 dark:text-slate-500'
                    }`}>
                      {threshold.max === Infinity 
                        ? `≥ ${formatEuroInt(threshold.min)}`
                        : `${formatEuroInt(threshold.min)} - ${formatEuroInt(threshold.max)}`
                      }
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-800 text-xs">
                        Actuel
                      </Badge>
                    )}
                    {isPassed && (
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 text-xs">
                        ✓ Atteint
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conseils d'action */}
        {progressData.nextThreshold && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Conseils pour Progresser
              </h3>
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">
              {progressData.remainingToNext < 1000 ? (
                <p>🎯 <strong>Vous êtes très proche !</strong> Il ne vous reste que {formatEuroInt(progressData.remainingToNext)} pour atteindre le taux de {progressData.nextThreshold.label}.</p>
              ) : progressData.remainingToNext < 5000 ? (
                <p>📈 <strong>Bon rythme !</strong> Concentrez-vous sur {formatEuroInt(progressData.remainingToNext)} supplémentaires pour passer au niveau {progressData.nextThreshold.label}.</p>
              ) : (
                <p>🚀 <strong>Objectif ambitieux !</strong> Pour atteindre {progressData.nextThreshold.label}, visez {formatEuroInt(progressData.remainingToNext)} de CA supplémentaire.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
