'use client';

import { useNavigation } from '@/lib/commercial-navigation-context';
import { CommercialDataProvider } from '@/lib/commercial-data-context';
import { MonthlyNavigation } from '@/components/commercial/monthly-navigation';
import { KPIsCards } from '@/components/commercial/kpis-cards';
import { ActButtons } from '@/components/commercial/act-buttons';
import { TimelineComponent } from '@/components/commercial/timeline-component';
import { FiltersSystem } from '@/components/commercial/filters-system';
import { DataTable } from '@/components/commercial/data-table';
import { ErrorMonitor } from '@/components/error-monitor';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CommercialPage() {
  const { currentMonth, isLoading } = useNavigation();

  return (
    <CommercialDataProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Monitoring des erreurs */}
        <ErrorMonitor />
        
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    Module Commercial
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Saisie et suivi de l'activité commerciale
                  </p>
                  <p className="text-blue-200">
                    Gérez vos actes commerciaux et suivez vos performances
                  </p>
                </div>
              </div>

              <div className="space-y-6">
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
            </main>
          </div>
        </div>
      </div>
    </CommercialDataProvider>
  );
}
