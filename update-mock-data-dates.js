/**
 * Script pour mettre à jour les données mock avec les bonnes dates
 * Ajoute la dateEffet et corrige les références de champs
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

async function updateMockDataDates() {
  try {
    console.log('🔄 Mise à jour des données mock avec les bonnes dates...');
    
    const userId = 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13';
    
    // Récupérer toutes les activités existantes
    const activitiesRef = db.collection('sante_coll_activities');
    const snapshot = await activitiesRef
      .where('userId', '==', userId)
      .where('month', '==', '2025-09')
      .get();

    if (snapshot.empty) {
      console.log('❌ Aucune activité mock trouvée');
      return;
    }

    console.log(`📋 ${snapshot.size} activités trouvées à mettre à jour`);

    const batch = db.batch();
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      
      // Calculer la date d'effet (généralement le mois suivant)
      const dateSaisie = new Date(data.dateSaisie);
      const dateEffet = new Date(dateSaisie);
      dateEffet.setMonth(dateEffet.getMonth() + 1); // Mois suivant
      dateEffet.setDate(1); // Premier jour du mois
      
      const updates = {
        dateEffet: dateEffet.toISOString().split('T')[0],
        // Corriger les noms de champs si nécessaire
        numeroContrat: data.contractNumber || data.numeroContrat,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Supprimer l'ancien champ si il existe
      if (data.contractNumber && !data.numeroContrat) {
        updates.contractNumber = admin.firestore.FieldValue.delete();
      }

      console.log(`📝 Mise à jour activité ${index + 1}: ${data.nomClient}`);
      console.log(`   - Date saisie: ${data.dateSaisie}`);
      console.log(`   - Date effet: ${updates.dateEffet}`);
      
      batch.update(doc.ref, updates);
    });

    await batch.commit();
    
    console.log('✅ Toutes les activités mock ont été mises à jour avec succès !');
    console.log(`📋 ${snapshot.size} documents mis à jour`);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des données mock:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  updateMockDataDates().then(() => {
    console.log('\n✨ Script de mise à jour terminé avec succès !');
    process.exit(0);
  });
}

module.exports = { updateMockDataDates };
