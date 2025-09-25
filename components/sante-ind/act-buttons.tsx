'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActModal } from './act-modal';
import { 
  Plus, 
  FileText, 
  RefreshCw, 
  UserPlus, 
  ArrowRightLeft,
  ArrowLeftRight
} from 'lucide-react';

const actTypes = [
  {
    id: 'affaire_nouvelle',
    label: 'Affaire Nouvelle',
    icon: Plus,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Nouveau contrat santé individuel'
  },
  {
    id: 'revision',
    label: 'Révision',
    icon: RefreshCw,
    color: 'bg-orange-600 hover:bg-orange-700',
    description: 'Révision d\'un contrat existant'
  },
  {
    id: 'adhesion_salarie',
    label: 'Adhésion salarié',
    icon: UserPlus,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Adhésion d\'un salarié'
  },
  {
    id: 'court_az',
    label: 'COURT → AZ',
    icon: ArrowRightLeft,
    color: 'bg-purple-600 hover:bg-purple-700',
    description: 'Passage de courtage à Allianz'
  },
  {
    id: 'az_courtage',
    label: 'AZ → Courtage',
    icon: ArrowLeftRight,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    description: 'Passage d\'Allianz au courtage'
  }
];

export function ActButtons() {
  const [selectedActType, setSelectedActType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActClick = (actType: string) => {
    setSelectedActType(actType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActType(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Saisie d'actes santé individuelle
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Sélectionnez le type d'acte à saisir
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actTypes.map((actType) => (
          <Button
            key={actType.id}
            onClick={() => handleActClick(actType.id)}
            className={`${actType.color} text-white h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            <actType.icon className="h-6 w-6" />
            <span className="text-sm font-medium text-center">
              {actType.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Informations sur les coefficients */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Coefficients appliqués :
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-blue-800 dark:text-blue-200">
          <div>Affaire Nouvelle : <strong>100%</strong></div>
          <div>Révision : <strong>50%</strong></div>
          <div>Adhésion salarié : <strong>50%</strong></div>
          <div>COURT → AZ : <strong>75%</strong></div>
          <div>AZ → Courtage : <strong>50%</strong></div>
        </div>
      </div>

      {/* Modal de saisie */}
      {selectedActType && (
        <ActModal
          actType={selectedActType}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
