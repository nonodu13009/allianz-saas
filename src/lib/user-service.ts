import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { User, CreateUserData } from '@/types/user'

const USERS_COLLECTION = 'users'

export class UserService {
  /**
   * Créer un utilisateur dans Firestore
   */
         static async createUser(uid: string, userData: CreateUserData): Promise<User> {
           const userRef = doc(db, USERS_COLLECTION, uid)

           const user: Omit<User, 'uid'> = {
             email: userData.email,
             ...userData,
             createdAt: new Date(),
             updatedAt: new Date(),
             isActive: true
           }

    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { uid, ...user }
  }

  /**
   * Récupérer un utilisateur par son UID
   */
  static async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    const data = userSnap.data()
    return {
      uid,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as User
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(uid: string, updates: Partial<CreateUserData>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid)
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  /**
   * Mettre à jour les préférences d'un utilisateur
   */
  static async updateUserPreferences(uid: string, preferences: Partial<User['preferences']>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid)
    
    await updateDoc(userRef, {
      'preferences': {
        ...preferences
      },
      updatedAt: serverTimestamp()
    })
  }

  /**
   * Mettre à jour la dernière connexion
   */
  static async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid)
    
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }

  /**
   * Récupérer tous les utilisateurs d'une entreprise
   */
  static async getUsersByCompany(company: string): Promise<User[]> {
    const usersRef = collection(db, USERS_COLLECTION)
    const q = query(usersRef, where('company', '==', company))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as User[]
  }

  /**
   * Récupérer tous les utilisateurs par rôle
   */
  static async getUsersByRole(role: User['role']): Promise<User[]> {
    const usersRef = collection(db, USERS_COLLECTION)
    const q = query(usersRef, where('role', '==', role))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as User[]
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, USERS_COLLECTION)
    const querySnapshot = await getDocs(usersRef)

    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as User[]
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid)
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    })
  }
}
