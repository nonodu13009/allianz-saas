"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { migrateUsersRoleFront, checkUserData } from '@/lib/migrate-users'
import { AlertCircle, CheckCircle, Database, User } from 'lucide-react'

export default function AdminMigrationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ updated: number; errors: number } | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const handleMigration = async () => {
    setLoading(true)
    try {
      const result = await migrateUsersRoleFront()
      setResult(result)
    } catch (error) {
      console.error('Erreur migration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckUser = async () => {
    setChecking(true)
    try {
      const data = await checkUserData('emma@allianz-nogaro.fr')
      setUserData(data)
    } catch (error) {
      console.error('Erreur vérification:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Migration des Rôles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mise à jour des utilisateurs avec le champ role_front
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Migration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Migration des Utilisateurs
              </CardTitle>
              <CardDescription>
                Ajouter le champ role_front à tous les utilisateurs existants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleMigration} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Migration en cours...' : 'Lancer la Migration'}
              </Button>
              
              {result && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Migration terminée</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {result.updated} utilisateurs mis à jour, {result.errors} erreurs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vérification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Vérification des Données
              </CardTitle>
              <CardDescription>
                Vérifier les données d'Emma Nogaro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleCheckUser} 
                disabled={checking}
                variant="outline"
                className="w-full"
              >
                {checking ? 'Vérification...' : 'Vérifier Emma Nogaro'}
              </Button>
              
              {userData && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Données utilisateur</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom:</strong> {userData.firstName} {userData.lastName}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Role:</strong> {userData.role}</p>
                    <p><strong>Role Front:</strong> {userData.roleFront || 'Non défini'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>1. <strong>Vérification:</strong> Cliquez sur "Vérifier Emma Nogaro" pour voir ses données actuelles</p>
              <p>2. <strong>Migration:</strong> Si role_front n'est pas défini, lancez la migration</p>
              <p>3. <strong>Test:</strong> Rafraîchissez la page du dashboard pour voir le changement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
