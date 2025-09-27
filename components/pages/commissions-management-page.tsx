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
  migrateCommissionsData,
  PaginationPayload
} from '@/lib/firebase-commissions';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
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

  // États pour la nouvelle section de comparaison indépendante
  const [comparisonYears, setComparisonYears] = useState<number[]>([]);
  const [comparisonItem, setComparisonItem] = useState<string>('total_commissions');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [comparisonChartType, setComparisonChartType] = useState<'bar' | 'line'>('bar');
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Fonctions pour la nouvelle section de comparaison indépendante
  const initializeComparisonYears = () => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const defaultYears = [previousYear, currentYear];
    setComparisonYears(defaultYears);
    
    // Sauvegarder en local storage seulement côté client
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparisonYears', JSON.stringify(defaultYears));
    }
  };

  const loadComparisonData = async () => {
    setComparisonLoading(true);
    try {
      const monthOrder = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      
      // Créer un objet pour regrouper par mois
      const monthlyData: { [key: string]: any } = {};
      
      // Initialiser tous les mois
      monthOrder.forEach(month => {
        monthlyData[month] = { month };
      });
      
      for (const year of comparisonYears) {
        try {
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
                commissions_iard: commission.commissions_iard,
                commissions_vie: commission.commissions_vie,
                commissions_courtage: commission.commissions_courtage,
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
      const sortedData = monthOrder.map(month => monthlyData[month]).filter(Boolean);
      
      setComparisonData(sortedData);
      
      // Sauvegarder en local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('comparisonData', JSON.stringify(sortedData));
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de comparaison:', error);
    } finally {
      setComparisonLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données de commissions...');
      const [commissionsData, years] = await Promise.all([
        getCommissions(),
        getAvailableYears()
      ]);
      console.log('Données chargées:', { 
        commissionsCount: commissionsData.data.length, 
        years: years,
        commissions: commissionsData.data,
        pagination: {
          total: commissionsData.total,
          hasMore: commissionsData.hasMore,
          page: commissionsData.page
        }
      });
      setCommissions(commissionsData.data);
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

  const handleComparisonYearsChange = (years: number[]) => {
    setComparisonYears(years);
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparisonYears', JSON.stringify(years));
    }
    if (years.length > 0) {
      loadComparisonData();
    }
  };

  const handleComparisonItemChange = (item: string) => {
    setComparisonItem(item);
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparisonItem', item);
    }
  };

  const handleComparisonChartTypeChange = (type: 'bar' | 'line') => {
    setComparisonChartType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparisonChartType', type);
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

  // useEffect pour initialiser la section de comparaison
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window !== 'undefined') {
      // Charger les données depuis le local storage
      const savedYears = localStorage.getItem('comparisonYears');
      const savedItem = localStorage.getItem('comparisonItem');
      const savedChartType = localStorage.getItem('comparisonChartType');
      const savedData = localStorage.getItem('comparisonData');

      if (savedYears) {
        setComparisonYears(JSON.parse(savedYears));
      } else {
        initializeComparisonYears();
      }

      if (savedItem) {
        setComparisonItem(savedItem);
      }

      if (savedChartType) {
        setComparisonChartType(savedChartType as 'bar' | 'line');
      }

      if (savedData) {
        setComparisonData(JSON.parse(savedData));
      }
    }
  }, []);

  // useEffect pour charger les données quand les années changent
  useEffect(() => {
    if (comparisonYears.length > 0) {
      loadComparisonData();
    }
  }, [comparisonYears]);

  const totals = calculateTotals(commissions);

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
              {/* Sélecteur d'année */}
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
                </div>

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
                  ) : selectedYear ? (
                    <div className="space-y-6">
                      {(() => {
                        const yearCommissions = commissions.filter(c => c.year === selectedYear);
                        
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
                          {
                            key: 'commissions_iard',
                            label: 'Commissions IARD',
                            type: 'data',
                            color: 'text-blue-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.commissions_iard : 0;
                            })
                          },
                          {
                            key: 'commissions_vie',
                            label: 'Commissions Vie',
                            type: 'data',
                            color: 'text-green-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.commissions_vie : 0;
                            })
                          },
                          {
                            key: 'commissions_courtage',
                            label: 'Commissions Courtage',
                            type: 'data',
                            color: 'text-purple-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.commissions_courtage : 0;
                            })
                          },
                          {
                            key: 'profits_exceptionnels',
                            label: 'Profits Exceptionnels',
                            type: 'data',
                            color: 'text-orange-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.profits_exceptionnels : 0;
                            })
                          },
                          
                          // Ligne des totaux des commissions
                          {
                            key: 'total_commissions',
                            label: 'Total Commissions',
                            type: 'calculated',
                            color: 'text-blue-800',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? 
                                commission.commissions_iard + commission.commissions_vie + 
                                commission.commissions_courtage + commission.profits_exceptionnels : 0;
                            })
                          },
                          
                          // Ligne des charges
                          {
                            key: 'charges_agence',
                            label: 'Charges Agence',
                            type: 'data',
                            color: 'text-red-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.charges_agence : 0;
                            })
                          },
                          
                          // Ligne du résultat
                          {
                            key: 'resultat',
                            label: 'Résultat',
                            type: 'calculated',
                            color: 'text-green-800',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              if (!commission) return 0;
                              const totalCommissions = commission.commissions_iard + commission.commissions_vie + 
                                                     commission.commissions_courtage + commission.profits_exceptionnels;
                              return totalCommissions - commission.charges_agence;
                            })
                          },
                          
                          // Lignes des prélèvements
                          {
                            key: 'prelevements_julien',
                            label: 'Prélèvements Julien',
                            type: 'data',
                            color: 'text-cyan-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.prelevements_julien : 0;
                            })
                          },
                          {
                            key: 'prelevements_jean_michel',
                            label: 'Prélèvements Jean Michel',
                            type: 'data',
                            color: 'text-cyan-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              return commission ? commission.prelevements_jean_michel : 0;
                            })
                          },
                          
                          // Lignes dynamiques des autres administrateurs
                          ...administrators.map(admin => ({
                            key: `prelevements_${admin.replace(/\s+/g, '_')}`,
                            label: `Prélèvements ${admin.charAt(0).toUpperCase() + admin.slice(1)}`,
                            type: 'data',
                            color: 'text-cyan-600',
                            monthlyValues: Array.from({ length: 12 }, (_, index) => {
                              const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                              const commission = yearCommissions.find(c => c.month === months[index]);
                              const fieldKey = `prelevements_${admin.replace(/\s+/g, '_')}`;
                              return commission ? (commission as any)[fieldKey] || 0 : 0;
                            })
                          }))
                        ];

                        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

                        // Fonction pour calculer le nombre de mois renseignés pour l'année sélectionnée
                        const getCompletedMonthsCount = () => {
                          return yearCommissions.filter(commission => {
                            // Vérifier que c'est bien l'année sélectionnée
                            if (commission.year !== selectedYear) return false;
                            
                            const totalCommissions = commission.commissions_iard + commission.commissions_vie + 
                                                   commission.commissions_courtage + commission.profits_exceptionnels;
                            const resultat = totalCommissions - commission.charges_agence;
                            return resultat !== 0; // Un mois est "renseigné" si le résultat n'est pas 0
                          }).length;
                        };

                        const completedMonthsCount = getCompletedMonthsCount();

                        return (
                          <Card key={selectedYear}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Commissions {selectedYear}
                                <Badge variant="outline" className="ml-2">
                                  {completedMonthsCount} mois renseignés
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableCell className="font-semibold">Type</TableCell>
                                      {months.map(month => (
                                        <TableCell key={month} className="text-center font-medium min-w-[120px]">
                                          {month}
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-center font-medium min-w-[120px] bg-blue-50 dark:bg-blue-900/20">
                                        Moyenne
                                      </TableCell>
                                      <TableCell className="text-center font-medium min-w-[120px] bg-green-50 dark:bg-green-900/20">
                                        Total Extrapolé
                                      </TableCell>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tableRows.map(row => {
                                      const rowClasses = row.type === 'calculated' ? 
                                        'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 
                                        'hover:bg-gray-50 dark:hover:bg-gray-800';

                                      // Calculer la moyenne pour cette ligne
                                      const calculateAverage = () => {
                                        if (completedMonthsCount === 0) return 0;
                                        
                                        // Pour les lignes calculées (total_commissions, resultat), on calcule la moyenne des valeurs non nulles
                                        if (row.type === 'calculated') {
                                          const nonZeroValues = row.monthlyValues.filter(value => value !== 0);
                                          return nonZeroValues.length > 0 ? nonZeroValues.reduce((sum, val) => sum + val, 0) / nonZeroValues.length : 0;
                                        }
                                        
                                        // Pour les lignes de données, on calcule la moyenne des mois renseignés
                                        const completedMonthsValues = row.monthlyValues.filter((value, index) => {
                                          const month = months[index];
                                          const commission = yearCommissions.find(c => c.month === month && c.year === selectedYear);
                                          if (!commission) return false;
                                          
                                          const totalCommissions = commission.commissions_iard + commission.commissions_vie + 
                                                                 commission.commissions_courtage + commission.profits_exceptionnels;
                                          const resultat = totalCommissions - commission.charges_agence;
                                          return resultat !== 0; // Seulement les mois avec un résultat non nul
                                        });
                                        
                                        return completedMonthsValues.length > 0 ? 
                                          completedMonthsValues.reduce((sum, val) => sum + val, 0) / completedMonthsValues.length : 0;
                                      };

                                      const average = calculateAverage();

                                      return (
                                        <TableRow key={row.key} className={rowClasses}>
                                          <TableCell className={row.type === 'calculated' ? 
                                            `font-bold ${row.color} dark:text-opacity-90` : 
                                            `font-medium ${row.color}`}>
                                            {row.label}
                                          </TableCell>
                                          {row.monthlyValues.map((value, index) => (
                                            <TableCell key={index} className="text-center">
                                              {value > 0 ? (
                                                <div className="space-y-1">
                                                  <div className={`font-medium ${row.color}`}>
                                                    {formatCurrency(value)}
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCellClick(selectedYear!, months[index])}
                                                    className="h-6 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900"
                                                  >
                                                    Modifier
                                                  </Button>
                                                </div>
                                              ) : (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleCellClick(selectedYear!, months[index])}
                                                  className="h-8 px-3 text-xs border-dashed hover:bg-blue-50 dark:hover:bg-blue-900"
                                                >
                                                  Cliquer pour ajouter
                                                </Button>
                                              )}
                                            </TableCell>
                                          ))}
                                          {/* Colonne Moyenne */}
                                          <TableCell className="text-center bg-blue-50 dark:bg-blue-900/20">
                                            <div className={`font-bold ${row.color} dark:text-opacity-90`}>
                                              {formatCurrency(average)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              / {completedMonthsCount} mois
                                            </div>
                                          </TableCell>
                                          {/* Colonne Total Extrapolé */}
                                          <TableCell className="text-center bg-green-50 dark:bg-green-900/20">
                                            <div className={`font-bold ${row.color} dark:text-opacity-90`}>
                                              {formatCurrency(average * 12)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {completedMonthsCount < 12 ? '× 12 mois' : 'année complète'}
                                            </div>
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
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Sélectionnez une année
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choisissez une année dans le sélecteur ci-dessus pour afficher les données.
                      </p>
                    </div>
                  )}
              </div>

              {/* Section de comparaison indépendante */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                                              <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comparaison d'années</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Outil indépendant de comparaison avec stockage local</p>
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
                            const newYears = comparisonYears.includes(year)
                              ? comparisonYears.filter(y => y !== year)
                              : [...comparisonYears, year];
                            handleComparisonYearsChange(newYears);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            comparisonYears.includes(year)
                              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sélection de l'item à comparer */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Élément à comparer</h4>
                    
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
                            onClick={() => handleComparisonItemChange(metric.key)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              comparisonItem === metric.key
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
                          onClick={() => handleComparisonItemChange('charges_agence')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            comparisonItem === 'charges_agence'
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
                          onClick={() => handleComparisonItemChange('resultat')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            comparisonItem === 'resultat'
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
                          onClick={() => handleComparisonItemChange('prelevements_julien')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            comparisonItem === 'prelevements_julien'
                              ? 'bg-lime-500 text-white shadow-md shadow-lime-500/25'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          Julien
                        </button>
                        <button
                          onClick={() => handleComparisonItemChange('prelevements_jean_michel')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            comparisonItem === 'prelevements_jean_michel'
                              ? 'bg-lime-500 text-white shadow-md shadow-lime-500/25'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          Jean Michel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Type de graphique */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Type de visualisation</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComparisonChartTypeChange('bar')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          comparisonChartType === 'bar'
                            ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        Histogramme
                      </button>
                      <button
                        onClick={() => handleComparisonChartTypeChange('line')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          comparisonChartType === 'line'
                            ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        Courbe
                      </button>
                    </div>
                  </div>

                  {/* Graphique de comparaison */}
                  {comparisonYears.length > 0 && comparisonData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      {/* Header du graphique */}
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Visualisation</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {comparisonItem === 'total_commissions' ? 'Total Commissions' :
                               comparisonItem === 'commissions_vie' ? 'Commissions Vie' :
                               comparisonItem === 'commissions_courtage' ? 'Commissions Courtage' :
                               comparisonItem === 'commissions_iard' ? 'Commissions IARD' :
                               comparisonItem === 'profits_exceptionnels' ? 'Profits Exceptionnels' :
                               comparisonItem === 'charges_agence' ? 'Charges Agence' :
                               comparisonItem === 'resultat' ? 'Résultat' :
                               comparisonItem === 'prelevements_julien' ? 'Prélèvements Julien' :
                               comparisonItem === 'prelevements_jean_michel' ? 'Prélèvements Jean Michel' :
                               comparisonItem} • {comparisonYears.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {comparisonYears.map((year, index) => {
                              const colors = ['bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-rose-500', 'bg-violet-500'];
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
                          {comparisonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              {comparisonChartType === 'bar' ? (
                                <RechartsBarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        // Trier les payloads par année décroissante
                                        const sortedPayload = [...payload].sort((a, b) => {
                                          const yearA = parseInt(a.name || '0');
                                          const yearB = parseInt(b.name || '0');
                                          return yearB - yearA; // Ordre décroissant
                                        });

                                        return (
                                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                            <p className="font-medium text-gray-900 mb-2">Mois: {label}</p>
                                            {sortedPayload.map((entry, index) => (
                                              <div key={index} className="flex items-center gap-2 text-sm">
                                                <div 
                                                  className="w-3 h-3 rounded-full" 
                                                  style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-gray-600">{entry.name}:</span>
                                                <span className="font-medium text-gray-900">
                                                  {formatCurrency(entry.value as number)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                    contentStyle={{
                                      backgroundColor: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                  {comparisonYears.map((year, index) => {
                                    const colors = ['#8b5cf6', '#ec4899', '#6366f1', '#f43f5e', '#8b5cf6'];
                                    return (
                                      <Bar 
                                        key={year}
                                        dataKey={`year_${year}.${comparisonItem}`} 
                                        fill={colors[index % colors.length]}
                                        name={`${year}`}
                                        radius={[4, 4, 0, 0]}
                                      />
                        );
                      })}
                                </RechartsBarChart>
                              ) : (
                                <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        // Trier les payloads par année décroissante
                                        const sortedPayload = [...payload].sort((a, b) => {
                                          const yearA = parseInt(a.name || '0');
                                          const yearB = parseInt(b.name || '0');
                                          return yearB - yearA; // Ordre décroissant
                                        });

                                        return (
                                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                            <p className="font-medium text-gray-900 mb-2">Mois: {label}</p>
                                            {sortedPayload.map((entry, index) => (
                                              <div key={index} className="flex items-center gap-2 text-sm">
                                                <div 
                                                  className="w-3 h-3 rounded-full" 
                                                  style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-gray-600">{entry.name}:</span>
                                                <span className="font-medium text-gray-900">
                                                  {formatCurrency(entry.value as number)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                    contentStyle={{
                                      backgroundColor: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                  {comparisonYears.map((year, index) => {
                                    const colors = ['#8b5cf6', '#ec4899', '#6366f1', '#f43f5e', '#8b5cf6'];
                                    return (
                                      <Line 
                                        key={year}
                                        type="monotone"
                                        dataKey={`year_${year}.${comparisonItem}`} 
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

                  {comparisonYears.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez au moins une année pour voir la comparaison</p>
                          </div>
                  )}

                  {comparisonYears.length > 0 && comparisonData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chargement des données...</p>
                      <p className="text-sm mt-2">Années sélectionnées: {comparisonYears.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
