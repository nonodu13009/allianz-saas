'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { createCommercialActivity, calculatePotentialCommission } from '@/lib/firebase-commercial';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface ActModalProps {
  actType: 'an' | 'm+3' | 'preterme_auto' | 'preterme_iard';
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCT_TYPES = [
  { value: 'auto_moto', label: 'Auto/Moto', commission: '10 €' },
  { value: 'iard_part', label: 'IARD Part', commission: '20 €' },
  { value: 'iard_pro', label: 'IARD Pro', commission: '20 € + 10 € par tranche de 1000 €' },
  { value: 'pj', label: 'PJ', commission: '30 €' },
  { value: 'gav', label: 'GAV', commission: '40 €' },
  { value: 'sante_prevoyance', label: 'Santé/Prévoyance', commission: '50 €' },
  { value: 'nop50eur', label: 'NOP 50€', commission: '10 €' },
  { value: 'vie_pp', label: 'Vie PP', commission: '50 €' },
  { value: 'vie_pu', label: 'Vie PU', commission: '1% du versement' },
];

const COMPANIES = [
  { value: 'allianz', label: 'Allianz' },
  { value: 'unim_uniced', label: 'Unim/Uniced' },
  { value: 'courtage', label: 'Courtage' },
];

export function ActModal({ actType, isOpen, onClose }: ActModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    contractNumber: '',
    effectDate: new Date(),
    productType: '',
    company: '',
    annualPremium: 0,
  });

  // Calculer la commission potentielle en temps réel
  const potentialCommission = formData.productType && formData.annualPremium > 0
    ? calculatePotentialCommission(formData.productType as any, formData.annualPremium)
    : 0;

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        contractNumber: '',
        effectDate: new Date(),
        productType: '',
        company: '',
        annualPremium: 0,
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    // Validation différente selon le type d'acte
    if (actType === 'an') {
      // AN : tous les champs obligatoires
      if (!formData.clientName || !formData.contractNumber || !formData.productType || !formData.company) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else {
      // M+3, Préterme Auto, Préterme IARD : seulement nom du client
      if (!formData.clientName) {
        toast.error('Veuillez saisir le nom du client');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const activityData: any = {
        userId: user.id,
        clientName: formData.clientName,
        effectDate: formData.effectDate,
        actType,
      };

      // Pour AN seulement : ajouter les autres champs
      if (actType === 'an') {
        activityData.contractNumber = formData.contractNumber;
        activityData.productType = formData.productType;
        activityData.company = formData.company;
        activityData.annualPremium = formData.annualPremium;
      } else {
        // Pour M+3, Préterme Auto, Préterme IARD : pas de produit ni compagnie
        activityData.contractNumber = '';
        activityData.productType = ''; // Pas de produit
        activityData.company = ''; // Pas de compagnie
        activityData.annualPremium = 0; // Pas de prime
      }

      await createCommercialActivity(activityData);

      toast.success('Acte commercial créé avec succès');
      
      // Déclencher un événement personnalisé pour rafraîchir les données
      window.dispatchEvent(new CustomEvent('commercialActivityCreated'));
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'acte commercial');
    } finally {
      setIsLoading(false);
    }
  };

  const getActTypeLabel = () => {
    const labels = {
      'an': 'Affaire Nouvelle',
      'm+3': 'Process M+3',
      'preterme_auto': 'Préterme Auto',
      'preterme_iard': 'Préterme IARD',
    };
    return labels[actType];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel acte - {getActTypeLabel()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom du client - TOUJOURS AFFICHÉ */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom du client *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Nom du client"
                required
              />
            </div>

            {/* Date d'effet - TOUJOURS AFFICHÉ */}
            <div className="space-y-2">
              <Label>Date d'effet *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.effectDate ? format(formData.effectDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.effectDate}
                    onSelect={(date) => date && setFormData({ ...formData, effectDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Champs spécifiques à AN seulement */}
            {actType === 'an' && (
              <>
                {/* Numéro de contrat */}
                <div className="space-y-2">
                  <Label htmlFor="contractNumber">Numéro de contrat *</Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="Numéro de contrat"
                    required
                  />
                </div>

                {/* Type de produit */}
                <div className="space-y-2">
                  <Label>Type de produit *</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((product) => (
                        <SelectItem key={product.value} value={product.value}>
                          <div className="flex flex-col">
                            <span>{product.label}</span>
                            <span className="text-xs text-muted-foreground">{product.commission}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Compagnie */}
                <div className="space-y-2">
                  <Label>Compagnie *</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => setFormData({ ...formData, company: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une compagnie" />
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

                {/* Prime annuelle */}
                <div className="space-y-2">
                  <Label htmlFor="annualPremium">Prime annuelle ou versée (€) *</Label>
                  <Input
                    id="annualPremium"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.annualPremium || ''}
                    onChange={(e) => setFormData({ ...formData, annualPremium: parseFloat(e.target.value) || 0 })}
                    placeholder="Montant en euros"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Commission potentielle calculée - seulement pour AN */}
          {actType === 'an' && potentialCommission > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Commission potentielle :</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(potentialCommission)}
                </span>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
