// Composant de filtres pour le dashboard CDC Santé Collective
// Système de filtres en cascade : 3 tags principaux puis sous-filtres

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  SanteCollFilter, 
  SanteCollActeType, 
  SanteCollOrigine, 
  CompagnieType 
} from '@/types/sante-coll'
import { 
  Filter, 
  RotateCcw, 
  Target,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface SanteCollFiltersProps {
  currentFilter: SanteCollFilter
  onFilterChange: (filter: SanteCollFilter) => void
  activitiesCount?: number
  filteredCount?: number
}

type FilterCategory = 'origine' | 'type' | 'compagnie' | null

export function SanteCollFilters({
  currentFilter,
  onFilterChange,
  activitiesCount = 0,
  filteredCount = 0
}: SanteCollFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(null)

  // Configuration des filtres principaux
  const filterCategories = {
    origine: {
      label: 'Origine',
      icon: Target,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      options: {
        [SanteCollOrigine.PROSPECTION]: { label: 'Prospection', icon: '🎯' },
        [SanteCollOrigine.RELATION_CLIENT]: { label: 'Relation client', icon: '🤝' },
        [SanteCollOrigine.REFERENCEMENT]: { label: 'Référencement', icon: '⭐' }
      }
    },
    type: {
      label: 'Type d\'acte',
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      options: {
        [SanteCollActeType.AFFAIRE_NOUVELLE]: { label: 'Affaire nouvelle', icon: '✨' },
        [SanteCollActeType.REVISION]: { label: 'Révision', icon: '📝' },
        [SanteCollActeType.ADHESION_GROUPE]: { label: 'Adhésion groupe', icon: '👥' },
        [SanteCollActeType.TRANSFERT_COURTAGE]: { label: 'Transfert courtage', icon: '🔄' },
        [SanteCollActeType.RESILIATION]: { label: 'Résiliation', icon: '❌' },
        [SanteCollActeType.MODIFICATION_CONTRAT]: { label: 'Modification contrat', icon: '📋' },
        [SanteCollActeType.RENOUVELLEMENT]: { label: 'Renouvellement', icon: '🔄' },
        [SanteCollActeType.EXTENSION_GARANTIE]: { label: 'Extension garantie', icon: '🛡️' },
        [SanteCollActeType.CHANGEMENT_TARIF]: { label: 'Changement tarif', icon: '💰' },
        [SanteCollActeType.AUTRE_ACTE]: { label: 'Autre acte', icon: '📄' }
      }
    },
    compagnie: {
      label: 'Compagnie',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      options: {
        [CompagnieType.ALLIANZ]: { label: 'Allianz', icon: '🏢' },
        [CompagnieType.UNIM_UNICED]: { label: 'Unim/Uniced', icon: '🏥' },
        [CompagnieType.COURTAGE]: { label: 'Courtage', icon: '🏛️' }
      }
    }
  }

  // Gestion des changements de filtres
  const handleCategorySelect = (category: FilterCategory) => {
    setSelectedCategory(category)
  }

  const handleFilterSelect = (category: FilterCategory, value: string | undefined) => {
    const newFilter = { ...currentFilter }
    
    switch (category) {
      case 'origine':
        newFilter.origine = value as SanteCollOrigine | undefined
        break
      case 'type':
        newFilter.type = value === 'all' ? 'all' : (value as SanteCollActeType)
        break
      case 'compagnie':
        newFilter.compagnie = value as CompagnieType | undefined
        break
    }
    
    onFilterChange(newFilter)
    setSelectedCategory(null) // Fermer le sous-menu
  }

  const handleResetFilters = () => {
    onFilterChange({
      type: 'all',
      origine: undefined,
      compagnie: undefined
    })
    setSelectedCategory(null)
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = 
    currentFilter.type !== 'all' || 
    currentFilter.origine || 
    currentFilter.compagnie

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Filtres
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredCount} / {activitiesCount}
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Tags principaux */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(filterCategories).map(([key, category]) => {
          const IconComponent = category.icon
          const isSelected = selectedCategory === key
          const hasActiveFilter = 
            (key === 'origine' && currentFilter.origine) ||
            (key === 'type' && currentFilter.type !== 'all') ||
            (key === 'compagnie' && currentFilter.compagnie)
          
          return (
            <Button
              key={key}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategorySelect(key as FilterCategory)}
              className={`flex items-center gap-2 ${hasActiveFilter ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}`}
            >
              <IconComponent className="h-4 w-4" />
              {category.label}
              {isSelected ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )
        })}
      </div>

      {/* Sous-filtres */}
      {selectedCategory && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            {/* Option "Tous" */}
            <Button
              variant={getCurrentFilterValue(selectedCategory) === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterSelect(selectedCategory, undefined)}
              className="flex items-center gap-1"
            >
              Tous
            </Button>
            
            {/* Options spécifiques */}
            {Object.entries(filterCategories[selectedCategory].options).map(([value, option]) => (
              <Button
                key={value}
                variant={getCurrentFilterValue(selectedCategory) === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterSelect(selectedCategory, value)}
                className="flex items-center gap-1"
              >
                <span>{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtres actifs :</span>
            
            {currentFilter.type !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>{filterCategories.type.options[currentFilter.type as SanteCollActeType]?.icon}</span>
                {filterCategories.type.options[currentFilter.type as SanteCollActeType]?.label}
              </Badge>
            )}
            
            {currentFilter.origine && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>{filterCategories.origine.options[currentFilter.origine]?.icon}</span>
                {filterCategories.origine.options[currentFilter.origine]?.label}
              </Badge>
            )}
            
            {currentFilter.compagnie && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>{filterCategories.compagnie.options[currentFilter.compagnie]?.icon}</span>
                {filterCategories.compagnie.options[currentFilter.compagnie]?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Helper function pour obtenir la valeur actuelle du filtre
  function getCurrentFilterValue(category: FilterCategory): string | undefined {
    switch (category) {
      case 'origine':
        return currentFilter.origine
      case 'type':
        return currentFilter.type === 'all' ? undefined : currentFilter.type
      case 'compagnie':
        return currentFilter.compagnie
      default:
        return undefined
    }
  }
}
