// Modale d'édition d'une activité CDC
// Permet de modifier les détails d'une activité existante

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { capitalizeClientName, calculateCommission, requiresPrimeAnnuelle, requiresVersementLibre } from '@/lib/cdc'
import { toast } from 'sonner'
import { 
  Save, 
  X, 
  User, 
  FileText, 
  Euro,
  Hash,
  Calendar,
  TrendingUp,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

interface ActivityEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<Activity>) => Promise<void>
  activity: Activity | null
  loading?: boolean
  isLocked?: boolean
}

export function ActivityEditModal({ 
  isOpen, 
  onClose, 
  onSave,
  activity,
  loading = false,
  isLocked = false
}: ActivityEditModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    dateEffet: '',
    primeAnnuelle: '',
    versementLibre: '',
    comment: '',
    productType: ''
  })

  // Initialisation du formulaire
  useEffect(() => {
    if (activity) {
      setFormData({
        clientName: activity.clientName || '',
        contractNumber: activity.contractNumber || '',
        dateEffet: activity.dateEffet || '',
        primeAnnuelle: activity.primeAnnuelle?.toString() || '',
        versementLibre: activity.versementLibre?.toString() || '',
        comment: activity.comment || '',
        productType: activity.productType || ''
      })
    }
  }, [activity])

  if (!activity) return null

  // Configuration selon le type d'activité
  const getActivityConfig = () => {
    switch (activity.type) {
      case ActivityType.AN:
        return {
          icon: TrendingUp,
          title: 'Modifier Affaire Nouvelle',
          color: 'emerald',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800'
        }
      case ActivityType.M3:
        return {
          icon: FileText,
          title: 'Modifier Process M+3',
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
      case ActivityType.PRETERME_AUTO:
        return {
          icon: FileText,
          title: 'Modifier Préterme Auto',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      case ActivityType.PRETERME_IRD:
        return {
          icon: FileText,
          title: 'Modifier Préterme IRD',
          color: 'purple',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      default:
        return {
          icon: FileText,
          title: 'Modifier Activité',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
    }
  }

  const config = getActivityConfig()
  const ActivityIcon = config.icon

  // Gestion des changements d'input
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcul de la commission potentielle
  const calculatePotentialCommission = () => {
    if (activity.type === ActivityType.AN && activity.productType) {
      const primeAnnuelle = parseFloat(formData.primeAnnuelle) || 0
      const versementLibre = parseFloat(formData.versementLibre) || 0
      return calculateCommission(activity.productType, primeAnnuelle, versementLibre)
    }
    return 0
  }

  // Validation du formulaire
  const isFormValid = () => {
    if (!formData.clientName.trim()) return false
    
    if (activity.type === ActivityType.AN) {
      if (requiresPrimeAnnuelle(activity.productType as ProductType)) {
        const prime = parseFloat(formData.primeAnnuelle)
        if (!prime || prime <= 0) return false
      }
      
      if (requiresVersementLibre(activity.productType as ProductType)) {
        const versement = parseFloat(formData.versementLibre)
        if (!versement || versement <= 0) return false
      }
    }
    
    return true
  }

  // Sauvegarde des modifications
  const handleSave = async () => {
    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (isLocked) {
      toast.error('Impossible de modifier : le mois est verrouillé')
      return
    }

    try {
      // Capitalisation du nom client
      const capitalizedName = capitalizeClientName(formData.clientName)

      // Préparation des données de mise à jour
      const updates: Partial<Activity> = {
        clientName: capitalizedName,
        updatedAt: new Date().toISOString()
      }

      // Données spécifiques selon le type
      if (activity.type === ActivityType.AN) {
        updates.contractNumber = formData.contractNumber
        updates.dateEffet = formData.dateEffet
        
        if (formData.primeAnnuelle) {
          updates.primeAnnuelle = parseFloat(formData.primeAnnuelle)
        }
        
        if (formData.versementLibre) {
          updates.versementLibre = parseFloat(formData.versementLibre)
        }
        
        // Recalcul de la commission
        if (activity.productType) {
          updates.commissionPotentielle = calculatePotentialCommission()
        }
      } else {
        // Pour les Process
        updates.comment = formData.comment
      }

      await onSave(activity.id, updates)
      toast.success('Activité modifiée avec succès')
      onClose()

    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error('Erreur lors de la modification')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <ActivityIcon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <span className={`text-${config.color}-600 font-semibold`}>
              {config.title}
            </span>
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette activité CDC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message d'avertissement si verrouillé */}
          {isLocked && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Le mois est verrouillé - Modification impossible
                </span>
              </div>
            </div>
          )}

          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Informations générales
            </h3>
            
            {/* Nom client */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Nom du client *
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Nom du client"
                disabled={isLocked}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Le nom sera capitalisé automatiquement à l'enregistrement
              </p>
            </div>

            {/* Type d'activité (lecture seule) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Type d'activité
              </Label>
              <Badge variant="outline" className={`text-${config.color}-600 border-${config.color}-200`}>
                {config.title.replace('Modifier ', '')}
              </Badge>
            </div>
          </div>

          {/* Détails spécifiques selon le type */}
          {activity.type === ActivityType.AN && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Détails de l'affaire nouvelle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type de produit (lecture seule) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Type de produit
                  </Label>
                  <Badge variant="outline">{activity.productType}</Badge>
                </div>

                {/* Numéro de contrat */}
                <div className="space-y-2">
                  <Label htmlFor="contractNumber" className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    Numéro de contrat
                  </Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                    placeholder="Ex: AUTO-2024-001"
                    disabled={isLocked}
                  />
                </div>

                {/* Date d'effet */}
                <div className="space-y-2">
                  <Label htmlFor="dateEffet" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Date d'effet
                  </Label>
                  <Input
                    id="dateEffet"
                    type="date"
                    value={formData.dateEffet}
                    onChange={(e) => handleInputChange('dateEffet', e.target.value)}
                    disabled={isLocked}
                  />
                </div>

                {/* Prime annuelle (si requise) */}
                {requiresPrimeAnnuelle(activity.productType as ProductType) && (
                  <div className="space-y-2">
                    <Label htmlFor="primeAnnuelle" className="text-sm font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4 text-blue-600" />
                      Prime annuelle *
                    </Label>
                    <Input
                      id="primeAnnuelle"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.primeAnnuelle}
                      onChange={(e) => handleInputChange('primeAnnuelle', e.target.value)}
                      placeholder="0.00"
                      disabled={isLocked}
                    />
                  </div>
                )}

                {/* Versement libre (si requis) */}
                {requiresVersementLibre(activity.productType as ProductType) && (
                  <div className="space-y-2">
                    <Label htmlFor="versementLibre" className="text-sm font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4 text-blue-600" />
                      Versement libre *
                    </Label>
                    <Input
                      id="versementLibre"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.versementLibre}
                      onChange={(e) => handleInputChange('versementLibre', e.target.value)}
                      placeholder="0.00"
                      disabled={isLocked}
                    />
                  </div>
                )}
              </div>

              {/* Commission potentielle */}
              {calculatePotentialCommission() > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Commission potentielle: {calculatePotentialCommission().toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Commentaire pour les Process */}
          {(activity.type === ActivityType.M3 || 
            activity.type === ActivityType.PRETERME_AUTO || 
            activity.type === ActivityType.PRETERME_IRD) && (
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
                disabled={isLocked}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
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
              disabled={loading || !isFormValid() || isLocked}
              className={`flex-1 ${
                config.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                config.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                config.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                config.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Modification...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
