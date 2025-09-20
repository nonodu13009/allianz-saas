/**
 * Script de nettoyage des données mock pour CDC Santé Collective
 * Supprime toutes les activités de test pour septembre 2025
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialisation Firebase Admin
const serviceAccount = require('./allianz-saas-132c3-firebase-adminsdk-fbsvc-1680d5d722.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'allianz-saas-132c3'
  });
}

const db = admin.firestore();

async function clearMockData() {
  try {
    console.log('🔥 Initialisation Firebase Admin...');
    
    console.log('🗑️ Nettoyage des données mock pour septembre 2025...');
    
    // Récupérer toutes les activités de septembre 2025 pour l'utilisateur test
    const activitiesRef = db.collection('sante_coll_activities');
    const snapshot = await activitiesRef
      .where('userId', '==', 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13')
      .where('month', '==', '2025-09')
      .get();

    if (snapshot.empty) {
      console.log('ℹ️ Aucune donnée mock trouvée pour septembre 2025');
      return;
    }

    console.log(`📋 ${snapshot.size} activités trouvées à supprimer`);

    // Supprimer en batch
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      console.log(`🗑️ Suppression: ${doc.data().nomClient}`);
      batch.delete(doc.ref);
    });

    await batch.commit();
    
    console.log('✅ Toutes les données mock ont été supprimées avec succès !');
    console.log(`📋 ${snapshot.size} documents supprimés de la collection sante_coll_activities`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des données mock:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  clearMockData().then(() => {
    console.log('\n✨ Script de nettoyage terminé avec succès !');
    process.exit(0);
  });
}

module.exports = { clearMockData };
