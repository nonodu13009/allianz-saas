import { collection, doc, setDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CommercialActivity {
  id?: string;
  userId: string; // UID du commercial
  dateCreated: Date; // Date de saisie (auto)
  clientName: string; // Nom capitalisé
  contractNumber: string;
  effectDate: Date;
  actType: 'an' | 'm+3' | 'preterme_auto' | 'preterme_iard';
  productType: 'auto_moto' | 'iard_part' | 'iard_pro' | 'pj' | 'gav' | 'sante_prevoyance' | 'nop50eur' | 'vie_pp' | 'vie_pu';
  company: 'allianz' | 'unim_uniced' | 'courtage';
  annualPremium: number;
  potentialCommission: number; // Calculée auto
  isCommissionReal: boolean; // Calculée selon les règles
  month: string; // Format: "YYYY-MM" pour faciliter les requêtes
  year: number;
}

// Mapping des types de produits vers les commissions potentielles
export const productCommissionMapping = {
  'auto_moto': 10,
  'iard_part': 20,
  'iard_pro': 20, // + 10€ par tranche de 1000€ au-delà de 999€
  'pj': 30,
  'gav': 40,
  'sante_prevoyance': 50,
  'nop50eur': 10,
  'vie_pp': 50,
  'vie_pu': 0.01 // 1% du versement
} as const;

// Calculer la commission potentielle selon le type de produit
export const calculatePotentialCommission = (productType: string, annualPremium: number): number => {
  const baseCommission = productCommissionMapping[productType as keyof typeof productCommissionMapping];
  
  if (productType === 'iard_pro') {
    // 20€ + 10€ par tranche de 1000€ au-delà de 999€
    if (annualPremium > 999) {
      const additionalTranches = Math.floor((annualPremium - 999) / 1000);
      return baseCommission + (additionalTranches * 10);
    }
    return baseCommission;
  }
  
  if (productType === 'vie_pu') {
    // 1% du versement
    return Math.round(annualPremium * baseCommission);
  }
  
  return baseCommission;
};

// Capitaliser le nom du client (gestion des noms composés)
export const capitalizeClientName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Vérifier si les commissions deviennent réelles
export const checkCommissionReal = (activities: CommercialActivity[]): boolean => {
  // Condition 1: Minimum 15 process dans le mois
  const processCount = activities.filter(activity => 
    ['m+3', 'preterme_auto', 'preterme_iard'].includes(activity.actType)
  ).length;
  
  if (processCount < 15) return false;
  
  // Condition 2: Ratio contrats autres / contrats auto >= 100%
  const autoContracts = activities.filter(activity => activity.productType === 'auto_moto').length;
  const otherContracts = activities.filter(activity => activity.productType !== 'auto_moto').length;
  
  const ratio = autoContracts === 0 ? 1 : otherContracts / autoContracts; // 100% par défaut si 0 auto
  
  if (ratio < 1) return false;
  
  // Condition 3: Commissions potentielles >= 200€
  const totalPotentialCommission = activities.reduce((sum, activity) => sum + activity.potentialCommission, 0);
  
  return totalPotentialCommission >= 200;
};

// Créer une nouvelle activité commerciale
export const createCommercialActivity = async (activityData: Omit<CommercialActivity, 'id' | 'dateCreated' | 'potentialCommission' | 'isCommissionReal' | 'month' | 'year'>) => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const activity: CommercialActivity = {
      ...activityData,
      dateCreated: now,
      clientName: capitalizeClientName(activityData.clientName),
      potentialCommission: calculatePotentialCommission(activityData.productType, activityData.annualPremium),
      month,
      year: now.getFullYear(),
      isCommissionReal: false // Sera calculé après sauvegarde
    };

    const docRef = await addDoc(collection(db, 'commercial_activities'), activity);
    
    // Recalculer isCommissionReal pour toutes les activités du mois
    await updateCommissionRealStatus(activityData.userId, month);
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité commerciale:', error);
    throw error;
  }
};

// Mettre à jour une activité commerciale
export const updateCommercialActivity = async (id: string, activityData: Partial<CommercialActivity>) => {
  try {
    const activityRef = doc(db, 'commercial_activities', id);
    
    // Si on modifie le nom du client, le capitaliser
    if (activityData.clientName) {
      activityData.clientName = capitalizeClientName(activityData.clientName);
    }
    
    // Si on modifie le type de produit ou la prime, recalculer la commission
    if (activityData.productType || activityData.annualPremium !== undefined) {
      const currentActivity = await getCommercialActivityById(id);
      if (currentActivity) {
        activityData.potentialCommission = calculatePotentialCommission(
          activityData.productType || currentActivity.productType,
          activityData.annualPremium !== undefined ? activityData.annualPremium : currentActivity.annualPremium
        );
      }
    }
    
    await updateDoc(activityRef, { ...activityData, updatedAt: new Date() });
    
    // Recalculer isCommissionReal si nécessaire
    if (activityData.userId && activityData.month) {
      await updateCommissionRealStatus(activityData.userId, activityData.month);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité commerciale:', error);
    throw error;
  }
};

// Supprimer une activité commerciale
export const deleteCommercialActivity = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'commercial_activities', id));
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité commerciale:', error);
    throw error;
  }
};

// Récupérer toutes les activités d'un utilisateur pour un mois donné
export const getCommercialActivitiesByUserAndMonth = async (userId: string, month: string): Promise<CommercialActivity[]> => {
  try {
    const q = query(
      collection(db, 'commercial_activities'),
      where('userId', '==', userId),
      where('month', '==', month),
      orderBy('dateCreated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities: CommercialActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated?.toDate(),
        effectDate: doc.data().effectDate?.toDate(),
      } as CommercialActivity);
    });
    
    return activities;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités commerciales:', error);
    return [];
  }
};

// Récupérer toutes les activités d'un utilisateur pour une année donnée
export const getCommercialActivitiesByUserAndYear = async (userId: string, year: number): Promise<CommercialActivity[]> => {
  try {
    const q = query(
      collection(db, 'commercial_activities'),
      where('userId', '==', userId),
      where('year', '==', year),
      orderBy('dateCreated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities: CommercialActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated?.toDate(),
        effectDate: doc.data().effectDate?.toDate(),
      } as CommercialActivity);
    });
    
    return activities;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités commerciales:', error);
    return [];
  }
};

// Récupérer une activité par son ID
export const getCommercialActivityById = async (id: string): Promise<CommercialActivity | null> => {
  try {
    const docRef = doc(db, 'commercial_activities', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const docData = docSnap.data();
      return {
        id: docSnap.id,
        ...docData,
        dateCreated: docData.dateCreated?.toDate(),
        effectDate: docData.effectDate?.toDate(),
      } as CommercialActivity;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité commerciale:', error);
    return null;
  }
};

// Mettre à jour le statut des commissions réelles pour un utilisateur et un mois
export const updateCommissionRealStatus = async (userId: string, month: string) => {
  try {
    const activities = await getCommercialActivitiesByUserAndMonth(userId, month);
    const isReal = checkCommissionReal(activities);
    
    // Mettre à jour toutes les activités du mois
    const updatePromises = activities.map(activity => {
      if (activity.id) {
        return updateDoc(doc(db, 'commercial_activities', activity.id), {
          isCommissionReal: isReal
        });
      }
    });
    
    await Promise.all(updatePromises.filter(Boolean));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut des commissions:', error);
  }
};

// Calculer les KPIs pour un mois donné
export const calculateMonthlyKPIs = (activities: CommercialActivity[]) => {
  const totalCA = activities.reduce((sum, activity) => sum + activity.annualPremium, 0);
  const totalContracts = activities.length;
  const contractsOtherThanAuto = activities.filter(activity => activity.productType !== 'auto_moto').length;
  const potentialCommissions = activities.reduce((sum, activity) => sum + activity.potentialCommission, 0);
  const realCommissions = activities.reduce((sum, activity) => sum + (activity.isCommissionReal ? activity.potentialCommission : 0), 0);
  
  const autoContracts = activities.filter(activity => activity.productType === 'auto_moto').length;
  const ratio = autoContracts === 0 ? 1 : contractsOtherThanAuto / autoContracts;
  
  const processCount = activities.filter(activity => 
    ['m+3', 'preterme_auto', 'preterme_iard'].includes(activity.actType)
  ).length;
  
  // KPIs avancés
  const averageContractValue = totalContracts > 0 ? totalCA / totalContracts : 0;
  const commissionRate = totalCA > 0 ? (realCommissions / totalCA) * 100 : 0;
  
  // Répartition par type de produit
  const productDistribution = activities.reduce((acc, activity) => {
    acc[activity.productType] = (acc[activity.productType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  // Répartition par société
  const companyDistribution = activities.reduce((acc, activity) => {
    acc[activity.company] = (acc[activity.company] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  // Répartition par type d'acte
  const actTypeDistribution = activities.reduce((acc, activity) => {
    acc[activity.actType] = (acc[activity.actType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  // Objectifs et seuils
  const objectives = {
    minProcesses: 15,
    minRatio: 1.0,
    minCommissions: 200,
    targetCA: 50000, // Objectif CA mensuel
    targetContracts: 20 // Objectif contrats mensuel
  };
  
  const achievements = {
    processesAchieved: processCount >= objectives.minProcesses,
    ratioAchieved: ratio >= objectives.minRatio,
    commissionsAchieved: potentialCommissions >= objectives.minCommissions,
    caAchieved: totalCA >= objectives.targetCA,
    contractsAchieved: totalContracts >= objectives.targetContracts
  };
  
  const overallScore = Object.values(achievements).filter(Boolean).length / Object.keys(achievements).length;
  
  // Top produits par CA
  const productCA = activities.reduce((acc, activity) => {
    acc[activity.productType] = (acc[activity.productType] || 0) + activity.annualPremium;
    return acc;
  }, {} as { [key: string]: number });
  
  const topProductByCA = Object.entries(productCA).sort(([,a], [,b]) => b - a)[0];
  
  // Top société par CA
  const companyCA = activities.reduce((acc, activity) => {
    acc[activity.company] = (acc[activity.company] || 0) + activity.annualPremium;
    return acc;
  }, {} as { [key: string]: number });
  
  const topCompanyByCA = Object.entries(companyCA).sort(([,a], [,b]) => b - a)[0];
  
  return {
    // KPIs de base
    totalCA,
    totalContracts,
    contractsOtherThanAuto,
    potentialCommissions,
    realCommissions,
    ratio: Math.round(ratio * 100) / 100,
    processCount,
    autoContracts,
    
    // KPIs avancés
    averageContractValue: Math.round(averageContractValue),
    commissionRate: Math.round(commissionRate * 100) / 100,
    productDistribution,
    companyDistribution,
    actTypeDistribution,
    
    // Objectifs et performances
    objectives,
    achievements,
    overallScore: Math.round(overallScore * 100),
    
    // Statut des commissions réelles
    commissionsReal: realCommissions > 0,
    commissionsStatus: realCommissions > 0 ? 'real' : 'potential',
    
    // Top performers
    topProductByCA: topProductByCA ? { type: topProductByCA[0], ca: topProductByCA[1] } : null,
    topCompanyByCA: topCompanyByCA ? { company: topCompanyByCA[0], ca: topCompanyByCA[1] } : null
  };
};

// Obtenir les activités par jour pour la timeline
export const getActivitiesByDay = (activities: CommercialActivity[]) => {
  const activitiesByDay: { [key: string]: CommercialActivity[] } = {};
  
  activities.forEach(activity => {
    const day = activity.dateCreated.getDate();
    const dayKey = String(day).padStart(2, '0');
    
    if (!activitiesByDay[dayKey]) {
      activitiesByDay[dayKey] = [];
    }
    activitiesByDay[dayKey].push(activity);
  });
  
  return activitiesByDay;
};
