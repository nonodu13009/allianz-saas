import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

// Mapping des rôles vers role_front
const roleMapping: Record<string, string> = {
  'administrateur': 'Agent Général',
  'cdc_commercial': 'CDC Commercial',
  'cdc_sante_coll': 'CDC Santé Collective',
  'cdc_sante_ind': 'CDC Santé Individuel',
  'cdc_sinistre': 'CDC Sinistre'
}

export async function migrateUsersRoleFront() {
  try {
    console.log('🔄 Début de la migration des rôles...')
    
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    let updated = 0
    let errors = 0
    
    for (const userDoc of snapshot.docs) {
      try {
        const userData = userDoc.data()
        const userId = userDoc.id
        
        // Vérifier si roleFront existe déjà
        if (userData.roleFront) {
          console.log(`✅ ${userData.firstName} ${userData.lastName} a déjà roleFront: ${userData.roleFront}`)
          continue
        }
        
        // Mapper le rôle vers roleFront
        const roleFront = roleMapping[userData.role] || userData.role
        
        // Mettre à jour le document
        await updateDoc(doc(db, 'users', userId), {
          roleFront: roleFront
        })
        
        console.log(`✅ ${userData.firstName} ${userData.lastName}: ${userData.role} → ${roleFront}`)
        updated++
        
      } catch (error) {
        console.error(`❌ Erreur pour ${userDoc.id}:`, error)
        errors++
      }
    }
    
    console.log(`🎉 Migration terminée: ${updated} utilisateurs mis à jour, ${errors} erreurs`)
    return { updated, errors }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  }
}

// Fonction pour vérifier les données d'un utilisateur spécifique
export async function checkUserData(email: string) {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const user = snapshot.docs.find(doc => doc.data().email === email)
    
    if (user) {
      const data = user.data()
      console.log(`👤 Données de ${data.firstName} ${data.lastName}:`, {
        role: data.role,
        roleFront: data.roleFront,
        email: data.email
      })
      return data
    } else {
      console.log(`❌ Utilisateur ${email} non trouvé`)
      return null
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    throw error
  }
}
