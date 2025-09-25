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
  CheckCircle
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
  const [monthFormData, setMonthFormData] = useState({
    commissions_iard: '',
    commissions_vie: '',
    commissions_courtage: '',
    profits_exceptionnels: '',
    charges_agence: '',
    prelevements_julien: '',
    prelevements_jean_michel: ''
  });

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
      setMonthFormData({
        commissions_iard: existingCommission.commissions_iard.toString(),
        commissions_vie: existingCommission.commissions_vie.toString(),
        commissions_courtage: existingCommission.commissions_courtage.toString(),
        profits_exceptionnels: existingCommission.profits_exceptionnels.toString(),
        charges_agence: existingCommission.charges_agence.toString(),
        prelevements_julien: existingCommission.prelevements_julien.toString(),
        prelevements_jean_michel: existingCommission.prelevements_jean_michel.toString()
      });
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
                  <Button onClick={() => setShowAnalysis(!showAnalysis)} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {showAnalysis ? 'Masquer' : 'Afficher'} l'analyse
                  </Button>
                  <Button onClick={loadData} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Recharger
                  </Button>
                </div>
                {/* Modale de modification mensuelle */}
                <Dialog open={showMonthModal} onOpenChange={setShowMonthModal}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedMonth && selectedYear ? 
                          `Modifier ${selectedMonth} ${selectedYear}` : 
                          'Ajouter des données'
                        }
                      </DialogTitle>
                      <DialogDescription>
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
                        const commissionData = {
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commissions_iard">Commissions IARD</Label>
                          <Input
                            id="commissions_iard"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_iard}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_iard: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissions_vie">Commissions Vie</Label>
                          <Input
                            id="commissions_vie"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_vie}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_vie: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissions_courtage">Commissions Courtage</Label>
                          <Input
                            id="commissions_courtage"
                            type="number"
                            step="0.01"
                            value={monthFormData.commissions_courtage}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, commissions_courtage: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profits_exceptionnels">Profits Exceptionnels</Label>
                          <Input
                            id="profits_exceptionnels"
                            type="number"
                            step="0.01"
                            value={monthFormData.profits_exceptionnels}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, profits_exceptionnels: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="charges_agence">Charges Agence</Label>
                          <Input
                            id="charges_agence"
                            type="number"
                            step="0.01"
                            value={monthFormData.charges_agence}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, charges_agence: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prelevements_julien">Prélèvements Julien</Label>
                          <Input
                            id="prelevements_julien"
                            type="number"
                            step="0.01"
                            value={monthFormData.prelevements_julien}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, prelevements_julien: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prelevements_jean_michel">Prélèvements Jean-Michel</Label>
                          <Input
                            id="prelevements_jean_michel"
                            type="number"
                            step="0.01"
                            value={monthFormData.prelevements_jean_michel}
                            onChange={(e) => setMonthFormData(prev => ({ ...prev, prelevements_jean_michel: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowMonthModal(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
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
                        
                        const commissionTypes = [
                          { key: 'commissions_iard', label: 'Commissions IARD', color: 'text-blue-600' },
                          { key: 'commissions_vie', label: 'Commissions Vie', color: 'text-green-600' },
                          { key: 'commissions_courtage', label: 'Commissions Courtage', color: 'text-purple-600' },
                          { key: 'profits_exceptionnels', label: 'Profits Exceptionnels', color: 'text-orange-600' },
                          { key: 'charges_agence', label: 'Charges Agence', color: 'text-red-600' },
                          { key: 'prelevements_julien', label: 'Prélèvements Julien', color: 'text-indigo-600' },
                          { key: 'prelevements_jean_michel', label: 'Prélèvements Jean-Michel', color: 'text-pink-600' }
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
                                      <TableHead className="text-center font-semibold">Moyenne</TableHead> {/* Force reload */}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {commissionTypes.map(type => {
                                      const monthlyValues = months.map(month => {
                                        const commission = yearCommissions.find(c => c.month === month);
                                        return commission ? commission[type.key as keyof CommissionData] as number : 0;
                                      });
                                      const total = monthlyValues.reduce((sum, value) => sum + value, 0);
                                      
                                      // Calcul de la moyenne basée sur les mois complets (valeurs > 0)
                                      const completeMonths = monthlyValues.filter(value => value > 0);
                                      const average = completeMonths.length > 0 ? total / completeMonths.length : 0;
                                      
                                      return (
                                        <TableRow key={type.key}>
                                          <TableCell className={`font-medium ${type.color}`}>
                                            {type.label}
                                          </TableCell>
                                          {monthlyValues.map((value, index) => (
                                            <TableCell 
                                              key={index} 
                                              className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                              onClick={() => handleCellClick(year, months[index])}
                                            >
                                              {value > 0 ? (
                                                <span className="font-medium">
                                                  {formatCurrency(value)}
                                                </span>
                                              ) : (
                                                <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                  Cliquer pour ajouter
                                                </span>
                                              )}
                                            </TableCell>
                                          ))}
                                          <TableCell className="text-center font-bold">
                                            {formatCurrency(total)}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {average > 0 ? (
                                              <div>
                                                <div className="font-bold text-lg">
                                                  {formatCurrency(average)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  sur {completeMonths.length} mois
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
                      
                      {/* Actions globales */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex space-x-4">
                            <Button onClick={handleMigrateData} variant="outline">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Charger les données par défaut
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
