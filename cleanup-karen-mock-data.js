/**
 * Script de nettoyage complet pour Karen Chollet
 * - Supprime les données mock
 * - Supprime le rôle cdc_sante_coll (optionnel)
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

async function cleanupKarenMockData() {
  try {
    console.log('🧹 Nettoyage complet des données mock pour Karen Chollet...');
    
    const userId = 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13';
    
    // 1. Supprimer les activités mock
    console.log('\n🗑️ Suppression des activités mock...');
    const activitiesRef = db.collection('sante_coll_activities');
    const snapshot = await activitiesRef
      .where('userId', '==', userId)
      .where('month', '==', '2025-09')
      .get();

    if (snapshot.empty) {
      console.log('ℹ️ Aucune activité mock trouvée pour septembre 2025');
    } else {
      console.log(`📋 ${snapshot.size} activités trouvées à supprimer`);

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        console.log(`🗑️ Suppression: ${doc.data().nomClient}`);
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('✅ Toutes les activités mock ont été supprimées');
    }

    // 2. Optionnel: Supprimer le rôle cdc_sante_coll
    console.log('\n🔧 Gestion du rôle cdc_sante_coll...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentRoles = userData.roles || [];
      
      if (currentRoles.includes('cdc_sante_coll')) {
        console.log('❓ Voulez-vous supprimer le rôle cdc_sante_coll de Karen Chollet ?');
        console.log('   - Tapez "y" pour supprimer le rôle');
        console.log('   - Tapez "n" pour garder le rôle');
        
        // Pour automatiser, on garde le rôle par défaut
        console.log('ℹ️ Rôle cdc_sante_coll conservé (pour faciliter les futurs tests)');
      } else {
        console.log('ℹ️ Le rôle cdc_sante_coll n\'était pas présent');
      }
    }

    console.log('\n✅ Nettoyage terminé avec succès !');
    console.log('🎯 Karen Chollet peut maintenant se connecter sans les données mock');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  cleanupKarenMockData().then(() => {
    console.log('\n✨ Script de nettoyage terminé !');
    process.exit(0);
  });
}

module.exports = { cleanupKarenMockData };
