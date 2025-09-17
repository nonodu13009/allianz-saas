"use client"

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Percent, 
  Target, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileText,
  Users,
  Building
} from 'lucide-react'

import {
  KPIMensuel,
  ProductionStats,
  LockStatus,
  ACTE_TYPE_LABELS
} from '../../types/sante-ind'

import {
  santeIndService,
  formatEuroInt,
  formatPercentage,
  MINIMUM_REVISIONS_REQUIRED
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface KPIsMensuelsProps {
  kpi: KPIMensuel
  stats: ProductionStats
  lockStatus: LockStatus
  isLoading?: boolean
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function KPIsMensuels({
  kpi,
  stats,
  lockStatus,
  isLoading = false
}: KPIsMensuelsProps) {
  
  // ============================================================================
  // RENDU
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Production brute */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Production brute
            </CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatEuroInt(kpi.productionBrute)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalActivites} activité{stats.totalActivites > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Production pondérée */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Production pondérée
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatEuroInt(kpi.productionPondere)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base de calcul des commissions
            </p>
          </CardContent>
        </Card>

        {/* Taux de commission */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taux de commission
            </CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(kpi.tauxCommission)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selon seuil de production
            </p>
          </CardContent>
        </Card>

        {/* Commission estimée */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commission estimée
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatEuroInt(kpi.commissionEstimee)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Estimation mensuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volumes par type d'acte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Volumes par type d'acte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(kpi.volumes).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {ACTE_TYPE_LABELS[type as keyof typeof ACTE_TYPE_LABELS]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critère qualitatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Critère qualitatif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                kpi.minimumRevisionsAtteint ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {kpi.minimumRevisionsAtteint ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              
              <div>
                <div className="text-lg font-semibold">
                  {kpi.nombreRevisions} révision{kpi.nombreRevisions > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-600">
                  Minimum requis : {MINIMUM_REVISIONS_REQUIRED} révisions
                </div>
              </div>
            </div>
            
            <Badge 
              variant={kpi.minimumRevisionsAtteint ? "default" : "destructive"}
              className="text-sm"
            >
              {kpi.minimumRevisionsAtteint ? 'Objectif atteint' : 'Objectif non atteint'}
            </Badge>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{kpi.nombreRevisions} / {MINIMUM_REVISIONS_REQUIRED}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  kpi.minimumRevisionsAtteint ? 'bg-green-600' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min((kpi.nombreRevisions / MINIMUM_REVISIONS_REQUIRED) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiques détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatEuroInt(stats.moyenneCA)}
              </div>
              <div className="text-sm text-gray-600">Moyenne CA</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatEuroInt(stats.moyenneCAPondere)}
              </div>
              <div className="text-sm text-gray-600">Moyenne CA pondéré</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalActivites}
              </div>
              <div className="text-sm text-gray-600">Total activités</div>
            </div>
          </div>
          
          {/* Période */}
          {stats.premierActe && stats.dernierActe && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Du {santeIndService.formatDateShort(stats.premierActe)} au{' '}
                    {santeIndService.formatDateShort(stats.dernierActe)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indicateur de verrouillage */}
      {lockStatus === 'locked' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-800">Mois verrouillé</h4>
                <p className="text-sm text-yellow-700">
                  Les données de ce mois sont figées. Aucune modification n'est possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
