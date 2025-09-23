'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@/lib/commercial-navigation-context';
import { useAuth } from '@/components/providers';
import { useFilters } from './filters-system';
import { getCommercialActivitiesByMonth, CommercialActivity } from '@/lib/firebase-commercial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
