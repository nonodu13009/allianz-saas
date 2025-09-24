'use client';

import { SanteIndNavigationProvider } from '@/lib/sante-ind-navigation-context';
import { SanteIndMonthlyNavigation } from '@/components/sante-ind/monthly-navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SanteIndividuellePage() {
  return (
    <SanteIndNavigationProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
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
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Module Santé Individuelle
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Saisie et suivi de l'activité santé individuelle
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
          <SanteIndMonthlyNavigation />

          {/* Contenu à développer */}
          <div className="text-center py-12">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Module en développement
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Le module Santé Individuelle sera développé selon les spécifications du cahier des charges.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Navigation mensuelle avec voyant de verrouillage implémentée
              </div>
            </div>
          </div>
        </div>
      </div>
    </SanteIndNavigationProvider>
  );
}
