"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CommissionService } from '@/lib/commission-service'
import { CommissionData, CommissionRow, MONTHS } from '@/types/commission'
import { toast } from 'sonner'
import { Edit3, Save, X, Euro, Calendar } from 'lucide-react'

interface CommissionEditModalProps {
  isOpen: boolean
  onClose: () => void
  commissionData: CommissionData | null
  monthIndex: number
  onDataUpdated: () => void
}

export function CommissionEditModal({
  isOpen,
  onClose,
  commissionData,
  monthIndex,
  onDataUpdated
}: CommissionEditModalProps) {
  const [monthValues, setMonthValues] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)

  // Initialiser les valeurs du mois quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && commissionData) {
      const initialValues: {[key: string]: string} = {}
      
      commissionData.rows.forEach(row => {
        const isReadOnly = row.isTotal || row.isResult
        if (!isReadOnly) {
          const value = row.values[monthIndex] || 0
          initialValues[row.label] = value > 0 ? value.toString() : ''
        }
      })
      
      setMonthValues(initialValues)
    }
  }, [isOpen, commissionData, monthIndex])

  const monthName = MONTHS[monthIndex]

  const handleValueChange = (rowLabel: string, value: string) => {
    setMonthValues(prev => ({
      ...prev,
      [rowLabel]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (!commissionData) {
        toast.error('Aucune donnée de commission disponible')
        return
      }

      // Valider toutes les valeurs
      for (const [rowLabel, value] of Object.entries(monthValues)) {
        if (value.trim() !== '') {
          const numericValue = parseFloat(value.replace(',', '.'))
          
          if (isNaN(numericValue)) {
            toast.error(`Valeur invalide pour "${rowLabel}"`)
            return
          }

          if (numericValue < 0) {
            toast.error(`La valeur ne peut pas être négative pour "${rowLabel}"`)
            return
          }
        }
      }

      // Mettre à jour toutes les valeurs du mois
      const updatedRows = commissionData.rows.map(row => {
        const isReadOnly = row.isTotal || row.isResult
        if (isReadOnly) {
          return row
        }

        const newValues = [...row.values]
        const newValue = monthValues[row.label]?.trim() === '' ? 0 : parseFloat((monthValues[row.label] || '0').replace(',', '.'))
        newValues[monthIndex] = newValue
        
        // Recalculer le total
        const newTotal = newValues.reduce((sum, val) => sum + val, 0)
        
        return {
          ...row,
          values: newValues,
          total: newTotal
        }
      })

      // Recalculer automatiquement les totaux et résultats
      const recalculatedRows = CommissionService.calculateCommissionRows(
        updatedRows.map(row => ({
          label: row.label,
          values: row.values,
          isWithdrawal: row.isWithdrawal
        }))
      )

      const updatedData = {
        ...commissionData,
        rows: recalculatedRows,
        updatedAt: new Date().toISOString()
      }

      await CommissionService.saveCommissionData(updatedData)
      toast.success(`Données mises à jour pour ${monthName}`)
      onDataUpdated()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde des données')
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholder = (row: CommissionRow) => {
    if (row.isWithdrawal) {
      return 'Ex: 5000 (montant du prélèvement)'
    }
    if (row.isCharges) {
      return 'Ex: 12000 (charges de l\'agence)'
    }
    return 'Ex: 25000 (montant des commissions)'
  }

  const getDescription = () => {
    return `Modifier toutes les données pour ${monthName}`
  }

  if (!commissionData) {
    return null
  }

  const editableRows = commissionData.rows.filter(row => !row.isTotal && !row.isResult)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Édition du mois de {monthName}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations contextuelles */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Modifier tous les montants pour {monthName}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Les totaux et résultats sont calculés automatiquement
            </p>
          </div>

          {/* Champs de saisie pour chaque ligne */}
          <div className="space-y-4">
            {editableRows.map((row) => (
              <div key={row.label} className="space-y-2">
                <Label htmlFor={`${row.label}-${monthIndex}`} className="text-sm font-medium flex items-center gap-2">
                  <span>{row.label}</span>
                  {row.isWithdrawal && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      Indicatif
                    </Badge>
                  )}
                  {row.isCharges && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Charges
                    </Badge>
                  )}
                </Label>
                
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id={`${row.label}-${monthIndex}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={getPlaceholder(row)}
                    value={monthValues[row.label] || ''}
                    onChange={(e) => handleValueChange(row.label, e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Valeur actuelle */}
                {row.values[monthIndex] > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Actuel: {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(row.values[monthIndex])}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
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
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder tout
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
