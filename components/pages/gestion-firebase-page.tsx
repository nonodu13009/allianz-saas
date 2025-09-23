'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/providers';
import { 
  createUsersInFirebase, 
  getAllUsers, 
  syncUsersFromAuth,
  usersData,
  UserData 
} from '@/lib/firebase-users';

export function GestionFirebasePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<UserData[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Vérifier que l'utilisateur est administrateur
  if (!user || user.role !== 'administrateur') {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Accès refusé. Seuls les administrateurs peuvent accéder à cette page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleCreateUsers = async () => {
    setLoading(true);
    setShowResults(false);
    
    try {
      const results = await createUsersInFirebase();
      setResults(results);
      setShowResults(true);
      
      // Recharger la liste des utilisateurs Firestore
      await loadFirestoreUsers();
    } catch (error) {
      console.error('Erreur lors de la création des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    setLoading(true);
    setShowResults(false);
    
    try {
      const results = await syncUsersFromAuth();
      setResults(results);
      setShowResults(true);
      
      // Recharger la liste des utilisateurs Firestore
      await loadFirestoreUsers();
    } catch (error) {
      console.error('Erreur lors de la synchronisation des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFirestoreUsers = async () => {
    try {
      const users = await getAllUsers();
      setFirestoreUsers(users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="mr-3 h-8 w-8 text-blue-600" />
              Gestion Firebase
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Création et synchronisation des utilisateurs Firebase Auth ↔ Firestore
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs à créer</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersData.length}</div>
              <p className="text-xs text-gray-500">Utilisateurs définis</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dans Firestore</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{firestoreUsers.length}</div>
              <p className="text-xs text-gray-500">Documents créés</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créations réussies</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <p className="text-xs text-gray-500">Dernière opération</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-xs text-gray-500">Dernière opération</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Synchronisation intelligente */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-green-600" />
                Synchroniser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Synchronise intelligemment les utilisateurs existants et crée les manquants.
              </p>
              <Button 
                onClick={handleSyncUsers} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Synchroniser {usersData.length} utilisateurs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Création des utilisateurs */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-blue-600" />
                Créer tout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Force la création de tous les utilisateurs (peut échouer si déjà existants).
              </p>
              <Button 
                onClick={handleCreateUsers} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Forcer création
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recharger la liste */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-purple-600" />
                Actualiser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Recharge la liste des utilisateurs depuis Firestore.
              </p>
              <Button 
                onClick={loadFirestoreUsers}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser la liste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Résultats */}
        {showResults && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5 text-purple-600" />
                Résultats de la création
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => {
                  let icon, badgeVariant, badgeText, iconColor;
                  
                  if (result.success) {
                    if (result.action === 'already_exists') {
                      icon = <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />;
                      badgeVariant = "secondary";
                      badgeText = "Déjà synchronisé";
                      iconColor = "text-blue-500";
                    } else if (result.action === 'created') {
                      icon = <CheckCircle className="h-5 w-5 text-green-500 mr-3" />;
                      badgeVariant = "default";
                      badgeText = "Créé";
                      iconColor = "text-green-500";
                    } else {
                      icon = <CheckCircle className="h-5 w-5 text-green-500 mr-3" />;
                      badgeVariant = "default";
                      badgeText = "Succès";
                      iconColor = "text-green-500";
                    }
                  } else {
                    if (result.action === 'needs_manual_sync') {
                      icon = <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />;
                      badgeVariant = "outline";
                      badgeText = "À synchroniser";
                      iconColor = "text-yellow-500";
                    } else {
                      icon = <XCircle className="h-5 w-5 text-red-500 mr-3" />;
                      badgeVariant = "destructive";
                      badgeText = "Erreur";
                      iconColor = "text-red-500";
                    }
                  }

                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center">
                        {icon}
                        <div>
                          <p className="font-medium">{result.email}</p>
                          <p className="text-sm text-gray-500">{result.message}</p>
                          {result.error && (
                            <p className="text-xs text-red-500 mt-1">{result.error}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={badgeVariant}>
                        {badgeText}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des utilisateurs Firestore */}
        {firestoreUsers.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-600" />
                Utilisateurs dans Firestore ({firestoreUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {firestoreUsers.map((user, index) => (
                  <div key={user.uid || index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="secondary">{user.role_front}</Badge>
                        <span className="text-xs text-gray-400">ETP: {user.etp}</span>
                        <span className="text-xs text-gray-400">{user.genre}</span>
                      </div>
                    </div>
                    <Badge variant="default">Firestore</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
