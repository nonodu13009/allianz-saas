'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/components/providers';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import Link from 'next/link';
import { 
  CommissionData, 
  getCommissions, 
  getCommissionsByYear, 
  getAvailableYears,
  createCommission,
  updateCommission,
  deleteCommission,
  calculateTotals,
  calculateYearTotals,
  migrateCommissionsData
} from '@/lib/firebase-commissions';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Métriques disponibles pour la comparaison d'années
const COMPARISON_METRICS = [
  { value: 'total_commissions', label: 'Total des commissions', color: '#3b82f6' },
  { value: 'commissions_vie', label: 'Commissions Vie', color: '#10b981' },
  { value: 'commissions_courtage', label: 'Commissions Courtage', color: '#8b5cf6' },
  { value: 'commissions_iard', label: 'Commissions IARD', color: '#f59e0b' },
  { value: 'profits_exceptionnels', label: 'Produits Exceptionnels', color: '#ef4444' },
  { value: 'charges_agence', label: 'Charges Agence', color: '#6b7280' },
  { value: 'resultat', label: 'Résultat', color: '#06b6d4' },
  { value: 'prelevements_julien', label: 'Prélèvement Julien', color: '#84cc16' },
  { value: 'prelevements_jean_michel', label: 'Prélèvement Jean-Michel', color: '#f97316' }
];

// Fonction utilitaire pour formater uniformément les montants
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value)); // S'assurer que c'est un entier
};

export function CommissionsManagementPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<CommissionData | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: '',
    commissions_iard: '',
    commissions_vie: '',
    commissions_courtage: '',
    profits_exceptionnels: '',
    charges_agence: '',
    prelevements_julien: '',
    prelevements_jean_michel: ''
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisYears, setAnalysisYears] = useState<number[]>([]);
  const [analysisPoste, setAnalysisPoste] = useState<string>('total_commissions');
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthFormData, setMonthFormData] = useState<Record<string, string>>({
    commissions_iard: '',
    commissions_vie: '',
    commissions_courtage: '',
    profits_exceptionnels: '',
    charges_agence: '',
    prelevements_julien: '',
    prelevements_jean_michel: ''
  });

  // États pour la comparaison d'années
  const [showYearComparison, setShowYearComparison] = useState(false);
  const [selectedYearsForComparison, setSelectedYearsForComparison] = useState<number[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<string>('total_commissions');
  const [yearComparisonData, setYearComparisonData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données de commissions...');
      const [commissionsData, years] = await Promise.all([
        getCommissions(),
        getAvailableYears()
      ]);
      console.log('Données chargées:', { 
        commissionsCount: commissionsData.commissions.length, 
        years: years,
        commissions: commissionsData.commissions 
      });
      setCommissions(commissionsData.commissions);
      setAvailableYears(years);
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionsByYear = async (year: number) => {
    setLoading(true);
    try {
      const commissionsData = await getCommissionsByYear(year);
      setCommissions(commissionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initialisation de la page commissions...');
    loadData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadCommissionsByYear(selectedYear);
    } else {
      loadData();
    }
  }, [selectedYear]);

  // Recalculer les données de comparaison quand les années sélectionnées changent
  useEffect(() => {
    if (selectedYearsForComparison.length > 0 && showYearComparison) {
      console.log('useEffect: Recalcul des données de comparaison pour les années:', selectedYearsForComparison);
      calculateYearComparisonData();
    }
  }, [selectedYearsForComparison, showYearComparison]);

  if (!user || user.role !== 'administrateur') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accès Refusé</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const commissionData = {
        year: formData.year,
        month: formData.month,
        commissions_iard: parseFloat(formData.commissions_iard) || 0,
        commissions_vie: parseFloat(formData.commissions_vie) || 0,
        commissions_courtage: parseFloat(formData.commissions_courtage) || 0,
        profits_exceptionnels: parseFloat(formData.profits_exceptionnels) || 0,
        charges_agence: parseFloat(formData.charges_agence) || 0,
        prelevements_julien: parseFloat(formData.prelevements_julien) || 0,
        prelevements_jean_michel: parseFloat(formData.prelevements_jean_michel) || 0
      };

      if (editingCommission?.id) {
        await updateCommission(editingCommission.id, commissionData);
      } else {
        await createCommission(commissionData);
      }

      await loadData();
      resetForm();
      setIsCreateDialogOpen(false);
      setEditingCommission(null);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      setLoading(true);
      try {
        await deleteCommission(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMigrateData = async () => {
    setLoading(true);
    try {
      console.log('Migration des données de commissions...');
      await migrateCommissionsData();
      console.log('Migration terminée, rechargement des données...');
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour la comparaison d'années
  const calculateYearComparisonData = async () => {
    console.log('calculateYearComparisonData appelée avec années:', selectedYearsForComparison);
    if (selectedYearsForComparison.length === 0) {
      console.log('Aucune année sélectionnée, arrêt du calcul');
      return;
    }

    const monthOrder = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Créer un objet pour regrouper par mois
    const monthlyData: { [key: string]: any } = {};
    
    // Initialiser tous les mois
    monthOrder.forEach(month => {
      monthlyData[month] = { month };
    });
    
    for (const year of selectedYearsForComparison) {
      try {
        console.log(`Chargement des données pour l'année ${year}...`);
        const yearCommissions = await getCommissionsByYear(year);
        
        if (!yearCommissions || !Array.isArray(yearCommissions)) {
          console.error(`Données invalides pour ${year}:`, yearCommissions);
          continue;
        }
        
        // Ajouter les données de chaque mois pour cette année
        yearCommissions.forEach(commission => {
          const monthKey = commission.month;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey][`year_${year}`] = {
              total_commissions: commission.commissions_iard + commission.commissions_vie + commission.commissions_courtage + commission.profits_exceptionnels,
              commissions_vie: commission.commissions_vie,
              commissions_courtage: commission.commissions_courtage,
              commissions_iard: commission.commissions_iard,
              profits_exceptionnels: commission.profits_exceptionnels,
              charges_agence: commission.charges_agence,
              resultat: (commission.commissions_iard + commission.commissions_vie + commission.commissions_courtage + commission.profits_exceptionnels) - commission.charges_agence,
              prelevements_julien: commission.prelevements_julien,
              prelevements_jean_michel: commission.prelevements_jean_michel
            };
          }
        });
      } catch (error) {
        console.error(`Erreur lors du chargement des données pour ${year}:`, error);
      }
    }
    
    // Convertir en tableau et trier par mois
    const comparisonData = monthOrder.map(month => monthlyData[month]);
    
    console.log('Données de comparaison finales (regroupées par mois):', comparisonData);
    setYearComparisonData(comparisonData);
  };

  const handleComparisonMetricChange = (metric: string) => {
    setComparisonMetric(metric);
  };

  const toggleYearComparison = () => {
    setShowYearComparison(!showYearComparison);
    if (!showYearComparison && selectedYearsForComparison.length > 0) {
      calculateYearComparisonData();
    }
  };

  // Fonction pour déclencher le calcul quand on sélectionne des années
  const handleYearSelectionChange = (years: number[]) => {
    console.log('Sélection d\'années changée:', years);
    setSelectedYearsForComparison(years);
    if (years.length > 0 && showYearComparison) {
      console.log('Déclenchement du calcul des données...');
      calculateYearComparisonData();
    }
  };

  const handleCellClick = (year: number, month: string) => {
    // Chercher les données existantes pour ce mois/année
    const existingCommission = commissions.find(c => c.year === year && c.month === month);
    
    if (existingCommission) {
      // Remplir le formulaire avec les données existantes
      const formData: any = {
        commissions_iard: existingCommission.commissions_iard.toString(),
        commissions_vie: existingCommission.commissions_vie.toString(),
        commissions_courtage: existingCommission.commissions_courtage.toString(),
        profits_exceptionnels: existingCommission.profits_exceptionnels.toString(),
        charges_agence: existingCommission.charges_agence.toString(),
        prelevements_julien: existingCommission.prelevements_julien.toString(),
        prelevements_jean_michel: existingCommission.prelevements_jean_michel.toString()
      };

      // Ajouter les champs dynamiques des autres administrateurs
      Object.keys(existingCommission).forEach(key => {
        if (key.startsWith('prelevements_') && 
            key !== 'prelevements_julien' && 
            key !== 'prelevements_jean_michel') {
          formData[key] = (existingCommission as any)[key]?.toString() || '';
        }
      });

      setMonthFormData(formData);
    } else {
      // Vider le formulaire pour nouvelle entrée
      setMonthFormData({
        commissions_iard: '',
        commissions_vie: '',
        commissions_courtage: '',
        profits_exceptionnels: '',
        charges_agence: '',
        prelevements_julien: '',
        prelevements_jean_michel: ''
      });
    }
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowMonthModal(true);
  };

  const handleEdit = (commission: CommissionData) => {
    setFormData({
      year: commission.year,
      month: commission.month,
      commissions_iard: commission.commissions_iard.toString(),
      commissions_vie: commission.commissions_vie.toString(),
      commissions_courtage: commission.commissions_courtage.toString(),
      profits_exceptionnels: commission.profits_exceptionnels.toString(),
      charges_agence: commission.charges_agence.toString(),
      prelevements_julien: commission.prelevements_julien.toString(),
      prelevements_jean_michel: commission.prelevements_jean_michel.toString()
    });
    setEditingCommission(commission);
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      month: '',
      commissions_iard: '',
      commissions_vie: '',
      commissions_courtage: '',
      profits_exceptionnels: '',
      charges_agence: '',
      prelevements_julien: '',
      prelevements_jean_michel: ''
    });
    setEditingCommission(null);
  };

  const totals = calculateTotals(commissions);
  const yearTotals = selectedYear ? calculateYearTotals(commissions, selectedYear) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  Gestion des commissions
                </h1>
                <p className="text-blue-100 text-lg">
                  Administration des commissions et profits
                </p>
                <p className="text-blue-200">
                  Suivez et gérez les commissions de l'agence
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Contrôles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={selectedYear?.toString() || ''} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={toggleYearComparison} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {showYearComparison ? 'Masquer' : 'Afficher'} l'analyse
                  </Button>
                  <Button onClick={() => selectedYear ? loadCommissionsByYear(selectedYear) : loadData()} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Recharger
                  </Button>
                </div>
                {/* Modale de modification mensuelle */}
                <Dialog open={showMonthModal} onOpenChange={setShowMonthModal}>
                  <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-2xl">
                    <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedMonth && selectedYear ? 
                          `Modifier ${selectedMonth} ${selectedYear}` : 
                          'Ajouter des données'
                        }
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        {selectedMonth && selectedYear ? 
                          `Modifiez les données pour ${selectedMonth} ${selectedYear}` : 
                          'Remplissez les informations pour ce mois'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      try {
                        // Construction dynamique des données de commission
                        const commissionData: any = {
                          year: selectedYear,
                          month: selectedMonth,
                          commissions_iard: parseFloat(monthFormData.commissions_iard) || 0,
                          commissions_vie: parseFloat(monthFormData.commissions_vie) || 0,
                          commissions_courtage: parseFloat(monthFormData.commissions_courtage) || 0,
                          profits_exceptionnels: parseFloat(monthFormData.profits_exceptionnels) || 0,
                          charges_agence: parseFloat(monthFormData.charges_agence) || 0,
                          prelevements_julien: parseFloat(monthFormData.prelevements_julien) || 0,
                          prelevements_jean_michel: parseFloat(monthFormData.prelevements_jean_michel) || 0
                        };

                        // Ajouter les champs dynamiques des autres administrateurs
                        Object.keys(monthFormData).forEach(key => {
                          if (key.startsWith('prelevements_') && 
                              key !== 'prelevements_julien' && 
                              key !== 'prelevements_jean_michel') {
                            commissionData[key] = parseFloat(monthFormData[key]) || 0;
                          }
                        });

                        // Chercher si une entrée existe déjà
                        const existingCommission = commissions.find(c => c.year === selectedYear && c.month === selectedMonth);
                        
                        if (existingCommission?.id) {
                          await updateCommission(existingCommission.id, commissionData);
                        } else {
                          await createCommission(commissionData);
                        }

                        await loadData();
                        setShowMonthModal(false);
                      } catch (error) {
                        console.error('Erreur lors de la soumission:', error);
                      } finally {
                        setLoading(false);
                      }
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-3">
                          <Label htmlFor="commissions_iard" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Commissions IARD
                          </Label>
                          <Input
                            id="commissions_iard"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_iard}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_iard: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="commissions_vie" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Commissions Vie
                          </Label>
                          <Input
                            id="commissions_vie"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_vie}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_vie: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="commissions_courtage" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Commissions Courtage
                          </Label>
                          <Input
                            id="commissions_courtage"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_courtage}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_courtage: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="profits_exceptionnels" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Profits Exceptionnels
                          </Label>
                          <Input
                            id="profits_exceptionnels"
                            type="number"
                            step="0.01"
                            value={monthFormData.profits_exceptionnels}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, profits_exceptionnels: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="charges_agence" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Charges Agence
                          </Label>
                          <Input
                            id="charges_agence"
                            type="number"
                            step="0.01"
                            value={monthFormData.charges_agence}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, charges_agence: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="prelevements_julien" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Prélèvements Julien
                          </Label>
                          <Input
                            id="prelevements_julien"
                            type="number"
                            step="0.01"
                            value={monthFormData.prelevements_julien}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, prelevements_julien: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="prelevements_jean_michel" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Prélèvements Jean-Michel
                          </Label>
                          <Input
                            id="prelevements_jean_michel"
                            type="number"
                            step="0.01"
                            value={monthFormData.prelevements_jean_michel}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, prelevements_jean_michel: e.target.value }))}
                            placeholder="0"
                            className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        {/* Champs dynamiques pour autres administrateurs */}
                        {(() => {
                          // Extraire les administrateurs depuis les données existantes
                          const getAdministratorsFromData = () => {
                            const admins = new Set<string>();
                            commissions.forEach(commission => {
                              Object.keys(commission).forEach(key => {
                                if (key.startsWith('prelevements_') && key !== 'prelevements_julien' && key !== 'prelevements_jean_michel') {
                                  const adminName = key.replace('prelevements_', '').replace(/_/g, ' ');
                                  admins.add(adminName);
                                }
                              });
                            });
                            return Array.from(admins).sort();
                          };

                          const administrators = getAdministratorsFromData();
                          
                          return administrators.map(admin => {
                            const fieldKey = `prelevements_${admin.replace(/\s+/g, '_')}`;
                            return (
                              <div key={fieldKey} className="space-y-3">
                                <Label htmlFor={fieldKey} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Prélèvements {admin.charAt(0).toUpperCase() + admin.slice(1)}
                                </Label>
                                <Input
                                  id={fieldKey}
                                  type="number"
                                  step="0.01"
                                  value={monthFormData[fieldKey] || ''}
                                  onChange={(e) => setMonthFormData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                  placeholder="0"
                                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowMonthModal(false)}
                          className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Annuler
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all"
                        >
                          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Sauvegarder
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Analyse */}
              {showAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Total Commissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totals.totalCommissions)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Profits Exceptionnels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totals.totalProfitsExceptionnels)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Charges Agence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(totals.totalChargesAgence)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Section de comparaison d'années */}
              {showYearComparison && (
                <div className="mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Header avec gradient */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyse comparative</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Comparez les performances par mois et par année</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-8">
                      {/* Sélection des années */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Années à comparer</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableYears.map(year => (
                            <button
                              key={year}
                              onClick={() => {
                                const newSelection = selectedYearsForComparison.includes(year)
                                  ? selectedYearsForComparison.filter(y => y !== year)
                                  : [...selectedYearsForComparison, year];
                                handleYearSelectionChange(newSelection);
                              }}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                selectedYearsForComparison.includes(year)
                                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Métriques organisées */}
                      <div className="space-y-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Métriques</h4>
                        
                        {/* Commissions */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Commissions</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { key: 'total_commissions', label: 'Total', color: 'blue', bgClass: 'bg-blue-500', shadowClass: 'shadow-blue-500/25' },
                              { key: 'commissions_vie', label: 'Vie', color: 'emerald', bgClass: 'bg-emerald-500', shadowClass: 'shadow-emerald-500/25' },
                              { key: 'commissions_courtage', label: 'Courtage', color: 'purple', bgClass: 'bg-purple-500', shadowClass: 'shadow-purple-500/25' },
                              { key: 'commissions_iard', label: 'IARD', color: 'orange', bgClass: 'bg-orange-500', shadowClass: 'shadow-orange-500/25' },
                              { key: 'profits_exceptionnels', label: 'Exceptionnels', color: 'red', bgClass: 'bg-red-500', shadowClass: 'shadow-red-500/25' }
                            ].map(metric => (
                              <button
                                key={metric.key}
                                onClick={() => handleComparisonMetricChange(metric.key)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  comparisonMetric === metric.key
                                    ? `${metric.bgClass} text-white shadow-md ${metric.shadowClass}`
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                              >
                                {metric.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Charges */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Charges</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleComparisonMetricChange('charges_agence')}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                comparisonMetric === 'charges_agence'
                                  ? 'bg-gray-500 text-white shadow-md shadow-gray-500/25'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              Charges Agence
                            </button>
                          </div>
                        </div>

                        {/* Bénéfice */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Bénéfice</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleComparisonMetricChange('resultat')}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                comparisonMetric === 'resultat'
                                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              Résultat
                            </button>
                          </div>
                        </div>

                        {/* Prélèvements */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Prélèvements</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleComparisonMetricChange('prelevements_julien')}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                comparisonMetric === 'prelevements_julien'
                                  ? 'bg-lime-500 text-white shadow-md shadow-lime-500/25'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              Julien
                            </button>
                            <button
                              onClick={() => handleComparisonMetricChange('prelevements_jean_michel')}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                comparisonMetric === 'prelevements_jean_michel'
                                  ? 'bg-lime-500 text-white shadow-md shadow-lime-500/25'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              Jean-Michel
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Type de graphique */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Type de visualisation</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setChartType('bar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              chartType === 'bar'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            <BarChart className="h-4 w-4" />
                            Histogramme
                          </button>
                          <button
                            onClick={() => setChartType('line')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              chartType === 'line'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            <TrendingUp className="h-4 w-4" />
                            Courbe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                      {/* Graphique de comparaison */}
                      {selectedYearsForComparison.length > 0 && yearComparisonData.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                          {/* Header du graphique */}
                          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Visualisation</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {COMPARISON_METRICS.find(m => m.value === comparisonMetric)?.label} • {selectedYearsForComparison.join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedYearsForComparison.map((year, index) => {
                                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                                  return (
                                    <div key={year} className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{year}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Zone du graphique */}
                          <div className="p-6">
                            <div className="h-80">
                              {yearComparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  {chartType === 'bar' ? (
                                    <RechartsBarChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis 
                                        dataKey="month" 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                      />
                                      <YAxis 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => formatCurrency(value)}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                      />
                                      <ChartTooltip 
                                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                        labelFormatter={(label) => `Mois: ${label}`}
                                        contentStyle={{
                                          backgroundColor: 'white',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '8px',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                      />
                                      {selectedYearsForComparison.map((year, index) => {
                                        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                                        return (
                                          <Bar 
                                            key={year}
                                            dataKey={`year_${year}.${comparisonMetric}`} 
                                            fill={colors[index % colors.length]}
                                            name={`${year}`}
                                            radius={[4, 4, 0, 0]}
                                          />
                                        );
                                      })}
                                    </RechartsBarChart>
                                  ) : (
                                    <LineChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis 
                                        dataKey="month" 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                      />
                                      <YAxis 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => formatCurrency(value)}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                      />
                                      <ChartTooltip 
                                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                        labelFormatter={(label) => `Mois: ${label}`}
                                        contentStyle={{
                                          backgroundColor: 'white',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '8px',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                      />
                                      {selectedYearsForComparison.map((year, index) => {
                                        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                                        return (
                                          <Line 
                                            key={year}
                                            type="monotone"
                                            dataKey={`year_${year}.${comparisonMetric}`} 
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={3}
                                            name={`${year}`}
                                            dot={{ r: 5, fill: colors[index % colors.length] }}
                                            activeDot={{ r: 7, stroke: colors[index % colors.length], strokeWidth: 2 }}
                                          />
                                        );
                                      })}
                                    </LineChart>
                                  )}
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  Aucune donnée à afficher
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedYearsForComparison.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Sélectionnez au moins une année pour voir la comparaison</p>
                          <Button 
                            onClick={() => {
                              console.log('Test: Années disponibles:', availableYears);
                              console.log('Test: Données actuelles:', yearComparisonData);
                              console.log('Test: État showYearComparison:', showYearComparison);
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            Test Debug
                          </Button>
                        </div>
                      )}

                      {selectedYearsForComparison.length > 0 && yearComparisonData.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Chargement des données...</p>
                          <p className="text-sm mt-2">Années sélectionnées: {selectedYearsForComparison.join(', ')}</p>
                        </div>
                      )}

              {/* Tableau des commissions */}
              <div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : commissions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucune commission trouvée
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Il n'y a actuellement aucune donnée de commission dans la base de données.
                      </p>
                      <div className="space-x-4">
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter la première commission
                        </Button>
                        <Button onClick={handleMigrateData} variant="outline">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Charger les données par défaut
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Tableau pivoté par année */}
                      {availableYears.map(year => {
                        const yearCommissions = commissions.filter(c => c.year === year);
                        if (yearCommissions.length === 0) return null;
                        
                        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                        
                        // Extraction des administrateurs depuis les données
                        const getAdministrators = (commissions: CommissionData[]) => {
                          const admins = new Set<string>();
                          commissions.forEach(commission => {
                            Object.keys(commission).forEach(key => {
                              if (key.startsWith('prelevements_') && key !== 'prelevements_julien' && key !== 'prelevements_jean_michel') {
                                const adminName = key.replace('prelevements_', '').replace(/_/g, ' ');
                                admins.add(adminName);
                              }
                            });
                          });
                          return Array.from(admins).sort();
                        };

                        const administrators = getAdministrators(yearCommissions);
                        
                        // Structure des lignes selon l'ordre demandé
                        const tableRows = [
                          // Lignes individuelles des commissions
                          { key: 'commissions_iard', label: 'Commissions IARD', color: 'text-blue-600', type: 'commission' },
                          { key: 'commissions_vie', label: 'Commissions Vie', color: 'text-green-600', type: 'commission' },
                          { key: 'commissions_courtage', label: 'Commissions Courtage', color: 'text-purple-600', type: 'commission' },
                          { key: 'profits_exceptionnels', label: 'Produits Exceptionnels', color: 'text-orange-600', type: 'commission' },
                          
                          // Ligne calculée : Total des commissions
                          { key: 'total_commissions', label: 'Total des commissions', color: 'text-green-700', type: 'calculated', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-700' },
                          
                          // Ligne individuelle : Charges
                          { key: 'charges_agence', label: 'Charges', color: 'text-red-600', type: 'charge' },
                          
                          // Ligne calculée : Résultat
                          { key: 'resultat', label: 'Résultat', color: 'text-blue-700', type: 'calculated', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-700' },
                          
                          // Lignes des prélèvements administrateurs (ordre fixe puis dynamique)
                          { key: 'prelevements_julien', label: 'Prélèvement Julien', color: 'text-indigo-600', type: 'prelevement' },
                          { key: 'prelevements_jean_michel', label: 'Prélèvement Jean-Michel', color: 'text-pink-600', type: 'prelevement' },
                          
                          // Lignes dynamiques des autres administrateurs
                          ...administrators.map(admin => ({
                            key: `prelevements_${admin.replace(/\s+/g, '_')}`,
                            label: `Prélèvement ${admin.charAt(0).toUpperCase() + admin.slice(1)}`,
                            color: 'text-cyan-600',
                            type: 'prelevement'
                          }))
                        ];
                        
                        return (
                          <Card key={year}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Commissions {year}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="font-semibold">Type</TableHead>
                                      {months.map(month => (
                                        <TableHead key={month} className="text-center font-medium">
                                          {month}
                                        </TableHead>
                                      ))}
                                      <TableHead className="text-center font-semibold">Total</TableHead>
                                      <TableHead className="text-center font-semibold">Moyenne</TableHead>
                                      <TableHead className="text-center font-semibold">Extrapolation</TableHead> {/* Force reload */}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tableRows.map(row => {
                                      // Calcul des valeurs selon le type de ligne
                                      let monthlyValues: number[];
                                      let total: number;
                                      let completeMonths: number[];
                                      let average: number;
                                      let extrapolation: number;
                                      let isYearComplete: boolean;

                                      if (row.type === 'calculated') {
                                        if (row.key === 'total_commissions') {
                                          // Total des commissions = somme de toutes les commissions
                                          monthlyValues = months.map(month => {
                                            const commission = yearCommissions.find(c => c.month === month);
                                            if (!commission) return 0;
                                            return commission.commissions_iard + commission.commissions_vie + 
                                                   commission.commissions_courtage + commission.profits_exceptionnels;
                                          });
                                        } else if (row.key === 'resultat') {
                                          // Résultat = total commissions - charges
                                          const monthlyCommissionsTotal = months.map(month => {
                                            const commission = yearCommissions.find(c => c.month === month);
                                            if (!commission) return 0;
                                            return commission.commissions_iard + commission.commissions_vie + 
                                                   commission.commissions_courtage + commission.profits_exceptionnels;
                                          });
                                          const monthlyCharges = months.map(month => {
                                            const commission = yearCommissions.find(c => c.month === month);
                                            return commission ? commission.charges_agence : 0;
                                          });
                                          monthlyValues = months.map((_, index) => {
                                            return monthlyCommissionsTotal[index] - monthlyCharges[index];
                                          });
                                        } else {
                                          monthlyValues = [];
                                        }
                                      } else {
                                        // Lignes individuelles
                                        monthlyValues = months.map(month => {
                                          const commission = yearCommissions.find(c => c.month === month);
                                          return commission ? commission[row.key as keyof CommissionData] as number : 0;
                                        });
                                      }

                                      total = monthlyValues.reduce((sum, value) => sum + value, 0);
                                      completeMonths = monthlyValues.filter(value => value > 0);
                                      average = completeMonths.length > 0 ? total / completeMonths.length : 0;
                                      extrapolation = average * 12;
                                      isYearComplete = completeMonths.length === 12;

                                      // Classes CSS selon le type
                                      const rowClasses = row.type === 'calculated' ? 
                                        `${row.bgColor} border-t-2 ${row.borderColor}` : '';
                                      
                                      const cellClasses = row.type === 'calculated' ? 
                                        `font-bold ${row.color} dark:text-opacity-90` : 
                                        `font-medium ${row.color}`;

                                      return (
                                        <TableRow key={row.key} className={rowClasses}>
                                          <TableCell className={cellClasses}>
                                            {row.label}
                                          </TableCell>
                                          {monthlyValues.map((value, index) => (
                                            <TableCell 
                                              key={index} 
                                              className={`text-center ${row.type === 'calculated' ? 'font-bold' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'}`}
                                              onClick={row.type !== 'calculated' ? () => handleCellClick(year, months[index]) : undefined}
                                            >
                                              {value > 0 ? (
                                                <span className={row.type === 'calculated' ? cellClasses : 'font-medium'}>
                                                  {formatCurrency(value)}
                                                </span>
                                              ) : (
                                                row.type === 'calculated' ? (
                                                  <span className="text-gray-400">-</span>
                                                ) : (
                                                  <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    Cliquer pour ajouter
                                                  </span>
                                                )
                                              )}
                                            </TableCell>
                                          ))}
                                          <TableCell className={`text-center ${row.type === 'calculated' ? 'font-bold' : 'font-bold'}`}>
                                            <span className={row.type === 'calculated' ? cellClasses : ''}>
                                              {formatCurrency(total)}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {average > 0 ? (
                                              <div>
                                                <div className={`font-bold text-lg ${row.type === 'calculated' ? cellClasses : ''}`}>
                                                  {formatCurrency(average)}
                                                </div>
                                                <div className={`text-xs ${row.type === 'calculated' ? 'text-opacity-70' : 'text-gray-500'}`}>
                                                  sur {completeMonths.length} mois
                                                </div>
                                              </div>
                                            ) : (
                                              <span className="text-gray-400">-</span>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {extrapolation > 0 ? (
                                              <div>
                                                <div className={`font-bold text-lg ${isYearComplete ? 'text-gray-500' : 'text-orange-600 dark:text-orange-400'}`}>
                                                  {formatCurrency(extrapolation)}
                                                </div>
                                                <div className={`text-xs ${isYearComplete ? 'text-gray-400' : 'text-orange-500 dark:text-orange-300'}`}>
                                                  {isYearComplete ? 'Année complète' : `Proj. sur ${completeMonths.length} mois`}
                                                </div>
                                              </div>
                                            ) : (
                                              <span className="text-gray-400">-</span>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
