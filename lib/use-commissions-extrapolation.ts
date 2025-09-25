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

        // Créer un tableau pour tous les mois de l'année (1-12)
        const allMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        // Calculer les commissions totales et résultats par mois de l'année en cours
        const monthlyData = allMonths.map(month => {
          const commission = yearCommissions.find(c => c.month === month);
          if (!commission) {
            return {
              commissions: 0,
              resultat: 0,
              month,
              hasData: false
            };
          }
          
          const commissions = commission.commissions_iard + commission.commissions_vie + 
                            commission.commissions_courtage + commission.profits_exceptionnels;
          const resultat = commissions - commission.charges_agence;
          return {
            commissions,
            resultat,
            month,
            hasData: true
          };
        });

        // Total des commissions actuelles (tous les mois avec données)
        const totalCommissions = monthlyData
          .filter(data => data.hasData)
          .reduce((sum, data) => sum + data.commissions, 0);
        
        // Mois complets : mois avec un résultat (positif ou négatif, mais pas 0)
        const completeMonthsData = monthlyData.filter(data => data.hasData && data.resultat !== 0);
        const completeMonths = completeMonthsData.length;
        
        // Calcul de l'extrapolation : moyenne des mois complets × 12
        const averageCommissions = completeMonths > 0 ? 
          completeMonthsData.reduce((sum, data) => sum + data.commissions, 0) / completeMonths : 0;
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
