// Script d'initialisation des utilisateurs Firestore
// Ce script crée la collection 'users' avec les données des 12 utilisateurs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');
const { createUserWithEmailAndPassword, getAuth } = require('firebase/auth');

// Configuration Firebase (utilise les variables d'environnement)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Données des utilisateurs
const usersData = [
  {
    prenom: 'Jean-Michel',
    nom: 'Nogaro',
    email: 'jeanmichel@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Julien',
    nom: 'Boetti',
    email: 'julien.boetti@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Gwendal',
    nom: 'Clouet',
    email: 'gwendal.clouet@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Emma',
    nom: 'Nogaro',
    email: 'emma@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 0.5,
    genre: 'Femme'
  },
  {
    prenom: 'Joelle',
    nom: 'Abi Karam',
    email: 'joelle.abikaram@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Astrid',
    nom: 'Ulrich',
    email: 'astrid.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Karen',
    nom: 'Chollet',
    email: 'karen.chollet@allianz-nogaro.fr',
    role: 'cdc_sante_coll',
    role_front: 'CDC Santé Collective',
    etp: 0.6,
    genre: 'Femme'
  },
  {
    prenom: 'Kheira',
    nom: 'Bagnasco',
    email: 'kheira.bagnasco@allianz-nogaro.fr',
    role: 'cdc_sante_ind',
    role_front: 'CDC Santé Individuel',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Virginie',
    nom: 'Tommasini',
    email: 'virginie.tommasini@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Nejma',
    nom: 'Hariati',
    email: 'nejma.hariati@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Corentin',
    nom: 'Ulrich',
    email: 'corentin.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Donia',
    nom: 'Sahraoui',
    email: 'donia.sahraoui@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  }
];

async function initializeUsers() {
  console.log('🚀 Initialisation de la collection users...');
  
  try {
    // Vérifier si la collection existe déjà
    const existingUsers = await getDocs(collection(db, 'users'));
    
    if (existingUsers.size > 0) {
      console.log(`✅ Collection 'users' existe déjà avec ${existingUsers.size} utilisateurs`);
      return;
    }

    console.log('📝 Création des documents utilisateurs...');
    
    // Créer les documents utilisateurs dans Firestore
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const docId = `user_${i + 1}`; // ID temporaire
      
      await setDoc(doc(db, 'users', docId), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Utilisateur créé: ${userData.prenom} ${userData.nom}`);
    }
    
    console.log('🎉 Collection "users" initialisée avec succès !');
    console.log(`📊 ${usersData.length} utilisateurs créés`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

// Exécuter le script
initializeUsers().then(() => {
  console.log('✅ Script terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
