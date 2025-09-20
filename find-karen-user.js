/**
 * Script pour trouver l'userId de Karen Chollet
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

async function findKarenUser() {
  try {
    console.log('🔍 Recherche de l\'utilisateur Karen Chollet...');
    
    // Rechercher dans la collection users
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('email', '==', 'karen.chollet@allianz.fr')
      .get();

    if (snapshot.empty) {
      console.log('❌ Utilisateur Karen Chollet non trouvé avec cet email');
      
      // Essayer de chercher par nom
      console.log('🔍 Recherche par nom...');
      const snapshot2 = await usersRef
        .where('firstName', '==', 'Karen')
        .where('lastName', '==', 'Chollet')
        .get();
        
      if (snapshot2.empty) {
        console.log('❌ Utilisateur Karen Chollet non trouvé par nom');
        
        // Lister tous les utilisateurs pour voir ce qui existe
        console.log('📋 Liste de tous les utilisateurs:');
        const allUsers = await usersRef.get();
        allUsers.forEach(doc => {
          const user = doc.data();
          console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ID: ${doc.id}`);
        });
        
        return;
      } else {
        const user = snapshot2.docs[0];
        console.log('✅ Utilisateur Karen Chollet trouvé par nom:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Nom: ${user.data().firstName} ${user.data().lastName}`);
        console.log(`   - Email: ${user.data().email}`);
        console.log(`   - Rôles: ${user.data().roles?.join(', ') || 'Aucun'}`);
        return user.id;
      }
    } else {
      const user = snapshot.docs[0];
      console.log('✅ Utilisateur Karen Chollet trouvé par email:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Nom: ${user.data().firstName} ${user.data().lastName}`);
      console.log(`   - Email: ${user.data().email}`);
      console.log(`   - Rôles: ${user.data().roles?.join(', ') || 'Aucun'}`);
      return user.id;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  findKarenUser().then((userId) => {
    if (userId) {
      console.log(`\n🎯 userId de Karen Chollet: ${userId}`);
    }
    process.exit(0);
  });
}

module.exports = { findKarenUser };
