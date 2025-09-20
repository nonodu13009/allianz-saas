// Timeline pour le dashboard CDC Santé Collective
// Inspiré de SanteIndTimeline avec adaptations spécifiques

"use client"

import { useState, useMemo } from 'react'
import { MonthTimeline } from '@/components/ui/month-timeline'
import { SanteCollActivity, SanteCollFilter, SanteCollActeType } from '@/types/sante-coll'
import { filterActivities, generateTimelineData } from '@/lib/sante-coll'

interface SanteCollTimelineProps {
  activities: SanteCollActivity[]
  year: number
  month: number
  filter?: SanteCollFilter
  onDayClick?: (day: number) => void
  onMonthChange?: (year: number, month: number) => void
  loading?: boolean
}

export function SanteCollTimeline({ 
  activities, 
  year, 
  month, 
  filter,
  onDayClick, 
  onMonthChange,
  loading = false 
}: SanteCollTimelineProps) {
  const [selectedDay, setSelectedDay] = useState<number | undefined>()

  // Génération des données de timeline avec filtrage
  const timelineData = useMemo(() => {
    if (loading || !activities.length) {
      return []
    }

    // Appliquer les filtres aux activités
    const filteredActivities = filter ? filterActivities(activities, filter) : activities
    
    const rawData = generateTimelineData(filteredActivities, year, month)
    
    return rawData.map(dayData => ({
      day: dayData.day,
      value: dayData.totalActivities,
      hasData: dayData.hasData,
      metadata: {
        acteCounts: dayData.acteCounts,
        totalActivities: dayData.totalActivities
      }
    }))
  }, [activities, year, month, filter, loading])

  // Gestionnaire pour le clic sur un jour
  const handleDayClick = (day: number) => {
    if (selectedDay === day) {
      // Désélectionner si déjà sélectionné
      setSelectedDay(undefined)
      onDayClick?.(undefined as any)
    } else {
      // Sélectionner le jour
      setSelectedDay(day)
      onDayClick?.(day)
    }
  }

  // Calcul de la valeur maximale pour la normalisation
  const maxValue = useMemo(() => {
    return Math.max(...timelineData.map(d => d.value), 1)
  }, [timelineData])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400">Chargement de la timeline...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline principale */}
      <MonthTimeline
        year={year}
        month={month}
        data={timelineData}
        selectedDay={selectedDay}
        onDayClick={handleDayClick}
        onMonthChange={onMonthChange}
        maxValue={maxValue}
        colorScheme="blue"
        showNavigation={true}
        showLabels={true}
        compact={false}
      />

      {/* Informations détaillées du jour sélectionné */}
      {selectedDay && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Détails du {selectedDay} {new Date(year, month - 1, selectedDay).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h4>
          
          {(() => {
            const dayData = timelineData.find(d => d.day === selectedDay)
            
            if (!dayData || !dayData.hasData) {
              return (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Aucune activité enregistrée ce jour
                </p>
              )
            }

            const acteCounts = dayData.metadata.acteCounts as Record<SanteCollActeType, number>
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total: {dayData.metadata.totalActivities} activité{dayData.metadata.totalActivities > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Object.entries(acteCounts).map(([type, count]) => {
                    if (count === 0) return null
                    
                    const configs = {
                      [SanteCollActeType.AFFAIRE_NOUVELLE]: { label: 'AN', color: 'bg-emerald-100 text-emerald-800', icon: '✨' },
                      [SanteCollActeType.REVISION]: { label: 'Révision', color: 'bg-blue-100 text-blue-800', icon: '📝' },
                      [SanteCollActeType.ADHESION_GROUPE]: { label: 'Groupe', color: 'bg-purple-100 text-purple-800', icon: '👥' },
                      [SanteCollActeType.TRANSFERT_COURTAGE]: { label: 'Transfert', color: 'bg-orange-100 text-orange-800', icon: '🔄' }
                    }
                    
                    const config = configs[type as SanteCollActeType]
                    
                    return (
                      <span
                        key={type}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <span>{config.icon}</span>
                        {config.label}: {count}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
