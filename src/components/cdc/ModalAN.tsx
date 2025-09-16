// Modale pour la saisie des Affaires Nouvelles (AN)
// Basée sur les spécifications du CDC commercial

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ActivityType, ProductType } from '@/types/cdc'
import { calculateCommission, formatEuroInt, capitalizeClientName } from '@/lib/cdc'
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
  TrendingUp
} from 'lucide-react'

interface ModalANProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  loading?: boolean
  isLocked?: boolean
}

export function ModalAN({ isOpen, onClose, onSave, loading = false, isLocked = false }: ModalANProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    productType: '' as ProductType | '',
    contractNumber: '',
    dateEffet: '',
    primeAnnuelle: '',
    versementLibre: ''
  })

  const [commissionPotentielle, setCommissionPotentielle] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        productType: '',
        contractNumber: '',
        dateEffet: '',
        primeAnnuelle: '',
        versementLibre: ''
      })
      setCommissionPotentielle(0)
    }
  }, [isOpen])

  // Calcul automatique de la commission
  useEffect(() => {
    if (formData.productType) {
      setIsCalculating(true)
      
      // Simulation d'un délai pour l'effet de calcul
      setTimeout(() => {
        const commission = calculateCommission(
          formData.productType as ProductType,
          formData.primeAnnuelle ? parseInt(formData.primeAnnuelle) : undefined,
          formData.versementLibre ? parseInt(formData.versementLibre) : undefined
        )
        setCommissionPotentielle(commission)
        setIsCalculating(false)
      }, 500)
    }
  }, [formData.productType, formData.primeAnnuelle, formData.versementLibre])

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

    if (!formData.productType) {
      toast.error('Le type de produit est obligatoire')
      return
    }

    // Validation spécifique selon le type de produit
    if (formData.productType === ProductType.PU_VL) {
      if (!formData.versementLibre || parseInt(formData.versementLibre) <= 0) {
        toast.error('Le versement libre doit être positif pour PU / VL')
        return
      }
    } else {
      if (!formData.primeAnnuelle || parseInt(formData.primeAnnuelle) <= 0) {
        toast.error('La prime annuelle doit être positive')
        return
      }
    }

    // Capitalisation du nom client
    const capitalizedName = capitalizeClientName(formData.clientName)

    // Préparation des données
    const activityData = {
      type: ActivityType.AN,
      clientName: capitalizedName,
      productType: formData.productType,
      contractNumber: formData.contractNumber,
      dateEffet: formData.dateEffet,
      primeAnnuelle: formData.productType !== ProductType.PU_VL ? parseInt(formData.primeAnnuelle) : undefined,
      versementLibre: formData.productType === ProductType.PU_VL ? parseInt(formData.versementLibre) : undefined,
      commissionPotentielle,
      comment: ''
    }

    onSave(activityData)
  }

  const getProductTypeOptions = () => [
    { value: ProductType.AUTO_MOTO, label: 'AUTO/MOTO', description: 'Assurance automobile et moto' },
    { value: ProductType.IARD_PART_DIVERS, label: 'IARD PART DIVERS', description: 'IARD particuliers divers' },
    { value: ProductType.IARD_PRO_DIVERS, label: 'IARD PRO DIVERS', description: 'IARD professionnels divers' },
    { value: ProductType.PJ, label: 'PJ', description: 'Protection juridique' },
    { value: ProductType.GAV, label: 'GAV', description: 'Garantie accidents de la vie' },
    { value: ProductType.SANTE_PREV, label: 'SANTE/PREV', description: 'Santé et prévoyance' },
    { value: ProductType.NOP_50EUR, label: 'NOP 50EUR', description: 'Non obligatoire 50€' },
    { value: ProductType.EPARGNE_RETRAITE, label: 'EPARGNE/RETRAITE', description: 'Épargne et retraite' },
    { value: ProductType.PU_VL, label: 'PU / VL', description: 'Prévoyance universelle / Versement libre' }
  ]

  const selectedProduct = getProductTypeOptions().find(p => p.value === formData.productType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PlusCircle className="h-6 w-6 text-emerald-600" />
            Affaire Nouvelle
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
              ✨ Nouvelle
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Saisissez les informations de la nouvelle affaire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de produit */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Type d'affaire *
              </Label>
              <select
                id="productType"
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un type</option>
                {getProductTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedProduct.description}
                </p>
              )}
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
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* N° contrat */}
            <div className="space-y-2">
              <Label htmlFor="contractNumber" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                N° contrat
              </Label>
              <Input
                id="contractNumber"
                type="text"
                placeholder="Ex: 123456789"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange('contractNumber', e.target.value)}
              />
            </div>

            {/* Date d'effet */}
            <div className="space-y-2">
              <Label htmlFor="dateEffet" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                Date d'effet
              </Label>
              <Input
                id="dateEffet"
                type="date"
                value={formData.dateEffet}
                onChange={(e) => handleInputChange('dateEffet', e.target.value)}
              />
            </div>
          </div>

          {/* Montants selon le type de produit */}
          {formData.productType && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Montants financiers
              </h3>
              
              {formData.productType === ProductType.PU_VL ? (
                /* Versement libre pour PU / VL */
                <div className="space-y-2">
                  <Label htmlFor="versementLibre" className="text-sm font-medium">
                    Versement libre (€) *
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="versementLibre"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 5000"
                      value={formData.versementLibre}
                      onChange={(e) => handleInputChange('versementLibre', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Montant du versement libre pour PU / VL
                  </p>
                </div>
              ) : (
                /* Prime annuelle pour les autres types */
                <div className="space-y-2">
                  <Label htmlFor="primeAnnuelle" className="text-sm font-medium">
                    Prime annuelle (€) *
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="primeAnnuelle"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 1200"
                      value={formData.primeAnnuelle}
                      onChange={(e) => handleInputChange('primeAnnuelle', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Montant de la prime annuelle
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Commission potentielle */}
          {formData.productType && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Commission potentielle
              </h3>
              <div className="flex items-center gap-2">
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span className="text-sm text-emerald-600">Calcul en cours...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatEuroInt(commissionPotentielle)}
                    </span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Calculé automatiquement
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Commission calculée selon le barème {selectedProduct?.label}
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
              disabled={loading || !formData.clientName || !formData.productType}
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
                  Enregistrer l'affaire
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
