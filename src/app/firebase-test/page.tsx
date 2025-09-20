"use client"

import { FirebaseDebug } from '@/components/FirebaseDebug'

export default function FirebaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 Test de Connexion Firebase</h1>
        
        <div className="space-y-4">
          <FirebaseDebug />
          
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">📋 Instructions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Vérifiez la console du navigateur (F12) pour les logs détaillés</li>
              <li>Si l'erreur persiste, vérifiez votre connexion internet</li>
              <li>Assurez-vous que les variables d'environnement sont correctement configurées</li>
              <li>Vérifiez que le projet Firebase est actif</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="text-lg font-semibold mb-2">🛠️ Solutions Possibles</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Problème de connexion :</strong> Vérifiez votre connexion internet</li>
              <li><strong>Variables d'environnement :</strong> Vérifiez le fichier .env.local</li>
              <li><strong>Projet Firebase :</strong> Vérifiez que le projet est actif dans la console Firebase</li>
              <li><strong>Règles Firestore :</strong> Vérifiez les règles d'accès</li>
              <li><strong>Cache navigateur :</strong> Essayez de vider le cache</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
