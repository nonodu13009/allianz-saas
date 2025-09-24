import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Interface pour les activités commerciales
export interface CommercialActivity {
  id?: string;
  userId: string; // UID du commercial
  dateCreated: Date; // Date de saisie (auto)
  clientName: string; // Nom capitalisé
  contractNumber: string;
  effectDate: Date;
  actType: 'an' | 'm+3' | 'preterme_auto' | 'preterme_iard';
  productType: 'auto_moto' | 'iard_part' | 'iard_pro' | 'pj' | 'gav' | 'sante_prevoyance' | 'nop50eur' | 'vie_pp' | 'vie_pu' | '';
  company: 'allianz' | 'unim_uniced' | 'courtage' | '';
  annualPremium: number;
  potentialCommission: number; // Calculée auto
  isCommissionReal: boolean; // Calculée selon les règles
  month: string; // Format: "YYYY-MM" pour faciliter les requêtes
  year: number;
}

// Configuration des commissions par type de produit
export const COMMISSION_RATES = {
  auto_moto: 10,
  iard_part: 20,
  iard_pro: 20, // + 10€ par tranche de 1000€ au-delà de 999€
  pj: 30,
  gav: 40,
  sante_prevoyance: 50,
  nop50eur: 10,
  vie_pp: 50,
  vie_pu: 0.01, // 1% du versement
} as const;

// Calculer la commission potentielle selon le type de produit
export function calculatePotentialCommission(
  productType: CommercialActivity['productType'],
  annualPremium: number
): number {
  // Si pas de produit (M+3, Préterme Auto, Préterme IARD), pas de commission
  if (!productType || productType === '') {
    return 0;
  }
  
  const baseRate = COMMISSION_RATES[productType];
  
  if (productType === 'iard_pro') {
    // 20€ + 10€ par tranche de 1000€ au-delà de 999€
    if (annualPremium <= 999) {
      return baseRate;
    }
    const additionalTranches = Math.floor((annualPremium - 999) / 1000);
    return baseRate + (additionalTranches * 10);
  }
  
  if (productType === 'vie_pu') {
    // 1% du versement
    return Math.round(annualPremium * baseRate);
  }
  
  return baseRate;
}

// Vérifier si les commissions deviennent réelles selon les 3 conditions
export function calculateIsCommissionReal(
  activities: CommercialActivity[]
): boolean {
  // Condition 1: Minimum 15 process dans le mois (m+3, préterme auto, préterme iard)
  const processCount = activities.filter(activity => 
    ['m+3', 'preterme_auto', 'preterme_iard'].includes(activity.actType)
  ).length;
  
  if (processCount < 15) return false;
  
  // Condition 2: Ratio contrats autres / contrats auto ≥ 200%
  const autoContracts = activities.filter(activity => 
    activity.productType === 'auto_moto'
  ).length;
  
  const otherContracts = activities.filter(activity => 
    activity.productType !== 'auto_moto'
  ).length;
  
  const ratio = autoContracts === 0 ? 100 : (otherContracts / autoContracts) * 100;
  if (ratio < 200) return false; // Changé de 100% à 200%
  
  // Condition 3: Commissions potentielles ≥ 200 €
  const totalPotentialCommissions = activities.reduce(
    (sum, activity) => sum + activity.potentialCommission, 
    0
  );
  
  if (totalPotentialCommissions < 200) return false;
  
  return true;
}

// Créer une nouvelle activité commerciale
export async function createCommercialActivity(
  activity: Omit<CommercialActivity, 'id' | 'dateCreated' | 'potentialCommission' | 'isCommissionReal' | 'month' | 'year'>
): Promise<string> {
  try {
    const now = new Date();
    // Utiliser la date réelle du système pour le mois
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('Firebase: Création d\'activité pour userId:', activity.userId, 'month:', month, 'dateCreated:', now);
    
    // Calculer la commission potentielle (seulement pour les AN)
    const potentialCommission = activity.actType === 'an' 
      ? calculatePotentialCommission(activity.productType, activity.annualPremium)
      : 0;
    
    // Capitaliser le nom du client
    const capitalizedClientName = activity.clientName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const activityData: Omit<CommercialActivity, 'id'> = {
      ...activity,
      clientName: capitalizedClientName,
      dateCreated: now, // Date système réelle
      potentialCommission,
      isCommissionReal: false, // Sera calculé lors du chargement des données
      month, // Date réelle du système
      year: now.getFullYear(), // Année de la date système
    };
    
    console.log('Firebase: Données à sauvegarder:', activityData);
    
    const docRef = await addDoc(collection(db, 'commercial_activities'), {
      ...activityData,
      dateCreated: Timestamp.fromDate(activityData.dateCreated),
      effectDate: Timestamp.fromDate(activityData.effectDate),
    });
    
    console.log('Firebase: Activité créée avec ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité commerciale:', error);
    throw error;
  }
}

// Mettre à jour une activité commerciale
export async function updateCommercialActivity(
  id: string,
  updates: Partial<Omit<CommercialActivity, 'id' | 'userId' | 'dateCreated' | 'month' | 'year'>>
): Promise<void> {
  try {
    const activityRef = doc(db, 'commercial_activities', id);
    
    // Recalculer la commission potentielle si nécessaire
    let updateData: any = { ...updates };
    
    if (updates.productType || updates.annualPremium !== undefined) {
      // Récupérer l'activité existante pour recalculer
      const activityDoc = await getDoc(activityRef);
      if (activityDoc.exists()) {
        const existingData = activityDoc.data();
        const productType = updates.productType || existingData.productType;
        const annualPremium = updates.annualPremium !== undefined ? updates.annualPremium : existingData.annualPremium;
        
        updateData.potentialCommission = calculatePotentialCommission(productType, annualPremium);
      }
    }
    
    // Capitaliser le nom du client si modifié
    if (updates.clientName) {
      updateData.clientName = updates.clientName
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    await updateDoc(activityRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité commerciale:', error);
    throw error;
  }
}

// Supprimer une activité commerciale
export async function deleteCommercialActivity(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'commercial_activities', id));
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité commerciale:', error);
    throw error;
  }
}

// Récupérer les activités commerciales d'un utilisateur pour un mois donné
export async function getCommercialActivitiesByMonth(
  userId: string,
  month: string
): Promise<CommercialActivity[]> {
  try {
    console.log('Firebase: Requête pour userId:', userId, 'month:', month);
    
    const q = query(
      collection(db, 'commercial_activities'),
      where('userId', '==', userId),
      where('month', '==', month)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Firebase: Nombre de documents trouvés:', querySnapshot.size);
    
    const activities: CommercialActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Firebase: Document trouvé:', doc.id, data);
      activities.push({
        id: doc.id,
        userId: data.userId,
        dateCreated: data.dateCreated.toDate(),
        clientName: data.clientName,
        contractNumber: data.contractNumber,
        effectDate: data.effectDate.toDate(),
        actType: data.actType,
        productType: data.productType,
        company: data.company,
        annualPremium: data.annualPremium,
        potentialCommission: data.potentialCommission,
        isCommissionReal: data.isCommissionReal,
        month: data.month,
        year: data.year,
      });
    });
    
    // Trier par date de création (plus récent en premier)
    activities.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    
    // Recalculer les commissions réelles pour toutes les activités
    const isCommissionReal = calculateIsCommissionReal(activities);
    activities.forEach(activity => {
      activity.isCommissionReal = isCommissionReal;
    });
    
    console.log('Firebase: Activités finales:', activities);
    return activities;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités commerciales:', error);
    throw error;
  }
}

// Récupérer toutes les activités commerciales d'un utilisateur
export async function getAllCommercialActivities(
  userId: string
): Promise<CommercialActivity[]> {
  try {
    const q = query(
      collection(db, 'commercial_activities'),
      where('userId', '==', userId),
      orderBy('dateCreated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities: CommercialActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        userId: data.userId,
        dateCreated: data.dateCreated.toDate(),
        clientName: data.clientName,
        contractNumber: data.contractNumber,
        effectDate: data.effectDate.toDate(),
        actType: data.actType,
        productType: data.productType,
        company: data.company,
        annualPremium: data.annualPremium,
        potentialCommission: data.potentialCommission,
        isCommissionReal: data.isCommissionReal,
        month: data.month,
        year: data.year,
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les activités commerciales:', error);
    throw error;
  }
}

// Calculer les KPIs pour un mois donné
export function calculateKPIs(activities: CommercialActivity[]) {
  const totalContracts = activities.length;
  const autoContracts = activities.filter(a => a.productType === 'auto_moto').length;
  const contractsOtherThanAuto = activities.filter(a => a.productType !== 'auto_moto').length;
  const totalCA = activities.reduce((sum, a) => sum + a.annualPremium, 0);
  const potentialCommissions = activities.reduce((sum, a) => sum + a.potentialCommission, 0);
  
  // Calculer les commissions réelles selon les 3 conditions
  const processCount = activities.filter(a => 
    ['m+3', 'preterme_auto', 'preterme_iard'].includes(a.actType)
  ).length;
  
  const ratioOtherToAuto = autoContracts === 0 ? 100 : (contractsOtherThanAuto / autoContracts) * 100;
  
  // 3 conditions pour commissions réelles :
  // 1. Commissions potentielles >= 200€
  // 2. Ratio >= 200% (autres/auto)
  // 3. Nombre de process >= 15
  const isCommissionReal = potentialCommissions >= 200 && 
                         ratioOtherToAuto >= 200 && 
                         processCount >= 15;
  
  const realCommissions = isCommissionReal ? potentialCommissions : 0;
  
  // Nombre d'actes = seulement les process (M+3, Préterme Auto, Préterme IARD)
  const totalProcessActs = activities.filter(a => 
    ['m+3', 'preterme_auto', 'preterme_iard'].includes(a.actType)
  ).length;
  
  return {
    totalCA,
    totalContracts,
    autoContracts, // Nouveau KPI
    contractsOtherThanAuto,
    potentialCommissions,
    realCommissions,
    ratioOtherToAuto,
    totalProcessActs,
  };
}
