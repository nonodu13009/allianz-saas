import { useState, useEffect } from 'react';
import { getCommissions } from './firebase-commissions';

interface ExtrapolationData {
  currentYear: number;
  totalCommissions: number;
  extrapolatedCommissions: number;
  completeMonths: number;
  isLoading: boolean;
  error: string | null;
}

export function useCommissionsExtrapolation(): ExtrapolationData {
  const [data, setData] = useState<ExtrapolationData>({
    currentYear: new Date().getFullYear(),
    totalCommissions: 0,
    extrapolatedCommissions: 0,
    completeMonths: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadExtrapolationData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const currentYear = new Date().getFullYear();
        const commissionsData = await getCommissions();
        const yearCommissions = commissionsData.commissions.filter(c => c.year === currentYear);
        
        if (yearCommissions.length === 0) {
          setData({
            currentYear,
            totalCommissions: 0,
            extrapolatedCommissions: 0,
            completeMonths: 0,
            isLoading: false,
            error: null
          });
          return;
        }

        // Calculer les commissions totales par mois
        const monthlyCommissions = yearCommissions.map(commission => {
          return commission.commissions_iard + commission.commissions_vie + 
                 commission.commissions_courtage + commission.profits_exceptionnels;
        });

        // Total des commissions actuelles
        const totalCommissions = monthlyCommissions.reduce((sum, value) => sum + value, 0);
        
        // Mois complets (avec des commissions > 0)
        const completeMonths = monthlyCommissions.filter(value => value > 0).length;
        
        // Calcul de l'extrapolation : moyenne des mois complets × 12
        const averageCommissions = completeMonths > 0 ? totalCommissions / completeMonths : 0;
        const extrapolatedCommissions = averageCommissions * 12;

        setData({
          currentYear,
          totalCommissions,
          extrapolatedCommissions,
          completeMonths,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données d\'extrapolation:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors du chargement des données'
        }));
      }
    };

    loadExtrapolationData();
  }, []);

  return data;
}
