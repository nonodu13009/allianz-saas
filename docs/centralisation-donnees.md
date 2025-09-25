# Centralisation des données - Amélioration des performances

## Vue d'ensemble

Cette amélioration centralise les données du mois dans des providers React pour éviter les requêtes Firestore multiples et améliorer la stabilité sur les connexions fragiles.

## Problème identifié

### Module Commercial (avant amélioration)
- **3 requêtes Firestore distinctes** pour le même mois :
  1. `KPIsCards` → `getCommercialActivitiesByMonth()`
  2. `TimelineComponent` → `getCommercialActivitiesByMonth()`
  3. `DataTable` → `getCommercialActivitiesByMonth()`

### Conséquences
- **Triple consommation de bande passante** sur connexions fragiles
- **Latence multipliée** par 3 pour le chargement initial
- **Instabilité** : si une requête échoue, le composant reste en erreur
- **Incohérence** : les données peuvent être différentes entre composants
- **Performance dégradée** sur mobile et connexions lentes

## Solution implémentée

### 1. Provider centralisé pour le module Commercial

**Fichier** : `lib/commercial-data-context.tsx`

```typescript
interface CommercialDataContextType {
  // Données brutes
  activities: CommercialActivity[];
  isLoading: boolean;
  error: string | null;
  
  // KPIs calculés
  kpis: {
    totalActs: number;
    anCount: number;
    mPlus3Count: number;
    // ... autres KPIs
  };
  
  // Actions
  refreshData: () => Promise<void>;
  addActivity: (activity: CommercialActivity) => void;
  updateActivity: (activity: CommercialActivity) => void;
  removeActivity: (activityId: string) => void;
}
```

**Avantages** :
- ✅ **Une seule requête Firestore** par changement de mois
- ✅ **KPIs calculés une seule fois** et partagés
- ✅ **Gestion d'erreur centralisée**
- ✅ **Mise à jour optimiste** des données locales
- ✅ **Écoute des événements** pour synchronisation

### 2. Refactorisation des composants

#### KPIsCards
```typescript
// AVANT
const [activities, setActivities] = useState<CommercialActivity[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadMonthData = async () => {
    const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
    setActivities(monthActivities);
  };
  loadMonthData();
}, [currentMonth, user?.id]);

const kpis = calculateKPIs(activities);

// APRÈS
const { activities, isLoading, kpis } = useCommercialData();
```

#### TimelineComponent
```typescript
// AVANT
const [activities, setActivities] = useState<CommercialActivity[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadMonthData = async () => {
    const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
    setActivities(monthActivities);
  };
  loadMonthData();
}, [currentMonth, user?.id]);

// APRÈS
const { activities, isLoading } = useCommercialData();
```

#### DataTable
```typescript
// AVANT
const [activities, setActivities] = useState<CommercialActivity[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadMonthData = async () => {
    const monthActivities = await getCommercialActivitiesByMonth(user.id, currentMonth);
    setActivities(monthActivities);
  };
  loadMonthData();
}, [currentMonth, user?.id]);

// APRÈS
const { activities, isLoading, updateActivity, removeActivity } = useCommercialData();
```

### 3. Structure préparée pour le module Santé Individuelle

**Fichier** : `lib/sante-ind-data-context.tsx`

```typescript
interface SanteIndActivity {
  id?: string;
  userId: string;
  dateCreated: Date;
  clientName: string;
  contractNumber: string;
  effectDate: Date;
  actType: 'affaire_nouvelle' | 'revision' | 'adhesion_salarie' | 'court_az' | 'az_courtage';
  annualPremium: number;
  weightedPremium: number; // Prime pondérée selon le coefficient
  potentialCommission: number;
  realCommission: number;
  month: string;
  year: number;
}

interface SanteIndDataContextType {
  activities: SanteIndActivity[];
  isLoading: boolean;
  error: string | null;
  
  kpis: {
    totalActs: number;
    affaireNouvelleCount: number;
    revisionCount: number;
    adhesionSalarieCount: number;
    courtAzCount: number;
    azCourtageCount: number;
    totalWeightedPremium: number;
    totalPotentialCommission: number;
    totalRealCommission: number;
    revisionCriteriaMet: boolean; // ≥ 4 révisions
    commissionUnlocked: boolean; // Commission débloquée si critère respecté
  };
  
  refreshData: () => Promise<void>;
  addActivity: (activity: SanteIndActivity) => void;
  updateActivity: (activity: SanteIndActivity) => void;
  removeActivity: (activityId: string) => void;
}
```

## Bénéfices mesurables

### Performance
- **Réduction de 66%** du nombre de requêtes Firestore (3 → 1)
- **Réduction de la latence** de chargement initial
- **Amélioration de la stabilité** sur connexions fragiles
- **Réduction de la consommation** de bande passante

### Expérience utilisateur
- **Chargement plus rapide** des données
- **Cohérence garantie** entre tous les composants
- **Gestion d'erreur améliorée** avec retry automatique
- **Mise à jour optimiste** pour une meilleure réactivité

### Maintenabilité
- **Code centralisé** et réutilisable
- **Logique métier** séparée de l'UI
- **Tests facilités** avec des providers isolés
- **Évolutivité** pour de nouveaux composants

## Architecture technique

### Flux de données
```
User Action → Provider → Firestore → Provider → Components
     ↓              ↓         ↓         ↓         ↓
  Event         State     Database   State    UI Update
```

### Gestion des événements
```typescript
// Création d'activité
window.dispatchEvent(new CustomEvent('commercialActivityCreated'));

// Provider écoute et recharge automatiquement
window.addEventListener('commercialActivityCreated', handleActivityChange);
```

### Mise à jour optimiste
```typescript
// Mise à jour locale immédiate
updateActivity(updatedActivity);

// Synchronisation avec Firestore en arrière-plan
await updateCommercialActivity(updatedActivity.id, updatedActivity);
```

## Migration et compatibilité

### Changements apportés
1. **Ajout** de `CommercialDataProvider` dans `commercial-page.tsx`
2. **Refactorisation** des composants KPIs, Timeline et DataTable
3. **Suppression** du code de chargement de données redondant
4. **Préparation** de la structure pour le module Santé Individuelle

### Compatibilité
- ✅ **Rétrocompatible** avec l'API existante
- ✅ **Pas de breaking changes** dans l'interface utilisateur
- ✅ **Même fonctionnalités** avec de meilleures performances
- ✅ **Gestion d'erreur** améliorée

## Prochaines étapes

### Module Commercial
- [x] Provider centralisé implémenté
- [x] Composants refactorisés
- [x] Tests de performance à effectuer

### Module Santé Individuelle
- [x] Structure de provider préparée
- [ ] Implémentation des fonctions Firebase
- [ ] Création des composants KPIs, Timeline, DataTable
- [ ] Tests d'intégration

### Optimisations futures
- [ ] **Cache intelligent** avec invalidation automatique
- [ ] **Pagination** pour les gros volumes de données
- [ ] **Synchronisation offline** avec Firestore
- [ ] **Compression** des données en transit

## Conclusion

Cette centralisation des données améliore significativement les performances et la stabilité de l'application, particulièrement sur les connexions fragiles. La structure mise en place facilite également le développement futur du module Santé Individuelle avec les mêmes bonnes pratiques.

---

*Document créé le : $(date)*  
*Version : 1.0*  
*Dernière mise à jour : $(date)*
