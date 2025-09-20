// Composant Timeline mensuelle réutilisable
// Peut être utilisé pour CDC, commissions, ou tout autre contexte mensuel

"use client"

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Home } from 'lucide-react'

interface TimelineData {
  day: number
  value: number
  hasData: boolean
  metadata?: Record<string, any>
}

interface MonthTimelineProps {
  year: number
  month: number
  data: TimelineData[]
  selectedDay?: number
  onDayClick?: (day: number) => void
  onMonthChange?: (year: number, month: number) => void
  maxValue?: number
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  showNavigation?: boolean
  showLabels?: boolean
  className?: string
}

export function MonthTimeline({
  year,
  month,
  data,
  selectedDay,
  onDayClick,
  onMonthChange,
  maxValue,
  colorScheme = 'blue',
  showNavigation = true,
  showLabels = true,
  className = ''
}: MonthTimelineProps) {
  
  // Calcul des jours du mois
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate()
  }, [year, month])

  // Création des données pour tous les jours du mois avec positionnement correct
  const monthData = useMemo(() => {
    const result: TimelineData[] = []
    
    // Calculer le jour de la semaine du premier jour du mois (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const firstDayWeekday = firstDayOfMonth.getDay() // 0 = dimanche, 1 = lundi, etc.
    
    // Convertir en format lundi = 0 (au lieu de dimanche = 0)
    const adjustedFirstDayWeekday = (firstDayWeekday + 6) % 7 // Convertir dimanche=0 en dimanche=6
    
    // Ajouter des jours vides pour aligner le premier jour
    for (let i = 0; i < adjustedFirstDayWeekday; i++) {
      result.push({
        day: 0, // Jour vide
        value: 0,
        hasData: false,
        metadata: {}
      })
    }
    
    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const existingData = data.find(d => d.day === day)
      result.push({
        day,
        value: existingData?.value || 0,
        hasData: existingData?.hasData || false,
        metadata: existingData?.metadata || {}
      })
    }
    
    return result
  }, [data, daysInMonth, year, month])




  // Navigation mensuelle
  const handlePreviousMonth = () => {
    if (!onMonthChange) return
    const newDate = new Date(year, month - 2, 1)
    onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1)
  }

  const handleNextMonth = () => {
    if (!onMonthChange) return
    const newDate = new Date(year, month, 1)
    onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1)
  }

  const handleCurrentMonth = () => {
    if (!onMonthChange) return
    const now = new Date()
    onMonthChange(now.getFullYear(), now.getMonth() + 1)
  }

  // Vérifier si on est sur le mois actuel
  const isCurrentMonth = () => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  }

  const handleDayClick = (day: number) => {
    if (onDayClick) {
      onDayClick(day)
    }
  }

  // Nom du mois en français
  const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })

  console.log('🔄 MonthTimeline render:', { year, month, showNavigation, onMonthChange: !!onMonthChange })

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full ${className}`}>
      {/* En-tête avec navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthName}
              {isCurrentMonth() && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                  Actuel
                </Badge>
              )}
            </h3>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
              {monthData.filter(d => d.day > 0 && d.hasData).length} jour{monthData.filter(d => d.day > 0 && d.hasData).length > 1 ? 's' : ''} avec données
            </Badge>
          </div>
          
          {showNavigation && onMonthChange && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="h-10 w-10 p-0 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                title="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5 text-blue-600" />
              </Button>
              
              {/* Date du mois */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {monthName}
                </span>
              </div>
              
              {/* Bouton retour au mois actuel */}
              {!isCurrentMonth() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurrentMonth}
                  className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  title="Retour au mois actuel"
                >
                  <Home className="h-3 w-3 mr-1.5" />
                  <span className="font-semibold">Retour</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-10 w-10 p-0 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                title="Mois suivant"
              >
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {/* Timeline sur une ligne - tous les jours visibles */}
        <div className="flex gap-0.5 sm:gap-1 md:gap-2 pb-2">
          {monthData.map((dayData, index) => {
            // Si c'est un jour vide (jour = 0), afficher un espace vide
            if (dayData.day === 0) {
              return (
                <div
                  key={`empty-compact-${index}`}
                  className="flex-1 min-w-0 h-6 sm:h-8 md:h-10"
                />
              )
            }
            
            const isSelected = selectedDay === dayData.day
            const hasData = dayData.hasData && dayData.value > 0
            
            // Déterminer le jour de la semaine (0 = dimanche, 1 = lundi, etc.)
            const dayOfWeek = new Date(year, month - 1, dayData.day).getDay()
            const isToday = new Date().toDateString() === new Date(year, month - 1, dayData.day).toDateString()
            
            // Couleurs selon le type de jour
            const getDayColors = () => {
              if (dayOfWeek === 6) { // Samedi - Orange flash (toujours)
                return 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              } else if (dayOfWeek === 0) { // Dimanche - Rouge flash (toujours)
                return 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } else { // Jour de semaine (1-5)
                if (hasData) {
                  return 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } else {
                  return 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              }
            }
            
            return (
              <button
                key={dayData.day}
                onClick={() => handleDayClick(dayData.day)}
                className={`
                  relative flex-1 min-w-0 h-6 sm:h-8 md:h-10 rounded-lg transition-all duration-200 flex items-center justify-center
                  ${getDayColors()}
                  ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                  ${isToday ? 'ring-2 ring-white border-white' : 'border border-gray-200 dark:border-gray-600'}
                  shadow-sm hover:shadow-md hover:scale-105
                `}
                title={`${dayData.day} - ${dayData.value} ${dayData.hasData ? 'données' : 'aucune donnée'}`}
              >
                {hasData ? (
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow-sm">
                    {dayData.value}
                  </span>
                ) : (
                  <span className={`text-xs sm:text-sm font-medium ${
                    dayOfWeek === 6 || dayOfWeek === 0 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    -
                  </span>
                )}
                
                {/* Numéro du jour en petit - masqué sur très petits écrans */}
                <span className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                  {dayData.day}
                </span>
              </button>
            )
          })}
        </div>

      </div>

    </div>
  )
}
