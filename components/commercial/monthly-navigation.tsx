'use client';

import { useNavigation } from '@/lib/commercial-navigation-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export function MonthlyNavigation() {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isLoading,
    isCurrentMonth,
    getCurrentMonthDisplay,
  } = useNavigation();

  const isCurrentMonthActive = isCurrentMonth(currentMonth);

  return (
    <div className="flex justify-center">
      <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-6">
          {/* Bouton mois précédent */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={isLoading}
            className="gap-2 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Affichage du mois */}
          <div className="text-center min-w-[220px]">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {getCurrentMonthDisplay()}
            </h2>
          </div>

          {/* Bouton mois suivant */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={isLoading}
            className="gap-2 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Bouton retour au mois actuel */}
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            disabled={isLoading || isCurrentMonthActive}
            className={`gap-2 text-sm transition-all ${
              isCurrentMonthActive 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            Retour au mois actuel
          </Button>
        </div>
      </Card>
    </div>
  );
}
