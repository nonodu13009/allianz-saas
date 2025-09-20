// Modale générique pour la saisie des actes commerciaux Santé Collective
// Adaptée aux 4 types d'actes avec design identique au CDC Commercial

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SanteCollActeType, SanteCollOrigine, CompagnieType, PONDERATION_RATES } from '@/types/sante-coll'
import { calculateCAPondere, formatEuroInt, capitalizeClientName } from '@/lib/sante-coll'
import { toast } from 'sonner'
import { 
  PlusCircle, 
  Save, 
  X, 
  Euro, 
  Calendar, 
  User, 
  FileText,
  Sparkles,
  TrendingUp,
  Building2,
  Target
} from 'lucide-react'

interface ModalActeProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  loading?: boolean
  isLocked?: boolean
  existingActivity?: any
  yearMonth?: string
}

export function ModalActe({ 
  isOpen, 
  onClose, 
  onSave, 
  loading = false, 
  isLocked = false,
  existingActivity,
  yearMonth
}: ModalActeProps) {
  
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    dateEffet: '',
    ca: '',
    type: '',
    origine: '',
    compagnie: '',
    comment: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      if (existingActivity) {
        // Mode édition
        setFormData({
          clientName: existingActivity.clientName || '',
          contractNumber: existingActivity.contractNumber || '',
          dateEffet: existingActivity.dateEffet || '',
          ca: existingActivity.ca?.toString() || '',
          type: existingActivity.type || '',
          origine: existingActivity.origine || '',
          compagnie: existingActivity.compagnie || '',
          comment: existingActivity.comment || ''
        })
      } else {
        // Mode création
        setFormData({
          clientName: '',
          contractNumber: '',
          dateEffet: '',
          ca: '',
          type: '',
          origine: '',
          compagnie: '',
          comment: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, existingActivity])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est obligatoire'
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Le numéro de contrat est obligatoire'
    }

    if (!formData.dateEffet) {
      newErrors.dateEffet = 'La date d\'effet est obligatoire'
    }

    if (!formData.ca || parseFloat(formData.ca) <= 0) {
      newErrors.ca = 'Le CA doit être supérieur à 0'
    }

    if (!formData.type) {
      newErrors.type = 'Le type d\'acte est obligatoire'
    }

    // Validation spécifique aux Affaires Nouvelles
    if (formData.type === SanteCollActeType.AFFAIRE_NOUVELLE && !formData.compagnie) {
      newErrors.compagnie = 'La compagnie est obligatoire pour les Affaires Nouvelles'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    // Vérification du verrouillage
    if (isLocked) {
      toast.error('Ce mois est verrouillé. Aucune modification n\'est autorisée.')
      return
    }

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    // Capitalisation du nom client
    const capitalizedName = capitalizeClientName(formData.clientName)
    const ca = parseFloat(formData.ca)
    const caPondere = calculateCAPondere(ca, formData.type as SanteCollActeType)

    // Préparation des données
    const activityData = {
      type: formData.type,
      clientName: capitalizedName,
      contractNumber: formData.contractNumber.trim(),
      dateEffet: formData.dateEffet,
      ca,
      caPondere,
      origine: formData.origine || undefined,
      compagnie: formData.compagnie || undefined,
      comment: formData.comment.trim() || undefined,
      dateSaisie: new Date().toISOString(),
      yearMonth: yearMonth || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
    }

    onSave(activityData)
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-blue-600">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <div className="text-xl font-bold">Nouvel acte</div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Santé Collective
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {existingActivity ? 'Modifier les informations de l\'activité' : 'Saisir les informations de la nouvelle activité'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations client */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations client
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Nom du client"
                  className={errors.clientName ? 'border-red-500' : ''}
                />
                {errors.clientName && (
                  <p className="text-sm text-red-600">{errors.clientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractNumber">N° contrat *</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                  placeholder="Numéro de contrat"
                  className={errors.contractNumber ? 'border-red-500' : ''}
                />
                {errors.contractNumber && (
                  <p className="text-sm text-red-600">{errors.contractNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations contrat */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations contrat
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'acte *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner un type d'acte</option>
                  <option value={SanteCollActeType.AFFAIRE_NOUVELLE}>{SanteCollActeType.AFFAIRE_NOUVELLE}</option>
                  <option value={SanteCollActeType.REVISION}>{SanteCollActeType.REVISION}</option>
                  <option value={SanteCollActeType.ADHESION_GROUPE}>{SanteCollActeType.ADHESION_GROUPE}</option>
                  <option value={SanteCollActeType.TRANSFERT_COURTAGE}>{SanteCollActeType.TRANSFERT_COURTAGE}</option>
                  <option value={SanteCollActeType.RESILIATION}>{SanteCollActeType.RESILIATION}</option>
                  <option value={SanteCollActeType.MODIFICATION_CONTRAT}>{SanteCollActeType.MODIFICATION_CONTRAT}</option>
                  <option value={SanteCollActeType.RENOUVELLEMENT}>{SanteCollActeType.RENOUVELLEMENT}</option>
                  <option value={SanteCollActeType.EXTENSION_GARANTIE}>{SanteCollActeType.EXTENSION_GARANTIE}</option>
                  <option value={SanteCollActeType.CHANGEMENT_TARIF}>{SanteCollActeType.CHANGEMENT_TARIF}</option>
                  <option value={SanteCollActeType.AUTRE_ACTE}>{SanteCollActeType.AUTRE_ACTE}</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateEffet">Date d'effet *</Label>
                <Input
                  id="dateEffet"
                  type="date"
                  value={formData.dateEffet}
                  onChange={(e) => handleInputChange('dateEffet', e.target.value)}
                  className={errors.dateEffet ? 'border-red-500' : ''}
                />
                {errors.dateEffet && (
                  <p className="text-sm text-red-600">{errors.dateEffet}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ca">CA (€) *</Label>
                <Input
                  id="ca"
                  type="number"
                  value={formData.ca}
                  onChange={(e) => handleInputChange('ca', e.target.value)}
                  placeholder="0"
                  className={errors.ca ? 'border-red-500' : ''}
                />
                {errors.ca && (
                  <p className="text-sm text-red-600">{errors.ca}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations spécifiques */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Informations spécifiques
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origine">Origine</Label>
                <select
                  id="origine"
                  value={formData.origine}
                  onChange={(e) => handleInputChange('origine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une origine</option>
                  <option value={SanteCollOrigine.PROSPECTION}>{SanteCollOrigine.PROSPECTION}</option>
                  <option value={SanteCollOrigine.REACTIF}>{SanteCollOrigine.REACTIF}</option>
                  <option value={SanteCollOrigine.PROACTIF}>{SanteCollOrigine.PROACTIF}</option>
                </select>
              </div>

              {/* Compagnie (seulement pour Affaires Nouvelles) */}
              {formData.type === SanteCollActeType.AFFAIRE_NOUVELLE && (
                <div className="space-y-2">
                  <Label htmlFor="compagnie">Compagnie *</Label>
                  <select
                    id="compagnie"
                    value={formData.compagnie}
                    onChange={(e) => handleInputChange('compagnie', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.compagnie ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Sélectionner une compagnie</option>
                    <option value={CompagnieType.ALLIANZ}>{CompagnieType.ALLIANZ}</option>
                    <option value={CompagnieType.UNIM_UNICED}>{CompagnieType.UNIM_UNICED}</option>
                    <option value={CompagnieType.COURTAGE}>{CompagnieType.COURTAGE}</option>
                  </select>
                  {errors.compagnie && (
                    <p className="text-sm text-red-600">{errors.compagnie}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Commentaire optionnel"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calcul du CA pondéré */}
          {formData.ca && formData.type && (
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    CA pondéré calculé
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatEuroInt(calculateCAPondere(parseFloat(formData.ca) || 0, formData.type as SanteCollActeType))}
                </div>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Coefficient: {((PONDERATION_RATES[formData.type as SanteCollActeType] || 1) * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={loading || isLocked}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {existingActivity ? 'Modifier' : 'Créer'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
