'use client';

import { useNavigation } from '@/lib/commercial-navigation-context';
import { MonthlyNavigation } from '@/components/commercial/monthly-navigation';
import { KPIsCards } from '@/components/commercial/kpis-cards';
import { ActButtons } from '@/components/commercial/act-buttons';
import { TimelineComponent } from '@/components/commercial/timeline-component';
import { FiltersSystem } from '@/components/commercial/filters-system';
import { DataTable } from '@/components/commercial/data-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CommercialPage() {
  const { currentMonth, isLoading } = useNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header avec bouton retour */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Module Commercial
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Saisie et suivi de l'activité commerciale
                </p>
              </div>
            </div>
            
            {/* Toggle thème clair/sombre */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Navigation mensuelle - PRIORITÉ ABSOLUE */}
        <MonthlyNavigation />

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-t-blue-600"></div>
          </div>
        )}

        {/* KPIs du mois */}
        <KPIsCards />

        {/* Boutons de saisie d'actes */}
        <ActButtons />

        {/* Système de filtres avec Timeline et Tableau */}
        <FiltersSystem>
          {/* Timeline interactive */}
          <TimelineComponent />

          {/* Tableau des saisies */}
          <DataTable />
        </FiltersSystem>
      </div>
    </div>
  );
}
