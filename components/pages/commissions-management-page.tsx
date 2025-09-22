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
      setCommissions(commissionsData);
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
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accès Refusé</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
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

  // Fonction pour ouvrir la modale d'un mois
  const openMonthModal = (month: string) => {
    setSelectedMonth(month);
    
    // Chercher les données existantes pour ce mois
    const existingData = commissions.find(c => c.month === month && c.year === selectedYear);
    
    if (existingData) {
      // Remplir avec les données existantes
      setMonthFormData({
        commissions_iard: existingData.commissions_iard.toString(),
        commissions_vie: existingData.commissions_vie.toString(),
        commissions_courtage: existingData.commissions_courtage.toString(),
        profits_exceptionnels: existingData.profits_exceptionnels.toString(),
        charges_agence: existingData.charges_agence.toString(),
        prelevements_julien: existingData.prelevements_julien.toString(),
        prelevements_jean_michel: existingData.prelevements_jean_michel.toString()
      });
    } else {
      // Vider le formulaire pour un nouveau mois
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
    
    setShowMonthModal(true);
  };

  // Fonction pour sauvegarder les données du mois
  const handleSaveMonth = async () => {
    if (!selectedYear || !selectedMonth) return;
    
    try {
      const monthData = {
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

      // Vérifier si le mois existe déjà
      const existingCommission = commissions.find(c => c.month === selectedMonth && c.year === selectedYear);
      
      if (existingCommission) {
        await updateCommission(existingCommission.id!, monthData);
      } else {
        await createCommission(monthData);
      }
      
      await loadData();
      setShowMonthModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour gérer les changements dans le formulaire du mois
  const handleMonthFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMonthFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDeleteCommission = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commission ?')) return;
    setLoading(true);
    try {
      await deleteCommission(id);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setLoading(false);
    }
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
  };

  const openEditDialog = (commission: CommissionData) => {
    setEditingCommission(commission);
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
  };


  const isEdit = !!editingCommission;
  const yearTotals = calculateYearTotals(commissions);
  
  // Calculer le nombre de mois réellement remplis (avec des données non nulles)
  const getFilledMonthsCount = (commissions: CommissionData[], field: keyof CommissionData) => {
    return commissions.filter(c => c[field] > 0).length;
  };
  
  // Calculer les moyennes et extrapolations intelligentes
  const calculateSmartTotals = (commissions: CommissionData[], field: keyof CommissionData) => {
    const total = commissions.reduce((sum, c) => sum + (c[field] as number), 0);
    const filledMonths = getFilledMonthsCount(commissions, field);
    const average = filledMonths > 0 ? total / filledMonths : 0;
    const extrapolation = average * 12;
    
    return { total, average, extrapolation, filledMonths };
  };
  
  // Calculer les totaux pour les valeurs calculées (comme total_commissions, resultat, etc.)
  const calculateSmartTotalsForComputed = (commissions: CommissionData[], computeFn: (c: CommissionData) => number) => {
    const computedValues = commissions.map(computeFn);
    const total = computedValues.reduce((sum, val) => sum + val, 0);
    const filledMonths = computedValues.filter(val => val > 0).length;
    const average = filledMonths > 0 ? total / filledMonths : 0;
    const extrapolation = average * 12;
    
    return { total, average, extrapolation, filledMonths };
  };

  // Helper pour afficher les cellules de totaux de manière cohérente
  const renderTotalCells = (smartTotals: any, yearTotal: number, colorClass: string = 'text-blue-600') => (
    <>
      <TableCell className={`font-semibold ${colorClass} text-center whitespace-nowrap`}>
        {Math.round(yearTotal).toLocaleString()} €
      </TableCell>
      <TableCell className="font-semibold text-center whitespace-nowrap">
        <div className="flex flex-col items-center">
          <span>{Math.round(smartTotals.average).toLocaleString()} €</span>
          <span className="text-xs text-gray-500">({smartTotals.filledMonths} mois)</span>
        </div>
      </TableCell>
      <TableCell className={`font-semibold ${colorClass} text-center whitespace-nowrap`}>
        {Math.round(smartTotals.extrapolation).toLocaleString()} €
      </TableCell>
    </>
  );

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commissions</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            variant="outline"
            className={showAnalysis ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {showAnalysis ? 'Masquer Analyse' : 'Analyse'}
          </Button>
          <Dialog open={isCreateDialogOpen || !!editingCommission} onOpenChange={isEdit ? setEditingCommission : setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEdit ? 'Modifier la commission' : 'Créer une nouvelle commission'}</DialogTitle>
                <DialogDescription>
                  {isEdit ? 'Modifiez les données de la commission.' : 'Remplissez les données pour créer une nouvelle commission.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Année *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={handleFormChange}
                      placeholder="2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Mois *</Label>
                    <Select value={formData.month} onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}>
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Sélectionner un mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(month => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commissions_iard">Commissions IARD *</Label>
                    <Input
                      id="commissions_iard"
                      type="number"
                      step="0.01"
                      value={formData.commissions_iard}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissions_vie">Commissions Vie *</Label>
                    <Input
                      id="commissions_vie"
                      type="number"
                      step="0.01"
                      value={formData.commissions_vie}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commissions_courtage">Commissions Courtage *</Label>
                    <Input
                      id="commissions_courtage"
                      type="number"
                      step="0.01"
                      value={formData.commissions_courtage}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profits_exceptionnels">Profits Exceptionnels</Label>
                    <Input
                      id="profits_exceptionnels"
                      type="number"
                      step="0.01"
                      value={formData.profits_exceptionnels}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="charges_agence">Charges Agence *</Label>
                    <Input
                      id="charges_agence"
                      type="number"
                      step="0.01"
                      value={formData.charges_agence}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prelevements_julien">Prélèvements Julien</Label>
                    <Input
                      id="prelevements_julien"
                      type="number"
                      step="0.01"
                      value={formData.prelevements_julien}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prelevements_jean_michel">Prélèvements Jean-Michel</Label>
                  <Input
                    id="prelevements_jean_michel"
                    type="number"
                    step="0.01"
                    value={formData.prelevements_jean_michel}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCommission(null);
                    resetForm();
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEdit ? (
                      <Edit className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Chargement...' : isEdit ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="year-select">Année</Label>
            <Select value={selectedYear?.toString() || 'all'} onValueChange={(value) => setSelectedYear(value === 'all' ? null : parseInt(value))}>
              <SelectTrigger id="year-select" className="w-48">
                <SelectValue placeholder="Toutes les années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Analyse */}
      {showAnalysis && (
        <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Analyse des Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="analysis-years">Années à analyser</Label>
                <Select 
                  value={analysisYears.join(',')} 
                  onValueChange={(value) => setAnalysisYears(value ? value.split(',').map(Number) : [])}
                >
                  <SelectTrigger id="analysis-years">
                    <SelectValue placeholder="Sélectionner les années" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="analysis-poste">Poste à analyser</Label>
                <Select value={analysisPoste} onValueChange={setAnalysisPoste}>
                  <SelectTrigger id="analysis-poste">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total_commissions">Total Commissions</SelectItem>
                    <SelectItem value="commissions_iard">Commissions IARD</SelectItem>
                    <SelectItem value="commissions_vie">Commissions Vie</SelectItem>
                    <SelectItem value="commissions_courtage">Commissions Courtage</SelectItem>
                    <SelectItem value="charges_agence">Charges Agence</SelectItem>
                    <SelectItem value="resultat">Résultat</SelectItem>
                    <SelectItem value="total_prelevements">Total Prélèvements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Ici on pourrait ajouter des graphiques ou tableaux d'analyse */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Module d'analyse en cours de développement. Les données sont disponibles pour l'analyse.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Totaux de l'année */}
      {selectedYear && commissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearTotals.total_commissions.toLocaleString()} €</div>
              <p className="text-xs text-gray-500">Année {selectedYear}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Charges Agence</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearTotals.total_charges.toLocaleString()} €</div>
              <p className="text-xs text-gray-500">Année {selectedYear}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résultat</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearTotals.total_resultat.toLocaleString()} €</div>
              <p className="text-xs text-gray-500">Année {selectedYear}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prélèvements</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearTotals.total_prelevements.toLocaleString()} €</div>
              <p className="text-xs text-gray-500">Année {selectedYear}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table des commissions - Vue analytique */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle>
            {selectedYear ? `Analyse des Commissions ${selectedYear}` : 'Analyse de toutes les commissions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Chargement des commissions...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10">Type de données</TableHead>
                    {MONTHS.map(month => (
                      <TableHead key={month} className="min-w-[90px] text-center font-semibold">{month}</TableHead>
                    ))}
                    <TableHead className="min-w-[90px] font-semibold">Somme</TableHead>
                    <TableHead className="min-w-[90px] font-semibold">Moyenne</TableHead>
                    <TableHead className="min-w-[90px] font-semibold">Extrapolation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Commissions IARD */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Commissions IARD</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.commissions_iard).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'commissions_iard');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-blue-600');
                    })()}
                  </TableRow>

                  {/* Commissions Vie */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Commissions Vie</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.commissions_vie).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'commissions_vie');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-blue-600');
                    })()}
                  </TableRow>

                  {/* Commissions Courtage */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Commissions Courtage</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.commissions_courtage).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'commissions_courtage');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-blue-600');
                    })()}
                  </TableRow>

                  {/* Profits Exceptionnels */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Profits Exceptionnels</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.profits_exceptionnels).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'profits_exceptionnels');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-blue-600');
                    })()}
                  </TableRow>

                  {/* Total Commissions */}
                  <TableRow className="bg-green-50 dark:bg-green-900/20">
                    <TableCell className="font-bold text-green-700 dark:text-green-300 sticky left-0 bg-green-50 dark:bg-green-900/20 z-10">Total Commissions</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      const totals = monthData ? calculateTotals(monthData) : null;
                      return (
                        <TableCell 
                          key={month} 
                          className="font-semibold text-green-600 text-center whitespace-nowrap cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {totals ? `${Math.round(totals.total_commissions).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotalsForComputed(commissions, c => calculateTotals(c).total_commissions);
                      return renderTotalCells(smartTotals, yearTotals.total_commissions, 'text-green-600');
                    })()}
                  </TableRow>

                  {/* Charges Agence */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Charges Agence</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.charges_agence).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'charges_agence');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-orange-600');
                    })()}
                  </TableRow>

                  {/* Résultat */}
                  <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                    <TableCell className="font-bold text-blue-700 dark:text-blue-300 sticky left-0 bg-blue-50 dark:bg-blue-900/20 z-10">Résultat</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      const totals = monthData ? calculateTotals(monthData) : null;
                      return (
                        <TableCell 
                          key={month} 
                          className={`font-semibold text-center whitespace-nowrap cursor-pointer transition-colors ${totals && totals.resultat >= 0 ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30' : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
                          onClick={() => openMonthModal(month)}
                        >
                          {totals ? `${Math.round(totals.resultat).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotalsForComputed(commissions, c => calculateTotals(c).resultat);
                      const isPositive = smartTotals.total >= 0;
                      const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
                      return renderTotalCells(smartTotals, yearTotals.total_resultat, colorClass);
                    })()}
                  </TableRow>

                  {/* Prélèvements Julien */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Prélèvements Julien</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.prelevements_julien).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'prelevements_julien');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-purple-600');
                    })()}
                  </TableRow>

                  {/* Prélèvements Jean-Michel */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">Prélèvements Jean-Michel</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      return (
                        <TableCell 
                          key={month} 
                          className="text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {monthData ? `${Math.round(monthData.prelevements_jean_michel).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotals(commissions, 'prelevements_jean_michel');
                      return renderTotalCells(smartTotals, smartTotals.total, 'text-purple-600');
                    })()}
                  </TableRow>

                  {/* Total Prélèvements */}
                  <TableRow className="bg-purple-50 dark:bg-purple-900/20">
                    <TableCell className="font-bold text-purple-700 dark:text-purple-300 sticky left-0 bg-purple-50 dark:bg-purple-900/20 z-10">Total Prélèvements</TableCell>
                    {MONTHS.map(month => {
                      const monthData = commissions.find(c => c.month === month);
                      const totals = monthData ? calculateTotals(monthData) : null;
                      return (
                        <TableCell 
                          key={month} 
                          className="font-semibold text-purple-600 text-center whitespace-nowrap cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                          onClick={() => openMonthModal(month)}
                        >
                          {totals ? `${Math.round(totals.total_prelevements).toLocaleString()} €` : '-'}
                        </TableCell>
                      );
                    })}
                    {(() => {
                      const smartTotals = calculateSmartTotalsForComputed(commissions, c => calculateTotals(c).total_prelevements);
                      return renderTotalCells(smartTotals, yearTotals.total_prelevements, 'text-purple-600');
                    })()}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau des actions par mois */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm mt-6">
        <CardHeader>
          <CardTitle>Actions par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{commission.month}</TableCell>
                    <TableCell>{commission.year}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(commission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCommission(commission.id!)}
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
          </div>
        </CardContent>
      </Card>

      {/* Modale pour éditer un mois */}
      <Dialog open={showMonthModal} onOpenChange={setShowMonthModal}>
        <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Édition du mois de {selectedMonth} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              {commissions.find(c => c.month === selectedMonth && c.year === selectedYear) 
                ? 'Modifiez les données existantes pour ce mois.' 
                : 'Saisissez les données pour ce nouveau mois.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Commissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Commissions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissions_iard">Commissions IARD</Label>
                  <Input
                    id="commissions_iard"
                    type="number"
                    step="0.01"
                    value={monthFormData.commissions_iard}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 50000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="commissions_vie">Commissions Vie</Label>
                  <Input
                    id="commissions_vie"
                    type="number"
                    step="0.01"
                    value={monthFormData.commissions_vie}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 5000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="commissions_courtage">Commissions Courtage</Label>
                  <Input
                    id="commissions_courtage"
                    type="number"
                    step="0.01"
                    value={monthFormData.commissions_courtage}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 3000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="profits_exceptionnels">Profits Exceptionnels</Label>
                  <Input
                    id="profits_exceptionnels"
                    type="number"
                    step="0.01"
                    value={monthFormData.profits_exceptionnels}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 1000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Charges et Prélèvements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Charges et Prélèvements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charges_agence">Charges Agence</Label>
                  <Input
                    id="charges_agence"
                    type="number"
                    step="0.01"
                    value={monthFormData.charges_agence}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 40000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="prelevements_julien">Prélèvements Julien</Label>
                  <Input
                    id="prelevements_julien"
                    type="number"
                    step="0.01"
                    value={monthFormData.prelevements_julien}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 15000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="prelevements_jean_michel">Prélèvements Jean-Michel</Label>
                  <Input
                    id="prelevements_jean_michel"
                    type="number"
                    step="0.01"
                    value={monthFormData.prelevements_jean_michel}
                    onChange={handleMonthFormChange}
                    placeholder="Ex: 15000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Calculs automatiques */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">Calculs automatiques</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Commissions:</span>
                  <div className="text-green-600 font-semibold">
                    {(parseFloat(monthFormData.commissions_iard || '0') + 
                      parseFloat(monthFormData.commissions_vie || '0') + 
                      parseFloat(monthFormData.commissions_courtage || '0') + 
                      parseFloat(monthFormData.profits_exceptionnels || '0')).toLocaleString()} €
                  </div>
                </div>
                <div>
                  <span className="font-medium">Résultat:</span>
                  <div className={`font-semibold ${
                    ((parseFloat(monthFormData.commissions_iard || '0') + 
                      parseFloat(monthFormData.commissions_vie || '0') + 
                      parseFloat(monthFormData.commissions_courtage || '0') + 
                      parseFloat(monthFormData.profits_exceptionnels || '0')) - 
                     parseFloat(monthFormData.charges_agence || '0')) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(((parseFloat(monthFormData.commissions_iard || '0') + 
                        parseFloat(monthFormData.commissions_vie || '0') + 
                        parseFloat(monthFormData.commissions_courtage || '0') + 
                        parseFloat(monthFormData.profits_exceptionnels || '0')) - 
                       parseFloat(monthFormData.charges_agence || '0'))).toLocaleString()} €
                  </div>
                </div>
                <div>
                  <span className="font-medium">Total Prélèvements:</span>
                  <div className="text-purple-600 font-semibold">
                    {(parseFloat(monthFormData.prelevements_julien || '0') + 
                      parseFloat(monthFormData.prelevements_jean_michel || '0')).toLocaleString()} €
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowMonthModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveMonth} disabled={loading}>
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
