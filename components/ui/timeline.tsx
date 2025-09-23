'use client';

import { cn } from '@/lib/utils';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from './button';

interface TimelineProps {
  activities: Array<{
    id?: string;
    clientName: string;
    contractNumber: string;
    productType: string;
    annualPremium: number;
    potentialCommission: number;
    isCommissionReal: boolean;
    dateCreated: Date;
  }>;
  onAddActivity?: () => void;
  onEditActivity?: (activity: any) => void;
  className?: string;
}

const productTypeLabels = {
  'auto_moto': 'Auto/Moto',
  'iard_part': 'IARD Particulier',
  'iard_pro': 'IARD Professionnel',
  'pj': 'Protection Juridique',
  'gav': 'GAV',
  'sante_prevoyance': 'Santé/Prévoyance',
  'nop50eur': 'NOP 50€',
  'vie_pp': 'Vie PP',
  'vie_pu': 'Vie PU'
} as const;

const actTypeLabels = {
  'an': 'AN',
  'm+3': 'M+3',
  'preterme_auto': 'Préterme Auto',
  'preterme_iard': 'Préterme IARD'
} as const;

export function Timeline({ activities, onAddActivity, onEditActivity, className }: TimelineProps) {
  // Grouper les activités par jour
  const activitiesByDay: { [key: string]: typeof activities } = {};
  
  activities.forEach(activity => {
    const day = activity.dateCreated.getDate();
    const dayKey = String(day).padStart(2, '0');
    
    if (!activitiesByDay[dayKey]) {
      activitiesByDay[dayKey] = [];
    }
    activitiesByDay[dayKey].push(activity);
  });

  // Calculer les totaux du mois
  const totalCA = activities.reduce((sum, activity) => sum + activity.annualPremium, 0);
  const totalContracts = activities.length;
  const totalCommissions = activities.reduce((sum, activity) => sum + activity.potentialCommission, 0);
  const realCommissions = activities.reduce((sum, activity) => sum + (activity.isCommissionReal ? activity.potentialCommission : 0), 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec totaux */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Activités du mois
          </h3>
          {onAddActivity && (
            <Button onClick={onAddActivity} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel acte
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalCA.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">CA Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalContracts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Contrats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalCommissions.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Commissions Pot.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {realCommissions.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Commissions Réelles</div>
          </div>
        </div>
      </div>

      {/* Timeline par jour */}
      <div className="space-y-4">
        {Object.keys(activitiesByDay)
          .sort((a, b) => parseInt(b) - parseInt(a)) // Trier par jour décroissant
          .map(day => (
            <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {day} {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activitiesByDay[day].length} acte{activitiesByDay[day].length > 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                {activitiesByDay[day].map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      onEditActivity && "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    )}
                    onClick={() => onEditActivity?.(activity)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {activity.clientName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.contractNumber} • {productTypeLabels[activity.productType as keyof typeof productTypeLabels]}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {activity.annualPremium.toLocaleString('fr-FR')} €
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        activity.isCommissionReal 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        {activity.potentialCommission.toLocaleString('fr-FR')} €
                        {activity.isCommissionReal && " ✓"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Message si aucune activité */}
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CalendarDays className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Aucune activité ce mois-ci</p>
          <p className="text-sm">Commencez par ajouter votre premier acte commercial</p>
          {onAddActivity && (
            <Button onClick={onAddActivity} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un acte
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
