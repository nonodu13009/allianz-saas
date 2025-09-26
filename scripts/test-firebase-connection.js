// Script de test pour vérifier la connexion Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies valeurs)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your_api_key_here",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your_project_id.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "allianz-saas",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your_project_id.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your_sender_id_here",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your_app_id_here"
};

async function testFirebaseConnection() {
  try {
    console.log('🔍 Test de connexion Firebase...');
    console.log('Configuration:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });

    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialisé avec succès');

    // Tester la connexion à Firestore
    console.log('🔍 Test de connexion à Firestore...');
    
    // Essayer de lire la collection commissions
    const commissionsRef = collection(db, 'commissions');
    const snapshot = await getDocs(commissionsRef);
    
    console.log(`✅ Connexion Firestore réussie !`);
    console.log(`📊 Nombre de documents dans 'commissions': ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('📄 Premiers documents:');
      snapshot.docs.slice(0, 3).forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.id}:`, doc.data());
      });
    } else {
      console.log('⚠️  Aucun document trouvé dans la collection "commissions"');
    }

  } catch (error) {
    console.error('❌ Erreur de connexion Firebase:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Solution: Vérifiez les règles de sécurité Firestore');
    } else if (error.code === 'not-found') {
      console.log('💡 Solution: Vérifiez que le projet Firebase existe et que l\'ID est correct');
    } else if (error.message.includes('API key')) {
      console.log('💡 Solution: Vérifiez que votre clé API Firebase est correcte');
    }
  }
}

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

testFirebaseConnection();

