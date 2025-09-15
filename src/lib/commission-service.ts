import { db } from './firebase'
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore'
import { CommissionData, CommissionRow, CommissionYear } from '@/types/commission'
import { User } from '@/types/user'

const COMMISSIONS_COLLECTION = 'agency_commissions'

export class CommissionService {
  /**
   * Obtenir les données de commission pour une année
   */
  static async getCommissionData(year: number): Promise<CommissionData | null> {
    try {
      const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Récupérer les utilisateurs administrateurs pour mettre à jour les prélèvements
        const adminUsers = await this.getAdminUsers()
        
        // Recalculer les lignes avec les utilisateurs actuels
        const baseRows = data.rows.map(row => ({
          label: row.label,
          values: row.values,
          isWithdrawal: row.isWithdrawal
        }))
        
        const updatedRows = this.calculateCommissionRows(baseRows, adminUsers)
        
        // Vérifier si des prélèvements ont été ajoutés ou modifiés
        const hasNewWithdrawals = updatedRows.some(row => 
          row.isWithdrawal && !data.rows.some(existingRow => 
            existingRow.label === row.label
          )
        )
        
        // Si des prélèvements ont été ajoutés, sauvegarder les mises à jour
        if (hasNewWithdrawals) {
          console.log('🔄 Nouveaux prélèvements détectés, mise à jour automatique...')
          const updatedData = {
            year: data.year,
            rows: updatedRows,
            updatedAt: serverTimestamp(),
            archived: data.archived || false
          }
          await this.saveCommissionData(updatedData)
          console.log('✅ Prélèvements mis à jour automatiquement')
        }
        
        return {
          year: data.year,
          rows: updatedRows,
          updatedAt: data.updatedAt
        } as CommissionData
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des données de commission:', error)
      return null
    }
  }

  /**
   * Obtenir la liste des années disponibles
   */
  static async getAvailableYears(): Promise<CommissionYear[]> {
    try {
      const q = query(collection(db, COMMISSIONS_COLLECTION), orderBy('year', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const firebaseYears = querySnapshot.docs.map(doc => ({
        year: doc.data().year,
        available: !doc.data().archived
      }))
      
      console.log('Années récupérées depuis Firebase:', firebaseYears)
      
      // Trier par année décroissante
      return firebaseYears.sort((a, b) => b.year - a.year)
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error)
      // En cas d'erreur, retourner les années locales comme fallback
      return [
        { year: 2025, available: true },
        { year: 2024, available: true },
        { year: 2023, available: true },
        { year: 2022, available: true }
      ]
    }
  }

  /**
   * Sauvegarder les données de commission pour une année
   */
  static async saveCommissionData(commissionData: CommissionData): Promise<void> {
    try {
      console.log('Tentative de sauvegarde pour l\'année:', commissionData.year)
      const docRef = doc(db, COMMISSIONS_COLLECTION, commissionData.year.toString())
      await setDoc(docRef, {
        ...commissionData,
        updatedAt: serverTimestamp(),
        archived: false
      })
      console.log('Sauvegarde réussie pour l\'année:', commissionData.year)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de commission:', error)
      throw error
    }
  }

  /**
   * Archiver une année (la masquer de la navigation)
   */
  static async archiveYear(year: number): Promise<void> {
    try {
      const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
      await updateDoc(docRef, {
        archived: true,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'année:', error)
      throw error
    }
  }

  /**
   * Désarchiver une année (la rendre visible dans la navigation)
   */
  static async unarchiveYear(year: number): Promise<void> {
    try {
      const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
      await updateDoc(docRef, {
        archived: false,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors du désarchivage de l\'année:', error)
      throw error
    }
  }

  /**
   * Supprimer définitivement une année
   */
  static async deleteYear(year: number): Promise<void> {
    try {
      const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'année:', error)
      throw error
    }
  }

  /**
   * Vérifier si une année contient des données
   */
  static async hasYearData(year: number): Promise<boolean> {
    try {
      const data = await this.getCommissionData(year)
      return data ? data.rows.some(row => row.values.some(val => val > 0)) : false
    } catch (error) {
      console.error('Erreur lors de la vérification des données:', error)
      return false
    }
  }

  /**
   * Récupérer les utilisateurs administrateurs (Agent Général)
   */
  static async getAdminUsers(): Promise<User[]> {
    try {
      console.log('🔍 Recherche des utilisateurs administrateurs...')
      const q = query(collection(db, 'users'), orderBy('role', 'asc'))
      const querySnapshot = await getDocs(q)
      
      console.log(`📊 Total utilisateurs trouvés: ${querySnapshot.docs.length}`)
      
      const allUsers = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log(`👤 Utilisateur: ${data.firstName} ${data.lastName} - Rôle: ${data.role} - Rôle Front: "${data.roleFront}"`)
        return { uid: doc.id, ...data } as User
      })
      
      const adminUsers = allUsers.filter(user => user.roleFront === 'Agent Général')
      console.log(`👑 Administrateurs trouvés: ${adminUsers.length}`)
      
      return adminUsers
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs administrateurs:', error)
      return []
    }
  }

  /**
   * Supprimer les prélèvements d'un utilisateur de toutes les années
   */
  static async removeUserWithdrawals(userId: string, userName: string): Promise<void> {
    try {
      console.log(`🔄 Suppression des prélèvements de ${userName} (${userId})...`)
      
      // Récupérer toutes les années disponibles
      const years = await this.getAvailableYears()
      console.log(`📅 Années à traiter: ${years.map(y => y.year).join(', ')}`)
      
      // Traiter chaque année
      for (const yearData of years) {
        const year = yearData.year
        console.log(`\n📊 Traitement de l'année ${year}...`)
        
        try {
          const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            console.log(`   📋 Données Firebase existantes trouvées`)
            
            // Filtrer les prélèvements pour supprimer ceux de l'utilisateur
            const filteredRows = data.rows.filter(row => 
              !(row.isWithdrawal && (row.userId === userId || row.label.includes(userName)))
            )
            
            const removedCount = data.rows.length - filteredRows.length
            console.log(`   🗑️ ${removedCount} prélèvement(s) supprimé(s) pour ${userName}`)
            
            // Sauvegarder les données filtrées
            const updatedData = {
              year: data.year,
              rows: filteredRows,
              updatedAt: serverTimestamp(),
              archived: data.archived || false
            }
            
            await this.saveCommissionData(updatedData)
            console.log(`   ✅ Année ${year} mise à jour avec succès`)
          } else {
            console.log(`   ⏭️ Année ${year} n'existe pas dans Firebase`)
          }
        } catch (error) {
          console.error(`   ❌ Erreur pour l'année ${year}:`, error)
        }
      }
      
      console.log(`\n🎉 Suppression des prélèvements de ${userName} terminée !`)
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des prélèvements:', error)
      throw error
    }
  }

  /**
   * Mettre à jour les prélèvements depuis le fichier de référence
   */
  static async updateWithdrawalsFromReference(): Promise<void> {
    try {
      console.log('🔄 Mise à jour des prélèvements depuis le fichier de référence...')
      
      // Données de référence extraites du fichier docs/prelevements-reference.md
      const referenceData = {
        2025: {
          julien: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 20500, 0, 0, 0],
          jeanMichel: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 20500, 0, 0, 0]
        },
        2024: {
          julien: [11000, 20000, 12500, 12000, 12000, 17000, 12000, 12000, 12000, 5000, 17000, 13000],
          jeanMichel: [11000, 20000, 12500, 12000, 12000, 17000, 12000, 12000, 12000, 5000, 17000, 13000]
        },
        2023: {
          julien: [22000, 22000, 12000, 10000, 12500, 10000, 12500, 20000, 10000, 14000, 14000, 14000],
          jeanMichel: [22000, 22000, 12000, 10000, 12500, 10000, 12500, 20000, 10000, 14000, 14000, 14000]
        },
        2022: {
          julien: [13000, 25000, 13000, 13000, 12500, 13500, 23000, 12000, 13500, 13500, 6500, 12500],
          jeanMichel: [13000, 25000, 13000, 13000, 12500, 13500, 23000, 12000, 13500, 13500, 6500, 12500]
        }
      }
      
      // Récupérer les utilisateurs administrateurs
      const adminUsers = await this.getAdminUsers()
      console.log(`👑 Administrateurs trouvés: ${adminUsers.length}`)
      
      // Traiter chaque année
      for (const [yearStr, data] of Object.entries(referenceData)) {
        const year = parseInt(yearStr)
        console.log(`\n📊 Mise à jour de l'année ${year}...`)
        
        try {
          // Récupérer les données actuelles de Firebase
          const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const firebaseData = docSnap.data()
            console.log(`   📋 Données Firebase existantes trouvées`)
            
            // Créer un mapping des prélèvements mis à jour
            const withdrawalMapping = new Map()
            
            // Pour chaque administrateur, utiliser les données de référence
            adminUsers.forEach(admin => {
              let referenceValues: number[] = []
              
              if (admin.firstName === 'Julien') {
                referenceValues = data.julien
                console.log(`   ✅ Données de référence trouvées pour Julien`)
              } else if (admin.firstName === 'Jean-Michel') {
                referenceValues = data.jeanMichel
                console.log(`   ✅ Données de référence trouvées pour Jean-Michel`)
              } else {
                // Pour les autres administrateurs (comme Pierre), garder les valeurs existantes ou créer des zéros
                const existingWithdrawal = firebaseData.rows.find(row => 
                  row.isWithdrawal && row.label.includes(admin.firstName)
                )
                referenceValues = existingWithdrawal ? existingWithdrawal.values : new Array(12).fill(0)
                console.log(`   ➕ Nouvelles données pour ${admin.firstName}`)
              }
              
              withdrawalMapping.set(admin.uid, {
                label: `Prélèvements ${admin.firstName}`,
                values: referenceValues,
                total: referenceValues.reduce((sum, val) => sum + val, 0),
                isWithdrawal: true,
                userId: admin.uid,
                userEmail: admin.email
              })
            })
            
            // Reconstruire les lignes en préservant les autres données
            const nonWithdrawalRows = firebaseData.rows.filter(row => !row.isWithdrawal)
            const newRows = [...nonWithdrawalRows, ...Array.from(withdrawalMapping.values())]
            
            // Sauvegarder
            const updatedData = {
              year: firebaseData.year,
              rows: newRows,
              updatedAt: serverTimestamp(),
              archived: firebaseData.archived || false
            }
            
            await this.saveCommissionData(updatedData)
            console.log(`   ✅ Année ${year} mise à jour avec succès`)
          } else {
            console.log(`   ⏭️ Année ${year} n'existe pas dans Firebase`)
          }
        } catch (error) {
          console.error(`   ❌ Erreur pour l'année ${year}:`, error)
        }
      }
      
      console.log('\n🎉 Mise à jour des prélèvements depuis la référence terminée !')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour depuis la référence:', error)
      throw error
    }
  }

  /**
   * Restaurer les prélèvements de Julien et Jean-Michel depuis les données locales
   */
  static async restoreWithdrawalsFromLocal(): Promise<void> {
    try {
      console.log('🔄 Restauration des prélèvements depuis les données locales...')
      
      // Récupérer les données locales
      const localData = this.getLocalData()
      console.log(`📅 Données locales disponibles: ${Object.keys(localData).join(', ')}`)
      
      // Récupérer les utilisateurs administrateurs
      const adminUsers = await this.getAdminUsers()
      console.log(`👑 Administrateurs trouvés: ${adminUsers.length}`)
      
      // Traiter chaque année
      for (const [yearStr, data] of Object.entries(localData)) {
        const year = parseInt(yearStr)
        console.log(`\n📊 Restauration de l'année ${year}...`)
        
        try {
          // Récupérer les données actuelles de Firebase
          const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const firebaseData = docSnap.data()
            console.log(`   📋 Données Firebase existantes trouvées`)
            
            // Identifier les prélèvements locaux de Julien et Jean-Michel
            const localWithdrawals = data.rows.filter(row => 
              row.isWithdrawal && 
              (row.label.includes('Jean-Michel') || row.label.includes('Julien'))
            )
            
            console.log(`   📊 Prélèvements locaux à restaurer: ${localWithdrawals.length}`)
            localWithdrawals.forEach(row => {
              console.log(`      - ${row.label}`)
            })
            
            // Créer un mapping des prélèvements à restaurer
            const withdrawalMapping = new Map()
            
            // Pour chaque administrateur, essayer de trouver ses données locales
            adminUsers.forEach(admin => {
              const localData = localWithdrawals.find(row => 
                row.label.includes(admin.firstName) || 
                (row.label.includes('Jean-Michel') && admin.firstName === 'Jean-Michel') ||
                (row.label.includes('Julien') && admin.firstName === 'Julien')
              )
              
              if (localData) {
                console.log(`   ✅ Données locales trouvées pour ${admin.firstName}: ${localData.label}`)
                withdrawalMapping.set(admin.uid, {
                  label: `Prélèvements ${admin.firstName}`,
                  values: localData.values,
                  total: localData.values.reduce((sum, val) => sum + val, 0),
                  isWithdrawal: true,
                  userId: admin.uid,
                  userEmail: admin.email
                })
              } else {
                console.log(`   ➕ Nouvelles données pour ${admin.firstName}`)
                withdrawalMapping.set(admin.uid, {
                  label: `Prélèvements ${admin.firstName}`,
                  values: new Array(12).fill(0),
                  total: 0,
                  isWithdrawal: true,
                  userId: admin.uid,
                  userEmail: admin.email
                })
              }
            })
            
            // Reconstruire les lignes en préservant les autres données
            const nonWithdrawalRows = firebaseData.rows.filter(row => !row.isWithdrawal)
            const newRows = [...nonWithdrawalRows, ...Array.from(withdrawalMapping.values())]
            
            // Sauvegarder
            const updatedData = {
              year: firebaseData.year,
              rows: newRows,
              updatedAt: serverTimestamp(),
              archived: firebaseData.archived || false
            }
            
            await this.saveCommissionData(updatedData)
            console.log(`   ✅ Année ${year} restaurée avec succès`)
          } else {
            console.log(`   ⏭️ Année ${year} n'existe pas dans Firebase`)
          }
        } catch (error) {
          console.error(`   ❌ Erreur pour l'année ${year}:`, error)
        }
      }
      
      console.log('\n🎉 Restauration des prélèvements terminée !')
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error)
      throw error
    }
  }

  /**
   * Forcer la migration des prélèvements existants vers le nouveau format
   */
  static async migrateExistingWithdrawals(): Promise<void> {
    try {
      console.log('🔄 Migration des prélèvements existants...')
      
      // Récupérer toutes les années disponibles
      const years = await this.getAvailableYears()
      console.log(`📅 Années à traiter: ${years.map(y => y.year).join(', ')}`)
      
      // Récupérer les utilisateurs administrateurs
      const adminUsers = await this.getAdminUsers()
      console.log(`👑 Administrateurs trouvés: ${adminUsers.length}`)
      
      // Traiter chaque année
      for (const yearData of years) {
        const year = yearData.year
        console.log(`\n📊 Migration de l'année ${year}...`)
        
        try {
          const docRef = doc(db, COMMISSIONS_COLLECTION, year.toString())
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            console.log(`   📋 Données existantes trouvées`)
            
            // Identifier les prélèvements existants
            const existingWithdrawals = data.rows.filter(row => row.isWithdrawal)
            console.log(`   📊 Prélèvements existants: ${existingWithdrawals.length}`)
            
            // Créer un mapping des anciens prélèvements vers les nouveaux
            const withdrawalMapping = new Map()
            
            // Pour chaque administrateur, essayer de trouver ses données existantes
            adminUsers.forEach(admin => {
              const existingData = existingWithdrawals.find(row => 
                row.label.includes(admin.firstName) || 
                row.label.includes('Jean-Michel') && admin.firstName === 'Jean-Michel' ||
                row.label.includes('Julien') && admin.firstName === 'Julien'
              )
              
              if (existingData) {
                console.log(`   ✅ Données trouvées pour ${admin.firstName}: ${existingData.label}`)
                withdrawalMapping.set(admin.uid, {
                  label: `Prélèvements ${admin.firstName}`,
                  values: existingData.values,
                  total: existingData.values.reduce((sum, val) => sum + val, 0),
                  isWithdrawal: true,
                  userId: admin.uid,
                  userEmail: admin.email
                })
              } else {
                console.log(`   ➕ Nouvelles données pour ${admin.firstName}`)
                withdrawalMapping.set(admin.uid, {
                  label: `Prélèvements ${admin.firstName}`,
                  values: new Array(12).fill(0),
                  total: 0,
                  isWithdrawal: true,
                  userId: admin.uid,
                  userEmail: admin.email
                })
              }
            })
            
            // Reconstruire les lignes
            const nonWithdrawalRows = data.rows.filter(row => !row.isWithdrawal)
            const newRows = [...nonWithdrawalRows, ...Array.from(withdrawalMapping.values())]
            
            // Sauvegarder
            const updatedData = {
              year: data.year,
              rows: newRows,
              updatedAt: serverTimestamp(),
              archived: data.archived || false
            }
            
            await this.saveCommissionData(updatedData)
            console.log(`   ✅ Année ${year} migrée avec succès`)
          } else {
            console.log(`   ⏭️ Année ${year} n'existe pas`)
          }
        } catch (error) {
          console.error(`   ❌ Erreur pour l'année ${year}:`, error)
        }
      }
      
      console.log('\n🎉 Migration des prélèvements terminée !')
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error)
      throw error
    }
  }

  /**
   * Forcer la mise à jour des prélèvements pour toutes les années
   */
  static async refreshAllWithdrawals(): Promise<void> {
    try {
      console.log('🔄 Mise à jour forcée des prélèvements...')
      
      // Récupérer toutes les années disponibles
      const years = await this.getAvailableYears()
      console.log(`📅 Années à traiter: ${years.map(y => y.year).join(', ')}`)
      
      // Récupérer les utilisateurs administrateurs
      const adminUsers = await this.getAdminUsers()
      console.log(`👑 Administrateurs trouvés: ${adminUsers.length}`)
      adminUsers.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Rôle Front: "${user.roleFront}"`)
      })
      
      // Traiter chaque année
      for (const yearData of years) {
        const year = yearData.year
        console.log(`\n📊 Traitement de l'année ${year}...`)
        
        try {
          const existingData = await this.getCommissionData(year)
          if (existingData) {
            // Recalculer avec les utilisateurs actuels
            const baseRows = existingData.rows.map(row => ({
              label: row.label,
              values: row.values,
              isWithdrawal: row.isWithdrawal
            }))
            
            const updatedRows = this.calculateCommissionRows(baseRows, adminUsers)
            
            // Sauvegarder les mises à jour
            const updatedData = {
              year: existingData.year,
              rows: updatedRows,
              updatedAt: serverTimestamp(),
              archived: existingData.archived || false
            }
            
            await this.saveCommissionData(updatedData)
            console.log(`✅ Année ${year} mise à jour`)
          } else {
            console.log(`⏭️ Année ${year} n'existe pas, ignorée`)
          }
        } catch (error) {
          console.error(`❌ Erreur pour l'année ${year}:`, error)
        }
      }
      
      console.log('\n🎉 Mise à jour des prélèvements terminée !')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des prélèvements:', error)
      throw error
    }
  }

  /**
   * Migrer les données locales vers Firebase
   */
  static async migrateLocalDataToFirebase(): Promise<void> {
    try {
      console.log('Début de la migration des données locales vers Firebase')
      const localData = this.getLocalData()
      
      for (const [yearStr, data] of Object.entries(localData)) {
        const year = parseInt(yearStr)
        console.log(`Vérification de l'année ${year}`)
        
        try {
          // Vérifier si l'année existe déjà dans Firebase
          const existingData = await this.getCommissionData(year)
          
          if (!existingData) {
            // L'année n'existe pas, la créer
            await this.saveCommissionData(data)
            console.log(`✅ Année ${year} créée dans Firebase`)
          } else {
            // L'année existe, vérifier si elle a des données
            const hasData = existingData.rows.some(row => 
              row.values.some(val => val > 0)
            )
            
            if (!hasData) {
              // L'année existe mais est vide, la mettre à jour
              await this.saveCommissionData(data)
              console.log(`🔄 Année ${year} mise à jour dans Firebase`)
            } else {
              // L'année existe et a des données, ne pas la modifier
              console.log(`⏭️ Année ${year} existe déjà avec des données, ignorée`)
            }
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de l'année ${year}:`, error)
          // Continuer avec les autres années même en cas d'erreur
        }
      }
      
      console.log('Migration terminée')
    } catch (error) {
      console.error('Erreur lors de la migration:', error)
      throw error
    }
  }

  /**
   * Obtenir les données de commission depuis le dataset local (fallback)
   */
  static async getLocalCommissionData(year: number): Promise<CommissionData | null> {
    const localData = this.getLocalData()
    const data = localData[year]
    
    if (data) {
      // Récupérer les utilisateurs administrateurs pour mettre à jour les prélèvements
      const adminUsers = await this.getAdminUsers()
      
      // Recalculer les lignes avec les utilisateurs actuels
      const baseRows = data.rows.map(row => ({
        label: row.label,
        values: row.values,
        isWithdrawal: row.isWithdrawal
      }))
      
      const updatedRows = this.calculateCommissionRows(baseRows, adminUsers)
      
      return {
        ...data,
        rows: updatedRows
      }
    }
    
    return null
  }

  /**
   * Obtenir les données de commission depuis le dataset local (fallback) - version synchrone
   */
  static getLocalCommissionDataSync(year: number): CommissionData | null {
    const localData = this.getLocalData()
    const data = localData[year]
    
    if (data) {
      // Utiliser les données locales directement sans recalculer les prélèvements
      return data
    }
    
    return null
  }

  /**
   * Calculer automatiquement les totaux et résultats
   */
  static calculateCommissionRows(baseRows: Array<{ label: string; values: number[]; isWithdrawal?: boolean }>, adminUsers: User[] = []): CommissionRow[] {
    const rows: CommissionRow[] = []
    
    // Trouver les indices des commissions et charges
    const iardIndex = baseRows.findIndex(row => row.label === 'Commissions IARD')
    const vieIndex = baseRows.findIndex(row => row.label === 'Commissions Vie')
    const courtageIndex = baseRows.findIndex(row => row.label === 'Commissions Courtage')
    const exceptionnelsIndex = baseRows.findIndex(row => row.label === 'Produits exceptionnels')
    const chargesIndex = baseRows.findIndex(row => row.label === 'Charges agence')
    
    // Ajouter les commissions individuelles
    if (iardIndex !== -1) {
      const row = baseRows[iardIndex]
      rows.push({
        label: row.label,
        values: row.values,
        total: row.values.reduce((sum, val) => sum + val, 0),
        isCommission: true
      })
    }
    
    if (vieIndex !== -1) {
      const row = baseRows[vieIndex]
      rows.push({
        label: row.label,
        values: row.values,
        total: row.values.reduce((sum, val) => sum + val, 0),
        isCommission: true
      })
    }
    
    if (courtageIndex !== -1) {
      const row = baseRows[courtageIndex]
      rows.push({
        label: row.label,
        values: row.values,
        total: row.values.reduce((sum, val) => sum + val, 0),
        isCommission: true
      })
    }
    
    if (exceptionnelsIndex !== -1) {
      const row = baseRows[exceptionnelsIndex]
      rows.push({
        label: row.label,
        values: row.values,
        total: row.values.reduce((sum, val) => sum + val, 0),
        isCommission: true
      })
    }
    
    // Calculer le total des commissions
    const totalCommissions = new Array(12).fill(0)
    if (iardIndex !== -1) {
      baseRows[iardIndex].values.forEach((val, i) => totalCommissions[i] += val)
    }
    if (vieIndex !== -1) {
      baseRows[vieIndex].values.forEach((val, i) => totalCommissions[i] += val)
    }
    if (courtageIndex !== -1) {
      baseRows[courtageIndex].values.forEach((val, i) => totalCommissions[i] += val)
    }
    if (exceptionnelsIndex !== -1) {
      baseRows[exceptionnelsIndex].values.forEach((val, i) => totalCommissions[i] += val)
    }
    
    rows.push({
      label: 'Total commissions',
      values: totalCommissions,
      total: totalCommissions.reduce((sum, val) => sum + val, 0),
      isTotal: true
    })
    
    // Ajouter les charges
    if (chargesIndex !== -1) {
      const row = baseRows[chargesIndex]
      rows.push({
        label: row.label,
        values: row.values,
        total: row.values.reduce((sum, val) => sum + val, 0),
        isCharges: true
      })
    }
    
    // Calculer le résultat (Total commissions - Charges)
    const charges = chargesIndex !== -1 ? baseRows[chargesIndex].values : new Array(12).fill(0)
    const result = totalCommissions.map((total, i) => total - charges[i])
    
    rows.push({
      label: 'Résultat',
      values: result,
      total: result.reduce((sum, val) => sum + val, 0),
      isResult: true
    })
    
    // D'abord, traiter les anciens prélèvements pour préserver les données existantes
    const existingWithdrawals = new Map()
    console.log(`🔍 Analyse des anciens prélèvements (${baseRows.filter(r => r.isWithdrawal).length} trouvés)`)
    
    baseRows.forEach(row => {
      if (row.isWithdrawal) {
        console.log(`   📋 Ancien prélèvement: "${row.label}"`)
        
        // Vérifier si ce prélèvement correspond à un administrateur actuel
        const matchingAdmin = adminUsers.find(user => {
          const matches = row.label.includes(user.firstName)
          console.log(`      🔍 Test ${user.firstName}: ${matches}`)
          return matches
        })
        
        if (matchingAdmin) {
          // C'est un administrateur actuel, préserver ses données
          console.log(`      ✅ Correspondance trouvée: ${matchingAdmin.firstName}`)
          existingWithdrawals.set(matchingAdmin.uid, {
            label: `Prélèvements ${matchingAdmin.firstName}`,
            values: row.values,
            total: row.values.reduce((sum, val) => sum + val, 0),
            isWithdrawal: true,
            userId: matchingAdmin.uid,
            userEmail: matchingAdmin.email
          })
        } else {
          // C'est un ancien prélèvement qui n'a pas d'administrateur correspondant
          console.log(`      ⏭️ Aucune correspondance, ajout direct`)
          rows.push({
            label: row.label,
            values: row.values,
            total: row.values.reduce((sum, val) => sum + val, 0),
            isWithdrawal: true
          })
        }
      }
    })
    
    console.log(`📊 Prélèvements existants préservés: ${existingWithdrawals.size}`)
    
    // Ensuite, ajouter les prélèvements pour chaque administrateur (nouveaux ou existants)
    console.log(`🔄 Génération des prélèvements pour ${adminUsers.length} administrateurs`)
    adminUsers.forEach(user => {
      console.log(`➕ Ajout prélèvements pour: ${user.firstName} ${user.lastName} (${user.email})`)
      
      if (existingWithdrawals.has(user.uid)) {
        // Utiliser les données existantes
        const existingData = existingWithdrawals.get(user.uid)
        rows.push(existingData)
        console.log(`   ✅ Données existantes préservées pour ${user.firstName}`)
      } else {
        // Créer de nouvelles données
        const values = new Array(12).fill(0)
        rows.push({
          label: `Prélèvements ${user.firstName}`,
          values: values,
          total: 0,
          isWithdrawal: true,
          userId: user.uid,
          userEmail: user.email
        })
        console.log(`   ➕ Nouvelles données créées pour ${user.firstName}`)
      }
    })
    
    return rows
  }

  /**
   * Données locales de commission (fallback)
   */
  private static getLocalData(): Record<number, CommissionData> {
    return {
      2022: {
        year: 2022,
        rows: this.calculateCommissionRows([
          { label: 'Commissions IARD', values: [58546, 52371, 50389, 45942, 43853, 44665, 83728, 44814, 46798, 47574, 43729, 47409] },
          { label: 'Commissions Vie', values: [4680, 29497, 2359, 9783, 7802, 3805, 4297, 8046, 2705, 3135, 8372, 2730] },
          { label: 'Commissions Courtage', values: [2707, 3844, 2403, 3713, 4406, 3628, 2758, 7553, 2998, 3602, 5390, 5043] },
          { label: 'Produits exceptionnels', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { label: 'Charges agence', values: [27391, 35936, 27295, 43619, 34926, 40174, 32446, 37051, 32880, 42554, 35522, 39196] },
          { label: 'Prélèvements Julien', values: [13000, 25000, 13000, 13000, 12500, 13500, 23000, 12000, 13500, 13500, 6500, 12500], isWithdrawal: true },
          { label: 'Prélèvements Jean-Michel', values: [13000, 25000, 13000, 13000, 12500, 13500, 23000, 12000, 13500, 13500, 6500, 12500], isWithdrawal: true }
        ]),
        updatedAt: new Date().toISOString()
      },
      2023: {
        year: 2023,
        rows: this.calculateCommissionRows([
          { label: 'Commissions IARD', values: [50747, 62205, 52309, 55232, 52594, 52029, 75777, 55400, 56408, 55409, 59763, 52203] },
          { label: 'Commissions Vie', values: [4298, 27998, 2533, 12705, 9904, 4588, 4519, 8401, 3146, 3371, 9642, 2885] },
          { label: 'Commissions Courtage', values: [3523, 5412, 5444, 7049, 4007, 6717, 5964, 6168, 5569, 4727, 4963, 5558] },
          { label: 'Produits exceptionnels', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { label: 'Charges agence', values: [31442, 45490, 41445, 38560, 49492, 37779, 51224, 49519, 41293, 44010, 34293, 62724] },
          { label: 'Prélèvements Julien', values: [22000, 22000, 12000, 10000, 12500, 10000, 12500, 20000, 10000, 14000, 14000, 14000], isWithdrawal: true },
          { label: 'Prélèvements Jean-Michel', values: [22000, 22000, 12000, 10000, 12500, 10000, 12500, 20000, 10000, 14000, 14000, 14000], isWithdrawal: true }
        ]),
        updatedAt: new Date().toISOString()
      },
      2024: {
        year: 2024,
        rows: this.calculateCommissionRows([
          { label: 'Commissions IARD', values: [69096, 65309, 61564, 58206, 58536, 63747, 78374, 61693, 66719, 61674, 64675, 68915] },
          { label: 'Commissions Vie', values: [4594, 29334, 2857, 16836, 14167, 2103, 7997, 9373, 2656, 5594, 3857, 8546] },
          { label: 'Commissions Courtage', values: [3480, 5260, 4446, 8321, 7013, 3765, 4468, 10340, 3685, 4908, 6469, 3919] },
          { label: 'Produits exceptionnels', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { label: 'Charges agence', values: [51946, 56200, 40711, 54384, 54350, 51219, 56893, 50871, 56607, 55565, 73049, 52004] },
          { label: 'Prélèvements Julien', values: [11000, 20000, 12500, 12000, 12000, 17000, 12000, 12000, 12000, 12000, 5000, 13000], isWithdrawal: true },
          { label: 'Prélèvements Jean-Michel', values: [11000, 20000, 12500, 12000, 12000, 17000, 12000, 12000, 12000, 12000, 5000, 13000], isWithdrawal: true }
        ]),
        updatedAt: new Date().toISOString()
      },
      2025: {
        year: 2025,
        rows: this.calculateCommissionRows([
          { label: 'Commissions IARD', values: [83717, 75088, 76902, 76694, 71661, 76841, 98375, 80991, 0, 0, 0, 0] },
          { label: 'Commissions Vie', values: [5815, 31813, 3461, 5565, 10027, 3409, 7062, 9824, 0, 0, 0, 0] },
          { label: 'Commissions Courtage', values: [6928, 6851, 4476, 4548, 5941, 4001, 4744, 11074, 0, 0, 0, 0] },
          { label: 'Produits exceptionnels', values: [0, 0, 0, 628, 0, 0, 0, 0, 0, 0, 0, 0] },
          { label: 'Charges agence', values: [54376, 63488, 64301, 57102, 57209, 67596, 61143, 66702, 0, 0, 0, 0] },
          { label: 'Prélèvements Julien', values: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 20500, 0, 0, 0], isWithdrawal: true },
          { label: 'Prélèvements Jean-Michel', values: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 20500, 0, 0, 0], isWithdrawal: true }
        ]),
        updatedAt: new Date().toISOString()
      }
    }
  }
}
