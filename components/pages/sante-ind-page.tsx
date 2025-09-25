'use client';

import { useNavigation } from '@/lib/sante-ind-navigation-context';
import { SanteIndDataProvider } from '@/lib/sante-ind-data-context';
import { MonthlyNavigation } from '@/components/sante-ind/monthly-navigation';
import { KPIsCards } from '@/components/sante-ind/kpis-cards';
import { ActButtons } from '@/components/sante-ind/act-buttons';
import { TimelineComponent } from '@/components/sante-ind/timeline-component';
import { FiltersSystem } from '@/components/sante-ind/filters-system';
import { DataTable } from '@/components/sante-ind/data-table';
import { ErrorMonitor } from '@/components/error-monitor';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function SanteIndPage() {
  const { currentMonth, isLoading } = useNavigation();

  return (
    <SanteIndDataProvider>
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
                    Module Santé Individuelle
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Saisie et suivi de l'activité santé individuelle
                  </p>
                  <p className="text-blue-200">
                    Gérez vos actes santé et suivez vos commissions
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

                {/* Rappel des règles de calcul */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Règles de calcul des commissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tranches de commission</h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>&lt; 10.000 € → 0%</div>
                        <div>&lt; 14.000 € → 2%</div>
                        <div>&lt; 18.000 € → 3%</div>
                        <div>&lt; 22.000 € → 4%</div>
                        <div>≥ 22.000 € → 6%</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Coefficients par type d'acte</h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>Affaire Nouvelle → 100%</div>
                        <div>Révision → 50%</div>
                        <div>Adhésion salarié → 50%</div>
                        <div>COURT → AZ → 75%</div>
                        <div>AZ → Courtage → 50%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      <strong>Critère de déblocage :</strong> Les commissions ne sont débloquées que si au moins 4 révisions sont saisies dans le mois.
                    </p>
                  </div>
                </div>

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
    </SanteIndDataProvider>
  );
}
