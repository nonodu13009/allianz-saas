// Utilitaires pour le module CDC Santé Collective
// Fonctions de calcul, formatage et manipulation des données

import { 
  SanteCollActivity, 
  SanteCollFilter, 
  SanteCollActeType,
  SanteCollOrigine,
  CompagnieType,
  COMMISSION_SEUILS
} from '@/types/sante-coll'

// ============================================================================
// FONCTIONS DE FILTRAGE
// ============================================================================

export function filterActivities(activities: SanteCollActivity[], filter: SanteCollFilter): SanteCollActivity[] {
  return activities.filter(activity => {
    // Filtre par type d'acte
    if (filter.type !== 'all' && activity.type !== filter.type) {
      return false
    }

    // Filtre par origine
    if (filter.origine && activity.origine !== filter.origine) {
      return false
    }

    // Filtre par compagnie
    if (filter.compagnie && activity.compagnie !== filter.compagnie) {
      return false
    }

    // Filtre par jour du mois
    if (filter.day) {
      const activityDay = new Date(activity.dateSaisie).getDate()
      if (activityDay !== filter.day) {
        return false
      }
    }

    return true
  })
}

// ============================================================================
// FONCTIONS DE CALCUL
// ============================================================================

export function calculateCAPondere(ca: number, type: SanteCollActeType): number {
  const ponderationRates = {
    [SanteCollActeType.AFFAIRE_NOUVELLE]: 1.00, // 100%
    [SanteCollActeType.REVISION]: 0.50, // 50%
    [SanteCollActeType.ADHESION_GROUPE]: 0.50, // 50%
    [SanteCollActeType.TRANSFERT_COURTAGE]: 0.75 // 75%
  }
  
  return ca * (ponderationRates[type] || 1.00)
}

export function calculateCommission(productionPondere: number): {
  tauxApplicable: number
  commissionEstimee: number
  seuilAtteint: typeof COMMISSION_SEUILS[0]
  prochainSeuil?: typeof COMMISSION_SEUILS[0]
  ecartProchainSeuil?: number
} {
  const seuilApplicable = COMMISSION_SEUILS.find(seuil => 
    productionPondere >= seuil.min && (seuil.max === undefined || productionPondere <= seuil.max)
  ) || COMMISSION_SEUILS[0]

  const commissionEstimee = productionPondere * (seuilApplicable.taux / 100)

  // Trouver le prochain seuil
  const prochainSeuil = COMMISSION_SEUILS.find(seuil => seuil.min > productionPondere)
  const ecartProchainSeuil = prochainSeuil ? prochainSeuil.min - productionPondere : undefined

  return {
    tauxApplicable: seuilApplicable.taux,
    commissionEstimee,
    seuilAtteint: seuilApplicable,
    prochainSeuil,
    ecartProchainSeuil
  }
}

// ============================================================================
// FONCTIONS DE FORMATAGE
// ============================================================================

export function formatEuroInt(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatEuroDecimal(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function getMonthName(month: number): string {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return monthNames[month - 1] || 'Mois inconnu'
}

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

export function validateActivity(activity: Partial<SanteCollActivity>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validation des champs obligatoires
  if (!activity.userId) {
    errors.push('L\'ID utilisateur est obligatoire')
  }

  if (!activity.type) {
    errors.push('Le type d\'acte est obligatoire')
  }

  if (!activity.clientName?.trim()) {
    errors.push('Le nom du client est obligatoire')
  }

  if (!activity.contractNumber?.trim()) {
    errors.push('Le numéro de contrat est obligatoire')
  }

  if (!activity.dateEffet) {
    errors.push('La date d\'effet est obligatoire')
  }

  if (activity.ca === undefined || activity.ca === null) {
    errors.push('Le CA est obligatoire')
  } else if (activity.ca < 0) {
    errors.push('Le CA ne peut pas être négatif')
  }

  // Validation spécifique aux Affaires Nouvelles
  if (activity.type === SanteCollActeType.AFFAIRE_NOUVELLE) {
    if (!activity.compagnie) {
      errors.push('La compagnie est obligatoire pour les Affaires Nouvelles')
    }
  }

  // Validation de la date d'effet
  if (activity.dateEffet) {
    const dateEffet = new Date(activity.dateEffet)
    const today = new Date()
    
    if (dateEffet > today) {
      errors.push('La date d\'effet ne peut pas être dans le futur')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// FONCTIONS DE MANIPULATION
// ============================================================================

export function capitalizeClientName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function generateTimelineData(activities: SanteCollActivity[], year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const timelineData = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.dateSaisie)
      return activityDate.getDate() === day && 
             activityDate.getMonth() === month - 1 && 
             activityDate.getFullYear() === year
    })

    const acteCounts = {
      [SanteCollActeType.AFFAIRE_NOUVELLE]: 0,
      [SanteCollActeType.REVISION]: 0,
      [SanteCollActeType.ADHESION_GROUPE]: 0,
      [SanteCollActeType.TRANSFERT_COURTAGE]: 0
    }

    dayActivities.forEach(activity => {
      acteCounts[activity.type]++
    })

    timelineData.push({
      day,
      totalActivities: dayActivities.length,
      acteCounts,
      hasData: dayActivities.length > 0
    })
  }

  return timelineData
}

export function sortActivities(activities: SanteCollActivity[], sortField: string, sortDirection: 'asc' | 'desc'): SanteCollActivity[] {
  return [...activities].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'dateSaisie':
        aValue = new Date(a.dateSaisie)
        bValue = new Date(b.dateSaisie)
        break
      case 'clientName':
        aValue = a.clientName.toLowerCase()
        bValue = b.clientName.toLowerCase()
        break
      case 'type':
        aValue = a.type
        bValue = b.type
        break
      case 'ca':
        aValue = a.ca
        bValue = b.ca
        break
      case 'caPondere':
        aValue = a.caPondere
        bValue = b.caPondere
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================================================
// FONCTIONS DE CONFIGURATION
// ============================================================================

export function getActeTypeConfig(type: SanteCollActeType) {
  const configs = {
    [SanteCollActeType.AFFAIRE_NOUVELLE]: {
      label: 'Affaire nouvelle',
      shortLabel: 'AN',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '✨'
    },
    [SanteCollActeType.REVISION]: {
      label: 'Révision',
      shortLabel: 'Révision',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '📝'
    },
    [SanteCollActeType.ADHESION_GROUPE]: {
      label: 'Adhésion groupe',
      shortLabel: 'Groupe',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '👥'
    },
    [SanteCollActeType.TRANSFERT_COURTAGE]: {
      label: 'Transfert courtage',
      shortLabel: 'Transfert',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🔄'
    }
  }
  
  return configs[type] || { label: type, shortLabel: type, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' }
}

export function getOrigineConfig(origine: SanteCollOrigine) {
  const configs = {
    [SanteCollOrigine.PROSPECTION]: {
      label: 'Prospection',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🎯'
    },
    [SanteCollOrigine.RELATION_CLIENT]: {
      label: 'Relation client',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '🤝'
    },
    [SanteCollOrigine.REFERENCEMENT]: {
      label: 'Référencement',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⭐'
    },
    [SanteCollOrigine.PARTENARIAT]: {
      label: 'Partenariat',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🤝'
    },
    [SanteCollOrigine.AUTRE]: {
      label: 'Autre',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '📋'
    }
  }
  
  return configs[origine] || { label: origine, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' }
}

export function getCompagnieConfig(compagnie: CompagnieType) {
  const configs = {
    [CompagnieType.ALLIANZ]: {
      label: 'Allianz',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🏢'
    },
    [CompagnieType.COURTAGE]: {
      label: 'Courtage',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '🏛️'
    },
    [CompagnieType.AUTRE]: {
      label: 'Autre',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🏢'
    }
  }
  
  return configs[compagnie] || { label: compagnie, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🏢' }
}
