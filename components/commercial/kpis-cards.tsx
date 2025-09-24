'use client';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { useAuth } from '@/components/providers';
import { getCommercialActivitiesByMonth, calculateKPIs, CommercialActivity } from '@/lib/firebase-commercial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Euro, FileText, Car, Building2, TrendingUp, Cog, DollarSign, CheckCircle } from 'lucide-react';

export function KPIsCards() {
  const { currentMonth, getCurrentMonthDisplay } = useNavigation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommissionTooltip, setShowCommissionTooltip] = useState(false);

  // Charger les données du mois sélectionné
  useEffect(() => {
    const loadMonthData = async () => {
      if (!user?.id) {
        console.log('Pas d\'utilisateur connecté');
        return;
      }
      
      console.log('Chargement des données pour:', { userId: user.id, month: currentMonth });
      setIsLoading(true);
      try {
        const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
        console.log('Activités chargées:', monthActivities);
        setActivities(monthActivities);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthData();
  }, [currentMonth, user?.id]);

  // Écouter les événements de création d'activité pour recharger les données
  useEffect(() => {
    const handleActivityCreated = () => {
      console.log('KPIs: Nouvelle activité créée, rechargement des données...');
      // Recharger les données
      const loadMonthData = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
          const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
          setActivities(monthActivities);
        } catch (error) {
          console.error('Erreur lors du rechargement:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMonthData();
    };

    window.addEventListener('commercialActivityCreated', handleActivityCreated);
    
    return () => {
      window.removeEventListener('commercialActivityCreated', handleActivityCreated);
    };
  }, [currentMonth, user?.id]);

  // Calculer les KPIs
  const kpis = calculateKPIs(activities);

  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          KPIs du mois
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Indicateurs clés de performance pour {getCurrentMonthDisplay()}
        </p>
      </div>
      
      {/* Première ligne : CA du mois, Nombre total, Nombre auto, Nombre autre */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CA du mois */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-500" />
              CA du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(kpis.totalCA)}
            </div>
          </CardContent>
        </Card>

        {/* Nombre de contrats total */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Nombre total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {kpis.totalContracts}
            </div>
          </CardContent>
        </Card>

        {/* Nombre auto */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-purple-500" />
              Nombre auto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {kpis.autoContracts}
            </div>
          </CardContent>
        </Card>

        {/* Nombre autre */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Nombre autre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {kpis.contractsOtherThanAuto}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deuxième ligne : Ratio, Nombre de process, Commissions potentielles, Commissions réelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Ratio autres/auto */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Ratio autres/auto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercentage(kpis.ratioOtherToAuto)}
            </div>
          </CardContent>
        </Card>

        {/* Nombre de process */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Cog className="w-4 h-4 text-teal-500" />
              Nombre de process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {kpis.totalProcessActs}
            </div>
          </CardContent>
        </Card>

        {/* Commissions potentielles */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Commissions potentielles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(kpis.potentialCommissions)}
            </div>
          </CardContent>
        </Card>

        {/* Commissions réelles avec effet hover explicatif */}
        <Card className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Commissions réelles
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info 
                      className="h-4 w-4 text-slate-400 hover:text-blue-600 cursor-help transition-colors"
                      onMouseEnter={() => setShowCommissionTooltip(true)}
                      onMouseLeave={() => setShowCommissionTooltip(false)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="space-y-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Comment passer de commissions potentielles à réelles ?</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Les commissions deviennent réelles lorsque 3 conditions sont remplies :</p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-slate-700 dark:text-slate-300">Minimum 15 process dans le mois (M+3, Préterme Auto, Préterme IARD)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-slate-700 dark:text-slate-300">Ratio contrats autres / contrats auto ≥ 200%</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-slate-700 dark:text-slate-300">Commissions potentielles ≥ 200 €</span>
                        </li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(kpis.realCommissions)}
              </div>
              {kpis.realCommissions > 0 && (
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  ✓ Réelles
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
