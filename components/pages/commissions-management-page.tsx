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
  calculateYearTotals
} from '@/lib/firebase-commissions';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

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
      const [commissionsData, years] = await Promise.all([
        getCommissions(),
        getAvailableYears()
      ]);
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
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une entrée
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCommission ? 'Modifier l\'entrée' : 'Ajouter une nouvelle entrée'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCommission ? 'Modifiez les informations de l\'entrée' : 'Remplissez les informations pour créer une nouvelle entrée'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="year">Année</Label>
                          <Input
                            id="year"
                            type="number"
                            value={formData.year}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="month">Mois</Label>
                          <Select value={formData.month} onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un mois" />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((month, index) => (
                                <SelectItem key={index} value={month}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commissions_iard">Commissions IARD</Label>
                          <Input
                            id="commissions_iard"
                            type="number"
                            step="0.01"
                            value={formData.commissions_iard}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissions_vie">Commissions Vie</Label>
                          <Input
                            id="commissions_vie"
                            type="number"
                            step="0.01"
                            value={formData.commissions_vie}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissions_courtage">Commissions Courtage</Label>
                          <Input
                            id="commissions_courtage"
                            type="number"
                            step="0.01"
                            value={formData.commissions_courtage}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profits_exceptionnels">Profits Exceptionnels</Label>
                          <Input
                            id="profits_exceptionnels"
                            type="number"
                            step="0.01"
                            value={formData.profits_exceptionnels}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="charges_agence">Charges Agence</Label>
                          <Input
                            id="charges_agence"
                            type="number"
                            step="0.01"
                            value={formData.charges_agence}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prelevements_julien">Prélèvements Julien</Label>
                          <Input
                            id="prelevements_julien"
                            type="number"
                            step="0.01"
                            value={formData.prelevements_julien}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prelevements_jean_michel">Prélèvements Jean-Michel</Label>
                          <Input
                            id="prelevements_jean_michel"
                            type="number"
                            step="0.01"
                            value={formData.prelevements_jean_michel}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsCreateDialogOpen(false);
                          resetForm();
                        }}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingCommission ? 'Modifier' : 'Créer'}
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
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totals.totalCommissions)}
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
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totals.totalProfitsExceptionnels)}
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
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totals.totalChargesAgence)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tableau des commissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Commissions {selectedYear && `- ${selectedYear}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Année</TableHead>
                          <TableHead>Mois</TableHead>
                          <TableHead>Commissions IARD</TableHead>
                          <TableHead>Commissions Vie</TableHead>
                          <TableHead>Commissions Courtage</TableHead>
                          <TableHead>Profits Exceptionnels</TableHead>
                          <TableHead>Charges Agence</TableHead>
                          <TableHead>Prélèvements Julien</TableHead>
                          <TableHead>Prélèvements Jean-Michel</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell>{commission.year}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{commission.month}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.commissions_iard)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.commissions_vie)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.commissions_courtage)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.profits_exceptionnels)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.charges_agence)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.prelevements_julien)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(commission.prelevements_jean_michel)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(commission)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(commission.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
