// Utilitaire pour nettoyer les données de test du cache local
// À exécuter une seule fois pour supprimer les 125+ activités de test

import { cdcPersistence } from './cdc-persistence'

export async function clearTestData(): Promise<void> {
  try {
    console.log('🧹 Nettoyage des données de test...')
    
    // Nettoyer le cache local
    await cdcPersistence.clearCache()
    
    console.log('✅ Cache local nettoyé')
    console.log('💡 Les données Firebase restent intactes')
    console.log('🔄 Rechargez la page pour voir le tableau vide')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Fonction à appeler depuis la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).clearTestData = clearTestData
}
