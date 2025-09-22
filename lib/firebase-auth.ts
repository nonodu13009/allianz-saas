import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  role_front: string;
  etp?: number;
  genre?: string;
}

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        prenom: userData.prenom,
        nom: userData.nom,
        email: userData.email,
        role: userData.role,
        role_front: userData.role_front,
        etp: userData.etp,
        genre: userData.genre
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};