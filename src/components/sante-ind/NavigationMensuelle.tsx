"use client"

import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  RotateCcw
} from 'lucide-react'

import {
  MonthNavigation
} from '../../types/sante-ind'

import {
  santeIndService,
  formatDateLong
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface NavigationMensuelleProps {
  navigation: MonthNavigation
  onNavigate: (year: number, month: number) => void
  onResetToCurrent: () => void
  isLoading?: boolean
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function NavigationMensuelle({
  navigation,
  onNavigate,
  onResetToCurrent,
  isLoading = false
}: NavigationMensuelleProps) {
  
  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================
  
  const handlePreviousMonth = () => {
    if (navigation.canGoPrevious && !isLoading) {
      const newYear = navigation.currentMonth === 1 ? navigation.currentYear - 1 : navigation.currentYear
      const newMonth = navigation.currentMonth === 1 ? 12 : navigation.currentMonth - 1
      onNavigate(newYear, newMonth)
    }
  }

  const handleNextMonth = () => {
    if (navigation.canGoNext && !isLoading) {
      const newYear = navigation.currentMonth === 12 ? navigation.currentYear + 1 : navigation.currentYear
      const newMonth = navigation.currentMonth === 12 ? 1 : navigation.currentMonth + 1
      onNavigate(newYear, newMonth)
    }
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================
  
  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[month - 1] || ''
  }

  const formatCurrentMonth = () => {
    return `${getMonthName(navigation.currentMonth)} ${navigation.currentYear}`
  }

  // ============================================================================
  // RENDU
  // ============================================================================
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border rounded-lg shadow-sm">
      {/* Titre et mois actuel */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Suivi de production
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={navigation.isCurrentMonth ? "default" : "secondary"}
            className="text-sm"
          >
            {formatCurrentMonth()}
          </Badge>
          
          {navigation.isCurrentMonth && (
            <Badge variant="outline" className="text-xs">
              Mois courant
            </Badge>
          )}
        </div>
      </div>

      {/* Contrôles de navigation */}
      <div className="flex items-center gap-2">
        {/* Bouton mois précédent */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          disabled={!navigation.canGoPrevious || isLoading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>

        {/* Bouton reset vers mois courant */}
        {!navigation.isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetToCurrent}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Aujourd'hui</span>
          </Button>
        )}

        {/* Bouton mois suivant */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          disabled={!navigation.canGoNext || isLoading}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      )}
    </div>
  )
}
