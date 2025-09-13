import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth } from './firebase'
import { UserService } from './user-service'
import { CreateUserData } from '@/types/user'

interface UserToMigrate {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
  roleFront: string
  etp: number
  genre: 'Homme' | 'Femme'
}

export class UserMigrationComplete {
  /**
   * Créer un utilisateur Firebase Auth + Firestore
   */
  static async createUser(userData: UserToMigrate): Promise<void> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const exists = await this.checkUserExists(userData.email)
      if (exists) {
        console.log(`⚠️  Utilisateur ${userData.firstName} ${userData.lastName} existe déjà, mise à jour Firestore...`)
        
        // Se connecter pour obtenir l'UID
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password)
        const firebaseUser = userCredential.user
        
        // Mettre à jour le profil Firebase Auth
        await updateProfile(firebaseUser, {
          displayName: `${userData.firstName} ${userData.lastName}`
        })

        // Mettre à jour l'utilisateur dans Firestore
        const updateData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          roleFront: userData.roleFront,
          etp: userData.etp,
          genre: userData.genre,
          isActive: true
        }

        await UserService.updateUser(firebaseUser.uid, updateData)
        await signOut(auth) // Se déconnecter après la mise à jour
        
        console.log(`✅ Utilisateur mis à jour: ${userData.firstName} ${userData.lastName} (${userData.etp} ETP)`)
        return
      }

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

      console.log(`✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${userData.etp} ETP)`)
    } catch (error) {
      console.error(`❌ Erreur création ${userData.firstName} ${userData.lastName}:`, error)
      throw error
    }
  }

  /**
   * Migrer tous les utilisateurs avec les données exactes
   */
  static async migrateAllUsers(): Promise<{ success: number; errors: string[] }> {
    const users: UserToMigrate[] = [
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

    console.log('🚀 Début de la migration complète des utilisateurs...')
    console.log(`📊 Total des utilisateurs à migrer: ${users.length}`)

    for (const user of users) {
      try {
        await this.createUser(user)
        success++
        
        // Petite pause entre les créations
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        const errorMessage = `${user.firstName} ${user.lastName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        errors.push(errorMessage)
        console.error(`❌ ${errorMessage}`)
      }
    }

    console.log(`✅ Migration terminée: ${success} utilisateurs traités, ${errors.length} erreurs`)
    return { success, errors }
  }

  /**
   * Vérifier si un utilisateur existe déjà
   */
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Essayer de se connecter avec l'email et le mot de passe standard
      await signInWithEmailAndPassword(auth, email, 'allianz')
      await signOut(auth)
      return true
    } catch {
      return false
    }
  }

  /**
   * Mettre à jour tous les utilisateurs existants
   */
  static async updateAllUsers(): Promise<{ success: number; errors: string[] }> {
    const users: UserToMigrate[] = [
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

    console.log('🔄 Début de la mise à jour des utilisateurs...')
    console.log(`📊 Total des utilisateurs à mettre à jour: ${users.length}`)

    for (const user of users) {
      try {
        // Essayer de se connecter pour obtenir l'UID
        const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password)
        const firebaseUser = userCredential.user
        
        // Mettre à jour le profil Firebase Auth
        await updateProfile(firebaseUser, {
          displayName: `${user.firstName} ${user.lastName}`
        })

        // Mettre à jour l'utilisateur dans Firestore
        const updateData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          roleFront: user.roleFront,
          etp: user.etp,
          genre: user.genre,
          isActive: true
        }

        await UserService.updateUser(firebaseUser.uid, updateData)
        await signOut(auth) // Se déconnecter après la mise à jour
        
        console.log(`✅ Utilisateur mis à jour: ${user.firstName} ${user.lastName} (${user.etp} ETP)`)
        success++
        
        // Petite pause entre les mises à jour
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        const errorMessage = `${user.firstName} ${user.lastName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        errors.push(errorMessage)
        console.error(`❌ ${errorMessage}`)
      }
    }

    console.log(`✅ Mise à jour terminée: ${success} utilisateurs traités, ${errors.length} erreurs`)
    return { success, errors }
  }

  /**
   * Calculer l'ETP total attendu
   */
  static calculateExpectedETP(): number {
    const users = [
      { name: 'Jean-Michel Nogaro', etp: 1 },
      { name: 'Julien Boetti', etp: 1 },
      { name: 'Gwendal Clouet', etp: 1 },
      { name: 'Emma Nogaro', etp: 0.5 },
      { name: 'Joelle Abi Karam', etp: 1 },
      { name: 'Astrid Ulrich', etp: 1 },
      { name: 'Karen Chollet', etp: 0.6 },
      { name: 'Kheira Bagnasco', etp: 1 },
      { name: 'Virginie Tommasini', etp: 1 },
      { name: 'Nejma Hariati', etp: 1 },
      { name: 'Corentin Ulrich', etp: 1 },
      { name: 'Donia Sahraoui', etp: 1 }
    ]

    const totalETP = users.reduce((sum, user) => sum + user.etp, 0)
    console.log(`📊 ETP total attendu: ${totalETP}`)
    return totalETP
  }
}
