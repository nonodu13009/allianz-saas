"use client"

import { useState } from 'react'
import { AdminService } from '@/lib/admin-service'
import { CommissionService } from '@/lib/commission-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Shield, Users, CheckCircle, XCircle, Loader2, Database, Calendar, Archive, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const [migrationLoading, setMigrationLoading] = useState(false)

  const handleCreateAllUsers = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const result = await AdminService.createAllUsers()
      setResult(result)
    } catch (error) {
      console.error('Erreur lors de la création des utilisateurs:', error)
      setResult({
        success: 0,
        errors: ['Erreur générale lors de la création des utilisateurs']
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMigrateCommissionData = async () => {
    setMigrationLoading(true)
    try {
      console.log('Début de la migration des données de commission...')
      await CommissionService.migrateLocalDataToFirebase()
      console.log('Migration terminée avec succès')
      toast.success('Migration des données de commission terminée ! Vérifiez la console pour les détails.')
    } catch (error) {
      console.error('Erreur lors de la migration:', error)
      toast.error('Erreur lors de la migration des données de commission')
    } finally {
      setMigrationLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-h2 font-poppins font-semibold">Allianz SaaS - Admin Firebase</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-h1 mb-4">Administration Firebase</h1>
            <p className="text-body text-muted-foreground">
              Création des utilisateurs Firebase Auth et profils Firestore
            </p>
          </div>

          {/* Création des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Création des utilisateurs
              </CardTitle>
              <CardDescription>
                Créer les 12 utilisateurs de l&apos;équipe Allianz Nogaro avec leurs comptes Firebase Auth et profils Firestore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Utilisateurs à créer :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 2 Administrateurs (Agent Général)</li>
                    <li>• 6 CDC Commercial</li>
                    <li>• 1 CDC Santé Collective</li>
                    <li>• 1 CDC Santé Individuel</li>
                    <li>• 2 CDC Sinistre</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Informations :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Email : prénom.nom@allianz-nogaro.fr</li>
                    <li>• Mot de passe : allianz</li>
                    <li>• Entreprise : Allianz Nogaro</li>
                    <li>• Département selon le rôle</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleCreateAllUsers}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Créer tous les utilisateurs
                    </>
                  )}
                </Button>
                
                <Link href="/admin-migrate-complete" className="block">
                  <Button 
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    size="lg"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Migration Complète (Recommandé)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Résultats */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-danger-500" />
                  )}
                  Résultats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-success-500">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{result.success} utilisateurs créés</span>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="flex items-center gap-2 text-danger-500">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">{result.errors.length} erreurs</span>
                    </div>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-danger-500">Erreurs :</h4>
                    <ul className="space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-sm text-danger-500 bg-danger-500/10 p-2 rounded">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.success > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>✅ Les utilisateurs ont été créés avec succès dans Firebase Auth et Firestore.</p>
                    <p>🔗 Chaque utilisateur peut maintenant se connecter avec son email et le mot de passe &quot;allianz&quot;.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Gestion des années de commission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestion des années de commission
              </CardTitle>
              <CardDescription>
                Migrer les données locales (2022-2025) vers Firebase pour les commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Années à migrer :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 2022 - Données de commission</li>
                    <li>• 2023 - Données de commission</li>
                    <li>• 2024 - Données de commission</li>
                    <li>• 2025 - Données de commission</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Comportement :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Année n'existe pas → Créer</li>
                    <li>• Année vide → Mettre à jour</li>
                    <li>• Année avec données → Ignorer</li>
                    <li>• Préservation des données existantes</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleMigrateCommissionData}
                  disabled={migrationLoading}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {migrationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migration en cours...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Migrer les données de commission
                    </>
                  )}
                </Button>
              </div>

              {/* Avertissement */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Attention :</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Les années existantes avec des données seront préservées</li>
                    <li>• Seules les années vides ou inexistantes seront mises à jour</li>
                    <li>• Vérifiez la console pour suivre le processus de migration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs de l&apos;équipe</CardTitle>
              <CardDescription>
                Liste des 12 utilisateurs qui seront créés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Jean-Michel Nogaro', role: 'Agent Général', email: 'jeanmichel@allianz-nogaro.fr' },
                  { name: 'Julien Boetti', role: 'Agent Général', email: 'julien.boetti@allianz-nogaro.fr' },
                  { name: 'Gwendal Clouet', role: 'CDC Commercial', email: 'gwendal.clouet@allianz-nogaro.fr' },
                  { name: 'Emma Nogaro', role: 'CDC Commercial', email: 'emma@allianz-nogaro.fr' },
                  { name: 'Joelle Abi Karam', role: 'CDC Commercial', email: 'joelle.abikaram@allianz-nogaro.fr' },
                  { name: 'Astrid Ulrich', role: 'CDC Commercial', email: 'astrid.ulrich@allianz-nogaro.fr' },
                  { name: 'Karen Chollet', role: 'CDC Santé Collective', email: 'karen.chollet@allianz-nogaro.fr' },
                  { name: 'Kheira Bagnasco', role: 'CDC Santé Individuel', email: 'kheira.bagnasco@allianz-nogaro.fr' },
                  { name: 'Virginie Tommasini', role: 'CDC Sinistre', email: 'virginie.tommasini@allianz-nogaro.fr' },
                  { name: 'Nejma Hariati', role: 'CDC Sinistre', email: 'nejma.hariati@allianz-nogaro.fr' },
                  { name: 'Corentin Ulrich', role: 'CDC Commercial', email: 'corentin.ulrich@allianz-nogaro.fr' },
                  { name: 'Donia Sahraoui', role: 'CDC Commercial', email: 'donia.sahraoui@allianz-nogaro.fr' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
