'use client';

import { useSanteIndNavigation } from '@/lib/sante-ind-navigation-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Lock, Unlock } from 'lucide-react';

export function SanteIndMonthlyNavigation() {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isLoading,
    isCurrentMonth,
    getCurrentMonthDisplay,
    isMonthLocked,
  } = useSanteIndNavigation();

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
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {getCurrentMonthDisplay()}
              </h2>
              {/* Voyant de verrouillage */}
              <div className="flex items-center gap-1">
                {isMonthLocked ? (
                  <>
                    <Lock className="h-5 w-5 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Verrouillé
                    </span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Déverrouillé
                    </span>
                  </>
                )}
              </div>
            </div>
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
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            disabled={isCurrentMonthActive || isLoading}
            className="gap-2 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Retour au mois actuel
          </Button>
        </div>
      </Card>
    </div>
  );
}
