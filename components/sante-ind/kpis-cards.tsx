'use client';

import { useMemo } from 'react';
import { useNavigation } from '@/lib/sante-ind-navigation-context';
import { useSanteIndData } from '@/lib/sante-ind-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function KPIsCards() {
  const { currentMonth } = useNavigation();
  const { activities, isLoading } = useSanteIndData();

  // Filtrer les activités du mois sélectionné
  const monthlyActivities = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return activities.filter(activity => {
      const activityDate = new Date(activity.dateCreated);
      return activityDate.getMonth() === month - 1 && 
             activityDate.getFullYear() === year;
    });
  }, [activities, currentMonth]);

  // Calculer les KPIs
  const kpis = useMemo(() => {
    const totalActs = monthlyActivities.length;
    const anCount = monthlyActivities.filter(a => a.actType === 'affaire_nouvelle').length;
    const revisionCount = monthlyActivities.filter(a => a.actType === 'revision').length;
    const adhesionCount = monthlyActivities.filter(a => a.actType === 'adhesion_salarie').length;
    const courtAzCount = monthlyActivities.filter(a => a.actType === 'court_az').length;
    const azCourtageCount = monthlyActivities.filter(a => a.actType === 'az_courtage').length;

    const caBrut = monthlyActivities.reduce((sum, activity) => sum + activity.primeAnnuelle, 0);
    const caPondere = monthlyActivities.reduce((sum, activity) => sum + activity.primePondere, 0);

    // Calcul des commissions selon les tranches
    let commissionPotentielle = 0;
    if (caPondere >= 22000) {
      commissionPotentielle = caPondere * 0.06;
    } else if (caPondere >= 18000) {
      commissionPotentielle = caPondere * 0.04;
    } else if (caPondere >= 14000) {
      commissionPotentielle = caPondere * 0.03;
    } else if (caPondere >= 10000) {
      commissionPotentielle = caPondere * 0.02;
    }

    // Commission réelle : débloquée si >= 4 révisions
    const commissionReelle = revisionCount >= 4 ? commissionPotentielle : 0;

    return {
      totalActs,
      anCount,
      revisionCount,
      adhesionCount,
      courtAzCount,
      azCourtageCount,
      caBrut,
      caPondere,
      commissionPotentielle,
      commissionReelle,
      critereRevisions: revisionCount
    };
  }, [monthlyActivities]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total des actes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {kpis.totalActs}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Ce mois
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA brut total
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(kpis.caBrut)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Primes annuelles
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA pondéré total
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(kpis.caPondere)}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Après coefficients
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commission réelle
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(kpis.commissionReelle)}
                </p>
                <p className={`text-sm font-medium ${
                  kpis.commissionReelle > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {kpis.commissionReelle > 0 ? 'Débloquée' : 'Bloquée'}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${
                kpis.commissionReelle > 0 
                  ? 'from-green-500 to-green-600' 
                  : 'from-red-500 to-red-600'
              } group-hover:scale-110 transition-transform`}>
                {kpis.commissionReelle > 0 ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type d'acte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Répartition par type d'acte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {kpis.anCount}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Affaires Nouvelles
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {kpis.revisionCount}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Révisions
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {kpis.adhesionCount}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Adhésions salarié
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {kpis.courtAzCount}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                COURT → AZ
              </div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {kpis.azCourtageCount}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300">
                AZ → Courtage
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critère des 4 révisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Critère de déblocage des commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Révisions saisies : {kpis.critereRevisions} / 4
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    kpis.critereRevisions >= 4 
                      ? 'bg-green-500' 
                      : kpis.critereRevisions >= 3 
                        ? 'bg-orange-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((kpis.critereRevisions / 4) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <Badge variant={kpis.critereRevisions >= 4 ? "default" : "destructive"}>
              {kpis.critereRevisions >= 4 ? 'Critère atteint' : 'Critère non atteint'}
            </Badge>
          </div>
          {kpis.critereRevisions < 4 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Il manque {4 - kpis.critereRevisions} révision{kpis.critereRevisions < 3 ? 's' : ''} pour débloquer les commissions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
