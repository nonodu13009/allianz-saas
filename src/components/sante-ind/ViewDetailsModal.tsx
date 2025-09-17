"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Eye, 
  Calendar, 
  FileText, 
  User, 
  Building, 
  Euro,
  Percent,
  X
} from 'lucide-react'

import {
  SanteIndActivity,
  ACTE_TYPE_LABELS,
  COMPAGNIE_LABELS
} from '../../types/sante-ind'

import {
  santeIndService,
  formatDateShort,
  formatDateLong,
  formatEuroInt,
  formatPercentage,
  getCommissionThresholdDescription
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface ViewDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  activity: SanteIndActivity | null
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ViewDetailsModal({
  isOpen,
  onClose,
  activity
}: ViewDetailsModalProps) {
  
  // ============================================================================
  // RENDU
  // ============================================================================
  
  if (!activity) return null

  // Calculer le taux de commission pour cette activité
  const commissionRate = santeIndService.getCommissionRate(activity.caPondere)
  const commission = santeIndService.calculateCommission(activity.caPondere)
  const thresholdDescription = getCommissionThresholdDescription(activity.caPondere)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Détails de l'activité
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{activity.nomClient}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Nature de l'acte</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {ACTE_TYPE_LABELS[activity.natureActe]}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Numéro de contrat</label>
                  <div className="mt-1">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {activity.numeroContrat}
                    </span>
                  </div>
                </div>
                
                {activity.compagnie && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Compagnie</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <Badge variant="outline">
                        {COMPAGNIE_LABELS[activity.compagnie]}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de saisie</label>
                  <div className="mt-1">
                    <div className="font-medium">
                      {formatDateLong(activity.dateSaisie)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateShort(activity.dateSaisie)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Date d'effet</label>
                  <div className="mt-1">
                    <div className="font-medium">
                      {formatDateLong(activity.dateEffet)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateShort(activity.dateEffet)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Montants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Montants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Chiffre d'affaires brut</label>
                  <div className="mt-1 text-2xl font-bold text-gray-800">
                    {formatEuroInt(activity.ca)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Chiffre d'affaires pondéré</label>
                  <div className="mt-1 text-2xl font-bold text-blue-600">
                    {formatEuroInt(activity.caPondere)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Pondération selon le type d'acte
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Commission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Taux de commission</label>
                    <div className="mt-1 text-xl font-bold text-purple-600">
                      {formatPercentage(commissionRate)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Commission estimée</label>
                    <div className="mt-1 text-xl font-bold text-orange-600">
                      {formatEuroInt(commission)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-800">
                    <strong>Seuil applicable :</strong> {thresholdDescription}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">ID de l'activité</label>
                  <div className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {activity.id}
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-600">Période</label>
                  <div className="mt-1">
                    {activity.yearMonth}
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-600">Créé le</label>
                  <div className="mt-1">
                    {formatDateLong(activity.createdAt)}
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-600">Modifié le</label>
                  <div className="mt-1">
                    {formatDateLong(activity.updatedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
