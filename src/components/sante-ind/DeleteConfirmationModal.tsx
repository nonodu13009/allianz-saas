"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { AlertTriangle, Trash2, X } from 'lucide-react'

import {
  SanteIndActivity,
  ACTE_TYPE_LABELS,
  COMPAGNIE_LABELS
} from '../../types/sante-ind'

import {
  santeIndService,
  formatDateShort,
  formatEuroInt
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  activity: SanteIndActivity | null
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  activity
}: DeleteConfirmationModalProps) {
  
  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  const [isDeleting, setIsDeleting] = useState(false)

  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================
  
  const handleConfirm = async () => {
    if (!activity) return

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  // ============================================================================
  // RENDU
  // ============================================================================
  
  if (!activity) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message d'avertissement */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-medium">Attention !</h4>
                <p className="text-red-700 text-sm mt-1">
                  Cette action est irréversible. L'activité sera définitivement supprimée.
                </p>
              </div>
            </div>
          </div>

          {/* Détails de l'activité à supprimer */}
          <div className="bg-gray-50 rounded-md p-4">
            <h5 className="font-medium text-gray-800 mb-3">Activité à supprimer :</h5>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client :</span>
                <span className="font-medium">{activity.nomClient}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nature :</span>
                <span className="font-medium">
                  {ACTE_TYPE_LABELS[activity.natureActe]}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Contrat :</span>
                <span className="font-mono">{activity.numeroContrat}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date de saisie :</span>
                <span className="font-medium">
                  {formatDateShort(activity.dateSaisie)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date d'effet :</span>
                <span className="font-medium">
                  {formatDateShort(activity.dateEffet)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">CA :</span>
                <span className="font-medium">
                  {formatEuroInt(activity.ca)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">CA pondéré :</span>
                <span className="font-semibold text-blue-600">
                  {formatEuroInt(activity.caPondere)}
                </span>
              </div>
              
              {activity.compagnie && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Compagnie :</span>
                  <span className="font-medium">
                    {COMPAGNIE_LABELS[activity.compagnie]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="min-w-[120px]"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suppression...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
