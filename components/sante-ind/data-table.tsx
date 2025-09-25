'use client';

import { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@/lib/sante-ind-navigation-context';
import { useSanteIndData } from '@/lib/sante-ind-data-context';
import { useFilters } from './filters-system';
import { SanteIndActivity, updateSanteIndActivity, deleteSanteIndActivity } from '@/lib/firebase-sante-ind';
import { logBusinessInfo, logBusinessError } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type SortField = 'dateCreated' | 'clientName' | 'contractNumber' | 'effectDate' | 'actType' | 'primeAnnuelle' | 'primePondere';
type SortDirection = 'asc' | 'desc';

const actTypeLabels = {
  affaire_nouvelle: 'Affaire Nouvelle',
  revision: 'Révision',
  adhesion_salarie: 'Adhésion salarié',
  court_az: 'COURT → AZ',
  az_courtage: 'AZ → Courtage'
};

export function DataTable() {
  const { activities, isLoading, updateActivity, removeActivity, forceRefresh } = useSanteIndData();
  const { filters } = useFilters();
  const [sortField, setSortField] = useState<SortField>('dateCreated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingActivity, setEditingActivity] = useState<SanteIndActivity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<SanteIndActivity | null>(null);

  // Écouter les événements de mise à jour et suppression pour assurer la cohérence des montants
  useEffect(() => {
    const handleActivityUpdated = () => {
      logBusinessInfo('Activité santé individuelle mise à jour détectée, rechargement pour cohérence des montants', 'DataTable');
      setTimeout(async () => {
        await forceRefresh();
      }, 500);
    };

    const handleActivityDeleted = () => {
      logBusinessInfo('Activité santé individuelle supprimée détectée, rechargement pour cohérence des montants', 'DataTable');
      setTimeout(async () => {
        await forceRefresh();
      }, 500);
    };

    window.addEventListener('santeIndActivityUpdated', handleActivityUpdated);
    window.addEventListener('santeIndActivityDeleted', handleActivityDeleted);
    
    return () => {
      window.removeEventListener('santeIndActivityUpdated', handleActivityUpdated);
      window.removeEventListener('santeIndActivityDeleted', handleActivityDeleted);
    };
  }, [forceRefresh]);

  // Filtrer les activités selon les filtres actifs
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const actTypeMatch = filters.actType.length === 0 || filters.actType.includes(activity.actType);
      return actTypeMatch;
    });
  }, [activities, filters]);

  // Trier les activités
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dateCreated' || sortField === 'effectDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
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

  const handleEdit = (activity: SanteIndActivity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (activity: SanteIndActivity) => {
    setActivityToDelete(activity);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      await removeActivity(activityToDelete.id);
      logBusinessInfo(`Activité santé individuelle supprimée: ${activityToDelete.clientName}`, 'DataTable');
      setIsDeleteDialogOpen(false);
      setActivityToDelete(null);
    } catch (error) {
      logBusinessError('Erreur lors de la suppression de l\'activité santé individuelle', 'DataTable', error);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau des actes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tableau des actes santé individuelle ({sortedActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('dateCreated')} className="h-8 px-2">
                      Date de saisie {getSortIcon('dateCreated')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('actType')} className="h-8 px-2">
                      Type d'acte {getSortIcon('actType')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('clientName')} className="h-8 px-2">
                      Client {getSortIcon('clientName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('contractNumber')} className="h-8 px-2">
                      Contrat {getSortIcon('contractNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('effectDate')} className="h-8 px-2">
                      Date d'effet {getSortIcon('effectDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('primeAnnuelle')} className="h-8 px-2">
                      Prime annuelle {getSortIcon('primeAnnuelle')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('primePondere')} className="h-8 px-2">
                      Prime pondérée {getSortIcon('primePondere')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {format(new Date(activity.dateCreated), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {actTypeLabels[activity.actType as keyof typeof actTypeLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{activity.clientName}</TableCell>
                    <TableCell>{activity.contractNumber}</TableCell>
                    <TableCell>
                      {format(new Date(activity.effectDate), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(activity.primeAnnuelle)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(activity.primePondere)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(activity)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'acte</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'acte de {activity.clientName} ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDelete}>
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
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'acte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Modification en cours de développement...
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
