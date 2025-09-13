"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserMigrationComplete } from '@/lib/migrate-users-complete'
import { toast } from 'sonner'
import { Database, Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function AdminMigrateCompletePage() {
  const [migrationStatus, setMigrationStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [expectedETP, setExpectedETP] = useState<number | null>(null)

  const handleMigrate = async () => {
    setLoading(true)
    setMigrationStatus('Migration en cours...')
    
    try {
      // Calculer l'ETP attendu
      const etp = UserMigrationComplete.calculateExpectedETP()
      setExpectedETP(etp)
      
      // Lancer la migration
      const result = await UserMigrationComplete.migrateAllUsers()
      
      setMigrationStatus(
        `Migration terminée ! ${result.success} utilisateurs traités. ${result.errors.length} erreurs.`
      )
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error))
        toast.error(`Migration terminée avec ${result.errors.length} erreurs`)
      } else {
        toast.success('Migration des utilisateurs terminée avec succès !')
      }
    } catch (error) {
      setMigrationStatus(`Erreur lors de la migration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      toast.error(`Erreur lors de la migration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setLoading(true)
    setMigrationStatus('Mise à jour en cours...')
    
    try {
      // Calculer l'ETP attendu
      const etp = UserMigrationComplete.calculateExpectedETP()
      setExpectedETP(etp)
      
      // Lancer la mise à jour
      const result = await UserMigrationComplete.updateAllUsers()
      
      setMigrationStatus(
        `Mise à jour terminée ! ${result.success} utilisateurs traités. ${result.errors.length} erreurs.`
      )
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error))
        toast.error(`Mise à jour terminée avec ${result.errors.length} erreurs`)
      } else {
        toast.success('Mise à jour des utilisateurs terminée avec succès !')
      }
    } catch (error) {
      setMigrationStatus(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateExpectedETP = () => {
    const etp = UserMigrationComplete.calculateExpectedETP()
    setExpectedETP(etp)
    toast.success(`ETP total attendu: ${etp}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Migration Complète des Utilisateurs
          </CardTitle>
          <CardDescription className="text-lg">
            Mise à jour de la collection users avec les données exactes d'Allianz
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations sur la migration */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📊 Données à migrer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Utilisateurs:</div>
                <div className="text-blue-700 dark:text-blue-300">12 utilisateurs Allianz</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">ETP Total:</div>
                <div className="text-blue-700 dark:text-blue-300">
                  {expectedETP ? `${expectedETP} ETP` : 'Calculer pour voir'}
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Rôles:</div>
                <div className="text-blue-700 dark:text-blue-300">2 Agents Généraux, 6 CDC Commercial, 1 CDC Santé Collective, 1 CDC Santé Individuel, 2 CDC Sinistre</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Genres:</div>
                <div className="text-blue-700 dark:text-blue-300">4 Hommes, 8 Femmes</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={calculateExpectedETP}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Calculer ETP attendu
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleMigrate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Migration Complète
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Mise à Jour (Recommandé)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Statut de la migration */}
          {migrationStatus && (
            <div className={`p-4 rounded-lg border ${
              migrationStatus.includes('terminée') && !migrationStatus.includes('erreurs')
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : migrationStatus.includes('erreurs')
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {migrationStatus.includes('terminée') && !migrationStatus.includes('erreurs') ? (
                  <CheckCircle className="h-5 w-5" />
                ) : migrationStatus.includes('erreurs') ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                )}
                <span className="font-medium">{migrationStatus}</span>
              </div>
            </div>
          )}

          {/* Détail des utilisateurs */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">👥 Liste des utilisateurs à migrer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Jean-Michel Nogaro</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Julien Boetti</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Gwendal Clouet</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Emma Nogaro</span>
                  <span className="font-medium text-orange-600">0.5 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Joelle Abi Karam</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Astrid Ulrich</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Karen Chollet</span>
                  <span className="font-medium text-yellow-600">0.6 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Kheira Bagnasco</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Virginie Tommasini</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Nejma Hariati</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Corentin Ulrich</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
                <div className="flex justify-between">
                  <span>Donia Sahraoui</span>
                  <span className="font-medium text-blue-600">1.0 ETP</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <div className="flex justify-between font-bold text-lg">
                <span>Total ETP:</span>
                <span className="text-green-600">11.1 ETP</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
