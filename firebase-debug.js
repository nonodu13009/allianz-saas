// Script de diagnostic Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

console.log('🔍 Diagnostic Firebase...')

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log('📋 Configuration Firebase:', {
  apiKey: firebaseConfig.apiKey ? '✅ Configuré' : '❌ Manquant',
  authDomain: firebaseConfig.authDomain ? '✅ Configuré' : '❌ Manquant',
  projectId: firebaseConfig.projectId ? '✅ Configuré' : '❌ Manquant',
  storageBucket: firebaseConfig.storageBucket ? '✅ Configuré' : '❌ Manquant',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Configuré' : '❌ Manquant',
  appId: firebaseConfig.appId ? '✅ Configuré' : '❌ Manquant',
})

try {
  // Initialiser Firebase
  const app = initializeApp(firebaseConfig)
  console.log('✅ Firebase initialisé avec succès')

  // Initialiser Firestore
  const db = getFirestore(app)
  console.log('✅ Firestore initialisé avec succès')

  // Initialiser Auth
  const auth = getAuth(app)
  console.log('✅ Auth initialisé avec succès')

  // Test de connexion simple
  console.log('🧪 Test de connexion Firestore...')
  
  // Tester avec un document simple
  const testDoc = doc(db, 'test', 'connection')
  getDoc(testDoc).then((docSnap) => {
    if (docSnap.exists()) {
      console.log('✅ Connexion Firestore réussie - Document trouvé:', docSnap.data())
    } else {
      console.log('⚠️ Connexion Firestore réussie - Document non trouvé (normal)')
    }
  }).catch((error) => {
    console.error('❌ Erreur de connexion Firestore:', error)
    console.error('📋 Détails de l\'erreur:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
  })

} catch (error) {
  console.error('❌ Erreur d\'initialisation Firebase:', error)
  console.error('📋 Détails de l\'erreur:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  })
}

console.log('🏁 Diagnostic terminé')
