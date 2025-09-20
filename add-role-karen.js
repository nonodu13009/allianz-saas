/**
 * Script pour ajouter le rôle cdc_sante_coll à Karen Chollet
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

async function addRoleToKaren() {
  try {
    console.log('🔧 Ajout du rôle cdc_sante_coll à Karen Chollet...');
    
    const userId = 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13';
    
    // Récupérer l'utilisateur actuel
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur Karen Chollet non trouvé');
      return;
    }
    
    const userData = userDoc.data();
    console.log('👤 Utilisateur actuel:');
    console.log(`   - Nom: ${userData.firstName} ${userData.lastName}`);
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Rôles actuels: ${userData.roles?.join(', ') || 'Aucun'}`);
    
    // Ajouter le rôle cdc_sante_coll
    const newRoles = userData.roles ? [...userData.roles] : [];
    if (!newRoles.includes('cdc_sante_coll')) {
      newRoles.push('cdc_sante_coll');
      
      await userRef.update({
        roles: newRoles,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Rôle cdc_sante_coll ajouté avec succès !');
      console.log(`   - Nouveaux rôles: ${newRoles.join(', ')}`);
    } else {
      console.log('ℹ️ Le rôle cdc_sante_coll existe déjà');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du rôle:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  addRoleToKaren().then(() => {
    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  });
}

module.exports = { addRoleToKaren };
