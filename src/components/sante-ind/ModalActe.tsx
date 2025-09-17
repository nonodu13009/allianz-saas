"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

import {
  ActeType,
  Compagnie,
  SanteIndActivity,
  SanteIndActivityForm,
  ValidationResult,
  ACTE_TYPE_LABELS,
  COMPAGNIE_LABELS
} from '../../types/sante-ind'

import {
  santeIndService,
  calculateCAPondere,
  validateSanteIndActivityForm,
  capitalizeClientName
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface ModalActeProps {
  isOpen: boolean
  onClose: () => void
  onSave: (activity: Omit<SanteIndActivity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  acteType: ActeType | null
  existingActivity?: SanteIndActivity // Pour l'édition
  yearMonth: string
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ModalActe({
  isOpen,
  onClose,
  onSave,
  acteType,
  existingActivity,
  yearMonth
}: ModalActeProps) {
  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  const [formData, setFormData] = useState<SanteIndActivityForm>({
    natureActe: acteType || 'affaire_nouvelle',
    nomClient: '',
    numeroContrat: '',
    dateEffet: '',
    ca: 0,
    compagnie: undefined
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] })
  const [caPondere, setCaPondere] = useState(0)

  // ============================================================================
  // EFFETS
  // ============================================================================
  
  // Initialiser le formulaire
  useEffect(() => {
    if (existingActivity) {
      setFormData({
        natureActe: existingActivity.natureActe,
        nomClient: existingActivity.nomClient,
        numeroContrat: existingActivity.numeroContrat,
        dateEffet: existingActivity.dateEffet.split('T')[0], // Format YYYY-MM-DD pour input
        ca: existingActivity.ca,
        compagnie: existingActivity.compagnie
      })
    } else {
      setFormData({
        natureActe: acteType || 'affaire_nouvelle',
        nomClient: '',
        numeroContrat: '',
        dateEffet: '',
        ca: 0,
        compagnie: undefined
      })
    }
  }, [existingActivity, acteType])

  // Calculer le CA pondéré quand les données changent
  useEffect(() => {
    if (formData.natureActe && formData.ca > 0) {
      try {
        const pondere = calculateCAPondere(formData.natureActe, formData.ca)
        setCaPondere(pondere)
      } catch (error) {
        setCaPondere(0)
      }
    } else {
      setCaPondere(0)
    }
  }, [formData.natureActe, formData.ca])

  // Validation en temps réel
  useEffect(() => {
    const result = validateSanteIndActivityForm(formData)
    setValidationResult(result)
  }, [formData])

  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================
  
  const handleInputChange = (field: keyof SanteIndActivityForm, value: string | number | Compagnie | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!validationResult.isValid) return

    setIsLoading(true)
    try {
      // Capitaliser le nom du client
      const nomClientCapitalized = capitalizeClientName(formData.nomClient)
      
      // Créer l'activité complète
      const activityData = {
        userId: '', // Sera défini côté serveur
        yearMonth,
        dateSaisie: new Date().toISOString(),
        natureActe: formData.natureActe,
        nomClient: nomClientCapitalized,
        numeroContrat: formData.numeroContrat,
        dateEffet: new Date(formData.dateEffet).toISOString(),
        ca: formData.ca,
        caPondere,
        compagnie: formData.compagnie
      }

      await onSave(activityData)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // ============================================================================
  // RENDU
  // ============================================================================
  
  if (!acteType) return null

  const title = existingActivity ? 'Modifier l\'activité' : `Nouvelle ${ACTE_TYPE_LABELS[acteType]}`
  const isAffaireNouvelle = formData.natureActe === 'affaire_nouvelle'
  const canSave = validationResult.isValid && !isLoading

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Champs automatiques (lecture seule) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateSaisie">Date de saisie</Label>
              <Input
                id="dateSaisie"
                value={new Date().toLocaleDateString('fr-FR')}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="natureActe">Nature de l'acte</Label>
              <Input
                id="natureActe"
                value={ACTE_TYPE_LABELS[formData.natureActe]}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Champs de saisie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomClient">
                Nom du client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomClient"
                value={formData.nomClient}
                onChange={(e) => handleInputChange('nomClient', e.target.value)}
                placeholder="Ex: Jean Dupont"
                className={validationResult.errors.some(e => e.field === 'nomClient') ? 'border-red-500' : ''}
              />
              {validationResult.errors.some(e => e.field === 'nomClient') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationResult.errors.find(e => e.field === 'nomClient')?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="numeroContrat">
                Numéro de contrat <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numeroContrat"
                value={formData.numeroContrat}
                onChange={(e) => handleInputChange('numeroContrat', e.target.value)}
                placeholder="Ex: CTR-123456"
                className={validationResult.errors.some(e => e.field === 'numeroContrat') ? 'border-red-500' : ''}
              />
              {validationResult.errors.some(e => e.field === 'numeroContrat') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationResult.errors.find(e => e.field === 'numeroContrat')?.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateEffet">
                Date d'effet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateEffet"
                type="date"
                value={formData.dateEffet}
                onChange={(e) => handleInputChange('dateEffet', e.target.value)}
                className={validationResult.errors.some(e => e.field === 'dateEffet') ? 'border-red-500' : ''}
              />
              {validationResult.errors.some(e => e.field === 'dateEffet') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationResult.errors.find(e => e.field === 'dateEffet')?.message}
                </p>
              )}
            </div>

            {isAffaireNouvelle && (
              <div>
                <Label htmlFor="compagnie">
                  Compagnie <span className="text-red-500">*</span>
                </Label>
                <select
                  id="compagnie"
                  value={formData.compagnie || ''}
                  onChange={(e) => handleInputChange('compagnie', e.target.value as Compagnie)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationResult.errors.some(e => e.field === 'compagnie') ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une compagnie</option>
                  <option value="Allianz">{COMPAGNIE_LABELS.Allianz}</option>
                  <option value="Courtage">{COMPAGNIE_LABELS.Courtage}</option>
                </select>
                {validationResult.errors.some(e => e.field === 'compagnie') && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationResult.errors.find(e => e.field === 'compagnie')?.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CA et CA pondéré */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ca">
                CA (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ca"
                type="number"
                value={formData.ca || ''}
                onChange={(e) => handleInputChange('ca', parseInt(e.target.value) || 0)}
                placeholder="Ex: 1000"
                min="0"
                step="1"
                className={validationResult.errors.some(e => e.field === 'ca') ? 'border-red-500' : ''}
              />
              {validationResult.errors.some(e => e.field === 'ca') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationResult.errors.find(e => e.field === 'ca')?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="caPondere">CA pondéré (€)</Label>
              <Input
                id="caPondere"
                value={santeIndService.formatEuroInt(caPondere)}
                disabled
                className="bg-gray-50 font-semibold"
              />
              <p className="text-sm text-gray-600 mt-1">
                Calculé automatiquement selon le type d'acte
              </p>
            </div>
          </div>

          {/* Messages d'erreur généraux */}
          {!validationResult.isValid && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h4 className="text-red-800 font-medium">Erreurs de validation</h4>
              </div>
              <ul className="mt-2 text-red-700 text-sm">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {existingActivity ? 'Modifier' : 'Enregistrer'}
                </div>
              )}
            </Button>
          </div>

          {/* Message d'aide pour le bouton désactivé */}
          {!canSave && !isLoading && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span>
                  {!validationResult.isValid 
                    ? 'Veuillez corriger les erreurs ci-dessus pour continuer'
                    : 'Veuillez remplir tous les champs obligatoires'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
