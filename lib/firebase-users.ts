import { collection, doc, setDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { withRetry, createFirebaseOperation } from './error-handling';

export interface UserData {
  uid?: string;
  prenom: string;
  nom: string;
  email: string;
  password?: string;
  role: string;
  role_front: string;
  etp: number;
  genre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mapping des rôles vers les rôles front
export const roleMapping = {
  'administrateur': 'Agent Général',
  'cdc_commercial': 'CDC Commercial',
  'cdc_sante_coll': 'CDC Santé Collective',
  'cdc_sante_ind': 'CDC Santé Individuel',
  'cdc_sinistre': 'CDC Sinistre'
} as const;

// Données des utilisateurs à importer
export const usersData: UserData[] = [
  {
    prenom: 'Jean-Michel',
    nom: 'Nogaro',
    email: 'jeanmichel@allianz-nogaro.fr',
    password: 'allianz',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Julien',
    nom: 'Boetti',
    email: 'julien.boetti@allianz-nogaro.fr',
    password: 'allianz',
    role: 'administrateur',
    role_front: 'Agent Général',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Gwendal',
    nom: 'Clouet',
    email: 'gwendal.clouet@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Emma',
    nom: 'Nogaro',
    email: 'emma@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 0.5,
    genre: 'Femme'
  },
  {
    prenom: 'Joelle',
    nom: 'Abi Karam',
    email: 'joelle.abikaram@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Astrid',
    nom: 'Ulrich',
    email: 'astrid.ulrich@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Karen',
    nom: 'Chollet',
    email: 'karen.chollet@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_sante_coll',
    role_front: 'CDC Santé Collective',
    etp: 0.6,
    genre: 'Femme'
  },
  {
    prenom: 'Kheira',
    nom: 'Bagnasco',
    email: 'kheira.bagnasco@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_sante_ind',
    role_front: 'CDC Santé Individuel',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Virginie',
    nom: 'Tommasini',
    email: 'virginie.tommasini@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Nejma',
    nom: 'Hariati',
    email: 'nejma.hariati@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre',
    etp: 1,
    genre: 'Femme'
  },
  {
    prenom: 'Corentin',
    nom: 'Ulrich',
    email: 'corentin.ulrich@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Homme'
  },
  {
    prenom: 'Donia',
    nom: 'Sahraoui',
    email: 'donia.sahraoui@allianz-nogaro.fr',
    password: 'allianz',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial',
    etp: 1,
    genre: 'Femme'
  }
];

// Fonction pour créer un nouvel utilisateur
export const createUser = async (userData: {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  role: string;
  role_front?: string;
  etp?: string;
  genre?: string;
}) => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // Mettre à jour le profil avec le nom complet
    await updateProfile(user, {
      displayName: `${userData.prenom} ${userData.nom}`
    });

    // Créer le document utilisateur dans Firestore avec l'UID comme document ID
    const userDoc = {
      uid: user.uid,
      email: userData.email,
      password: userData.password,
      prenom: userData.prenom,
      nom: userData.nom,
      role: userData.role,
      role_front: userData.role_front || roleMapping[userData.role as keyof typeof roleMapping],
      etp: userData.etp ? parseFloat(userData.etp) : 1,
      genre: userData.genre || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    return user.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Fonction pour récupérer les utilisateurs avec tri et pagination
export const getUsers = async (options?: {
  limit?: number;
  startAfter?: any;
  searchTerm?: string;
}): Promise<{
  users: UserData[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}> => {
  const operation = createFirebaseOperation(async () => {
    const { limit = 50, startAfter, searchTerm } = options || {};
    
    let q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    if (startAfter) {
      q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        startAfter(startAfter),
        limit(limit)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as UserData));
    
    // Filtrer côté client si searchTerm fourni
    let filteredUsers = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.prenom?.toLowerCase().includes(term) ||
        user.nom?.toLowerCase().includes(term)
      );
    }
    
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === limit;
    
    // Compter le total (requête séparée pour éviter de charger toutes les données)
    const countSnapshot = await getDocs(collection(db, 'users'));
    const total = countSnapshot.size;
    
    return {
      users: filteredUsers,
      lastDoc,
      hasMore,
      total
    };
  }, 'getUsers');
  
  return operation();
};

// Fonction pour mettre à jour un utilisateur
export const updateUser = async (uid: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Fonction pour supprimer un utilisateur
export const deleteUser = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Fonction pour synchroniser les utilisateurs existants
export const syncUsersFromAuth = async () => {
  const results = [];
  
  try {
    // Récupérer tous les utilisateurs existants dans Firestore
    const existingFirestoreUsers = await getUsers();
    const existingEmails = existingFirestoreUsers.map(user => user.email);
    
    console.log('Synchronisation des utilisateurs...');
    console.log(`Utilisateurs déjà dans Firestore: ${existingEmails.length}`);
    
    for (const userData of usersData) {
      try {
        // Vérifier si l'utilisateur existe déjà dans Firestore
        if (existingEmails.includes(userData.email)) {
          results.push({
            success: true,
            email: userData.email,
            action: 'already_exists',
            message: `Utilisateur déjà synchronisé: ${userData.prenom} ${userData.nom}`
          });
          console.log(`✅ Déjà synchronisé: ${userData.prenom} ${userData.nom}`);
          continue;
        }
        
        // Essayer de créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          'allianz'
        );
        
        // Mettre à jour le profil avec le nom complet
        await updateProfile(userCredential.user, {
          displayName: `${userData.prenom} ${userData.nom}`
        });
        
        // Créer le document utilisateur dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        results.push({
          success: true,
          email: userData.email,
          uid: userCredential.user.uid,
          action: 'created',
          message: `Utilisateur créé: ${userData.prenom} ${userData.nom}`
        });
        
        console.log(`✅ Utilisateur créé: ${userData.prenom} ${userData.nom}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // L'utilisateur existe dans Firebase Auth mais pas dans Firestore
          results.push({
            success: false,
            email: userData.email,
            action: 'needs_manual_sync',
            error: error.message,
            message: `Utilisateur existe dans Auth mais pas dans Firestore: ${userData.prenom} ${userData.nom}`
          });
          console.log(`⚠️ À synchroniser manuellement: ${userData.prenom} ${userData.nom}`);
        } else {
          results.push({
            success: false,
            email: userData.email,
            action: 'creation_failed',
            error: error.message,
            message: `Erreur création ${userData.email}: ${error.message}`
          });
          console.error(`❌ Erreur création utilisateur ${userData.email}:`, error);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return [{
      success: false,
      email: 'system',
      action: 'system_error',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur système lors de la synchronisation'
    }];
  }
};