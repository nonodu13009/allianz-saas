'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/providers';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { getCommercialActivitiesByMonth, CommercialActivity, calculateKPIs } from '@/lib/firebase-commercial';
import { logDatabaseInfo, logDatabaseError, logBusinessInfo } from '@/lib/logger';

interface CommercialDataContextType {
  // Données brutes
  activities: CommercialActivity[];
  isLoading: boolean;
  error: string | null;
  
  // KPIs calculés
  kpis: {
    totalActs: number;
    anCount: number;
    mPlus3Count: number;
    pretermeAutoCount: number;
    pretermeIardCount: number;
    totalAnnualPremium: number;
    totalPotentialCommission: number;
    totalRealCommission: number;
    commissionRatio: number;
    isCommissionReal: boolean;
  };
  
  // Actions
  refreshData: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  addActivity: (activity: CommercialActivity) => void;
  updateActivity: (activity: CommercialActivity) => void;
  removeActivity: (activityId: string) => void;
}

const CommercialDataContext = createContext<CommercialDataContextType | undefined>(undefined);

export function CommercialDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentMonth } = useNavigation();
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du mois sélectionné
  const loadMonthData = async () => {
    if (!user?.id) {
      logDatabaseInfo('Pas d\'utilisateur connecté', 'CommercialDataProvider');
      return;
    }
    
    logDatabaseInfo(`Chargement des données pour ${currentMonth}`, 'CommercialDataProvider', { userId: user.id });
    setIsLoading(true);
    setError(null);
    
    try {
      const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
      logDatabaseInfo(`Activités chargées: ${monthActivities.length} éléments`, 'CommercialDataProvider');
      setActivities(monthActivities);
    } catch (error) {
      logDatabaseError('Erreur lors du chargement des données', 'CommercialDataProvider', error);
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
      logBusinessInfo('Nouvelle activité créée, rechargement des données', 'CommercialDataProvider');
      loadMonthData();
    };

    const handleActivityUpdated = () => {
      logBusinessInfo('Activité mise à jour, rechargement des données', 'CommercialDataProvider');
      loadMonthData();
    };

    const handleActivityDeleted = () => {
      logBusinessInfo('Activité supprimée, rechargement des données', 'CommercialDataProvider');
      loadMonthData();
    };

    window.addEventListener('commercialActivityCreated', handleActivityCreated);
    window.addEventListener('commercialActivityUpdated', handleActivityUpdated);
    window.addEventListener('commercialActivityDeleted', handleActivityDeleted);
    
    return () => {
      window.removeEventListener('commercialActivityCreated', handleActivityCreated);
      window.removeEventListener('commercialActivityUpdated', handleActivityUpdated);
      window.removeEventListener('commercialActivityDeleted', handleActivityDeleted);
    };
  }, [currentMonth, user?.id]);

  // Calculer les KPIs
  const kpis = calculateKPIs(activities);

  // Actions pour modifier les données localement (optimisation)
  const addActivity = (activity: CommercialActivity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (updatedActivity: CommercialActivity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };

  const removeActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  // Fonction pour forcer un rechargement complet (utile pour la cohérence des commissions)
  const forceRefresh = async () => {
    logDatabaseInfo('Rechargement forcé pour cohérence des données', 'CommercialDataProvider');
    await loadMonthData();
  };

  const refreshData = async () => {
    await loadMonthData();
  };

  return (
    <CommercialDataContext.Provider
      value={{
        activities,
        isLoading,
        error,
        kpis,
        refreshData,
        forceRefresh,
        addActivity,
        updateActivity,
        removeActivity,
      }}
    >
      {children}
    </CommercialDataContext.Provider>
  );
}

export function useCommercialData() {
  const context = useContext(CommercialDataContext);
  if (!context) {
    throw new Error('useCommercialData must be used within a CommercialDataProvider');
  }
  return context;
}
