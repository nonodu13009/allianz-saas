import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';

export interface UserData {
  prenom: string;
  nom: string;
  email: string;
  role: string;
  role_front: string;
  etp: number;
  genre: string;
}

// Données des utilisateurs à importer
const usersData: UserData[] = [
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
    prenom: 'Corendin',
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

// Fonction pour créer les utilisateurs dans Firebase
export const createUsersInFirebase = async () => {
  const password = 'allianz'; // Mot de passe par défaut
  
  for (const userData of usersData) {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        password
      );
      
      // Ajouter les données utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Utilisateur créé: ${userData.prenom} ${userData.nom}`);
    } catch (error) {
      console.error(`Erreur création utilisateur ${userData.email}:`, error);
    }
  }
};

// Fonction pour récupérer tous les utilisateurs
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: UserData[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData);
    });
    
    return users;
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return [];
  }
};