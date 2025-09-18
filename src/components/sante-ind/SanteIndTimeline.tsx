// Timeline spécifique pour le module CDC Santé Individuelle
// Utilise le composant MonthTimeline réutilisable

"use client"

import { useMemo, useState } from 'react'
import { MonthTimeline } from '@/components/ui/month-timeline'
import { SanteIndActivity, SanteIndActeType, SanteIndFilter } from '@/types/sante-ind'
import { generateTimelineData, filterActivities } from '@/lib/sante-ind'

interface SanteIndTimelineProps {
  activities: SanteIndActivity[]
  year: number
  month: number
  filter?: SanteIndFilter
  onDayClick?: (day: number) => void
  onMonthChange?: (year: number, month: number) => void
  loading?: boolean
}

export function SanteIndTimeline({ 
  activities, 
  year, 
  month, 
  filter,
  onDayClick, 
  onMonthChange,
  loading = false 
}: SanteIndTimelineProps) {
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

  console.log('🔄 SanteIndTimeline render:', { year, month, showNavigation: true, onMonthChange: !!onMonthChange })

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
        colorScheme="emerald"
        showNavigation={true}
        showLabels={true}
        compact={false}
      />

      {/* Informations détaillées du jour sélectionné */}
      {selectedDay && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
          <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
            Détails du {selectedDay} {new Date(year, month - 1, selectedDay).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h4>
          
          {(() => {
            const dayData = timelineData.find(d => d.day === selectedDay)
            if (!dayData || !dayData.hasData) {
              return (
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  Aucune activité enregistrée ce jour
                </p>
              )
            }

            const acteCounts = dayData.metadata.acteCounts

            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {dayData.metadata.totalActivities}
                  </div>
                  <div className="text-xs text-emerald-600">Total</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {acteCounts[SanteIndActeType.AFFAIRE_NOUVELLE]}
                  </div>
                  <div className="text-xs text-emerald-600">AN</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {acteCounts[SanteIndActeType.REVISION]}
                  </div>
                  <div className="text-xs text-blue-600">Révisions</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {acteCounts[SanteIndActeType.ADHESION_GROUPE]}
                  </div>
                  <div className="text-xs text-purple-600">Groupe</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {acteCounts[SanteIndActeType.COURTAGE_VERS_ALLIANZ] + acteCounts[SanteIndActeType.ALLIANZ_VERS_COURTAGE]}
                  </div>
                  <div className="text-xs text-orange-600">Transferts</div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Statistiques globales du mois */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Statistiques du mois
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {timelineData.filter(d => d.hasData).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Jours actifs
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {timelineData.reduce((sum, d) => sum + d.value, 0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total activités
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">
              {timelineData.reduce((sum, d) => sum + (d.metadata?.acteCounts[SanteIndActeType.AFFAIRE_NOUVELLE] || 0), 0)}
            </div>
            <div className="text-xs text-emerald-600">
              Total AN
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {timelineData.reduce((sum, d) => sum + (d.metadata?.acteCounts[SanteIndActeType.REVISION] || 0), 0)}
            </div>
            <div className="text-xs text-blue-600">
              Total Révisions
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {timelineData.reduce((sum, d) => sum + (d.metadata?.acteCounts[SanteIndActeType.ADHESION_GROUPE] || 0), 0)}
            </div>
            <div className="text-xs text-purple-600">
              Total Groupe
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {timelineData.reduce((sum, d) => 
                sum + (d.metadata?.acteCounts[SanteIndActeType.COURTAGE_VERS_ALLIANZ] || 0) + 
                (d.metadata?.acteCounts[SanteIndActeType.ALLIANZ_VERS_COURTAGE] || 0), 0)}
            </div>
            <div className="text-xs text-orange-600">
              Total Transferts
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
