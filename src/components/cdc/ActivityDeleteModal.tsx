// Modale de suppression d'une activité CDC
// Confirmation avec alerte de sécurité

"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityType } from '@/types/cdc'
import { formatDateShort, formatEuroInt } from '@/lib/cdc'
import { toast } from 'sonner'
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  User, 
  Calendar,
  Euro,
  FileText,
  TrendingUp
} from 'lucide-react'

interface ActivityDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
  activity: Activity | null
  loading?: boolean
  isLocked?: boolean
}

export function ActivityDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  activity,
  loading = false,
  isLocked = false
}: ActivityDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('')

  if (!activity) return null

  // Configuration selon le type d'activité
  const getActivityConfig = () => {
    switch (activity.type) {
      case ActivityType.AN:
        return {
          icon: TrendingUp,
          title: 'Affaire Nouvelle',
          color: 'emerald',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800'
        }
      case ActivityType.M3:
        return {
          icon: FileText,
          title: 'Process M+3',
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
      case ActivityType.PRETERME_AUTO:
        return {
          icon: FileText,
          title: 'Préterme Auto',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      case ActivityType.PRETERME_IRD:
        return {
          icon: FileText,
          title: 'Préterme IRD',
          color: 'purple',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      default:
        return {
          icon: FileText,
          title: 'Activité CDC',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
    }
  }

  const config = getActivityConfig()
  const ActivityIcon = config.icon

  // Texte de confirmation requis
  const requiredConfirmText = "SUPPRIMER"
  const isConfirmValid = confirmText === requiredConfirmText

  // Gestion de la suppression
  const handleConfirm = async () => {
    if (!isConfirmValid) {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer')
      return
    }

    if (isLocked) {
      toast.error('Impossible de supprimer : le mois est verrouillé')
      return
    }

    try {
      await onConfirm(activity.id)
      toast.success('Activité supprimée avec succès')
      onClose()
      setConfirmText('') // Reset du champ de confirmation
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Reset du champ de confirmation à la fermeture
  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <span className="text-red-600 font-semibold">
                Supprimer une activité
              </span>
              <div className="text-sm text-gray-500 font-normal">
                Cette action est irréversible
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer définitivement cette activité CDC.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alerte de sécurité */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Attention - Action irréversible
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  La suppression de cette activité est définitive. Toutes les données associées seront perdues.
                </p>
              </div>
            </div>
          </div>

          {/* Message d'avertissement si verrouillé */}
          {isLocked && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Le mois est verrouillé - Suppression impossible
                </span>
              </div>
            </div>
          )}

          {/* Résumé de l'activité à supprimer */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Activité à supprimer
            </h3>
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                <ActivityIcon className={`h-4 w-4 text-${config.color}-600`} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-${config.color}-600 border-${config.color}-200`}>
                    {config.title}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDateShort(activity.dateSaisie)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{activity.clientName}</span>
                </div>
                
                {activity.type === ActivityType.AN && (
                  <>
                    {activity.productType && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{activity.productType}</span>
                      </div>
                    )}
                    
                    {activity.commissionPotentielle && (
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600">
                          {formatEuroInt(activity.commissionPotentielle)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {activity.comment && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {activity.comment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation de suppression */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </span>
            </div>
            
            <p className="text-sm text-gray-600">
              Pour confirmer la suppression, tapez exactement : <strong>SUPPRIMER</strong>
            </p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER ici"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-black dark:text-white ${
                isConfirmValid 
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100' 
                  : 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
            />
            
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-600">
                Le texte ne correspond pas. Tapez exactement "SUPPRIMER"
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !isConfirmValid || isLocked}
              variant="destructive"
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
