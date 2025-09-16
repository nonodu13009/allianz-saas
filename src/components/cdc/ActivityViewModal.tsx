// Modale de visualisation d'une activité CDC
// Affiche les détails en lecture seule

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { formatDateShort, formatEuroInt } from '@/lib/cdc'
import { 
  Calendar, 
  User, 
  FileText, 
  Euro,
  Hash,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react'

interface ActivityViewModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
}

export function ActivityViewModal({ 
  isOpen, 
  onClose, 
  activity 
}: ActivityViewModalProps) {
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
          icon: Clock,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <ActivityIcon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <div>
              <span className={`text-${config.color}-600 font-semibold`}>
                {config.title}
              </span>
              <div className="text-sm text-gray-500 font-normal">
                Détails de l'activité
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes de cette activité CDC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
            <h3 className={`text-sm font-medium text-${config.color}-800 dark:text-${config.color}-200 mb-3`}>
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Date de saisie:</span>
                <span className="font-medium">{formatDateShort(activity.dateSaisie)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Client:</span>
                <span className="font-medium">{activity.clientName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Type:</span>
                <Badge variant="outline" className={`text-${config.color}-600 border-${config.color}-200`}>
                  {config.title}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Statut:</span>
                <Badge variant="secondary" className={activity.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {activity.isLocked ? 'Verrouillé' : 'Modifiable'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Détails spécifiques selon le type */}
          {activity.type === ActivityType.AN && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Détails de l'affaire nouvelle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activity.productType && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Produit:</span>
                    <Badge variant="outline">{activity.productType}</Badge>
                  </div>
                )}
                
                {activity.contractNumber && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Contrat:</span>
                    <span className="font-medium">{activity.contractNumber}</span>
                  </div>
                )}
                
                {activity.dateEffet && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date d'effet:</span>
                    <span className="font-medium">{formatDateShort(activity.dateEffet)}</span>
                  </div>
                )}
                
                {activity.primeAnnuelle && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Prime annuelle:</span>
                    <span className="font-medium">{formatEuroInt(activity.primeAnnuelle)}</span>
                  </div>
                )}
                
                {activity.versementLibre && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Versement libre:</span>
                    <span className="font-medium">{formatEuroInt(activity.versementLibre)}</span>
                  </div>
                )}
                
                {activity.commissionPotentielle && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Commission potentielle:</span>
                    <span className="font-medium text-emerald-600">{formatEuroInt(activity.commissionPotentielle)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commentaire pour les Process */}
          {(activity.type === ActivityType.M3 || 
            activity.type === ActivityType.PRETERME_AUTO || 
            activity.type === ActivityType.PRETERME_IRD) && 
            activity.comment && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Commentaire
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.comment}
                </p>
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Métadonnées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {activity.id}
              </div>
              <div>
                <span className="font-medium">Utilisateur:</span> {activity.userId}
              </div>
              <div>
                <span className="font-medium">Période:</span> {activity.yearMonth}
              </div>
              {activity.createdAt && (
                <div>
                  <span className="font-medium">Créé:</span> {formatDateShort(activity.createdAt)}
                </div>
              )}
              {activity.updatedAt && (
                <div>
                  <span className="font-medium">Modifié:</span> {formatDateShort(activity.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
