// Boutons de saisie pour le dashboard CDC Santé Collective
// Inspiré de SanteIndButtons avec adaptations spécifiques

"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SanteCollActeType } from '@/types/sante-coll'
import { 
  PlusCircle, 
  FileText, 
  Users, 
  RefreshCw,
  Lock,
  Unlock,
  Download,
  RotateCcw
} from 'lucide-react'

interface SanteCollButtonsProps {
  onNewActeClick: () => void
  isLocked: boolean
  disabled?: boolean
  onExport?: () => void
  onReset?: () => void
  onLockToggle?: () => void
  isLoading?: boolean
}

export function SanteCollButtons({
  onNewActeClick,
  isLocked,
  disabled = false,
  onExport,
  onReset,
  onLockToggle,
  isLoading = false
}: SanteCollButtonsProps) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            Saisie d'activités Santé Collective
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sélectionnez le type d'acte à enregistrer
          </p>
        </div>
        
        {/* Indicateur de verrouillage */}
        <div className="flex items-center gap-2">
          {isLocked ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Mois verrouillé
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
              <Unlock className="h-3 w-3" />
              Mois éditable
            </Badge>
          )}
        </div>
      </div>

      {/* Bouton principal */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={onNewActeClick}
          disabled={disabled || isLoading || isLocked}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="h-6 w-6 mr-3" />
          Nouvel acte
        </Button>
      </div>

      {/* Actions secondaires */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Bouton Export */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={disabled || isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        )}

        {/* Bouton Reset */}
        {onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={disabled || isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filtres
          </Button>
        )}

        {/* Bouton Verrouillage */}
        {onLockToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLockToggle}
            disabled={disabled || isLoading}
            className={`flex items-center gap-2 ${
              isLocked 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="h-4 w-4" />
                Déverrouiller
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Verrouiller
              </>
            )}
          </Button>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Chargement...
          </div>
        )}
      </div>

      {/* Message d'aide */}
      {isLocked && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Ce mois est verrouillé. Aucune nouvelle activité ne peut être ajoutée.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
