// Composant de filtres pour le dashboard CDC Santé Collective
// Système de filtres par origine, acte, compagnie avec bouton reset

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  SanteCollFilter, 
  SanteCollActeType, 
  SanteCollOrigine, 
  CompagnieType 
} from '@/types/sante-coll'
import { 
  Filter, 
  RotateCcw, 
  Calendar,
  Building2,
  Target,
  Users,
  TrendingUp,
  X
} from 'lucide-react'

interface SanteCollFiltersProps {
  currentFilter: SanteCollFilter
  onFilterChange: (filter: SanteCollFilter) => void
  selectedDay?: number
  onDayFilterChange?: (day: number | undefined) => void
  yearMonth: string
  activitiesCount?: number
  filteredCount?: number
}

export function SanteCollFilters({
  currentFilter,
  onFilterChange,
  selectedDay,
  onDayFilterChange,
  yearMonth,
  activitiesCount = 0,
  filteredCount = 0
}: SanteCollFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Parsing de l'année et du mois pour l'affichage
  const [year, month] = yearMonth.split('-').map(Number)
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  // Configuration des types d'actes avec icônes et couleurs
  const acteTypeConfig = {
    [SanteCollActeType.AFFAIRE_NOUVELLE]: {
      label: 'Affaire nouvelle',
      icon: '✨',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      shortLabel: 'AN'
    },
    [SanteCollActeType.REVISION]: {
      label: 'Révision',
      icon: '📝',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      shortLabel: 'Révision'
    },
    [SanteCollActeType.ADHESION_GROUPE]: {
      label: 'Adhésion groupe',
      icon: '👥',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      shortLabel: 'Groupe'
    },
    [SanteCollActeType.TRANSFERT_COURTAGE]: {
      label: 'Transfert courtage',
      icon: '🔄',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      shortLabel: 'Transfert'
    }
  }

  // Configuration des origines avec icônes et couleurs
  const origineConfig = {
    [SanteCollOrigine.PROSPECTION]: {
      label: 'Prospection',
      icon: '🎯',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [SanteCollOrigine.RELATION_CLIENT]: {
      label: 'Relation client',
      icon: '🤝',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    [SanteCollOrigine.REFERENCEMENT]: {
      label: 'Référencement',
      icon: '⭐',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    [SanteCollOrigine.PARTENARIAT]: {
      label: 'Partenariat',
      icon: '🤝',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    [SanteCollOrigine.AUTRE]: {
      label: 'Autre',
      icon: '📋',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Configuration des compagnies avec icônes et couleurs
  const compagnieConfig = {
    [CompagnieType.ALLIANZ]: {
      label: 'Allianz',
      icon: '🏢',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [CompagnieType.COURTAGE]: {
      label: 'Courtage',
      icon: '🏛️',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    [CompagnieType.AUTRE]: {
      label: 'Autre',
      icon: '🏢',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  // Gestion des changements de filtres
  const handleActeTypeChange = (type: SanteCollActeType | 'all') => {
    onFilterChange({
      ...currentFilter,
      type: type === 'all' ? 'all' : type
    })
  }

  const handleOrigineChange = (origine: SanteCollOrigine | undefined) => {
    onFilterChange({
      ...currentFilter,
      origine: origine
    })
  }

  const handleCompagnieChange = (compagnie: CompagnieType | undefined) => {
    onFilterChange({
      ...currentFilter,
      compagnie: compagnie
    })
  }

  const handleDayChange = (day: number | undefined) => {
    if (onDayFilterChange) {
      onDayFilterChange(day)
    }
  }

  const handleResetFilters = () => {
    onFilterChange({
      type: 'all',
      origine: undefined,
      compagnie: undefined,
      day: undefined
    })
    if (onDayFilterChange) {
      onDayFilterChange(undefined)
    }
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = 
    currentFilter.type !== 'all' || 
    currentFilter.origine || 
    currentFilter.compagnie || 
    currentFilter.day ||
    selectedDay

  // Générer les jours du mois pour le filtre par jour
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5 text-blue-600" />
            Filtres - {monthNames[month - 1]} {year}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Compteur d'activités */}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredCount} / {activitiesCount} activités
            </Badge>
            
            {/* Bouton reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtres principaux */}
        <div className="space-y-4">
          {/* Filtre par type d'acte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Type d'acte
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentFilter.type === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActeTypeChange('all')}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-4 w-4" />
                Tous
              </Button>
              {Object.entries(acteTypeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  variant={currentFilter.type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleActeTypeChange(type as SanteCollActeType)}
                  className="flex items-center gap-1"
                >
                  <span>{config.icon}</span>
                  {config.shortLabel}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-4 w-4" />
              Filtres avancés
              {showAdvancedFilters ? ' ▲' : ' ▼'}
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              {/* Filtre par origine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Origine
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!currentFilter.origine ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleOrigineChange(undefined)}
                    className="flex items-center gap-1"
                  >
                    Toutes
                  </Button>
                  {Object.entries(origineConfig).map(([origine, config]) => (
                    <Button
                      key={origine}
                      variant={currentFilter.origine === origine ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleOrigineChange(origine as SanteCollOrigine)}
                      className="flex items-center gap-1"
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtre par compagnie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Compagnie
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!currentFilter.compagnie ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCompagnieChange(undefined)}
                    className="flex items-center gap-1"
                  >
                    Toutes
                  </Button>
                  {Object.entries(compagnieConfig).map(([compagnie, config]) => (
                    <Button
                      key={compagnie}
                      variant={currentFilter.compagnie === compagnie ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCompagnieChange(compagnie as CompagnieType)}
                      className="flex items-center gap-1"
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtre par jour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Jour du mois
                </label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  <Button
                    variant={!selectedDay ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDayChange(undefined)}
                    className="flex items-center gap-1"
                  >
                    Tous
                  </Button>
                  {monthDays.map((day) => (
                    <Button
                      key={day}
                      variant={selectedDay === day ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDayChange(day)}
                      className="min-w-[2.5rem]"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtres actifs :
              </span>
              
              {currentFilter.type !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {acteTypeConfig[currentFilter.type as SanteCollActeType]?.icon}
                  {acteTypeConfig[currentFilter.type as SanteCollActeType]?.shortLabel}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleActeTypeChange('all')}
                  />
                </Badge>
              )}
              
              {currentFilter.origine && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {origineConfig[currentFilter.origine]?.icon}
                  {origineConfig[currentFilter.origine]?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleOrigineChange(undefined)}
                  />
                </Badge>
              )}
              
              {currentFilter.compagnie && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {compagnieConfig[currentFilter.compagnie]?.icon}
                  {compagnieConfig[currentFilter.compagnie]?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCompagnieChange(undefined)}
                  />
                </Badge>
              )}
              
              {(selectedDay || currentFilter.day) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Jour {(selectedDay || currentFilter.day)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleDayChange(undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
