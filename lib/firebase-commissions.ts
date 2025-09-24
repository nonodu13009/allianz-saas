import { collection, doc, setDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebase';

export interface CommissionData {
  id?: string;
  year: number;
  month: string;
  commissions_iard: number;
  commissions_vie: number;
  commissions_courtage: number;
  profits_exceptionnels: number;
  charges_agence: number;
  prelevements_julien: number;
  prelevements_jean_michel: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommissionYear {
  year: number;
  months: CommissionData[];
  total_commissions: number;
  total_charges: number;
  total_resultat: number;
  total_prelevements: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Calculs automatiques
export const calculateTotals = (data: CommissionData) => {
  const total_commissions = data.commissions_iard + data.commissions_vie + data.commissions_courtage + data.profits_exceptionnels;
  const total_prelevements = data.prelevements_julien + data.prelevements_jean_michel;
  const resultat = total_commissions - data.charges_agence;
  
  return {
    total_commissions,
    total_prelevements,
    resultat
  };
};

export const calculateYearTotals = (months: CommissionData[]) => {
  const totals = months.reduce((acc, month) => {
    const monthTotals = calculateTotals(month);
    return {
      total_commissions: acc.total_commissions + monthTotals.total_commissions,
      total_charges: acc.total_charges + month.charges_agence,
      total_prelevements: acc.total_prelevements + monthTotals.total_prelevements,
      total_resultat: acc.total_resultat + monthTotals.resultat
    };
  }, {
    total_commissions: 0,
    total_charges: 0,
    total_prelevements: 0,
    total_resultat: 0
  });

  return totals;
};

// Fonctions CRUD
export const createCommission = async (data: CommissionData) => {
  try {
    const totals = calculateTotals(data);
    const commissionDoc = {
      ...data,
      ...totals,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'commissions'), commissionDoc);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la commission:', error);
    throw error;
  }
};

export const updateCommission = async (id: string, data: Partial<CommissionData>) => {
  try {
    const totals = calculateTotals(data as CommissionData);
    const updateData = {
      ...data,
      ...totals,
      updatedAt: new Date()
    };

    await updateDoc(doc(db, 'commissions', id), updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commission:', error);
    throw error;
  }
};

export const deleteCommission = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'commissions', id));
  } catch (error) {
    console.error('Erreur lors de la suppression de la commission:', error);
    throw error;
  }
};

export const getCommissions = async (options?: {
  limit?: number;
  startAfter?: any;
  year?: number;
}): Promise<{
  commissions: CommissionData[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}> => {
  try {
    const { limit: limitValue = 100, startAfter, year } = options || {};
    
    let q = query(
      collection(db, 'commissions'),
      orderBy('year', 'desc'),
      orderBy('month', 'desc'),
      limit(limitValue)
    );
    
    if (startAfter) {
      q = query(
        collection(db, 'commissions'),
        orderBy('year', 'desc'),
        orderBy('month', 'desc'),
        startAfter(startAfter),
        limit(limitValue)
      );
    }
    
    if (year) {
      q = query(
        collection(db, 'commissions'),
        where('year', '==', year),
        orderBy('month', 'desc'),
        limit(limitValue)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const commissions: CommissionData[] = [];
    querySnapshot.forEach((doc) => {
      commissions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as CommissionData);
    });
    
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === limitValue;
    
    // Compter le total
    const countSnapshot = await getDocs(collection(db, 'commissions'));
    const total = countSnapshot.size;
    
    return {
      commissions: commissions.sort((a, b) => a.year - b.year || a.month.localeCompare(b.month)),
      lastDoc,
      hasMore,
      total
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des commissions:', error);
    return {
      commissions: [],
      lastDoc: null,
      hasMore: false,
      total: 0
    };
  }
};

export const getCommissionsByYear = async (year: number): Promise<CommissionData[]> => {
  try {
    // Récupérer toutes les commissions et filtrer côté client pour éviter le besoin d'index
    const allCommissions = await getCommissions();
    return allCommissions.filter(commission => commission.year === year);
  } catch (error) {
    console.error('Erreur lors de la récupération des commissions par année:', error);
    return [];
  }
};

export const getAvailableYears = async (): Promise<number[]> => {
  try {
    const commissions = await getCommissions();
    const years = [...new Set(commissions.map(c => c.year))];
    return years.sort((a, b) => b - a); // Plus récent en premier
  } catch (error) {
    console.error('Erreur lors de la récupération des années:', error);
    return [];
  }
};

// Données par défaut pour migration
export const defaultCommissionsData = {
  2022: [
    { month: 'Janvier', commissions_iard: 58546, commissions_vie: 4680, commissions_courtage: 2707, profits_exceptionnels: 0, charges_agence: 27391, prelevements_julien: 13000, prelevements_jean_michel: 13000 },
    { month: 'Février', commissions_iard: 52371, commissions_vie: 29497, commissions_courtage: 3844, profits_exceptionnels: 0, charges_agence: 35936, prelevements_julien: 25000, prelevements_jean_michel: 25000 },
    { month: 'Mars', commissions_iard: 50389, commissions_vie: 2359, commissions_courtage: 2403, profits_exceptionnels: 0, charges_agence: 27295, prelevements_julien: 13000, prelevements_jean_michel: 13000 },
    { month: 'Avril', commissions_iard: 45942, commissions_vie: 9783, commissions_courtage: 3713, profits_exceptionnels: 0, charges_agence: 43619, prelevements_julien: 13000, prelevements_jean_michel: 13000 },
    { month: 'Mai', commissions_iard: 43853, commissions_vie: 7802, commissions_courtage: 4406, profits_exceptionnels: 0, charges_agence: 34926, prelevements_julien: 12500, prelevements_jean_michel: 12500 },
    { month: 'Juin', commissions_iard: 44665, commissions_vie: 3805, commissions_courtage: 3628, profits_exceptionnels: 0, charges_agence: 40174, prelevements_julien: 13500, prelevements_jean_michel: 13500 },
    { month: 'Juillet', commissions_iard: 83728, commissions_vie: 4297, commissions_courtage: 2758, profits_exceptionnels: 0, charges_agence: 32446, prelevements_julien: 23000, prelevements_jean_michel: 23000 },
    { month: 'Août', commissions_iard: 44814, commissions_vie: 8046, commissions_courtage: 7553, profits_exceptionnels: 0, charges_agence: 37051, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Septembre', commissions_iard: 46798, commissions_vie: 2705, commissions_courtage: 2998, profits_exceptionnels: 0, charges_agence: 32880, prelevements_julien: 13500, prelevements_jean_michel: 13500 },
    { month: 'Octobre', commissions_iard: 47574, commissions_vie: 3135, commissions_courtage: 3602, profits_exceptionnels: 0, charges_agence: 42554, prelevements_julien: 13500, prelevements_jean_michel: 13500 },
    { month: 'Novembre', commissions_iard: 43729, commissions_vie: 8372, commissions_courtage: 5390, profits_exceptionnels: 0, charges_agence: 35522, prelevements_julien: 6500, prelevements_jean_michel: 6500 },
    { month: 'Décembre', commissions_iard: 47409, commissions_vie: 2730, commissions_courtage: 5043, profits_exceptionnels: 0, charges_agence: 39196, prelevements_julien: 12500, prelevements_jean_michel: 12500 }
  ],
  2023: [
    { month: 'Janvier', commissions_iard: 50747, commissions_vie: 4298, commissions_courtage: 3523, profits_exceptionnels: 0, charges_agence: 31442, prelevements_julien: 22000, prelevements_jean_michel: 22000 },
    { month: 'Février', commissions_iard: 62205, commissions_vie: 27998, commissions_courtage: 5412, profits_exceptionnels: 0, charges_agence: 45490, prelevements_julien: 22000, prelevements_jean_michel: 22000 },
    { month: 'Mars', commissions_iard: 52309, commissions_vie: 2533, commissions_courtage: 5444, profits_exceptionnels: 0, charges_agence: 41445, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Avril', commissions_iard: 55232, commissions_vie: 12705, commissions_courtage: 7049, profits_exceptionnels: 0, charges_agence: 38560, prelevements_julien: 10000, prelevements_jean_michel: 10000 },
    { month: 'Mai', commissions_iard: 52594, commissions_vie: 9904, commissions_courtage: 4007, profits_exceptionnels: 0, charges_agence: 49492, prelevements_julien: 12500, prelevements_jean_michel: 12500 },
    { month: 'Juin', commissions_iard: 52029, commissions_vie: 4588, commissions_courtage: 6717, profits_exceptionnels: 0, charges_agence: 37779, prelevements_julien: 10000, prelevements_jean_michel: 10000 },
    { month: 'Juillet', commissions_iard: 75777, commissions_vie: 4519, commissions_courtage: 5964, profits_exceptionnels: 0, charges_agence: 51224, prelevements_julien: 12500, prelevements_jean_michel: 12500 },
    { month: 'Août', commissions_iard: 55400, commissions_vie: 8401, commissions_courtage: 6168, profits_exceptionnels: 0, charges_agence: 49519, prelevements_julien: 20000, prelevements_jean_michel: 20000 },
    { month: 'Septembre', commissions_iard: 56408, commissions_vie: 3146, commissions_courtage: 5569, profits_exceptionnels: 0, charges_agence: 41293, prelevements_julien: 10000, prelevements_jean_michel: 10000 },
    { month: 'Octobre', commissions_iard: 55409, commissions_vie: 3371, commissions_courtage: 4727, profits_exceptionnels: 0, charges_agence: 44010, prelevements_julien: 14000, prelevements_jean_michel: 14000 },
    { month: 'Novembre', commissions_iard: 59763, commissions_vie: 9642, commissions_courtage: 4963, profits_exceptionnels: 0, charges_agence: 34293, prelevements_julien: 14000, prelevements_jean_michel: 14000 },
    { month: 'Décembre', commissions_iard: 52203, commissions_vie: 2885, commissions_courtage: 5558, profits_exceptionnels: 0, charges_agence: 62724, prelevements_julien: 14000, prelevements_jean_michel: 14000 }
  ],
  2024: [
    { month: 'Janvier', commissions_iard: 69096, commissions_vie: 4594, commissions_courtage: 3480, profits_exceptionnels: 0, charges_agence: 51946, prelevements_julien: 11000, prelevements_jean_michel: 11000 },
    { month: 'Février', commissions_iard: 65309, commissions_vie: 29334, commissions_courtage: 5260, profits_exceptionnels: 0, charges_agence: 56200, prelevements_julien: 20000, prelevements_jean_michel: 20000 },
    { month: 'Mars', commissions_iard: 61564, commissions_vie: 2857, commissions_courtage: 4446, profits_exceptionnels: 0, charges_agence: 40711, prelevements_julien: 12500, prelevements_jean_michel: 12500 },
    { month: 'Avril', commissions_iard: 58206, commissions_vie: 16836, commissions_courtage: 8321, profits_exceptionnels: 0, charges_agence: 54384, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Mai', commissions_iard: 58536, commissions_vie: 14167, commissions_courtage: 7013, profits_exceptionnels: 0, charges_agence: 54350, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Juin', commissions_iard: 63747, commissions_vie: 2103, commissions_courtage: 3765, profits_exceptionnels: 0, charges_agence: 51219, prelevements_julien: 17000, prelevements_jean_michel: 17000 },
    { month: 'Juillet', commissions_iard: 78374, commissions_vie: 7997, commissions_courtage: 4468, profits_exceptionnels: 0, charges_agence: 56893, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Août', commissions_iard: 61693, commissions_vie: 9373, commissions_courtage: 10340, profits_exceptionnels: 0, charges_agence: 50871, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Septembre', commissions_iard: 66719, commissions_vie: 2656, commissions_courtage: 3685, profits_exceptionnels: 0, charges_agence: 56607, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Octobre', commissions_iard: 61674, commissions_vie: 5594, commissions_courtage: 4908, profits_exceptionnels: 0, charges_agence: 55565, prelevements_julien: 5000, prelevements_jean_michel: 5000 },
    { month: 'Novembre', commissions_iard: 64675, commissions_vie: 3857, commissions_courtage: 6469, profits_exceptionnels: 0, charges_agence: 73049, prelevements_julien: 17000, prelevements_jean_michel: 17000 },
    { month: 'Décembre', commissions_iard: 68915, commissions_vie: 8546, commissions_courtage: 3919, profits_exceptionnels: 0, charges_agence: 52004, prelevements_julien: 13000, prelevements_jean_michel: 13000 }
  ],
  2025: [
    { month: 'Janvier', commissions_iard: 83717, commissions_vie: 5815, commissions_courtage: 6928, profits_exceptionnels: 0, charges_agence: 54376, prelevements_julien: 18000, prelevements_jean_michel: 18000 },
    { month: 'Février', commissions_iard: 75088, commissions_vie: 31813, commissions_courtage: 6851, profits_exceptionnels: 0, charges_agence: 63488, prelevements_julien: 13000, prelevements_jean_michel: 13000 },
    { month: 'Mars', commissions_iard: 76902, commissions_vie: 3461, commissions_courtage: 4476, profits_exceptionnels: 0, charges_agence: 64301, prelevements_julien: 13000, prelevements_jean_michel: 13000 },
    { month: 'Avril', commissions_iard: 76694, commissions_vie: 5565, commissions_courtage: 4548, profits_exceptionnels: 628, charges_agence: 57102, prelevements_julien: 14400, prelevements_jean_michel: 14400 },
    { month: 'Mai', commissions_iard: 71661, commissions_vie: 10027, commissions_courtage: 5941, profits_exceptionnels: 0, charges_agence: 57209, prelevements_julien: 12000, prelevements_jean_michel: 12000 },
    { month: 'Juin', commissions_iard: 76841, commissions_vie: 3409, commissions_courtage: 4001, profits_exceptionnels: 0, charges_agence: 67596, prelevements_julien: 18000, prelevements_jean_michel: 18000 },
    { month: 'Juillet', commissions_iard: 98375, commissions_vie: 7062, commissions_courtage: 4744, profits_exceptionnels: 0, charges_agence: 61143, prelevements_julien: 15500, prelevements_jean_michel: 15500 },
    { month: 'Août', commissions_iard: 80991, commissions_vie: 9824, commissions_courtage: 11074, profits_exceptionnels: 0, charges_agence: 66702, prelevements_julien: 17000, prelevements_jean_michel: 17000 },
    { month: 'Septembre', commissions_iard: 0, commissions_vie: 0, commissions_courtage: 0, profits_exceptionnels: 0, charges_agence: 0, prelevements_julien: 20500, prelevements_jean_michel: 20500 },
    { month: 'Octobre', commissions_iard: 0, commissions_vie: 0, commissions_courtage: 0, profits_exceptionnels: 0, charges_agence: 0, prelevements_julien: 0, prelevements_jean_michel: 0 },
    { month: 'Novembre', commissions_iard: 0, commissions_vie: 0, commissions_courtage: 0, profits_exceptionnels: 0, charges_agence: 0, prelevements_julien: 0, prelevements_jean_michel: 0 },
    { month: 'Décembre', commissions_iard: 0, commissions_vie: 0, commissions_courtage: 0, profits_exceptionnels: 0, charges_agence: 0, prelevements_julien: 0, prelevements_jean_michel: 0 }
  ]
};

export const migrateCommissionsData = async () => {
  try {
    const existingCommissions = await getCommissions();
    if (existingCommissions.length > 0) {
      console.log('Les données de commissions existent déjà');
      return;
    }

    for (const [yearStr, months] of Object.entries(defaultCommissionsData)) {
      const year = parseInt(yearStr);
      for (const monthData of months) {
        await createCommission({
          year,
          month: monthData.month,
          commissions_iard: monthData.commissions_iard,
          commissions_vie: monthData.commissions_vie,
          commissions_courtage: monthData.commissions_courtage,
          profits_exceptionnels: monthData.profits_exceptionnels,
          charges_agence: monthData.charges_agence,
          prelevements_julien: monthData.prelevements_julien,
          prelevements_jean_michel: monthData.prelevements_jean_michel
        });
      }
    }
    console.log('Migration des données de commissions terminée');
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    throw error;
  }
};
