'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { useAuth } from '@/components/providers';
import { useFilters } from './filters-system';
import { getCommercialActivitiesByMonth, CommercialActivity, updateCommercialActivity, deleteCommercialActivity } from '@/lib/firebase-commercial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type SortField = 'dateCreated' | 'clientName' | 'contractNumber' | 'effectDate' | 'actType' | 'productType' | 'company' | 'annualPremium' | 'potentialCommission';
type SortDirection = 'asc' | 'desc';

export function DataTable() {
  const { currentMonth } = useNavigation();
  const { user } = useAuth();
  const { filters } = useFilters();
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('dateCreated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingActivity, setEditingActivity] = useState<CommercialActivity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<CommercialActivity | null>(null);

  // Charger les données du mois sélectionné
  useEffect(() => {
    const loadMonthData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
        setActivities(monthActivities);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthData();
  }, [currentMonth, user?.id]);

  // Écouter les événements de création d'activité pour recharger les données
  useEffect(() => {
    const handleActivityCreated = () => {
      console.log('DataTable: Nouvelle activité créée, rechargement des données...');
      // Recharger les données
      const loadMonthData = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
          const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
          setActivities(monthActivities);
        } catch (error) {
          console.error('DataTable: Erreur lors du rechargement:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMonthData();
    };

    window.addEventListener('commercialActivityCreated', handleActivityCreated);
    
    return () => {
      window.removeEventListener('commercialActivityCreated', handleActivityCreated);
    };
  }, [currentMonth, user?.id]);

  // Filtrer les activités selon les filtres actifs
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const actTypeMatch = filters.actType.length === 0 || filters.actType.includes(activity.actType);
      const productTypeMatch = filters.productType.length === 0 || filters.productType.includes(activity.productType);
      const companyMatch = filters.company.length === 0 || filters.company.includes(activity.company);
      
      return actTypeMatch && productTypeMatch && companyMatch;
    });
  }, [activities, filters]);

  // Trier les activités
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Gestion spéciale pour les dates
      if (sortField === 'dateCreated' || sortField === 'effectDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Gestion spéciale pour les chaînes de caractères
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredActivities, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fonctions de gestion CRUD
  const handleEdit = (activity: CommercialActivity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (activity: CommercialActivity) => {
    setActivityToDelete(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateActivity = async (updatedActivity: CommercialActivity) => {
    if (!updatedActivity.id) return;
    
    try {
      await updateCommercialActivity(updatedActivity.id, updatedActivity);
      
      // Mettre à jour la liste locale
      setActivities(prev => 
        prev.map(activity => 
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      
      setIsEditDialogOpen(false);
      setEditingActivity(null);
      
      // Déclencher un événement pour mettre à jour les KPIs
      window.dispatchEvent(new CustomEvent('commercialActivityUpdated'));
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete?.id) return;
    
    try {
      await deleteCommercialActivity(activityToDelete.id);
      
      // Mettre à jour la liste locale
      setActivities(prev => 
        prev.filter(activity => activity.id !== activityToDelete.id)
      );
      
      setIsDeleteDialogOpen(false);
      setActivityToDelete(null);
      
      // Déclencher un événement pour mettre à jour les KPIs
      window.dispatchEvent(new CustomEvent('commercialActivityDeleted'));
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActTypeLabel = (actType: string) => {
    const labels = {
      'an': 'AN',
      'm+3': 'M+3',
      'preterme_auto': 'Préterme Auto',
      'preterme_iard': 'Préterme IARD',
    };
    return labels[actType as keyof typeof labels] || actType;
  };

  const getProductTypeLabel = (productType: string) => {
    if (!productType || productType === '') {
      return '-';
    }
    return productType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCompanyLabel = (company: string) => {
    if (!company || company === '') {
      return '-';
    }
    const labels = {
      'allianz': 'Allianz',
      'unim_uniced': 'Unim/Uniced',
      'courtage': 'Courtage',
    };
    return labels[company as keyof typeof labels] || company;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau de production</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Tableau de production
          {filteredActivities.length !== activities.length && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredActivities.length} résultat{filteredActivities.length > 1 ? 's' : ''} sur {activities.length} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {activities.length === 0 
              ? 'Aucune activité commerciale ce mois-ci'
              : 'Aucun résultat ne correspond aux filtres sélectionnés'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('dateCreated')}
                      className="h-auto p-0 font-semibold"
                    >
                      Date de saisie {getSortIcon('dateCreated')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('clientName')}
                      className="h-auto p-0 font-semibold"
                    >
                      Client {getSortIcon('clientName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('contractNumber')}
                      className="h-auto p-0 font-semibold"
                    >
                      Contrat {getSortIcon('contractNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('effectDate')}
                      className="h-auto p-0 font-semibold"
                    >
                      Date d'effet {getSortIcon('effectDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('actType')}
                      className="h-auto p-0 font-semibold"
                    >
                      Type d'acte {getSortIcon('actType')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('productType')}
                      className="h-auto p-0 font-semibold"
                    >
                      Produit {getSortIcon('productType')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('company')}
                      className="h-auto p-0 font-semibold"
                    >
                      Compagnie {getSortIcon('company')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('annualPremium')}
                      className="h-auto p-0 font-semibold"
                    >
                      Prime {getSortIcon('annualPremium')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('potentialCommission')}
                      className="h-auto p-0 font-semibold"
                    >
                      Commission (AN uniquement) {getSortIcon('potentialCommission')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {format(new Date(activity.dateCreated), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {activity.clientName}
                    </TableCell>
                    <TableCell>
                      {activity.contractNumber}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.effectDate), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getActTypeLabel(activity.actType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getProductTypeLabel(activity.productType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getCompanyLabel(activity.company)}
                    </TableCell>
                    <TableCell>
                      {activity.actType === 'an' ? (
                        formatCurrency(activity.annualPremium)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {activity.actType === 'an' ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(activity.potentialCommission)}
                          </span>
                          {activity.isCommissionReal && (
                            <Badge variant="default" className="text-xs">
                              ✓ Réelle
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen && activityToDelete?.id === activity.id} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(activity)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet acte ? Cette action est irréversible.
                                <br />
                                <strong>Client:</strong> {activity.clientName}
                                <br />
                                <strong>Type:</strong> {getActTypeLabel(activity.actType)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Modal d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'activité commerciale</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <EditActivityForm
              activity={editingActivity}
              onSave={handleUpdateActivity}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Composant de formulaire d'édition
function EditActivityForm({ 
  activity, 
  onSave, 
  onCancel 
}: { 
  activity: CommercialActivity; 
  onSave: (activity: CommercialActivity) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    clientName: activity.clientName,
    contractNumber: activity.contractNumber,
    effectDate: format(new Date(activity.effectDate), 'yyyy-MM-dd'),
    actType: activity.actType,
    productType: activity.productType,
    company: activity.company,
    annualPremium: activity.annualPremium.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedActivity: CommercialActivity = {
      ...activity,
      clientName: formData.clientName.toUpperCase(),
      contractNumber: formData.contractNumber,
      effectDate: new Date(formData.effectDate),
      actType: formData.actType as CommercialActivity['actType'],
      productType: formData.productType as CommercialActivity['productType'],
      company: formData.company as CommercialActivity['company'],
      annualPremium: parseFloat(formData.annualPremium) || 0,
    };

    onSave(updatedActivity);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nom du client</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="contractNumber">Numéro de contrat</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, contractNumber: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effectDate">Date d'effet</Label>
          <Input
            id="effectDate"
            type="date"
            value={formData.effectDate}
            onChange={(e) => setFormData(prev => ({ ...prev, effectDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="actType">Type d'acte</Label>
          <Select
            value={formData.actType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, actType: value as CommercialActivity['actType'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="an">Affaire Nouvelle</SelectItem>
              <SelectItem value="m+3">M+3</SelectItem>
              <SelectItem value="preterme_auto">Préterme Auto</SelectItem>
              <SelectItem value="preterme_iard">Préterme IARD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productType">Type de produit</Label>
          <Select
            value={formData.productType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value as CommercialActivity['productType'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_moto">Auto/Moto</SelectItem>
              <SelectItem value="iard_part">IARD Particulier</SelectItem>
              <SelectItem value="iard_pro">IARD Professionnel</SelectItem>
              <SelectItem value="pj">Protection Juridique</SelectItem>
              <SelectItem value="gav">GAV</SelectItem>
              <SelectItem value="sante_prevoyance">Santé/Prévoyance</SelectItem>
              <SelectItem value="nop50eur">NOP 50€</SelectItem>
              <SelectItem value="vie_pp">Vie PP</SelectItem>
              <SelectItem value="vie_pu">Vie PU</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="company">Compagnie</Label>
          <Select
            value={formData.company}
            onValueChange={(value) => setFormData(prev => ({ ...prev, company: value as CommercialActivity['company'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allianz">Allianz</SelectItem>
              <SelectItem value="unim_uniced">Unim/Uniced</SelectItem>
              <SelectItem value="courtage">Courtage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="annualPremium">Prime annuelle (€)</Label>
        <Input
          id="annualPremium"
          type="number"
          value={formData.annualPremium}
          onChange={(e) => setFormData(prev => ({ ...prev, annualPremium: e.target.value }))}
          min="0"
          step="0.01"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Sauvegarder
        </Button>
      </DialogFooter>
    </form>
  );
}
