'use client';

import { useSanteCollNavigation } from '@/lib/sante-coll-navigation-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Lock, Unlock } from 'lucide-react';

export function SanteCollMonthlyNavigation() {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isLoading,
    isCurrentMonth,
    getCurrentMonthDisplay,
    isMonthLocked,
  } = useSanteCollNavigation();

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
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
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
            disabled={isLoading || isCurrentMonthActive}
            className={`gap-2 text-xs ${
              isCurrentMonthActive 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            {isCurrentMonthActive ? 'Mois actuel' : 'Retour au mois actuel'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
