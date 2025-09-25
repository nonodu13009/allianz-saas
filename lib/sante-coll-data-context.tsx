'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/providers';
import { useSanteCollNavigation } from '@/lib/sante-coll-navigation-context';

// Interface pour les activités santé collective (à définir selon les besoins spécifiques)
interface SanteCollActivity {
  id?: string;
  userId: string;
  dateCreated: Date;
  clientName: string;
  contractNumber: string;
  effectDate: Date;
  actType: 'affaire_nouvelle' | 'revision' | 'adhesion_salarie' | 'court_az' | 'az_courtage';
  annualPremium: number;
  weightedPremium: number; // Prime pondérée selon le coefficient
  potentialCommission: number;
  realCommission: number;
  month: string;
  year: number;
  // Champs spécifiques à la santé collective
  employeeCount?: number; // Nombre d'employés couverts
  contractType?: 'collectif' | 'mutuelle' | 'prevoyance'; // Type de contrat collectif
  companySize?: 'petite' | 'moyenne' | 'grande'; // Taille d'entreprise
}

interface SanteCollDataContextType {
  // Données brutes
  activities: SanteCollActivity[];
  isLoading: boolean;
  error: string | null;
  
  // KPIs calculés spécifiques à la santé collective
  kpis: {
    totalActs: number;
    affaireNouvelleCount: number;
    revisionCount: number;
    adhesionSalarieCount: number;
    courtAzCount: number;
    azCourtageCount: number;
    totalWeightedPremium: number;
    totalPotentialCommission: number;
    totalRealCommission: number;
    revisionCriteriaMet: boolean; // ≥ 4 révisions
    commissionUnlocked: boolean; // Commission débloquée si critère respecté
    // KPIs spécifiques santé collective
    totalEmployeesCovered: number; // Total employés couverts
    averageContractSize: number; // Taille moyenne des contrats
    contractTypeDistribution: {
      collectif: number;
      mutuelle: number;
      prevoyance: number;
    };
    companySizeDistribution: {
      petite: number;
      moyenne: number;
      grande: number;
    };
  };
  
  // Actions
  refreshData: () => Promise<void>;
  addActivity: (activity: SanteCollActivity) => void;
  updateActivity: (activity: SanteCollActivity) => void;
  removeActivity: (activityId: string) => void;
}

const SanteCollDataContext = createContext<SanteCollDataContextType | undefined>(undefined);

export function SanteCollDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentMonth } = useSanteCollNavigation();
  const [activities, setActivities] = useState<SanteCollActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données du mois sélectionné
  // TODO: Implémenter la fonction getSanteCollActivitiesByMonth dans firebase-sante-coll.ts
  const loadMonthData = async () => {
    if (!user?.id) {
      console.log('SanteCollDataProvider: Pas d\'utilisateur connecté');
      return;
    }
    
    console.log('SanteCollDataProvider: Chargement des données pour:', { userId: user.id, month: currentMonth });
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Remplacer par l'appel Firebase réel
      // const monthActivities = await getSanteCollActivitiesByMonth(user.id, currentMonth);
      const monthActivities: SanteCollActivity[] = []; // Placeholder
      console.log('SanteCollDataProvider: Activités chargées:', monthActivities);
      setActivities(monthActivities);
    } catch (error) {
      console.error('SanteCollDataProvider: Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et quand le mois change
  useEffect(() => {
    loadMonthData();
  }, [currentMonth, user?.id]);

  // Écouter les événements de modification d'activité
  useEffect(() => {
    const handleActivityCreated = () => {
      console.log('SanteCollDataProvider: Nouvelle activité créée, rechargement des données...');
      loadMonthData();
    };

    const handleActivityUpdated = () => {
      console.log('SanteCollDataProvider: Activité mise à jour, rechargement des données...');
      loadMonthData();
    };

    const handleActivityDeleted = () => {
      console.log('SanteCollDataProvider: Activité supprimée, rechargement des données...');
      loadMonthData();
    };

    window.addEventListener('santeCollActivityCreated', handleActivityCreated);
    window.addEventListener('santeCollActivityUpdated', handleActivityUpdated);
    window.addEventListener('santeCollActivityDeleted', handleActivityDeleted);
    
    return () => {
      window.removeEventListener('santeCollActivityCreated', handleActivityCreated);
      window.removeEventListener('santeCollActivityUpdated', handleActivityUpdated);
      window.removeEventListener('santeCollActivityDeleted', handleActivityDeleted);
    };
  }, [currentMonth, user?.id]);

  // Calculer les KPIs selon les spécifications pour la santé collective
  const kpis = {
    totalActs: activities.length,
    affaireNouvelleCount: activities.filter(a => a.actType === 'affaire_nouvelle').length,
    revisionCount: activities.filter(a => a.actType === 'revision').length,
    adhesionSalarieCount: activities.filter(a => a.actType === 'adhesion_salarie').length,
    courtAzCount: activities.filter(a => a.actType === 'court_az').length,
    azCourtageCount: activities.filter(a => a.actType === 'az_courtage').length,
    totalWeightedPremium: activities.reduce((sum, activity) => sum + activity.weightedPremium, 0),
    totalPotentialCommission: activities.reduce((sum, activity) => sum + activity.potentialCommission, 0),
    totalRealCommission: activities.reduce((sum, activity) => sum + activity.realCommission, 0),
    revisionCriteriaMet: activities.filter(a => a.actType === 'revision').length >= 4,
    commissionUnlocked: activities.filter(a => a.actType === 'revision').length >= 4,
    // KPIs spécifiques santé collective
    totalEmployeesCovered: activities.reduce((sum, activity) => sum + (activity.employeeCount || 0), 0),
    averageContractSize: activities.length > 0 
      ? activities.reduce((sum, activity) => sum + activity.annualPremium, 0) / activities.length 
      : 0,
    contractTypeDistribution: {
      collectif: activities.filter(a => a.contractType === 'collectif').length,
      mutuelle: activities.filter(a => a.contractType === 'mutuelle').length,
      prevoyance: activities.filter(a => a.contractType === 'prevoyance').length,
    },
    companySizeDistribution: {
      petite: activities.filter(a => a.companySize === 'petite').length,
      moyenne: activities.filter(a => a.companySize === 'moyenne').length,
      grande: activities.filter(a => a.companySize === 'grande').length,
    },
  };

  // Actions pour modifier les données localement (optimisation)
  const addActivity = (activity: SanteCollActivity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (updatedActivity: SanteCollActivity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };

  const removeActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  const refreshData = async () => {
    await loadMonthData();
  };

  return (
    <SanteCollDataContext.Provider
      value={{
        activities,
        isLoading,
        error,
        kpis,
        refreshData,
        addActivity,
        updateActivity,
        removeActivity,
      }}
    >
      {children}
    </SanteCollDataContext.Provider>
  );
}

export function useSanteCollData() {
  const context = useContext(SanteCollDataContext);
  if (!context) {
    throw new Error('useSanteCollData must be used within a SanteCollDataProvider');
  }
  return context;
}
