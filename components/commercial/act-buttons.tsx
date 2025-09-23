'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, RefreshCw, Car, Shield } from 'lucide-react';
import { ActModal } from './act-modal';

interface ActButtonProps {
  actType: 'an' | 'm+3' | 'preterme_auto' | 'preterme_iard';
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const actButtons: ActButtonProps[] = [
  {
    actType: 'an',
    label: 'AN - Affaire Nouvelle',
    description: 'Nouveau contrat client',
    icon: <Plus className="h-8 w-8 text-emerald-100" />,
    variant: 'default',
  },
  {
    actType: 'm+3',
    label: 'M+3 - Process M+3',
    description: 'Processus M+3',
    icon: <RefreshCw className="h-8 w-8 text-blue-100" />,
    variant: 'default',
  },
  {
    actType: 'preterme_auto',
    label: 'Préterme Auto',
    description: 'Préterme automatique',
    icon: <Car className="h-8 w-8 text-orange-100" />,
    variant: 'default',
  },
  {
    actType: 'preterme_iard',
    label: 'Préterme IARD',
    description: 'Préterme IARD',
    icon: <Shield className="h-8 w-8 text-purple-100" />,
    variant: 'default',
  },
];

export function ActButtons() {
  const [selectedActType, setSelectedActType] = useState<string | null>(null);

  const handleActClick = (actType: string) => {
    setSelectedActType(actType);
  };

  const handleModalClose = () => {
    setSelectedActType(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Saisie des actes commerciaux
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Sélectionnez le type d'acte à saisir
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actButtons.map((button) => {
          // Couleurs flashy pour chaque type d'acte
          const getButtonStyles = (actType: string) => {
            switch (actType) {
              case 'an':
                return {
                  gradient: 'from-emerald-500 to-green-600',
                  hoverGradient: 'from-emerald-400 to-green-500',
                  textColor: 'text-white',
                  shadow: 'shadow-emerald-500/25',
                  hoverShadow: 'hover:shadow-emerald-500/40'
                };
              case 'm+3':
                return {
                  gradient: 'from-blue-500 to-cyan-600',
                  hoverGradient: 'from-blue-400 to-cyan-500',
                  textColor: 'text-white',
                  shadow: 'shadow-blue-500/25',
                  hoverShadow: 'hover:shadow-blue-500/40'
                };
              case 'preterme_auto':
                return {
                  gradient: 'from-orange-500 to-red-500',
                  hoverGradient: 'from-orange-400 to-red-400',
                  textColor: 'text-white',
                  shadow: 'shadow-orange-500/25',
                  hoverShadow: 'hover:shadow-orange-500/40'
                };
              case 'preterme_iard':
                return {
                  gradient: 'from-purple-500 to-pink-600',
                  hoverGradient: 'from-purple-400 to-pink-500',
                  textColor: 'text-white',
                  shadow: 'shadow-purple-500/25',
                  hoverShadow: 'hover:shadow-purple-500/40'
                };
              default:
                return {
                  gradient: 'from-slate-500 to-slate-600',
                  hoverGradient: 'from-slate-400 to-slate-500',
                  textColor: 'text-white',
                  shadow: 'shadow-slate-500/25',
                  hoverShadow: 'hover:shadow-slate-500/40'
                };
            }
          };

          const styles = getButtonStyles(button.actType);

          return (
            <Card key={button.actType} className="p-0 overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <Button
                variant={button.variant}
                size="lg"
                className={`w-full h-28 flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br ${styles.gradient} hover:bg-gradient-to-br hover:${styles.hoverGradient} border-0 ${styles.shadow} ${styles.hoverShadow} transition-all duration-300`}
                onClick={() => handleActClick(button.actType)}
              >
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {button.icon}
                </div>
                <div className="text-center">
                  <div className={`font-bold text-sm ${styles.textColor} transition-colors`}>
                    {button.label}
                  </div>
                  <div className={`text-xs ${styles.textColor} opacity-90 transition-colors`}>
                    {button.description}
                  </div>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Modale de saisie */}
      {selectedActType && (
        <ActModal
          actType={selectedActType as any}
          isOpen={!!selectedActType}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
