import { db } from './firebase'
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { CommissionData, CommissionRow, CommissionYear } from '@/types/commission'

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
        return {
          year: data.year,
          rows: data.rows,
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
      
      return querySnapshot.docs.map(doc => ({
        year: doc.data().year,
        available: true
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error)
      return []
    }
  }

  /**
   * Sauvegarder les données de commission pour une année
   */
  static async saveCommissionData(commissionData: CommissionData): Promise<void> {
    try {
      const docRef = doc(db, COMMISSIONS_COLLECTION, commissionData.year.toString())
      await setDoc(docRef, {
        ...commissionData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de commission:', error)
      throw error
    }
  }

  /**
   * Obtenir les données de commission depuis le dataset local (fallback)
   */
  static getLocalCommissionData(year: number): CommissionData | null {
    const localData = this.getLocalData()
    return localData[year] || null
  }

  /**
   * Calculer automatiquement les totaux et résultats
   */
  private static calculateCommissionRows(baseRows: Array<{ label: string; values: number[]; isWithdrawal?: boolean }>): CommissionRow[] {
    const rows: CommissionRow[] = []
    
    // Trouver les indices des commissions et charges
    const iardIndex = baseRows.findIndex(row => row.label === 'Commissions IARD')
    const vieIndex = baseRows.findIndex(row => row.label === 'Commissions Vie')
    const courtageIndex = baseRows.findIndex(row => row.label === 'Commissions Courtage')
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
    
    // Ajouter les prélèvements (à titre indicatif)
    baseRows.forEach(row => {
      if (row.isWithdrawal) {
        rows.push({
          label: row.label,
          values: row.values,
          total: row.values.reduce((sum, val) => sum + val, 0),
          isWithdrawal: true
        })
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
          { label: 'Charges agence', values: [54376, 63488, 64301, 57102, 57209, 67596, 61143, 66702, 0, 0, 0, 0] },
          { label: 'Prélèvements Julien', values: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 0, 0, 0, 0], isWithdrawal: true },
          { label: 'Prélèvements Jean-Michel', values: [18000, 13000, 13000, 14400, 12000, 18000, 15500, 17000, 0, 0, 0, 0], isWithdrawal: true }
        ]),
        updatedAt: new Date().toISOString()
      }
    }
  }
}
