// Système de filtres pour le module CDC Commercial
// Filtres : Tous | AN | Process + filtre par produit pour AN

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CDCFilter, ActivityType, ProductType } from '@/types/cdc'
import { 
  Filter, 
  FileText, 
  TrendingUp, 
  Car, 
  Shield,
  X,
  Search,
  Calendar
} from 'lucide-react'

interface CDCFiltersProps {
  currentFilter: CDCFilter
  onFilterChange: (filter: CDCFilter) => void
  selectedDay?: number
  onDayFilterChange?: (day: number | undefined) => void
  yearMonth: string
  className?: string
}

export function CDCFilters({ 
  currentFilter, 
  onFilterChange, 
  selectedDay,
  onDayFilterChange,
  yearMonth,
  className = ''
}: CDCFiltersProps) {
  const [showProductFilter, setShowProductFilter] = useState(false)

  // Configuration des types de filtres
  const filterTypes = [
    {
      type: 'all' as const,
      label: 'Tous',
      icon: Filter,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      hoverColor: 'hover:bg-gray-200',
      activeColor: 'bg-gray-800 text-white border-gray-800',
      description: 'Toutes les activités'
    },
    {
      type: 'AN' as const,
      label: 'AN',
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      hoverColor: 'hover:bg-emerald-200',
      activeColor: 'bg-emerald-800 text-white border-emerald-800',
      description: 'Affaires nouvelles'
    },
    {
      type: 'Process' as const,
      label: 'Process',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      hoverColor: 'hover:bg-blue-200',
      activeColor: 'bg-blue-800 text-white border-blue-800',
      description: 'Processus commerciaux'
    }
  ]

  // Configuration des types de produits
  const productTypes = [
    { value: ProductType.AUTO_MOTO, label: 'AUTO/MOTO', icon: Car, color: 'bg-blue-50 text-blue-700' },
    { value: ProductType.IARD_PART_DIVERS, label: 'IARD PART', icon: FileText, color: 'bg-green-50 text-green-700' },
    { value: ProductType.IARD_PRO_DIVERS, label: 'IARD PRO', icon: FileText, color: 'bg-purple-50 text-purple-700' },
    { value: ProductType.PJ, label: 'PJ', icon: Shield, color: 'bg-yellow-50 text-yellow-700' },
    { value: ProductType.GAV, label: 'GAV', icon: Shield, color: 'bg-red-50 text-red-700' },
    { value: ProductType.SANTE_PREV, label: 'SANTE/PREV', icon: FileText, color: 'bg-pink-50 text-pink-700' },
    { value: ProductType.NOP_50EUR, label: 'NOP 50€', icon: FileText, color: 'bg-gray-50 text-gray-700' },
    { value: ProductType.EPARGNE_RETRAITE, label: 'EPARGNE', icon: FileText, color: 'bg-indigo-50 text-indigo-700' },
    { value: ProductType.PU_VL, label: 'PU/VL', icon: FileText, color: 'bg-emerald-50 text-emerald-700' }
  ]

  // Configuration des types de process
  const processTypes = [
    { value: ActivityType.M3, label: 'M+3', icon: TrendingUp, color: 'bg-blue-50 text-blue-700', description: 'Suivi mensuel +3 mois' },
    { value: ActivityType.PRETERME_AUTO, label: 'Préterme Auto', icon: Car, color: 'bg-orange-50 text-orange-700', description: 'Résiliation anticipée automobile' },
    { value: ActivityType.PRETERME_IRD, label: 'Préterme IRD', icon: Shield, color: 'bg-violet-50 text-violet-700', description: 'Résiliation anticipée IRD' }
  ]

  // Gestionnaire pour le changement de type de filtre
  const handleFilterTypeChange = (type: CDCFilter['type']) => {
    const newFilter: CDCFilter = {
      type,
      product: undefined, // Reset le produit/process si on change de type
      day: selectedDay
    }
    onFilterChange(newFilter)
    
    // Afficher le filtre produit/process pour AN et Process
    setShowProductFilter(type === 'AN' || type === 'Process')
  }

  // Gestionnaire pour le changement de produit/process
  const handleProductChange = (product: ProductType | ActivityType) => {
    const newFilter: CDCFilter = {
      ...currentFilter,
      product: currentFilter.product === product ? undefined : product
    }
    onFilterChange(newFilter)
  }

  // Gestionnaire pour le filtre par jour
  const handleDayFilterChange = (day: number | undefined) => {
    const newFilter: CDCFilter = {
      ...currentFilter,
      day
    }
    onFilterChange(newFilter)
    onDayFilterChange?.(day)
  }

  // Gestionnaire pour effacer tous les filtres
  const handleClearFilters = () => {
    const newFilter: CDCFilter = {
      type: 'all',
      product: undefined,
      day: undefined
    }
    onFilterChange(newFilter)
    onDayFilterChange?.(undefined)
    setShowProductFilter(false)
  }

  // Vérifier s'il y a des filtres actifs
  const hasActiveFilters = currentFilter.type !== 'all' || currentFilter.product || currentFilter.day

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* En-tête des filtres */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtres
          </h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(yearMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Badge>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres par type */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type d'activité
          </h4>
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((filterType) => {
              const IconComponent = filterType.icon
              const isActive = currentFilter.type === filterType.type
              
              return (
                <Button
                  key={filterType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterTypeChange(filterType.type)}
                  className={`
                    ${isActive ? filterType.activeColor : filterType.color}
                    ${filterType.hoverColor}
                    border transition-all duration-200
                    ${isActive ? 'shadow-md' : ''}
                  `}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {filterType.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Filtre par produit/process (visible pour AN et Process) */}
        {showProductFilter && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentFilter.type === 'AN' ? 'Type de produit' : 'Type de process'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(currentFilter.type === 'AN' ? productTypes : processTypes).map((item) => {
                const IconComponent = item.icon
                const isActive = currentFilter.product === item.value
                
                return (
                  <Button
                    key={item.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleProductChange(item.value)}
                    className={`
                      ${isActive ? 'bg-blue-800 text-white border-blue-800' : item.color}
                      hover:bg-blue-200 border transition-all duration-200
                      ${isActive ? 'shadow-md' : ''}
                    `}
                    title={item.description}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filtre par jour */}
        {selectedDay && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Jour sélectionné
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {selectedDay} {new Date(yearMonth + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDayFilterChange(undefined)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtres actifs
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentFilter.type !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Type: {filterTypes.find(f => f.type === currentFilter.type)?.label}
              </Badge>
            )}
            {currentFilter.product && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {currentFilter.type === 'AN' ? 'Produit' : 'Process'}: {
                  currentFilter.type === 'AN' 
                    ? productTypes.find(p => p.value === currentFilter.product)?.label
                    : processTypes.find(p => p.value === currentFilter.product)?.label
                }
              </Badge>
            )}
            {currentFilter.day && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                Jour: {currentFilter.day}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Instructions d'utilisation */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>💡 <strong>Astuce :</strong> Cliquez sur un jour dans la timeline pour filtrer par jour</p>
          <p>🎯 <strong>Navigation :</strong> Les filtres s'appliquent à la timeline et au tableau</p>
        </div>
      </div>
    </div>
  )
}
