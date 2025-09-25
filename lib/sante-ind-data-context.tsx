'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/providers';
import { useSanteIndNavigation } from '@/lib/sante-ind-navigation-context';

// Interface pour les activités santé individuelle (à définir selon le cahier des charges)
interface SanteIndActivity {
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
}

interface SanteIndDataContextType {
  // Données brutes
  activities: SanteIndActivity[];
  isLoading: boolean;
  error: string | null;
  
  // KPIs calculés
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
  };
  
  // Actions
  refreshData: () => Promise<void>;
  addActivity: (activity: SanteIndActivity) => void;
  updateActivity: (activity: SanteIndActivity) => void;
  removeActivity: (activityId: string) => void;
}

const SanteIndDataContext = createContext<SanteIndDataContextType | undefined>(undefined);

export function SanteIndDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentMonth } = useSanteIndNavigation();
  const [activities, setActivities] = useState<SanteIndActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données du mois sélectionné
  // TODO: Implémenter la fonction getSanteIndActivitiesByMonth dans firebase-sante-ind.ts
  const loadMonthData = async () => {
    if (!user?.id) {
      console.log('SanteIndDataProvider: Pas d\'utilisateur connecté');
      return;
    }
    
    console.log('SanteIndDataProvider: Chargement des données pour:', { userId: user.id, month: currentMonth });
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Remplacer par l'appel Firebase réel
      // const monthActivities = await getSanteIndActivitiesByMonth(user.id, currentMonth);
      const monthActivities: SanteIndActivity[] = []; // Placeholder
      console.log('SanteIndDataProvider: Activités chargées:', monthActivities);
      setActivities(monthActivities);
    } catch (error) {
      console.error('SanteIndDataProvider: Erreur lors du chargement des données:', error);
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
      console.log('SanteIndDataProvider: Nouvelle activité créée, rechargement des données...');
      loadMonthData();
    };

    const handleActivityUpdated = () => {
      console.log('SanteIndDataProvider: Activité mise à jour, rechargement des données...');
      loadMonthData();
    };

    const handleActivityDeleted = () => {
      console.log('SanteIndDataProvider: Activité supprimée, rechargement des données...');
      loadMonthData();
    };

    window.addEventListener('santeIndActivityCreated', handleActivityCreated);
    window.addEventListener('santeIndActivityUpdated', handleActivityUpdated);
    window.addEventListener('santeIndActivityDeleted', handleActivityDeleted);
    
    return () => {
      window.removeEventListener('santeIndActivityCreated', handleActivityCreated);
      window.removeEventListener('santeIndActivityUpdated', handleActivityUpdated);
      window.removeEventListener('santeIndActivityDeleted', handleActivityDeleted);
    };
  }, [currentMonth, user?.id]);

  // Calculer les KPIs selon les spécifications du cahier des charges
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
  };

  // Actions pour modifier les données localement (optimisation)
  const addActivity = (activity: SanteIndActivity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (updatedActivity: SanteIndActivity) => {
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
    <SanteIndDataContext.Provider
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
    </SanteIndDataContext.Provider>
  );
}

export function useSanteIndData() {
  const context = useContext(SanteIndDataContext);
  if (!context) {
    throw new Error('useSanteIndData must be used within a SanteIndDataProvider');
  }
  return context;
}
