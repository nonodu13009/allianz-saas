"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Plus, Archive, Trash2, Calendar, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CommissionService } from '@/lib/commission-service'
import { CommissionYear } from '@/types/commission'

interface YearManagementModalProps {
  availableYears: CommissionYear[]
  onYearsUpdated: () => void
}

export function YearManagementModal({ availableYears, onYearsUpdated }: YearManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newYear, setNewYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ year: number; show: boolean }>({ year: 0, show: false })

  const handleCreateYear = async () => {
    console.log('handleCreateYear appelé avec newYear:', newYear)
    
    if (!newYear || isNaN(Number(newYear))) {
      console.log('Erreur: année invalide')
      toast.error('Veuillez entrer une année valide')
      return
    }

    const year = Number(newYear)
    console.log('Année convertie:', year)
    
    if (year < 2020 || year > 2030) {
      console.log('Erreur: année hors limites')
      toast.error('L\'année doit être entre 2020 et 2030')
      return
    }

    if (availableYears.some(y => y.year === year)) {
      console.log('Erreur: année existe déjà')
      toast.error('Cette année existe déjà')
      return
    }

    setLoading(true)
    try {
      console.log('Début de la création de l\'année:', year)
      

      // Créer une nouvelle année avec des données vides en utilisant la structure attendue
      const baseRows = [
        { label: 'Commissions IARD', values: new Array(12).fill(0) },
        { label: 'Commissions Vie', values: new Array(12).fill(0) },
        { label: 'Commissions Courtage', values: new Array(12).fill(0) },
        { label: 'Produits exceptionnels', values: new Array(12).fill(0) },
        { label: 'Charges agence', values: new Array(12).fill(0) },
        { label: 'Prélèvements Julien', values: new Array(12).fill(0), isWithdrawal: true },
        { label: 'Prélèvements Jean-Michel', values: new Array(12).fill(0), isWithdrawal: true }
      ]

      console.log('Base rows créées:', baseRows)

      // Utiliser la méthode du service pour calculer les totaux automatiquement
      const calculatedRows = CommissionService.calculateCommissionRows(baseRows)
      console.log('Rows calculées:', calculatedRows)
      
      const newYearData = {
        year,
        rows: calculatedRows,
        updatedAt: new Date().toISOString()
      }

      console.log('Données finales à sauvegarder:', newYearData)
      await CommissionService.saveCommissionData(newYearData)
      console.log('Année créée avec succès dans Firebase')
      toast.success(`Année ${year} créée avec succès`)
      setNewYear('')
      onYearsUpdated()
    } catch (error) {
      console.error('Erreur lors de la création de l\'année:', error)
      toast.error(`Erreur lors de la création de l'année: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveYear = async (year: number) => {
    setLoading(true)
    try {
      await CommissionService.archiveYear(year)
      toast.success(`Année ${year} archivée avec succès`)
      onYearsUpdated()
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'année:', error)
      toast.error('Erreur lors de l\'archivage de l\'année')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (year: number) => {
    setDeleteConfirm({ year, show: true })
  }

  const handleDeleteConfirm = async () => {
    const year = deleteConfirm.year
    setDeleteConfirm({ year: 0, show: false })
    setLoading(true)
    
    try {
      // Vérifier si l'année a des données
      const hasData = await CommissionService.hasYearData(year)
      if (hasData) {
        toast.error('Impossible de supprimer une année contenant des données')
        return
      }

      await CommissionService.deleteYear(year)
      toast.success(`Année ${year} supprimée avec succès`)
      onYearsUpdated()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'année:', error)
      toast.error('Erreur lors de la suppression de l\'année')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ year: 0, show: false })
  }



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Gérer les années</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestion des années
          </DialogTitle>
          <DialogDescription>
            Créez, archivez ou supprimez des années de commission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Création d'une nouvelle année */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                Créer une nouvelle année
              </CardTitle>
              <CardDescription>
                Ajoutez une nouvelle année de commission à la navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newYear">Année</Label>
                  <Input
                    id="newYear"
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2026"
                    min="2020"
                    max="2030"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateYear} 
                    disabled={loading || !newYear}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Créer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des années existantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Archive className="h-5 w-5" />
                Années existantes
              </CardTitle>
              <CardDescription>
                Gérez les années déjà créées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableYears.map((yearObj) => (
                  <div key={yearObj.year} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm">
                        {yearObj.year}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {yearObj.available ? 'Visible' : 'Archivée'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveYear(yearObj.year)}
                        disabled={loading}
                        className="flex items-center gap-1"
                      >
                        <Archive className="h-3 w-3" />
                        <span className="hidden sm:inline">Archiver</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(yearObj.year)}
                        disabled={loading}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Avertissement */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Attention :</p>
              <ul className="space-y-1 text-xs">
                <li>• L'archivage masque l'année de la navigation</li>
                <li>• La suppression est définitive et irréversible</li>
                <li>• Seules les années sans données peuvent être supprimées</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteConfirm.show} onOpenChange={handleDeleteCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmation de suppression
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible et ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer définitivement l'année <strong>{deleteConfirm.year}</strong> ?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
