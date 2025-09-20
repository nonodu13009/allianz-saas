/**
 * Script de test de connectivité Firebase
 * Diagnostique les problèmes de connexion Firebase
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, doc, getDoc } = require('firebase/firestore');
const { getAuth, connectAuthEmulator } = require('firebase/auth');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxXJ7K8Q9R2S3T4U5V6W7X8Y9Z0A1B2C3",
  authDomain: "allianz-saas-132c3.firebaseapp.com",
  projectId: "allianz-saas-132c3",
  storageBucket: "allianz-saas-132c3.appspot.com",
  messagingSenderId: "102519702913805426095",
  appId: "1:102519702913805426095:web:abcdef1234567890"
};

async function testFirebaseConnection() {
  try {
    console.log('🔥 Test de connectivité Firebase...');
    
    // Initialiser Firebase
    console.log('📱 Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialisé avec succès');
    
    // Test Firestore
    console.log('\n💾 Test de connectivité Firestore...');
    const db = getFirestore(app);
    console.log('✅ Firestore initialisé avec succès');
    
    // Test de lecture d'un document
    console.log('📖 Test de lecture d\'un document...');
    try {
      const testDocRef = doc(db, 'users', 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13');
      const testDoc = await getDoc(testDocRef);
      
      if (testDoc.exists()) {
        console.log('✅ Document utilisateur trouvé:', testDoc.data().firstName, testDoc.data().lastName);
      } else {
        console.log('ℹ️ Document utilisateur non trouvé (normal si pas encore créé)');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture du document:', error.message);
      
      if (error.message.includes('offline')) {
        console.log('🔍 Diagnostic: Problème de connectivité réseau');
        console.log('💡 Solutions possibles:');
        console.log('   - Vérifier la connexion internet');
        console.log('   - Vérifier les règles Firestore');
        console.log('   - Vérifier la configuration Firebase');
      }
    }
    
    // Test d'une collection existante
    console.log('\n📊 Test de lecture des activités Santé Collective...');
    try {
      const { collection, query, where, limit, getDocs } = require('firebase/firestore');
      const activitiesRef = collection(db, 'sante_coll_activities');
      const q = query(activitiesRef, where('userId', '==', 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13'), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log('✅ Activités Santé Collective trouvées:', snapshot.size);
        console.log('📋 Première activité:', snapshot.docs[0].data().nomClient);
      } else {
        console.log('ℹ️ Aucune activité Santé Collective trouvée pour cet utilisateur');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture des activités:', error.message);
    }
    
    console.log('\n✅ Test de connectivité Firebase terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test Firebase:', error);
    
    console.log('\n🔍 Diagnostic détaillé:');
    console.log('Message d\'erreur:', error.message);
    console.log('Code d\'erreur:', error.code || 'N/A');
    
    if (error.message.includes('offline')) {
      console.log('\n💡 Solutions pour "client is offline":');
      console.log('1. Vérifier la connectivité internet');
      console.log('2. Redémarrer le serveur de développement');
      console.log('3. Vérifier les règles Firestore');
      console.log('4. Vérifier la configuration Firebase');
      console.log('5. Nettoyer le cache du navigateur');
    }
  }
}

// Exécution du script
if (require.main === module) {
  testFirebaseConnection().then(() => {
    console.log('\n✨ Script de diagnostic terminé !');
    process.exit(0);
  });
}

module.exports = { testFirebaseConnection };
