'use client';

import { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterContextType {
  filters: {
    actType: string[];
    productType: string[];
    company: string[];
  };
  setFilters: (filters: any) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}

const ACT_TYPES = [
  { value: 'an', label: 'AN - Affaire Nouvelle' },
  { value: 'm+3', label: 'M+3 - Process M+3' },
  { value: 'preterme_auto', label: 'Préterme Auto' },
  { value: 'preterme_iard', label: 'Préterme IARD' },
];

const PRODUCT_TYPES = [
  { value: 'auto_moto', label: 'Auto/Moto' },
  { value: 'iard_part', label: 'IARD Part' },
  { value: 'iard_pro', label: 'IARD Pro' },
  { value: 'pj', label: 'PJ' },
  { value: 'gav', label: 'GAV' },
  { value: 'sante_prevoyance', label: 'Santé/Prévoyance' },
  { value: 'nop50eur', label: 'NOP 50€' },
  { value: 'vie_pp', label: 'Vie PP' },
  { value: 'vie_pu', label: 'Vie PU' },
];

const COMPANIES = [
  { value: 'allianz', label: 'Allianz' },
  { value: 'unim_uniced', label: 'Unim/Uniced' },
  { value: 'courtage', label: 'Courtage' },
];

interface FiltersSystemProps {
  children: React.ReactNode;
}

export function FiltersSystem({ children }: FiltersSystemProps) {
  const [filters, setFiltersState] = useState({
    actType: [],
    productType: [],
    company: [],
  });

  const setFilters = (newFilters: any) => {
    setFiltersState(newFilters);
  };

  const clearAllFilters = () => {
    setFiltersState({
      actType: [],
      productType: [],
      company: [],
    });
  };

  const addFilter = (type: 'actType' | 'productType' | 'company', value: string) => {
    if (!filters[type].includes(value)) {
      setFiltersState({
        ...filters,
        [type]: [...filters[type], value],
      });
    }
  };

  const removeFilter = (type: 'actType' | 'productType' | 'company', value: string) => {
    setFiltersState({
      ...filters,
      [type]: filters[type].filter((item: string) => item !== value),
    });
  };

  const getActiveFiltersCount = () => {
    return filters.actType.length + filters.productType.length + filters.company.length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearAllFilters }}>
      <div className="space-y-6">
        {/* Interface des filtres */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtres</h3>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Effacer tous les filtres
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre par type d'acte */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'acte</label>
              <Select onValueChange={(value) => addFilter('actType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un filtre" />
                </SelectTrigger>
                <SelectContent>
                  {ACT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par type de produit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de produit</label>
              <Select onValueChange={(value) => addFilter('productType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un filtre" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par compagnie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Compagnie</label>
              <Select onValueChange={(value) => addFilter('company', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un filtre" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((company) => (
                    <SelectItem key={company.value} value={company.value}>
                      {company.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Affichage des filtres actifs */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Filtres actifs ({getActiveFiltersCount()})
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.actType.map((filter: string) => (
                  <Badge key={`act-${filter}`} variant="secondary" className="gap-1">
                    {ACT_TYPES.find(t => t.value === filter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('actType', filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.productType.map((filter: string) => (
                  <Badge key={`product-${filter}`} variant="secondary" className="gap-1">
                    {PRODUCT_TYPES.find(t => t.value === filter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('productType', filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.company.map((filter: string) => (
                  <Badge key={`company-${filter}`} variant="secondary" className="gap-1">
                    {COMPANIES.find(c => c.value === filter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('company', filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Composants enfants qui utilisent les filtres */}
        {children}
      </div>
    </FilterContext.Provider>
  );
}
