'use client';

import { SanteCollNavigationProvider } from '@/lib/sante-coll-navigation-context';
import { SanteCollDataProvider } from '@/lib/sante-coll-data-context';
import { SanteCollMonthlyNavigation } from '@/components/sante-coll/monthly-navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SanteCollectivePage() {
  return (
    <SanteCollNavigationProvider>
      <SanteCollDataProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 dark:from-slate-900 dark:to-slate-800">
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      Module Santé Collective
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Saisie et suivi de l'activité santé collective
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
            {/* Navigation mensuelle */}
            <SanteCollMonthlyNavigation />

            {/* Contenu à développer */}
            <div className="text-center py-12">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                  Module en développement
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Le module Santé Collective sera développé selon les spécifications du cahier des charges.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Navigation mensuelle avec voyant de verrouillage implémentée
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Provider de données centralisé préparé pour éviter les requêtes multiples
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    KPIs spécifiques santé collective (employés couverts, taille d'entreprise, etc.)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SanteCollDataProvider>
    </SanteCollNavigationProvider>
  );
}
