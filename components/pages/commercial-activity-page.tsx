'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { Timeline } from '@/components/ui/timeline';
import { CommercialActivityModal } from '@/components/ui/commercial-activity-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, Target, CheckCircle, BarChart3, Award, Users, Building, PieChart, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { 
  CommercialActivity, 
  getCommercialActivitiesByUserAndMonth, 
  calculateMonthlyKPIs,
  getActivitiesByDay 
} from '@/lib/firebase-commercial';

export function CommercialActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CommercialActivity | null>(null);

  // Vérifier les permissions
  if (!user || !['cdc_commercial', 'administrateur'].includes(user.role)) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accès Refusé</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  // Charger les activités du mois sélectionné
  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const userActivities = await getCommercialActivitiesByUserAndMonth(user.uid, month);
        setActivities(userActivities);
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user?.uid, currentDate]);

  // Calculer les KPIs
  const kpis = calculateMonthlyKPIs(activities);
  const activitiesByDay = getActivitiesByDay(activities);

  const handleAddActivity = () => {
    setShowAddModal(true);
  };

  const handleEditActivity = (activity: CommercialActivity) => {
    setEditingActivity(activity);
  };

  const handleActivitySaved = () => {
    // Recharger les activités après sauvegarde
    const loadActivities = async () => {
      if (!user?.uid) return;
      
      try {
        const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const userActivities = await getCommercialActivitiesByUserAndMonth(user.uid, month);
        setActivities(userActivities);
      } catch (error) {
        console.error('Erreur lors du rechargement des activités:', error);
      }
    };

    loadActivities();
    setShowAddModal(false);
    setEditingActivity(null);
  };

  // Navigation mensuelle
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activité Commerciale</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {activities.length} actes
          </Badge>
          <Button onClick={handleAddActivity}>
            Nouvel acte
          </Button>
        </div>
      </div>

      {/* Navigation mensuelle */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center min-w-[200px]">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatMonthYear(currentDate)}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToCurrentMonth}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Retour au mois actuel
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="flex items-center"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs du mois - Exactement selon les spécifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {kpis.totalCA.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de contrats total</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {kpis.totalContracts}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de contrats autres qu'auto</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {kpis.contractsOtherThanAuto}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions potentielles</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {kpis.potentialCommissions.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ligne 2 - KPIs restants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio autres/auto</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {kpis.ratio.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              {kpis.contractsOtherThanAuto}/{kpis.autoContracts}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre d'actes total</CardTitle>
            <PieChart className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {kpis.totalContracts}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions réelles</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {kpis.realCommissions.toLocaleString('fr-FR')} €
            </div>
            <p className="text-xs text-gray-500">
              {kpis.commissionsReal ? '✓ Réelles' : '⚠ Potentielles'}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Timeline */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timeline des activités</span>
            <Badge variant={kpis.realCommissions > 0 ? "default" : "secondary"}>
              {kpis.realCommissions > 0 ? "Commissions réelles" : "Commissions potentielles"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : (
            <Timeline 
              activities={activities}
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
            />
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <CommercialActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleActivitySaved}
        userId={user?.uid || ''}
      />
      
      <CommercialActivityModal
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={handleActivitySaved}
        activity={editingActivity}
        userId={user?.uid || ''}
      />
    </div>
  );
}
