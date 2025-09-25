'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  disabled?: boolean;
  showCurrentMonthIndicator?: boolean;
}

export function MonthSelector({ 
  value, 
  onChange, 
  disabled = false,
  showCurrentMonthIndicator = true 
}: MonthSelectorProps) {
  const [availableMonths, setAvailableMonths] = useState<Array<{value: string, label: string, isCurrent: boolean}>>([]);

  // Générer les mois disponibles (mois actuel + 12 mois précédents)
  useEffect(() => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Générer le mois actuel + 12 mois précédents
    for (let i = 0; i < 13; i++) {
      let year = currentYear;
      let month = currentMonth - i;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthString = `${year}-${String(month).padStart(2, '0')}`;
      const monthName = monthNames[month - 1];
      const isCurrent = i === 0;
      
      months.push({
        value: monthString,
        label: `${monthName} ${year}`,
        isCurrent
      });
    }
    
    setAvailableMonths(months);
  }, []);

  const getCurrentMonthDisplay = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const selectedMonth = availableMonths.find(m => m.value === value);
  const isCurrentMonth = value === getCurrentMonthDisplay();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="month-selector" className="text-sm font-medium">
          Mois de saisie
        </Label>
        {showCurrentMonthIndicator && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  Sélectionnez le mois pour lequel vous souhaitez enregistrer cet acte.
                  <br />
                  <strong>Mois actuel :</strong> Saisie normale
                  <br />
                  <strong>Mois précédents :</strong> Saisie différée
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un mois" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{month.label}</span>
                  {month.isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      Actuel
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedMonth && (
          <div className="flex items-center gap-1">
            {isCurrentMonth ? (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Saisie normale
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-200">
                Saisie différée
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {!isCurrentMonth && (
        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
          <strong>Attention :</strong> Vous effectuez une saisie différée pour {selectedMonth?.label}. 
          Vérifiez que cette saisie est bien nécessaire et autorisée.
        </div>
      )}
    </div>
  );
}
