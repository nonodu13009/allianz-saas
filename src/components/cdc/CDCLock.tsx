// Composant de verrouillage mensuel CDC
// Gère le verrouillage/déverrouillage des mois

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Lock, Unlock, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { CDCLock } from '@/types/cdc'
import { toast } from 'sonner'

interface CDCLockProps {
  yearMonth: string // Format: "2024-01"
  isLocked: boolean
  lockedBy?: string
  lockedAt?: string
  onLockToggle: (locked: boolean) => Promise<void>
  loading?: boolean
}

export function CDCLockComponent({
  yearMonth,
  isLocked,
  lockedBy,
  lockedAt,
  onLockToggle,
  loading = false
}: CDCLockProps) {
  const [isToggling, setIsToggling] = useState(false)

  // Formatage de la date
  const formatLockDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatage du mois affiché
  const formatMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Gestionnaire de basculement du verrouillage
  const handleToggleLock = async () => {
    setIsToggling(true)
    try {
      await onLockToggle(!isLocked)
      
      if (isLocked) {
        toast.success(`Mois de ${formatMonth(yearMonth)} déverrouillé avec succès`)
      } else {
        toast.success(`Mois de ${formatMonth(yearMonth)} verrouillé avec succès`)
      }
    } catch (error) {
      console.error('Erreur lors du changement de verrouillage:', error)
      toast.error('Erreur lors du changement de verrouillage')
    } finally {
      setIsToggling(false)
    }
  }

  // Déterminer le statut du mois
  const getMonthStatus = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const [year, month] = yearMonth.split('-').map(Number)
    
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return 'future'
    } else if (year === currentYear && month === currentMonth) {
      return 'current'
    } else {
      return 'past'
    }
  }

  const monthStatus = getMonthStatus()

  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icône de statut */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20">
            {isLocked ? (
              <Lock className="h-5 w-5 text-red-600" />
            ) : (
              <Unlock className="h-5 w-5 text-green-600" />
            )}
          </div>

          {/* Informations du mois */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {formatMonth(yearMonth)}
              </h3>
              
              {/* Badge de statut */}
              <Badge 
                variant="secondary" 
                className={`
                  ${isLocked 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-green-100 text-green-800 border-green-200'
                  }
                `}
              >
                {isLocked ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Verrouillé
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ouvert
                  </>
                )}
              </Badge>

              {/* Badge de période */}
              {monthStatus === 'current' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Mois actuel
                </Badge>
              )}
            </div>

            {/* Informations de verrouillage */}
            {isLocked && lockedBy && lockedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verrouillé par <span className="font-medium">{lockedBy}</span> le {formatLockDate(lockedAt)}
              </p>
            )}

            {/* Avertissement pour les mois futurs */}
            {monthStatus === 'future' && (
              <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Mois futur - Verrouillage non recommandé</span>
              </div>
            )}
          </div>
        </div>

        {/* Bouton de basculement */}
        <Button
          onClick={handleToggleLock}
          disabled={loading || isToggling}
          variant={isLocked ? "default" : "destructive"}
          size="sm"
          className={`
            ${isLocked 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
            }
            min-w-[120px]
          `}
        >
          {isToggling ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isLocked ? 'Déverrouillage...' : 'Verrouillage...'}
            </>
          ) : isLocked ? (
            <>
              <Unlock className="h-4 w-4 mr-2" />
              Déverrouiller
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Verrouiller
            </>
          )}
        </Button>
      </div>

      {/* Message d'information */}
      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {isLocked ? (
            <>
              <Shield className="h-4 w-4 inline mr-1" />
              Ce mois est verrouillé. Aucune modification n'est autorisée.
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 inline mr-1" />
              Ce mois est ouvert aux modifications. Vous pouvez ajouter ou modifier des activités.
            </>
          )}
        </p>
      </div>
    </Card>
  )
}
