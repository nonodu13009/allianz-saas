// Script de debug pour vérifier les utilisateurs dans Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans Firebase...')
    
    const q = query(collection(db, 'users'), orderBy('role', 'asc'))
    const querySnapshot = await getDocs(q)
    
    console.log(`📊 Total utilisateurs trouvés: ${querySnapshot.docs.length}`)
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`👤 ${data.firstName} ${data.lastName}`)
      console.log(`   📧 Email: ${data.email}`)
      console.log(`   🔑 UID: ${doc.id}`)
      console.log(`   👤 Rôle: ${data.role}`)
      console.log(`   🎭 Rôle Front: "${data.roleFront}"`)
      console.log(`   ✅ Est Agent Général: ${data.roleFront === 'Agent Général'}`)
      console.log('---')
    })
    
    const adminUsers = querySnapshot.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .filter(user => user.roleFront === 'Agent Général')
    
    console.log(`👑 Administrateurs (Agent Général) trouvés: ${adminUsers.length}`)
    adminUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

debugUsers()
