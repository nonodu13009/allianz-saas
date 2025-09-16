// Modale pour la saisie des Process (M+3, Préterme Auto, Préterme IRD)
// Basée sur les spécifications du CDC commercial

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ActivityType } from '@/types/cdc'
import { capitalizeClientName } from '@/lib/cdc'
import { toast } from 'sonner'
import { 
  TrendingUp, 
  Car, 
  Shield,
  Save, 
  X, 
  User, 
  MessageSquare,
  Calendar,
  Clock
} from 'lucide-react'

interface ModalProcessProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  processType: ActivityType
  loading?: boolean
  isLocked?: boolean
}

export function ModalProcess({ 
  isOpen, 
  onClose, 
  onSave, 
  processType, 
  loading = false,
  isLocked = false
}: ModalProcessProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    comment: ''
  })

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        comment: ''
      })
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Vérification du verrouillage
    if (isLocked) {
      toast.error('Ce mois est verrouillé. Aucune modification n\'est autorisée.')
      return
    }

    // Validation
    if (!formData.clientName.trim()) {
      toast.error('Le nom du client est obligatoire')
      return
    }

    // Capitalisation du nom client
    const capitalizedName = capitalizeClientName(formData.clientName)

    // Préparation des données
    const activityData = {
      type: processType,
      clientName: capitalizedName,
      comment: formData.comment.trim(),
      dateSaisie: new Date().toISOString()
    }

    onSave(activityData)
  }

  // Configuration selon le type de process
  const getProcessConfig = () => {
    switch (processType) {
      case ActivityType.M3:
        return {
          title: 'Process M+3',
          icon: TrendingUp,
          color: 'blue',
          gradient: 'from-blue-500 to-indigo-600',
          description: 'Suivi mensuel +3 mois',
          badgeText: '📈 Suivi',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case ActivityType.PRETERME_AUTO:
        return {
          title: 'Préterme Auto',
          icon: Car,
          color: 'orange',
          gradient: 'from-orange-500 to-red-600',
          description: 'Résiliation anticipée automobile',
          badgeText: '🚗 Auto',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
        }
      case ActivityType.PRETERME_IRD:
        return {
          title: 'Préterme IRD',
          icon: Shield,
          color: 'violet',
          gradient: 'from-violet-500 to-purple-600',
          description: 'Résiliation anticipée IRD',
          badgeText: '🛡️ IRD',
          badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
        }
      default:
        return {
          title: 'Process',
          icon: TrendingUp,
          color: 'gray',
          gradient: 'from-gray-500 to-gray-600',
          description: 'Processus commercial',
          badgeText: '📋 Process',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const config = getProcessConfig()
  const IconComponent = config.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <IconComponent className={`h-6 w-6 text-${config.color}-600`} />
            {config.title}
            <Badge variant="secondary" className={config.badgeColor}>
              {config.badgeText}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de saisie automatique */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Informations automatiques
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date de saisie</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type de process</span>
                <Badge variant="outline" className={config.badgeColor}>
                  {config.title}
                </Badge>
              </div>
            </div>
          </div>

          {/* Nom client */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              Nom du client *
            </Label>
            <div className="relative">
              <Input
                id="clientName"
                type="text"
                placeholder="Ex: Jean Dupont"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="pl-10"
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Le nom sera capitalisé automatiquement à l'enregistrement
            </p>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              Commentaire
            </Label>
            <textarea
              id="comment"
              rows={4}
              placeholder="Ajoutez un commentaire sur ce process..."
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Commentaire optionnel pour plus de détails
            </p>
          </div>

          {/* Résumé de la saisie */}
          <div className={`${
            config.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
            config.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
            'bg-purple-50 dark:bg-purple-900/20'
          } rounded-lg p-4`}>
            <h3 className={`text-sm font-medium mb-2 ${
              config.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
              config.color === 'red' ? 'text-red-800 dark:text-red-200' :
              'text-purple-800 dark:text-purple-200'
            }`}>
              Résumé de la saisie
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Client:</span>
                <span className="font-medium">
                  {formData.clientName || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium">{config.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Message d'aide si bouton désactivé */}
          {(!formData.clientName || isLocked) && (
            <div className={`${
              config.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              config.color === 'red' ? 'bg-red-50 border-red-200' :
              'bg-purple-50 border-purple-200'
            } border rounded-lg p-3`}>
              <p className={`text-sm ${
                config.color === 'orange' ? 'text-orange-700' :
                config.color === 'red' ? 'text-red-700' :
                'text-purple-700'
              }`}>
                {isLocked ? '⚠️ Le mois est verrouillé - Modification impossible' : '⚠️ Le nom du client est obligatoire pour enregistrer'}
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !formData.clientName || isLocked}
              className={`flex-1 ${
                config.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                config.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer le process
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
