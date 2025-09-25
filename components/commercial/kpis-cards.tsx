'use client';

import { useState } from 'react';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { useCommercialData } from '@/lib/commercial-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Euro, FileText, Car, Building2, TrendingUp, Cog, DollarSign, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function KPIsCards() {
  const { getCurrentMonthDisplay } = useNavigation();
  const { activities, isLoading, kpis } = useCommercialData();
  const [showPedagogicNote, setShowPedagogicNote] = useState(true);

  // Les KPIs sont maintenant fournis par le provider centralisé

  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          KPIs du mois
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Indicateurs clés de performance pour {getCurrentMonthDisplay()}
        </p>
      </div>
      
      {/* Première ligne : CA du mois, Nombre total, Nombre auto, Nombre autre */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CA du mois */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-500" />
              CA du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(kpis.totalCA)}
            </div>
          </CardContent>
        </Card>

        {/* Nombre de contrats total */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Nombre total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {kpis.totalContracts}
            </div>
          </CardContent>
        </Card>

        {/* Nombre auto */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-purple-500" />
              Nombre auto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {kpis.autoContracts}
            </div>
          </CardContent>
        </Card>

        {/* Nombre autre */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Nombre autre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {kpis.contractsOtherThanAuto}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deuxième ligne : Ratio, Nombre de process, Commissions potentielles, Commissions réelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Ratio autres/auto */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Ratio autres/auto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercentage(kpis.ratioOtherToAuto)}
            </div>
          </CardContent>
        </Card>

        {/* Nombre de process */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Cog className="w-4 h-4 text-teal-500" />
              Nombre de process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {kpis.totalProcessActs}
            </div>
          </CardContent>
        </Card>

        {/* Commissions potentielles */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Commissions potentielles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(kpis.potentialCommissions)}
            </div>
          </CardContent>
        </Card>

        {/* Commissions réelles */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Commissions réelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(kpis.realCommissions)}
              </div>
              {kpis.realCommissions > 0 && (
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  ✓ Réelles
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note pédagogique sur les commissions réelles */}
      <div className="mt-6">
        <div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
          onClick={() => setShowPedagogicNote(!showPedagogicNote)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                Comment les commissions deviennent réelles ?
              </h4>
            </div>
            {showPedagogicNote ? (
              <ChevronUp className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-500" />
            )}
          </div>
          
          {showPedagogicNote && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Les commissions potentielles deviennent réelles lorsque <strong>3 conditions</strong> sont simultanément remplies :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Cog className="w-4 h-4 text-teal-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Process</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>≥ 15 process</strong> dans le mois<br/>
                    <span className="text-xs text-slate-500">(M+3, Préterme Auto, Préterme IARD)</span>
                  </p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Ratio</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>≥ 100%</strong> autres/auto<br/>
                    <span className="text-xs text-slate-500">(contrats autres ÷ contrats auto)</span>
                  </p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Commissions</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>≥ 200 €</strong> potentielles<br/>
                    <span className="text-xs text-slate-500">(total des commissions du mois)</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Résultat : Si les 3 conditions sont remplies, les commissions potentielles deviennent réelles !
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
