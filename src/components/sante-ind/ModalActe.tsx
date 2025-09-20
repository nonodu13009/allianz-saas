// Modale générique pour la saisie des actes commerciaux Santé Individuelle
// Adaptée aux 5 types d'actes avec design identique au CDC Commercial

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SanteIndActeType, CompagnieType } from '@/types/sante-ind'
import { calculateCAPondere, formatEuroInt, capitalizeClientName, getPonderationLabel } from '@/lib/sante-ind'
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
  Building2
} from 'lucide-react'

interface ModalActeProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  acteType: SanteIndActeType
  loading?: boolean
  isLocked?: boolean
}

export function ModalActe({ 
  isOpen, 
  onClose, 
  onSave, 
  acteType, 
  loading = false, 
  isLocked = false 
}: ModalActeProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    dateEffet: '',
    ca: '',
    compagnie: '' as CompagnieType | ''
  })

  const [caPondere, setCaPondere] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        contractNumber: '',
        dateEffet: '',
        ca: '',
        compagnie: ''
      })
      setCaPondere(0)
    }
  }, [isOpen])

  // Calcul automatique du CA pondéré
  useEffect(() => {
    if (formData.ca && !isNaN(parseInt(formData.ca))) {
      setIsCalculating(true)
      
      // Simulation d'un délai pour l'effet de calcul
      setTimeout(() => {
        const ca = parseInt(formData.ca)
        const pondere = calculateCAPondere(acteType, ca)
        setCaPondere(pondere)
        setIsCalculating(false)
      }, 500)
    }
  }, [formData.ca, acteType])

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

    if (!formData.contractNumber.trim()) {
      toast.error('Le numéro de contrat est obligatoire')
      return
    }

    if (!formData.dateEffet) {
      toast.error('La date d\'effet est obligatoire')
      return
    }

    if (!formData.ca || parseInt(formData.ca) <= 0) {
      toast.error('Le CA doit être un montant positif')
      return
    }

    // Validation spécifique aux Affaires Nouvelles
    if (acteType === SanteIndActeType.AFFAIRE_NOUVELLE) {
      if (!formData.compagnie) {
        toast.error('La compagnie est obligatoire pour les affaires nouvelles')
        return
      }
    }

    // Capitalisation du nom client
    const capitalizedName = capitalizeClientName(formData.clientName)

    // Préparation des données
    const activityData: Record<string, unknown> = {
      type: acteType,
      clientName: capitalizedName,
      contractNumber: formData.contractNumber,
      dateEffet: formData.dateEffet,
      dateSaisie: new Date().toISOString(), // Date de saisie automatique
      ca: parseInt(formData.ca),
      caPondere
    }

    // Ajouter la compagnie seulement pour les Affaires Nouvelles
    if (acteType === SanteIndActeType.AFFAIRE_NOUVELLE && formData.compagnie) {
      activityData.compagnie = formData.compagnie
    }

    onSave(activityData)
  }

  const getActeTypeInfo = () => {
    const infos = {
      [SanteIndActeType.AFFAIRE_NOUVELLE]: {
        icon: PlusCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-200',
        label: 'Affaire Nouvelle',
        description: 'Nouvelle affaire commerciale',
        badge: '✨ Nouvelle'
      },
      [SanteIndActeType.REVISION]: {
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        label: 'Révision',
        description: 'Révision d\'un contrat existant',
        badge: '📝 Révision'
      },
      [SanteIndActeType.ADHESION_GROUPE]: {
        icon: User,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        label: 'Adhésion Groupe',
        description: 'Adhésion à un groupe existant',
        badge: '👥 Groupe'
      },
      [SanteIndActeType.COURTAGE_VERS_ALLIANZ]: {
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        label: 'Courtage → Allianz',
        description: 'Transfert depuis courtage vers Allianz',
        badge: '➡️ Transfert'
      },
      [SanteIndActeType.ALLIANZ_VERS_COURTAGE]: {
        icon: TrendingUp,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Allianz → Courtage',
        description: 'Transfert depuis Allianz vers courtage',
        badge: '⬅️ Transfert'
      }
    }
    return infos[acteType]
  }

  const acteInfo = getActeTypeInfo()
  const IconComponent = acteInfo.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <IconComponent className={`h-6 w-6 ${acteInfo.color}`} />
            {acteInfo.label}
            <Badge variant="secondary" className={`${acteInfo.bgColor} ${acteInfo.color} ${acteInfo.borderColor}`}>
              {acteInfo.badge}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {acteInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* N° contrat */}
            <div className="space-y-2">
              <Label htmlFor="contractNumber" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                N° contrat *
              </Label>
              <Input
                id="contractNumber"
                type="text"
                placeholder="Ex: 123456789"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date d'effet */}
            <div className="space-y-2">
              <Label htmlFor="dateEffet" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                Date d'effet *
              </Label>
              <Input
                id="dateEffet"
                type="date"
                value={formData.dateEffet}
                onChange={(e) => handleInputChange('dateEffet', e.target.value)}
                required
              />
            </div>

            {/* Compagnie (seulement pour Affaire Nouvelle) */}
            {acteType === SanteIndActeType.AFFAIRE_NOUVELLE && (
              <div className="space-y-2">
                <Label htmlFor="compagnie" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  Compagnie *
                </Label>
                <select
                  id="compagnie"
                  value={formData.compagnie}
                  onChange={(e) => handleInputChange('compagnie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez une compagnie</option>
                  <option value={CompagnieType.ALLIANZ}>Allianz</option>
                  <option value={CompagnieType.COURTAGE}>Courtage</option>
                </select>
              </div>
            )}
          </div>

          {/* Montants financiers */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Montants financiers
            </h3>
            
            <div className="space-y-4">
              {/* CA brut */}
              <div className="space-y-2">
                <Label htmlFor="ca" className="text-sm font-medium">
                  CA (€) *
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="ca"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 5000"
                    value={formData.ca}
                    onChange={(e) => handleInputChange('ca', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Montant du chiffre d'affaires brut
                </p>
              </div>

              {/* CA pondéré */}
              {formData.ca && !isNaN(parseInt(formData.ca)) && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    CA pondéré
                  </h4>
                  <div className="flex items-center gap-2">
                    {isCalculating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        <span className="text-sm text-emerald-600">Calcul en cours...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatEuroInt(caPondere)}
                        </span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {getPonderationLabel(acteType)}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    CA pondéré calculé selon la grille {getPonderationLabel(acteType)}
                  </p>
                </div>
              )}
            </div>
          </div>

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
              disabled={loading || !formData.clientName || !formData.contractNumber || !formData.dateEffet || !formData.ca}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer l'acte
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
