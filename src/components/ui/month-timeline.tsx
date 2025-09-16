// Composant Timeline mensuelle réutilisable
// Peut être utilisé pour CDC, commissions, ou tout autre contexte mensuel

"use client"

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Home, Activity, FileText } from 'lucide-react'

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
  compact?: boolean
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
  compact = false,
  className = ''
}: MonthTimelineProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
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

  // Calcul de la valeur maximale pour la normalisation
  const normalizedMaxValue = useMemo(() => {
    if (maxValue) return maxValue
    // Exclure les jours vides (jour = 0) du calcul de la valeur maximale
    const realDaysData = monthData.filter(d => d.day > 0)
    if (realDaysData.length === 0) return 1
    const maxDataValue = Math.max(...realDaysData.map(d => d.value))
    return Math.max(maxDataValue, 1) // Éviter la division par 0
  }, [monthData, maxValue])

  // Configuration des couleurs
  const colorConfig = {
    blue: {
      base: 'bg-blue-500',
      hover: 'bg-blue-600',
      selected: 'bg-blue-700',
      light: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300'
    },
    green: {
      base: 'bg-green-500',
      hover: 'bg-green-600',
      selected: 'bg-green-700',
      light: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300'
    },
    purple: {
      base: 'bg-purple-500',
      hover: 'bg-purple-600',
      selected: 'bg-purple-700',
      light: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300'
    },
    orange: {
      base: 'bg-orange-500',
      hover: 'bg-orange-600',
      selected: 'bg-orange-700',
      light: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300'
    },
    red: {
      base: 'bg-red-500',
      hover: 'bg-red-600',
      selected: 'bg-red-700',
      light: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300'
    }
  }

  const colors = colorConfig[colorScheme]

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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                title="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 hover:text-blue-600" />
              </Button>
              
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
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                title="Mois suivant"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 hover:text-blue-600" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {compact ? (
          /* Version compacte - une seule ligne */
          <div className="flex gap-1 overflow-x-auto pb-2">
            {monthData.map((dayData, index) => {
              // Si c'est un jour vide (jour = 0), afficher un espace vide
              if (dayData.day === 0) {
                return (
                  <div
                    key={`empty-compact-${index}`}
                    className="flex-shrink-0 w-6 h-6"
                  />
                )
              }
              
              const intensity = dayData.value / normalizedMaxValue
              const isSelected = selectedDay === dayData.day
              
              return (
                <button
                  key={dayData.day}
                  onClick={() => handleDayClick(dayData.day)}
                  className={`
                    relative flex-shrink-0 w-6 h-6 rounded-full transition-all duration-200
                    ${dayData.hasData ? colors.base : 'bg-gray-200 dark:bg-gray-600'}
                    ${isSelected ? colors.selected : ''}
                    hover:${colors.hover}
                    ${dayData.hasData ? 'shadow-sm' : ''}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                  `}
                  style={{
                    opacity: dayData.hasData ? 0.3 + (intensity * 0.7) : 0.5
                  }}
                  title={`${dayData.day} - ${dayData.value} ${dayData.hasData ? 'données' : 'aucune donnée'}`}
                >
                  {showLabels && (
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
                      {dayData.day}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          /* Version détaillée - grille */
          <div className="grid grid-cols-7 gap-2">
            {/* En-têtes des jours de la semaine */}
            <div className="col-span-7 grid grid-cols-7 gap-2 mb-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Jours du mois */}
            {monthData.map((dayData, index) => {
              // Si c'est un jour vide (jour = 0), afficher une cellule vide
              if (dayData.day === 0) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square rounded-lg border border-transparent"
                  />
                )
              }
              
              const isSelected = selectedDay === dayData.day
              const hasData = dayData.hasData && dayData.value > 0
              
              // Déterminer le jour de la semaine (0 = dimanche, 1 = lundi, etc.)
              const dayOfWeek = new Date(year, month - 1, dayData.day).getDay()
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Dimanche ou samedi
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
              
              // Gestionnaire pour le hover
              const handleMouseEnter = (e: React.MouseEvent) => {
                setHoveredDay(dayData.day)
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10
                })
              }
              
              const handleMouseLeave = () => {
                setHoveredDay(null)
              }
              
              return (
                <button
                  key={dayData.day}
                  onClick={() => handleDayClick(dayData.day)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`
                    relative aspect-square rounded-lg transition-all duration-200 flex items-center justify-center
                    ${getDayColors()}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                    ${isToday ? 'ring-2 ring-white border-white' : 'border border-gray-200 dark:border-gray-600'}
                    shadow-sm hover:shadow-md
                  `}
                >
                  {hasData ? (
                    // Affichage avec données : nombre en gros et coloré
                    <span className="text-lg font-bold text-white drop-shadow-sm">
                      {dayData.value}
                    </span>
                  ) : (
                    // Affichage sans données : tiret
                    <span className={`text-lg font-medium ${
                      dayOfWeek === 6 || dayOfWeek === 0 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      -
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

      </div>

      {/* Tooltip personnalisé */}
      {hoveredDay !== null && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 p-3 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {(() => {
            const dayData = monthData.find(d => d.day === hoveredDay)
            if (!dayData || !dayData.hasData || dayData.value === 0) {
              return (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {hoveredDay} - Aucune saisie
                  </span>
                </div>
              )
            }
            
            const metadata = dayData.metadata || {}
            const anCount = metadata.anCount || 0
            const processCount = metadata.processCount || 0
            const total = dayData.value
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold">
                    {hoveredDay} - {total} saisie{total > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs text-gray-300">
                      AN: {anCount}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-orange-400" />
                    <span className="text-xs text-gray-300">
                      Process: {processCount}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}
          
          {/* Flèche du tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}
