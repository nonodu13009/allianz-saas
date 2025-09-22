'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Users,
  AlertTriangle
} from 'lucide-react';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Données des utilisateurs
const usersData = [
  {
    prenom: 'Jean-Michel',
    nom: 'Nogaro',
    email: 'jeanmichel@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Julien',
    nom: 'Boetti',
    email: 'julien.boetti@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Gwendal',
    nom: 'Clouet',
    email: 'gwendal.clouet@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Emma',
    nom: 'Nogaro',
    email: 'emma@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 0.5,
    genre: 'Femme'
  },
  {
    prenom: 'Joelle',
    nom: 'Abi Karam',
    email: 'joelle.abikaram@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Astrid',
    nom: 'Ulrich',
    email: 'astrid.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Karen',
    nom: 'Chollet',
    email: 'karen.chollet@allianz-nogaro.fr',
    role: 'cdc_sante_coll',
    role_front: 'CDC Santé Collective',
    etp: 0.6,
    genre: 'Femme'
  },
  {
    prenom: 'Kheira',
    nom: 'Bagnasco',
    email: 'kheira.bagnasco@allianz-nogaro.fr',
    role: 'cdc_sante_ind',
    role_front: 'CDC Santé Individuel',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Virginie',
    nom: 'Tommasini',
    email: 'virginie.tommasini@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Nejma',
    nom: 'Hariati',
    email: 'nejma.hariati@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Corentin',
    nom: 'Ulrich',
    email: 'corentin.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Donia',
    nom: 'Sahraoui',
    email: 'donia.sahraoui@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  }
];

export default function InitUsersPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [existingUsers, setExistingUsers] = useState(0);

  useEffect(() => {
    checkExistingUsers();
  }, []);

  const checkExistingUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setExistingUsers(querySnapshot.size);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  };

  const initializeUsers = async () => {
    setLoading(true);
    setShowResults(false);
    
    try {
      const results = [];
      
      for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i];
        const docId = `user_${i + 1}`;
        
        try {
          await setDoc(doc(db, 'users', docId), {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          results.push({
            success: true,
            email: userData.email,
            message: `✅ ${userData.prenom} ${userData.nom} créé`
          });
        } catch (error: any) {
          results.push({
            success: false,
            email: userData.email,
            message: `❌ Erreur: ${error.message}`
          });
        }
      }
      
      setResults(results);
      setShowResults(true);
      await checkExistingUsers();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Initialisation de la Collection Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ce script va créer la collection Firestore "users" avec vos 12 utilisateurs
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-blue-600" />
              État de la Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  Collection "users" : {existingUsers} utilisateur(s)
                </p>
                <p className="text-sm text-gray-500">
                  {existingUsers === 0 ? 'Collection vide - Initialisation nécessaire' : 'Collection déjà initialisée'}
                </p>
              </div>
              <Badge variant={existingUsers === 0 ? "destructive" : "default"}>
                {existingUsers === 0 ? "À initialiser" : "Initialisée"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={initializeUsers} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Initialisation en cours...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialiser la collection avec {usersData.length} utilisateurs
                  </>
                )}
              </Button>
              
              <Button 
                onClick={checkExistingUsers}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Vérifier l'état de la collection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Résultats de l'initialisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Résumé :</strong> {successCount} succès, {errorCount} erreurs
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm font-medium">{result.email}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                      {result.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ol className="list-decimal list-inside space-y-2">
              <li>Cliquez sur "Initialiser la collection" pour créer les documents utilisateurs</li>
              <li>Chaque utilisateur sera créé avec un ID temporaire (user_1, user_2, etc.)</li>
              <li>Vous pourrez ensuite utiliser la page "Gestion d'équipe" pour les gérer</li>
              <li>Les utilisateurs Firebase Auth devront être créés séparément</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
