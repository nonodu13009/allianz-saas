'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  CommercialActivity, 
  createCommercialActivity, 
  updateCommercialActivity,
  calculatePotentialCommission 
} from '@/lib/firebase-commercial';

interface CommercialActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  activity?: CommercialActivity | null;
  userId: string;
}

const productTypes = [
  { value: 'auto_moto', label: 'Auto/Moto' },
  { value: 'iard_part', label: 'IARD Particulier' },
  { value: 'iard_pro', label: 'IARD Professionnel' },
  { value: 'pj', label: 'Protection Juridique' },
  { value: 'gav', label: 'GAV' },
  { value: 'sante_prevoyance', label: 'Santé/Prévoyance' },
  { value: 'nop50eur', label: 'NOP 50€' },
  { value: 'vie_pp', label: 'Vie PP' },
  { value: 'vie_pu', label: 'Vie PU' }
];

const actTypes = [
  { value: 'an', label: 'AN' },
  { value: 'm+3', label: 'M+3' },
  { value: 'preterme_auto', label: 'Préterme Auto' },
  { value: 'preterme_iard', label: 'Préterme IARD' }
];

const companies = [
  { value: 'allianz', label: 'Allianz' },
  { value: 'unim_uniced', label: 'Unim/Uniced' },
  { value: 'courtage', label: 'Courtage' }
];

export function CommercialActivityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  activity, 
  userId 
}: CommercialActivityModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    effectDate: new Date(),
    actType: '',
    productType: '',
    company: '',
    annualPremium: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEdit = !!activity;

  // Initialiser le formulaire
  useEffect(() => {
    if (activity) {
      setFormData({
        clientName: activity.clientName,
        contractNumber: activity.contractNumber,
        effectDate: activity.effectDate,
        actType: activity.actType,
        productType: activity.productType,
        company: activity.company,
        annualPremium: activity.annualPremium.toString()
      });
    } else {
      setFormData({
        clientName: '',
        contractNumber: '',
        effectDate: new Date(),
        actType: '',
        productType: '',
        company: '',
        annualPremium: ''
      });
    }
    setErrors({});
  }, [activity, isOpen]);

  // Calculer la commission potentielle en temps réel
  const potentialCommission = formData.productType && formData.annualPremium 
    ? calculatePotentialCommission(formData.productType, parseFloat(formData.annualPremium) || 0)
    : 0;

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Le numéro de contrat est requis';
    }

    if (!formData.actType) {
      newErrors.actType = 'Le type d\'acte est requis';
    }

    if (!formData.productType) {
      newErrors.productType = 'Le type de produit est requis';
    }

    if (!formData.company) {
      newErrors.company = 'La société est requise';
    }

    if (!formData.annualPremium || parseFloat(formData.annualPremium) <= 0) {
      newErrors.annualPremium = 'La prime annuelle doit être supérieure à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const activityData = {
        userId,
        clientName: formData.clientName.trim(),
        contractNumber: formData.contractNumber.trim(),
        effectDate: formData.effectDate,
        actType: formData.actType,
        productType: formData.productType,
        company: formData.company,
        annualPremium: parseFloat(formData.annualPremium)
      };

      if (isEdit && activity?.id) {
        await updateCommercialActivity(activity.id, activityData);
      } else {
        await createCommercialActivity(activityData);
      }

      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ general: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEdit ? 'Modifier l\'acte commercial' : 'Nouvel acte commercial'}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modifiez les informations de l\'acte commercial.' : 'Remplissez les informations pour créer un nouvel acte commercial.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nom du client */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Nom du client *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Ex: Dupont Jean"
              className={errors.clientName ? "border-red-500" : ""}
            />
            {errors.clientName && (
              <p className="text-sm text-red-500">{errors.clientName}</p>
            )}
          </div>

          {/* Numéro de contrat */}
          <div className="space-y-2">
            <Label htmlFor="contractNumber">Numéro de contrat *</Label>
            <Input
              id="contractNumber"
              value={formData.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value)}
              placeholder="Ex: 123456789"
              className={errors.contractNumber ? "border-red-500" : ""}
            />
            {errors.contractNumber && (
              <p className="text-sm text-red-500">{errors.contractNumber}</p>
            )}
          </div>

          {/* Date d'effet */}
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
                  onSelect={(date) => date && handleInputChange('effectDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type d'acte */}
            <div className="space-y-2">
              <Label htmlFor="actType">Type d'acte *</Label>
              <Select value={formData.actType} onValueChange={(value) => handleInputChange('actType', value)}>
                <SelectTrigger className={errors.actType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {actTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.actType && (
                <p className="text-sm text-red-500">{errors.actType}</p>
              )}
            </div>

            {/* Type de produit */}
            <div className="space-y-2">
              <Label htmlFor="productType">Type de produit *</Label>
              <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                <SelectTrigger className={errors.productType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productType && (
                <p className="text-sm text-red-500">{errors.productType}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Société */}
            <div className="space-y-2">
              <Label htmlFor="company">Société *</Label>
              <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)}>
                <SelectTrigger className={errors.company ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.value} value={company.value}>
                      {company.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            {/* Prime annuelle */}
            <div className="space-y-2">
              <Label htmlFor="annualPremium">Prime annuelle (€) *</Label>
              <Input
                id="annualPremium"
                type="number"
                step="0.01"
                value={formData.annualPremium}
                onChange={(e) => handleInputChange('annualPremium', e.target.value)}
                placeholder="Ex: 500.00"
                className={errors.annualPremium ? "border-red-500" : ""}
              />
              {errors.annualPremium && (
                <p className="text-sm text-red-500">{errors.annualPremium}</p>
              )}
            </div>
          </div>

          {/* Commission potentielle calculée */}
          {potentialCommission > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Commission potentielle calculée :
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {potentialCommission.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          )}

          {/* Erreur générale */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Sauvegarde...' : isEdit ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
