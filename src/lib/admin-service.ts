import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth } from './firebase'
import { UserService } from './user-service'
import { CreateUserData } from '@/types/user'

export interface UserToCreate {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
  roleFront: string
  etp: number
  genre: 'Homme' | 'Femme'
}

export class AdminService {
  /**
   * Créer un utilisateur Firebase Auth + Firestore
   */
  static async createUser(userData: UserToCreate): Promise<void> {
    try {
      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      const firebaseUser = userCredential.user

      // Mettre à jour le profil Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })

      // Créer l'utilisateur dans Firestore
      const createUserData: CreateUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        roleFront: userData.roleFront,
        etp: userData.etp,
        genre: userData.genre
      }

      await UserService.createUser(
        firebaseUser.uid, 
        createUserData
      )

      console.log(`✅ Utilisateur créé: ${userData.firstName} ${userData.lastName}`)
      console.log(`📧 Email: ${userData.email}`)
      console.log(`🔑 UID: ${firebaseUser.uid}`)
      console.log(`👤 Rôle: ${userData.role}`)
      console.log(`🎭 Rôle Front: ${userData.roleFront}`)
    } catch (error) {
      console.error(`❌ Erreur création ${userData.firstName} ${userData.lastName}:`, error)
      throw error
    }
  }

  /**
   * Créer tous les utilisateurs de l'équipe
   */
  static async createAllUsers(): Promise<{ success: number; errors: string[] }> {
    const users: UserToCreate[] = [
      {
        firstName: 'Jean-Michel',
        lastName: 'Nogaro',
        email: 'jeanmichel@allianz-nogaro.fr',
        password: 'allianz',
        role: 'administrateur',
        roleFront: 'Agent Général',
        etp: 1,
        genre: 'Homme'
      },
      {
        firstName: 'Julien',
        lastName: 'Boetti',
        email: 'julien.boetti@allianz-nogaro.fr',
        password: 'allianz',
        role: 'administrateur',
        roleFront: 'Agent Général',
        etp: 1,
        genre: 'Homme'
      },
      {
        firstName: 'Gwendal',
        lastName: 'Clouet',
        email: 'gwendal.clouet@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 1,
        genre: 'Homme'
      },
      {
        firstName: 'Emma',
        lastName: 'Nogaro',
        email: 'emma@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 0.5,
        genre: 'Femme'
      },
      {
        firstName: 'Joelle',
        lastName: 'Abi Karam',
        email: 'joelle.abikaram@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 1,
        genre: 'Femme'
      },
      {
        firstName: 'Astrid',
        lastName: 'Ulrich',
        email: 'astrid.ulrich@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 1,
        genre: 'Femme'
      },
      {
        firstName: 'Karen',
        lastName: 'Chollet',
        email: 'karen.chollet@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_sante_coll',
        roleFront: 'CDC Santé Collective',
        etp: 0.6,
        genre: 'Femme'
      },
      {
        firstName: 'Kheira',
        lastName: 'Bagnasco',
        email: 'kheira.bagnasco@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_sante_ind',
        roleFront: 'CDC Santé Individuel',
        etp: 1,
        genre: 'Femme'
      },
      {
        firstName: 'Virginie',
        lastName: 'Tommasini',
        email: 'virginie.tommasini@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_sinistre',
        roleFront: 'CDC Sinistre',
        etp: 1,
        genre: 'Femme'
      },
      {
        firstName: 'Nejma',
        lastName: 'Hariati',
        email: 'nejma.hariati@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_sinistre',
        roleFront: 'CDC Sinistre',
        etp: 1,
        genre: 'Femme'
      },
      {
        firstName: 'Corentin',
        lastName: 'Ulrich',
        email: 'corentin.ulrich@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 1,
        genre: 'Homme'
      },
      {
        firstName: 'Donia',
        lastName: 'Sahraoui',
        email: 'donia.sahraoui@allianz-nogaro.fr',
        password: 'allianz',
        role: 'cdc_commercial',
        roleFront: 'CDC Commercial',
        etp: 1,
        genre: 'Femme'
      }
    ]

    let success = 0
    const errors: string[] = []

    for (const user of users) {
      try {
        await this.createUser(user)
        success++
      } catch (error) {
        const errorMessage = `${user.firstName} ${user.lastName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    return { success, errors }
  }

  /**
   * Vérifier si un utilisateur existe déjà
   */
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Essayer de se connecter avec l'email
      await signInWithEmailAndPassword(auth, email, 'temp')
      await signOut(auth)
      return true
    } catch {
      return false
    }
  }
}