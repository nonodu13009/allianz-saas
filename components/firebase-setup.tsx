'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUsersInFirebase, getAllUsers } from '@/lib/firebase-users';
import { Database, Users, CheckCircle } from 'lucide-react';

export function FirebaseSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userCount, setUserCount] = useState<number | null>(null);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    setMessage('');
    
    try {
      await createUsersInFirebase();
      setMessage('✅ Tous les utilisateurs ont été créés avec succès !');
      await checkUsers();
    } catch (error) {
      setMessage('❌ Erreur lors de la création des utilisateurs');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const checkUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getAllUsers();
      setUserCount(users.length);
    } catch (error) {
      console.error('Erreur vérification utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration Firebase
          </CardTitle>
          <CardDescription>
            Configurez votre base de données Firebase et créez les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Étapes de configuration :</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Créez un projet Firebase sur <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 hover:underline">console.firebase.google.com</a></li>
              <li>Activez Authentication (Email/Password)</li>
              <li>Activez Firestore Database</li>
              <li>Copiez la configuration dans le fichier .env.local</li>
              <li>Cliquez sur "Créer les utilisateurs" ci-dessous</li>
            </ol>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleCreateUsers}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {isCreating ? 'Création en cours...' : 'Créer les utilisateurs'}
            </Button>

            <Button 
              variant="outline"
              onClick={checkUsers}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isLoading ? 'Vérification...' : 'Vérifier les utilisateurs'}
            </Button>
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm">{message}</p>
            </div>
          )}

          {userCount !== null && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 {userCount} utilisateurs trouvés dans la base de données
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration .env.local</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}