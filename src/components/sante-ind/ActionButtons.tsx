"use client"

import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Plus, 
  FileText, 
  RotateCcw, 
  ArrowRightLeft, 
  Users,
  Lock,
  Unlock
} from 'lucide-react'

import {
  ActeType,
  LockStatus,
  ACTE_TYPE_LABELS
} from '../../types/sante-ind'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface ActionButtonsProps {
  lockStatus: LockStatus
  onOpenModal: (acteType: ActeType) => void
  onExport?: () => void
  onReset?: () => void
  onTransfer?: () => void
  onManageGroup?: () => void
  isLoading?: boolean
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ActionButtons({
  lockStatus,
  onOpenModal,
  onExport,
  onReset,
  onTransfer,
  onManageGroup,
  isLoading = false
}: ActionButtonsProps) {
  
  // ============================================================================
  // ÉTAT DÉRIVÉ
  // ============================================================================
  
  const isLocked = lockStatus === 'locked'
  const canPerformActions = !isLocked && !isLoading

  // ============================================================================
  // RENDU
  // ============================================================================
  
  return (
    <div className="space-y-4">
      {/* Titre et statut */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actions rapides</h3>
        
        <Badge 
          variant={isLocked ? "destructive" : "default"}
          className="flex items-center gap-1"
        >
          {isLocked ? (
            <>
              <Lock className="h-3 w-3" />
              Verrouillé
            </>
          ) : (
            <>
              <Unlock className="h-3 w-3" />
              Ouvert
            </>
          )}
        </Badge>
      </div>

      {/* Boutons d'actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Affaire nouvelle */}
        <Button
          onClick={() => onOpenModal('affaire_nouvelle')}
          disabled={!canPerformActions}
          className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <div className="text-center">
            <div className="font-medium">Affaire nouvelle</div>
            <div className="text-xs opacity-90">
              {ACTE_TYPE_LABELS.affaire_nouvelle}
            </div>
          </div>
        </Button>

        {/* Révision */}
        <Button
          onClick={() => onOpenModal('revision')}
          disabled={!canPerformActions}
          className="h-auto p-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <RotateCcw className="h-5 w-5" />
          <div className="text-center">
            <div className="font-medium">Révision</div>
            <div className="text-xs opacity-90">
              {ACTE_TYPE_LABELS.revision}
            </div>
          </div>
        </Button>

        {/* Adhésion groupe */}
        <Button
          onClick={() => onOpenModal('adhesion_groupe')}
          disabled={!canPerformActions}
          className="h-auto p-4 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Users className="h-5 w-5" />
          <div className="text-center">
            <div className="font-medium">Adhésion groupe</div>
            <div className="text-xs opacity-90">
              {ACTE_TYPE_LABELS.adhesion_groupe}
            </div>
          </div>
        </Button>

        {/* Courtage → Allianz */}
        <Button
          onClick={() => onOpenModal('courtage_vers_allianz')}
          disabled={!canPerformActions}
          className="h-auto p-4 flex flex-col items-center gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <ArrowRightLeft className="h-5 w-5" />
          <div className="text-center">
            <div className="font-medium">Courtage → Allianz</div>
            <div className="text-xs opacity-90">
              {ACTE_TYPE_LABELS.courtage_vers_allianz}
            </div>
          </div>
        </Button>

        {/* Allianz → Courtage */}
        <Button
          onClick={() => onOpenModal('allianz_vers_courtage')}
          disabled={!canPerformActions}
          className="h-auto p-4 flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowRightLeft className="h-5 w-5 rotate-180" />
          <div className="text-center">
            <div className="font-medium">Allianz → Courtage</div>
            <div className="text-xs opacity-90">
              {ACTE_TYPE_LABELS.allianz_vers_courtage}
            </div>
          </div>
        </Button>

        {/* Actions secondaires */}
        <div className="space-y-2">
          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Exporter
            </Button>
          )}
          
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Message d'information si verrouillé */}
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <strong>Mois verrouillé :</strong> Les nouvelles saisies ne sont plus possibles.
            </div>
          </div>
        </div>
      )}

      {/* Message de chargement */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-blue-800">
              Chargement en cours...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
