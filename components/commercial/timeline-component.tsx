'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { useAuth } from '@/components/providers';
import { useFilters } from './filters-system';
import { getCommercialActivitiesByMonth, CommercialActivity } from '@/lib/firebase-commercial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DayData {
  date: Date;
  dayNumber: number;
  dayName: string;
  activities: CommercialActivity[];
  totalActs: number;
  anCount: number;
  processCount: number;
}

export function TimelineComponent() {
  const { currentMonth, getCurrentMonthDisplay } = useNavigation();
  const { user } = useAuth();
  const { filters } = useFilters();
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Charger les données du mois sélectionné
  useEffect(() => {
    const loadMonthData = async () => {
      if (!user?.id) {
        console.log('Timeline: Pas d\'utilisateur connecté');
        return;
      }
      
      console.log('Timeline: Chargement des données pour:', { userId: user.id, month: currentMonth });
      setIsLoading(true);
      try {
        const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
        console.log('Timeline: Activités chargées:', monthActivities);
        setActivities(monthActivities);
      } catch (error) {
        console.error('Timeline: Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthData();
  }, [currentMonth, user?.id]);

  // Écouter les événements de création, mise à jour et suppression d'activité pour recharger les données
  useEffect(() => {
    const handleActivityChange = () => {
      console.log('Timeline: Activité modifiée, rechargement des données...');
      // Recharger les données
      const loadMonthData = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
          const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
          setActivities(monthActivities);
        } catch (error) {
          console.error('Timeline: Erreur lors du rechargement:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMonthData();
    };

    window.addEventListener('commercialActivityCreated', handleActivityChange);
    window.addEventListener('commercialActivityUpdated', handleActivityChange);
    window.addEventListener('commercialActivityDeleted', handleActivityChange);
    
    return () => {
      window.removeEventListener('commercialActivityCreated', handleActivityChange);
      window.removeEventListener('commercialActivityUpdated', handleActivityChange);
      window.removeEventListener('commercialActivityDeleted', handleActivityChange);
    };
  }, [currentMonth, user?.id]);

  // Filtrer les activités selon les filtres actifs
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const actTypeMatch = filters.actType.length === 0 || filters.actType.includes(activity.actType);
      const productTypeMatch = filters.productType.length === 0 || filters.productType.includes(activity.productType);
      const companyMatch = filters.company.length === 0 || filters.company.includes(activity.company);
      
      return actTypeMatch && productTypeMatch && companyMatch;
    });
  }, [activities, filters]);

  // Générer les données des jours du mois
  const daysData = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: DayData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayActivities = filteredActivities.filter(activity => {
        const activityDate = new Date(activity.dateCreated);
        return activityDate.getDate() === day && 
               activityDate.getMonth() === month - 1 && 
               activityDate.getFullYear() === year;
      });
      
      const anCount = dayActivities.filter(a => a.actType === 'an').length;
      const processCount = dayActivities.filter(a => ['m+3', 'preterme_auto', 'preterme_iard'].includes(a.actType)).length;
      
      days.push({
        date,
        dayNumber: day,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        activities: dayActivities,
        totalActs: dayActivities.length,
        anCount,
        processCount,
      });
    }
    
    return days;
  }, [currentMonth, filteredActivities]);

  // Vérifier si c'est un jour système (jour spécial)
  const isSystemDay = (dayData: DayData) => {
    // Le jour système est le jour actuel de la date système
    const today = new Date();
    const dayDataDate = dayData.date;
    
    return dayDataDate.getDate() === today.getDate() &&
           dayDataDate.getMonth() === today.getMonth() &&
           dayDataDate.getFullYear() === today.getFullYear();
  };

  // Obtenir la couleur de la pastille selon le jour
  const getDayColor = (dayData: DayData) => {
    const dayOfWeek = dayData.date.getDay();
    
    if (dayOfWeek === 0) return 'bg-red-500'; // Dimanche
    if (dayOfWeek === 6) return 'bg-orange-500'; // Samedi
    return 'bg-green-500'; // Lundi-Vendredi
  };

  // Obtenir les classes CSS pour la pastille
  const getDayClasses = (dayData: DayData) => {
    const baseColor = getDayColor(dayData);
    const isSystem = isSystemDay(dayData);
    
    if (isSystem) {
      return `${baseColor} border-4 border-white shadow-lg`; // Bordure blanche épaisse pour les jours système
    }
    
    return baseColor;
  };

  // Obtenir le nom du jour en français
  const getDayName = (dayData: DayData) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return dayNames[dayData.date.getDay()];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Timeline mensuelle
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Activités par jour pour {getCurrentMonthDisplay()}
        </p>
      </div>
      
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Lundi-Vendredi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Samedi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Dimanche</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-slate-400 rounded-full"></div>
              <span>Aujourd'hui</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 justify-center flex-wrap">
            {daysData.map((dayData) => (
              <TooltipProvider key={dayData.dayNumber}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedDay(dayData)}
                      className={`w-12 h-12 rounded-full text-white font-bold text-sm flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg ${getDayClasses(dayData)}`}
                    >
                      {dayData.totalActs}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-semibold">
                        {dayData.dayNumber} {getDayName(dayData)}
                        {isSystemDay(dayData) && (
                          <span className="ml-2 text-xs bg-white text-black px-1 rounded">
                            Aujourd'hui
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        {dayData.totalActs} acte{dayData.totalActs > 1 ? 's' : ''}
                      </div>
                      {dayData.totalActs > 0 && (
                        <div className="text-xs mt-1">
                          <div>AN: {dayData.anCount}</div>
                          <div>Process: {dayData.processCount}</div>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modale de détail du jour */}
      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Détail du {selectedDay.dayNumber} {getDayName(selectedDay)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedDay.activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun acte commercial ce jour
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDay.activities.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{activity.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          Contrat: {activity.contractNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {activity.actType.toUpperCase()}
                        </Badge>
                        <div className="text-sm font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(activity.potentialCommission)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {activity.productType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {activity.company}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
