'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSanteIndData } from '@/lib/sante-ind-data-context';
import { logBusinessInfo, logBusinessError } from '@/lib/logger';

interface ActModalProps {
  actType: string;
  isOpen: boolean;
  onClose: () => void;
}

const actTypeLabels = {
  affaire_nouvelle: 'Affaire Nouvelle',
  revision: 'Révision',
  adhesion_salarie: 'Adhésion salarié',
  court_az: 'COURT → AZ',
  az_courtage: 'AZ → Courtage'
};

const actTypeCoefficients = {
  affaire_nouvelle: 1.0,
  revision: 0.5,
  adhesion_salarie: 0.5,
  court_az: 0.75,
  az_courtage: 0.5
};

export function ActModal({ actType, isOpen, onClose }: ActModalProps) {
  const { addActivity } = useSanteIndData();
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    effectDate: new Date(),
    primeAnnuelle: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcul de la prime pondérée
  const primePondere = useMemo(() => {
    const prime = parseFloat(formData.primeAnnuelle) || 0;
    const coefficient = actTypeCoefficients[actType as keyof typeof actTypeCoefficients];
    return Math.round(prime * coefficient);
  }, [formData.primeAnnuelle, actType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est obligatoire';
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Le numéro de contrat est obligatoire';
    }

    if (!formData.primeAnnuelle || parseFloat(formData.primeAnnuelle) <= 0) {
      newErrors.primeAnnuelle = 'La prime annuelle doit être supérieure à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const activityData = {
        actType,
        clientName: formData.clientName.trim().toUpperCase(),
        contractNumber: formData.contractNumber.trim(),
        effectDate: formData.effectDate,
        primeAnnuelle: Math.round(parseFloat(formData.primeAnnuelle)),
        primePondere,
        dateCreated: new Date(),
        dateSaisie: new Date()
      };

      await addActivity(activityData);
      
      logBusinessInfo(`Acte santé individuelle créé: ${actTypeLabels[actType as keyof typeof actTypeLabels]} - ${formData.clientName}`, 'ActModal');
      
      // Reset form
      setFormData({
        clientName: '',
        contractNumber: '',
        effectDate: new Date(),
        primeAnnuelle: ''
      });
      setErrors({});
      onClose();
      
    } catch (error) {
      logBusinessError('Erreur lors de la création de l\'acte santé individuelle', 'ActModal', error);
      console.error('Erreur lors de la création de l\'acte:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Saisie d'acte - {actTypeLabels[actType as keyof typeof actTypeLabels]}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom du client *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Nom du client"
                className={errors.clientName ? 'border-red-500' : ''}
              />
              {errors.clientName && (
                <p className="text-sm text-red-500">{errors.clientName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractNumber">Numéro de contrat *</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                placeholder="Numéro de contrat"
                className={errors.contractNumber ? 'border-red-500' : ''}
              />
              {errors.contractNumber && (
                <p className="text-sm text-red-500">{errors.contractNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date d'effet *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.effectDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.effectDate ? (
                      format(formData.effectDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.effectDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, effectDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primeAnnuelle">Prime annuelle (€) *</Label>
              <Input
                id="primeAnnuelle"
                type="number"
                value={formData.primeAnnuelle}
                onChange={(e) => handleInputChange('primeAnnuelle', e.target.value)}
                placeholder="Montant en euros"
                className={errors.primeAnnuelle ? 'border-red-500' : ''}
              />
              {errors.primeAnnuelle && (
                <p className="text-sm text-red-500">{errors.primeAnnuelle}</p>
              )}
            </div>
          </div>

          {/* Calcul automatique de la prime pondérée */}
          {formData.primeAnnuelle && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Calcul automatique
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Prime annuelle :</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(parseFloat(formData.primeAnnuelle) || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Coefficient :</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                    {(actTypeCoefficients[actType as keyof typeof actTypeCoefficients] * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700 dark:text-blue-300">Prime pondérée :</span>
                  <span className="ml-2 font-bold text-lg text-blue-900 dark:text-blue-100">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(primePondere)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer l\'acte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
