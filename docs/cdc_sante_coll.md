# Dashboard CDC Santé Collective

## Vue d'ensemble

Le dashboard CDC Santé Collective est inspiré de l'architecture du dashboard CDC Santé Individuelle, avec des adaptations spécifiques aux besoins de la santé collective.

## Architecture inspirée de CDC Santé Individuelle

### 1. Navigation mois par mois

**Fonctionnalité** : Navigation temporelle identique à CDC Santé Individuelle
- **Format** : Timeline horizontale avec boutons "Précédent/Suivant"
- **Période par défaut** : Mois en cours
- **Données mises à jour** : Tout le dashboard (KPIs, tableaux, graphiques)
- **Limites** : Navigation libre (pas de restrictions temporelles)

**Composants réutilisables** :
- `MonthTimeline` (composant UI générique)
- `SanteCollTimeline` (wrapper spécifique santé collective)

```typescript
interface SanteCollMonthNavigation {
  currentYear: number;
  currentMonth: number;
  currentYearMonth: string; // Format "YYYY-MM"
  canGoPrevious: boolean;
  canGoNext: boolean;
}
```

### 2. Hook personnalisé `useSanteCollActivities`

**Inspiré de** : `useSanteIndActivities`

**Fonctionnalités** :
- Gestion des activités santé collective
- Calcul automatique des KPIs
- Navigation mensuelle intégrée
- Système de filtres
- Actualisation automatique (30s)
- Gestion du verrouillage mensuel
- Statistiques de production

```typescript
interface UseSanteCollActivitiesReturn {
  // Données
  activities: SanteCollActivity[];
  kpis: SanteCollKPI | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  saveActivity: (activity: Omit<SanteCollActivity, 'id'>) => Promise<SanteCollActivity>;
  updateActivity: (id: string, updates: Partial<SanteCollActivity>) => Promise<SanteCollActivity>;
  deleteActivity: (id: string) => Promise<void>;
  refreshActivities: () => Promise<void>;
  
  // Navigation mensuelle
  navigation: SanteCollMonthNavigation;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  
  // Filtres
  filters: SanteCollFilter;
  setFilters: (filters: Partial<SanteCollFilter>) => void;
  filteredActivities: SanteCollActivity[];
  
  // Verrouillage
  isMonthLocked: boolean;
  lockLoading: boolean;
}
```

### 3. Service unifié `SanteCollService`

**Inspiré de** : `SanteIndService`

**Architecture** :
- Singleton pattern
- Validation cohérente
- Normalisation des données
- Calculs automatiques (CA pondéré, commissions)
- Gestion Firebase intégrée

```typescript
class SanteCollService {
  // Validation cohérente
  private validateActivity(activity: Partial<SanteCollActivity>): ValidationResult;
  
  // Normalisation des données
  private normalizeActivity(activity: Partial<SanteCollActivity>): Partial<SanteCollActivity>;
  
  // Capitalisation intelligente des noms clients
  private capitalizeClientName(name: string): string;
  
  // Calculs métier
  private calculateCAPondere(type: SanteCollActeType, ca: number): number;
  private calculateCommission(productionPondere: number): CommissionCalculation;
  
  // CRUD Firebase
  async getActivities(yearMonth: string): Promise<SanteCollActivity[]>;
  async saveActivity(activity: Omit<SanteCollActivity, 'id'>): Promise<SanteCollActivity>;
  async updateActivity(id: string, updates: Partial<SanteCollActivity>): Promise<SanteCollActivity>;
  async deleteActivity(id: string): Promise<void>;
  
  // KPIs et statistiques
  async calculateKPIs(yearMonth: string, userId: string): Promise<SanteCollKPI>;
  calculateProductionStats(activities: SanteCollActivity[]): ProductionStats;
  
  // Verrouillage
  async isMonthLocked(yearMonth: string, userId: string): Promise<boolean>;
}
```

### 4. Composants spécifiques Santé Collective

**Structure identique à Santé Individuelle** :

```
src/components/sante-coll/
├── SanteCollKPIs.tsx           # Affichage des KPIs avec graphiques
├── SanteCollTimeline.tsx      # Timeline mensuelle avec navigation
├── SanteCollTable.tsx         # Tableau des activités avec filtres
├── SanteCollButtons.tsx       # Boutons d'action (Nouveau, etc.)
├── ModalActe.tsx              # Modal de saisie d'acte
├── ModalActeSimple.tsx        # Modal simplifié
└── index.ts                   # Exports centralisés
```

### 5. Types et interfaces

**Inspirés de** : `types/sante-ind.ts`

```typescript
// Types d'actes spécifiques santé collective
enum SanteCollActeType {
  AFFAIRE_NOUVELLE = 'affaire_nouvelle',
  REVISION = 'revision',
  ADHESION_GROUPE = 'adhesion_groupe',
  TRANSFERT_COURTAGE = 'transfert_courtage',
  // ... autres types spécifiques
}

// Interface activité
interface SanteCollActivity {
  id: string;
  userId: string;
  yearMonth: string;
  clientName: string;
  type: SanteCollActeType;
  dateSaisie: string;
  contractNumber: string;
  dateEffet: string;
  ca: number;
  caPondere: number;
  compagnie?: CompagnieType;
  createdAt: string;
  updatedAt: string;
}

// Interface KPIs
interface SanteCollKPI {
  yearMonth: string;
  userId: string;
  nombreAffairesNouvelles: number;
  nombreRevisions: number;
  nombreAdhesionsGroupe: number;
  nombreTransfertsCourtage: number;
  productionBrute: number;
  productionPondere: number;
  tauxCommission: number;
  commissionEstimee: number;
  critereQualitatifAtteint: boolean;
  calculatedAt: string;
  updatedAt: string;
}
```

### 6. API Routes

**Structure identique** :
```
src/app/api/sante-coll-activities/
├── route.ts                    # GET, POST
├── [id]/route.ts              # GET, PUT, DELETE
└── lock/route.ts              # Verrouillage mensuel
```

### 7. Page Dashboard dédiée

**Inspirée de** : `src/app/dashboard/sante-individuelle/page.tsx`

**Fonctionnalités** :
- Layout responsive identique
- Message de bienvenue avec gradient
- Navigation mensuelle intégrée
- KPIs en temps réel
- Timeline interactive
- Tableau avec filtres et tri
- Modales de saisie
- Gestion des erreurs

### 8. Spécificités Santé Collective

**Différences avec Santé Individuelle** :
- Types d'actes différents
- Grille de pondération spécifique
- Seuils de commission adaptés
- Critères qualitatifs spécifiques
- Couleurs thématiques (ex: bleu au lieu d'émeraude)

### 9. Implémentation technique

**Stack identique** :
- Next.js 14 avec App Router
- TypeScript strict
- Firebase Firestore
- Tailwind CSS
- Composants UI réutilisables
- Hooks personnalisés
- Services singleton

**Performance** :
- Actualisation automatique (30s)
- Cache local des données
- Optimistic updates
- Lazy loading des composants
- Debouncing des recherches

### 10. Tests et validation

**Stratégie identique** :
- Tests unitaires des services
- Tests d'intégration des hooks
- Tests E2E des workflows
- Validation des calculs métier
- Tests de performance

## Diagnostic et résolution des erreurs Firebase

### Erreur "Failed to get document because the client is offline"

Cette erreur indique que Firebase n'arrive pas à se connecter au serveur. Voici le guide de diagnostic :

#### 1. Vérification de la configuration Firebase

**Variables d'environnement** :
```bash
# Vérifier que toutes les variables sont définies
echo $NEXT_PUBLIC_FIREBASE_API_KEY
echo $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo $NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo $NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
echo $NEXT_PUBLIC_FIREBASE_APP_ID
```

**Fichier `.env.local`** :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxXJ7K8Q9R2S3T4U5V6W7X8Y9Z0A1B2C3
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=allianz-saas-132c3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=allianz-saas-132c3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=allianz-saas-132c3.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=102519702913805426095
NEXT_PUBLIC_FIREBASE_APP_ID=1:102519702913805426095:web:abcdef1234567890
```

#### 2. Tests de connectivité

**Script de diagnostic** :
```bash
# Exécuter le script de test
node test-firebase-connection.js

# Ou utiliser le composant de debug
# Aller sur /firebase-test dans l'application
```

**Composant FirebaseDebug** :
```typescript
// Utiliser le composant de diagnostic
import { FirebaseDebug } from '@/components/FirebaseDebug'

// Dans votre page de test
<FirebaseDebug />
```

#### 3. Solutions courantes

**A. Problème de réseau** :
- Vérifier la connexion internet
- Tester avec un autre réseau (mobile hotspot)
- Vérifier les proxies/firewalls

**B. Configuration Firebase** :
- Vérifier que le projet Firebase est actif
- Vérifier les règles Firestore (`firestore.rules`)
- Vérifier les index Firestore (`firestore.indexes.json`)

**C. Variables d'environnement** :
- Redémarrer le serveur de développement après modification
- Vérifier le fichier `.env.local` (pas `.env`)
- S'assurer que les variables commencent par `NEXT_PUBLIC_`

**D. Cache et cookies** :
- Vider le cache du navigateur
- Supprimer les cookies Firebase
- Redémarrer le navigateur

#### 4. Configuration de développement

**Emulateurs Firebase** (optionnel) :
```typescript
// Dans src/lib/firebase.ts
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('firebase/auth').then(({ connectAuthEmulator }) => {
    connectAuthEmulator(auth, 'http://localhost:9099')
  })
  
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    connectFirestoreEmulator(db, 'localhost', 8080)
  })
}
```

**Démarrage des émulateurs** :
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Démarrer les émulateurs
firebase emulators:start
```

#### 5. Monitoring et logs

**Console Firebase** :
- Aller sur https://console.firebase.google.com
- Vérifier les logs dans "Functions" > "Logs"
- Vérifier l'état des services dans "Project Overview"

**Logs côté client** :
```typescript
// Activer les logs détaillés
import { enableLogging } from 'firebase/firestore'
enableLogging(true)
```

#### 6. Gestion d'erreur robuste

**Wrapper avec retry** :
```typescript
async function robustFirebaseCall<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      if (error.code === 'unavailable' && i < maxRetries - 1) {
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries reached')
}
```

**Gestion des états offline** :
```typescript
import { onSnapshot } from 'firebase/firestore'

// Écouter les changements de connectivité
const unsubscribe = onSnapshot(doc(db, 'status', 'connection'), (doc) => {
  const isOnline = doc.data()?.online
  console.log('Firebase online status:', isOnline)
})
```

#### 7. Checklist de diagnostic

- [ ] Variables d'environnement définies
- [ ] Projet Firebase actif
- [ ] Connexion internet stable
- [ ] Règles Firestore correctes
- [ ] Index Firestore à jour
- [ ] Cache navigateur vidé
- [ ] Serveur de développement redémarré
- [ ] Logs Firebase consultés
- [ ] Test avec émulateurs local
- [ ] Test avec autre réseau

## Saisie d'actes - Modal de création

### Interface utilisateur

**Déclenchement** : Clic sur bouton "Nouvel acte" → Ouverture de la modale

**Composant** : `ModalActeSanteColl.tsx`

### Champs de saisie

#### 1. Date de saisie
- **Type** : `string` (ISO format)
- **Valeur** : Date système automatique
- **Modifiable** : ❌ Non (lecture seule)
- **Format** : `YYYY-MM-DDTHH:mm:ss.sssZ`

#### 2. Origine de l'affaire
- **Type** : `enum SanteCollOrigine`
- **Options** :
  - `PROACTIF` : "Proactif"
  - `REACTIF` : "Réactif" 
  - `PROSPECTION` : "Prospection"
- **Obligatoire** : ✅ Oui

#### 3. Type d'actes
- **Type** : `enum SanteCollActeType`
- **Options** :
  - `AN_COLLECTIVE_SANTE` : "AN Collective en Santé"
  - `AN_COLLECTIVE_PREVOYANCE` : "AN Collective en Prévoyance"
  - `AN_COLLECTIVE_RETRAITE` : "AN Collective en Retraite"
  - `AN_INDIVIDUELLE_SANTE` : "AN Individuelle en Santé"
  - `AN_INDIVIDUELLE_PREVOYANCE` : "AN Individuelle en Prévoyance"
  - `AN_INDIVIDUELLE_RETRAITE` : "AN Individuelle en Retraite"
  - `ADHESION_RENFORT_COLLECTIVE` : "Adhésion/Renfort en Collective"
  - `REVISION_COLLECTIVE` : "Révision Collective"
  - `COURTAGE_VERS_ALLIANZ` : "Courtage → Allianz"
  - `ALLIANZ_VERS_COURTAGE` : "Allianz → Courtage"
- **Obligatoire** : ✅ Oui

#### 4. Compagnie
- **Type** : `enum CompagnieType`
- **Options** :
  - `ALLIANZ` : "Allianz"
  - `UNIM_UNICED` : "Unim / Uniced"
  - `COURTAGE` : "Courtage"
- **Obligatoire** : ✅ Oui

#### 5. Nom du client
- **Type** : `string`
- **Validation** : Non vide, trim automatique
- **Capitalisation** : Automatique (Jean-Michel → JEAN-MICHEL)
- **Obligatoire** : ✅ Oui

#### 6. Numéro de contrat
- **Type** : `string`
- **Validation** : Non vide, trim automatique
- **Format** : Texte libre
- **Obligatoire** : ✅ Oui

#### 7. Date d'effet
- **Type** : `string` (ISO format)
- **Validation** : Date valide, format ISO
- **Format** : `YYYY-MM-DD`
- **Obligatoire** : ✅ Oui

#### 8. Prime brute
- **Type** : `number`
- **Validation** : Nombre positif
- **Format** : Montant en euros
- **Obligatoire** : ✅ Oui

#### 9. Prime pondérée
- **Type** : `number`
- **Calcul** : Automatique selon coefficients
- **Formule** : `Prime brute × Coefficient du type d'acte`
- **Modifiable** : ❌ Non (calculé automatiquement)
- **Obligatoire** : ✅ Oui (calculé)

### Interface TypeScript

```typescript
// Types d'origine
enum SanteCollOrigine {
  PROACTIF = 'proactif',
  REACTIF = 'reactif',
  PROSPECTION = 'prospection'
}

// Types d'actes spécifiques santé collective
enum SanteCollActeType {
  AN_COLLECTIVE_SANTE = 'an_collective_sante',
  AN_COLLECTIVE_PREVOYANCE = 'an_collective_prevoyance',
  AN_COLLECTIVE_RETRAITE = 'an_collective_retraite',
  AN_INDIVIDUELLE_SANTE = 'an_individuelle_sante',
  AN_INDIVIDUELLE_PREVOYANCE = 'an_individuelle_prevoyance',
  AN_INDIVIDUELLE_RETRAITE = 'an_individuelle_retraite',
  ADHESION_RENFORT_COLLECTIVE = 'adhesion_renfort_collective',
  REVISION_COLLECTIVE = 'revision_collective',
  COURTAGE_VERS_ALLIANZ = 'courtage_vers_allianz',
  ALLIANZ_VERS_COURTAGE = 'allianz_vers_courtage'
}

// Types de compagnie (réutilisé depuis santé individuelle)
enum CompagnieType {
  ALLIANZ = 'allianz',
  UNIM_UNICED = 'unim_uniced',
  COURTAGE = 'courtage'
}

// Interface activité santé collective
interface SanteCollActivity {
  id: string;
  userId: string;
  yearMonth: string; // Format "YYYY-MM"
  dateSaisie: string; // ISO string, auto-générée
  origine: SanteCollOrigine;
  type: SanteCollActeType;
  compagnie: CompagnieType;
  clientName: string; // Capitalisé automatiquement
  contractNumber: string;
  dateEffet: string; // ISO string
  primeBrute: number; // Montant en euros
  primePondere: number; // Calculé automatiquement
  createdAt: string;
  updatedAt: string;
}

// Interface pour la création d'activité
interface CreateSanteCollActivity {
  origine: SanteCollOrigine;
  type: SanteCollActeType;
  compagnie: CompagnieType;
  clientName: string;
  contractNumber: string;
  dateEffet: string;
  primeBrute: number;
  // primePondere calculé automatiquement
}
```

### Coefficients de pondération

**Grille selon l'origine de l'affaire** :

```typescript
// Coefficients selon l'origine de l'affaire
const PONDERATION_RATES_BY_ORIGINE: Record<SanteCollOrigine, number> = {
  [SanteCollOrigine.PROACTIF]: 1.00,     // Coefficient 1,00
  [SanteCollOrigine.REACTIF]: 0.50,      // Coefficient 0,50
  [SanteCollOrigine.PROSPECTION]: 1.50   // Coefficient 1,50
}

// Fonction de calcul selon l'origine
function calculatePrimePondereByOrigine(origine: SanteCollOrigine, primeBrute: number): number {
  const coefficient = PONDERATION_RATES_BY_ORIGINE[origine]
  return Math.round(primeBrute * coefficient)
}
```

**Logique métier** :
- **PROACTIF** (1,00) : Coefficient neutre - prime pondérée = prime brute
- **REACTIF** (0,50) : Coefficient réduit - prime pondérée = 50% de la prime brute
- **PROSPECTION** (1,50) : Coefficient majoré - prime pondérée = 150% de la prime brute

**Exemples de calcul** :
- Prime brute 1000€ + Origine PROACTIF = Prime pondérée 1000€
- Prime brute 1000€ + Origine REACTIF = Prime pondérée 500€
- Prime brute 1000€ + Origine PROSPECTION = Prime pondérée 1500€

### Coefficients selon le type d'acte

**Grille selon le type d'acte** :

```typescript
// Coefficients selon le type d'acte
const PONDERATION_RATES_BY_TYPE: Record<SanteCollActeType, number> = {
  [SanteCollActeType.AN_COLLECTIVE_SANTE]: 1.00,           // COLL AN SANTE
  [SanteCollActeType.AN_COLLECTIVE_PREVOYANCE]: 1.00,      // COLL AN PCE
  [SanteCollActeType.AN_COLLECTIVE_RETRAITE]: 1.00,        // COLL AN RETRAITE
  [SanteCollActeType.AN_INDIVIDUELLE_SANTE]: 1.00,          // IND AN SANTE
  [SanteCollActeType.AN_INDIVIDUELLE_PREVOYANCE]: 1.00,    // IND AN PCE
  [SanteCollActeType.AN_INDIVIDUELLE_RETRAITE]: 1.00,      // IND AN VIE & RETRAITE
  [SanteCollActeType.ADHESION_RENFORT_COLLECTIVE]: 0.50,    // COLL ADHESION + RENFORT
  [SanteCollActeType.REVISION_COLLECTIVE]: 0.75,           // REVISION GAMME ANCIENNE
  [SanteCollActeType.COURTAGE_VERS_ALLIANZ]: 0.75,         // COURTAGE->ALLIANZ
  [SanteCollActeType.ALLIANZ_VERS_COURTAGE]: 0.50          // ALLIANZ->COURTAGE
}

// Fonction de calcul selon le type d'acte
function calculatePrimePondereByType(type: SanteCollActeType, primeBrute: number): number {
  const coefficient = PONDERATION_RATES_BY_TYPE[type]
  return Math.round(primeBrute * coefficient)
}
```

**Logique métier par type** :
- **AN Collective/Individuelle** (1,00) : Affaires nouvelles à valeur pleine
- **Adhésion/Renfort Collective** (0,50) : Valeur réduite pour les extensions
- **Révision Collective** (0,75) : Valeur intermédiaire pour les modifications
- **Courtage → Allianz** (0,75) : Transfert entrant avec valeur réduite
- **Allianz → Courtage** (0,50) : Transfert sortant avec valeur minimale

**Exemples de calcul par type** :
- Prime brute 1000€ + AN Collective Santé = Prime pondérée 1000€
- Prime brute 1000€ + Adhésion/Renfort = Prime pondérée 500€
- Prime brute 1000€ + Révision Collective = Prime pondérée 750€
- Prime brute 1000€ + Courtage → Allianz = Prime pondérée 750€
- Prime brute 1000€ + Allianz → Courtage = Prime pondérée 500€

### Calcul combiné (Origine × Type)

**Formule finale** : `Prime pondérée = Prime brute × Coefficient origine × Coefficient type`

```typescript
// Fonction de calcul combiné
function calculatePrimePondereFinale(
  origine: SanteCollOrigine, 
  type: SanteCollActeType, 
  primeBrute: number
): number {
  const coefficientOrigine = PONDERATION_RATES_BY_ORIGINE[origine]
  const coefficientType = PONDERATION_RATES_BY_TYPE[type]
  const coefficientFinal = coefficientOrigine * coefficientType
  
  return Math.round(primeBrute * coefficientFinal)
}
```

**Exemples de calcul combiné** :
- 1000€ + PROACTIF + AN Collective Santé = 1000€ × 1,00 × 1,00 = **1000€**
- 1000€ + REACTIF + AN Collective Santé = 1000€ × 0,50 × 1,00 = **500€**
- 1000€ + PROSPECTION + Adhésion/Renfort = 1000€ × 1,50 × 0,50 = **750€**
- 1000€ + PROACTIF + Allianz → Courtage = 1000€ × 1,00 × 0,50 = **500€**
- 1000€ + PROSPECTION + Révision Collective = 1000€ × 1,50 × 0,75 = **1125€**

### Coefficients selon la compagnie

**Grille selon la compagnie** :

```typescript
// Coefficients selon la compagnie
const PONDERATION_RATES_BY_COMPAGNIE: Record<CompagnieType, number> = {
  [CompagnieType.ALLIANZ]: 1.20,        // Coefficient 1,20
  [CompagnieType.UNIM_UNICED]: 1.50,    // Coefficient 1,50
  [CompagnieType.COURTAGE]: 1.00        // Coefficient 1,00
}

// Fonction de calcul selon la compagnie
function calculatePrimePondereByCompagnie(compagnie: CompagnieType, primeBrute: number): number {
  const coefficient = PONDERATION_RATES_BY_COMPAGNIE[compagnie]
  return Math.round(primeBrute * coefficient)
}
```

**Logique métier par compagnie** :
- **ALLIANZ** (1,20) : Compagnie principale avec bonus de 20%
- **UNIM/UNICED** (1,50) : Compagnie partenaire avec bonus de 50%
- **COURTAGE** (1,00) : Courtage avec coefficient neutre

**Exemples de calcul par compagnie** :
- Prime brute 1000€ + Allianz = Prime pondérée 1200€
- Prime brute 1000€ + Unim/Uniced = Prime pondérée 1500€
- Prime brute 1000€ + Courtage = Prime pondérée 1000€

### Calcul final combiné (Origine × Type × Compagnie)

**Formule finale** : `Prime pondérée = Prime brute × Coefficient origine × Coefficient type × Coefficient compagnie`

```typescript
// Fonction de calcul final combiné
function calculatePrimePondereFinaleComplete(
  origine: SanteCollOrigine, 
  type: SanteCollActeType,
  compagnie: CompagnieType,
  primeBrute: number
): number {
  const coefficientOrigine = PONDERATION_RATES_BY_ORIGINE[origine]
  const coefficientType = PONDERATION_RATES_BY_TYPE[type]
  const coefficientCompagnie = PONDERATION_RATES_BY_COMPAGNIE[compagnie]
  const coefficientFinal = coefficientOrigine * coefficientType * coefficientCompagnie
  
  return Math.round(primeBrute * coefficientFinal)
}
```

**Exemples de calcul final** :
- 1000€ + PROACTIF + AN Collective Santé + Allianz = 1000€ × 1,00 × 1,00 × 1,20 = **1200€**
- 1000€ + REACTIF + AN Collective Santé + Unim/Uniced = 1000€ × 0,50 × 1,00 × 1,50 = **750€**
- 1000€ + PROSPECTION + Adhésion/Renfort + Courtage = 1000€ × 1,50 × 0,50 × 1,00 = **750€**
- 1000€ + PROACTIF + Allianz → Courtage + Allianz = 1000€ × 1,00 × 0,50 × 1,20 = **600€**
- 1000€ + PROSPECTION + Révision Collective + Unim/Uniced = 1000€ × 1,50 × 0,75 × 1,50 = **1688€**

## Système de commissions

### Principe des seuils progressifs

La **production pondérée** (somme des primes pondérées du mois) détermine les commissions à verser selon un système de seuils progressifs.

**Règle** : À chaque seuil franchi, le taux s'applique depuis le 1er euro de production.

### Grille des seuils

```typescript
// Seuils de commission pour CDC Santé Collective
interface CommissionSeuil {
  id: string;
  min: number;
  max: number | null; // null = pas de limite supérieure
  taux: number; // en pourcentage
  description: string;
}

const COMMISSION_SEUILS: CommissionSeuil[] = [
  {
    id: 'SEUIL1',
    min: 0,
    max: 6000,
    taux: 0,
    description: '0€ à 6 000€ - 0%'
  },
  {
    id: 'SEUIL2', 
    min: 6001,
    max: 10000,
    taux: 2,
    description: '6 001€ à 10 000€ - 2%'
  },
  {
    id: 'SEUIL3',
    min: 10001,
    max: 14000,
    taux: 3,
    description: '10 001€ à 14 000€ - 3%'
  },
  {
    id: 'SEUIL4',
    min: 14001,
    max: 18000,
    taux: 4,
    description: '14 001€ à 18 000€ - 4%'
  },
  {
    id: 'SEUIL5',
    min: 18001,
    max: null,
    taux: 6,
    description: '18 001€ et plus - 6%'
  }
]
```

### Calcul des commissions

```typescript
interface CommissionCalculation {
  productionPondere: number;
  seuilAtteint: CommissionSeuil;
  tauxApplicable: number;
  commissionEstimee: number;
  prochainSeuil?: CommissionSeuil;
  ecartProchainSeuil: number;
  details: {
    seuil: string;
    montantDansSeuil: number;
    taux: number;
    commission: number;
  }[];
}

function calculateCommission(productionPondere: number): CommissionCalculation {
  // Trouver le seuil applicable
  const seuilAtteint = COMMISSION_SEUILS.find(seuil => {
    if (seuil.max === null) {
      return productionPondere >= seuil.min
    }
    return productionPondere >= seuil.min && productionPondere <= seuil.max
  }) || COMMISSION_SEUILS[0]

  // Calculer la commission selon le taux du seuil atteint
  const commissionEstimee = Math.round(productionPondere * (seuilAtteint.taux / 100))

  // Trouver le prochain seuil
  const prochainSeuil = COMMISSION_SEUILS.find(s => s.min > productionPondere)
  const ecartProchainSeuil = prochainSeuil ? prochainSeuil.min - productionPondere : 0

  // Détail des tranches (pour information)
  const details = COMMISSION_SEUILS.map(seuil => {
    let montantDansSeuil = 0
    
    if (productionPondere >= seuil.min) {
      if (seuil.max === null) {
        montantDansSeuil = productionPondere - seuil.min
      } else {
        montantDansSeuil = Math.min(productionPondere, seuil.max) - seuil.min
      }
    }

    return {
      seuil: seuil.id,
      montantDansSeuil: Math.max(0, montantDansSeuil),
      taux: seuil.taux,
      commission: Math.round(montantDansSeuil * (seuil.taux / 100))
    }
  })

  return {
    productionPondere,
    seuilAtteint,
    tauxApplicable: seuilAtteint.taux,
    commissionEstimee,
    prochainSeuil,
    ecartProchainSeuil,
    details
  }
}
```

### Exemples de calcul

**Exemple 1** : Production pondérée = 8 500€
- Seuil atteint : SEUIL2 (6 001€ à 10 000€)
- Taux applicable : 2%
- Commission : 8 500€ × 2% = **170€**
- Prochain seuil : SEUIL3 (10 001€) - Écart : 1 501€

**Exemple 2** : Production pondérée = 12 000€
- Seuil atteint : SEUIL3 (10 001€ à 14 000€)
- Taux applicable : 3%
- Commission : 12 000€ × 3% = **360€**
- Prochain seuil : SEUIL4 (14 001€) - Écart : 2 001€

**Exemple 3** : Production pondérée = 20 000€
- Seuil atteint : SEUIL5 (18 001€ et plus)
- Taux applicable : 6%
- Commission : 20 000€ × 6% = **1 200€**
- Prochain seuil : Aucun (seuil maximum)

### Interface utilisateur

```typescript
interface SanteCollKPI {
  yearMonth: string;
  userId: string;
  
  // Compteurs par type d'acte
  nombreAffairesNouvelles: number;
  nombreRevisions: number;
  nombreAdhesionsGroupe: number;
  nombreTransfertsCourtage: number;
  
  // Production
  productionBrute: number;
  productionPondere: number;
  
  // Commission
  tauxCommission: number;
  commissionEstimee: number;
  seuilAtteint: string;
  prochainSeuil?: string;
  ecartProchainSeuil: number;
  
  // Critères qualitatifs
  critereQualitatifAtteint: boolean;
  
  // Métadonnées
  calculatedAt: string;
  updatedAt: string;
}
```

### Affichage dans le dashboard

**Carte Commission** :
- Production pondérée : 12 000€
- Seuil atteint : SEUIL3 (3%)
- Commission estimée : 360€
- Prochain seuil : SEUIL4 (14 001€) - Il manque 2 001€

**Barre de progression** :
- Progression vers le prochain seuil
- Indicateur visuel du taux actuel
- Montant restant pour le seuil suivant

## Affichage sur le dashboard CDC Santé Collective

### Composant CommissionProgressChart

**Emplacement** : Intégré directement dans le dashboard principal

```typescript
interface CommissionProgressChartProps {
  productionPondere: number;
  commissionCalculation: CommissionCalculation;
  loading?: boolean;
}

export function CommissionProgressChart({ 
  productionPondere, 
  commissionCalculation, 
  loading = false 
}: CommissionProgressChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const { seuilAtteint, tauxApplicable, commissionEstimee, prochainSeuil, ecartProchainSeuil } = commissionCalculation

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Commission du mois
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Production pondérée */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Production pondérée
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {productionPondere.toLocaleString('fr-FR')} €
          </span>
        </div>
        
        {/* Barre de progression vers le prochain seuil */}
        {prochainSeuil && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Seuil actuel : {seuilAtteint.description}</span>
              <span>Prochain : {prochainSeuil.description}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (productionPondere / prochainSeuil.min) * 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-center text-gray-500">
              Il manque {ecartProchainSeuil.toLocaleString('fr-FR')} € pour le seuil suivant
            </div>
          </div>
        )}
      </div>

      {/* Commission estimée */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Commission estimée
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300">
              Taux {tauxApplicable}% - Seuil {seuilAtteint.id}
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {commissionEstimee.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* Grille des seuils */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Grille des seuils
        </h4>
        <div className="space-y-2">
          {COMMISSION_SEUILS.map((seuil, index) => {
            const isCurrentSeuil = seuil.id === seuilAtteint.id
            const isReached = productionPondere >= seuil.min
            
            return (
              <div 
                key={seuil.id}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  isCurrentSeuil 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : isReached 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isCurrentSeuil 
                      ? 'bg-blue-500' 
                      : isReached 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}></div>
                  <span className={`font-medium ${
                    isCurrentSeuil 
                      ? 'text-blue-800 dark:text-blue-200' 
                      : isReached 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {seuil.description}
                  </span>
                </div>
                <span className={`font-bold ${
                  isCurrentSeuil 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isReached 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {seuil.taux}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

### Intégration dans le dashboard

**Structure du dashboard** :

```typescript
// Dans src/app/dashboard/sante-collective/page.tsx
export default function SanteCollDashboardPage() {
  const { user } = useAuth()
  const { activities, kpis, loading } = useSanteCollActivities({
    yearMonth: currentYearMonth,
    userId: user?.uid || ''
  })

  // Calcul de la commission
  const commissionCalculation = useMemo(() => {
    if (kpis?.productionPondere) {
      return calculateCommission(kpis.productionPondere)
    }
    return null
  }, [kpis?.productionPondere])

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Message de bienvenue */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Dashboard Santé Collective</h1>
          <p className="text-blue-100">Gestion des contrats de santé collective</p>
        </div>

        {/* Navigation mensuelle */}
        <SanteCollTimeline 
          activities={activities}
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
        />

        {/* KPIs et Commission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPIs traditionnels */}
          <SanteCollKPIs 
            activities={activities}
            yearMonth={currentYearMonth}
            kpis={kpis}
            loading={loading}
          />
          
          {/* Commission */}
          <CommissionProgressChart
            productionPondere={kpis?.productionPondere || 0}
            commissionCalculation={commissionCalculation}
            loading={loading}
          />
        </div>

        {/* Tableau des activités */}
        <SanteCollTable 
          activities={activities}
          loading={loading}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      </div>
    </DashboardLayout>
  )
}
```

### Fonctionnalités du composant Commission

**Affichage en temps réel** :
- ✅ Production pondérée du mois
- ✅ Seuil atteint avec taux applicable
- ✅ Commission estimée calculée
- ✅ Barre de progression vers le prochain seuil
- ✅ Grille complète des seuils avec statut visuel

**Indicateurs visuels** :
- 🔵 Seuil actuel (bleu)
- 🟢 Seuils atteints (vert)
- ⚪ Seuils non atteints (gris)
- 📊 Barre de progression animée

**Informations contextuelles** :
- Montant restant pour le seuil suivant
- Description claire de chaque seuil
- Taux de commission en pourcentage
- Date du mois affiché

Le système de commission est maintenant **intégré directement dans le dashboard** CDC Santé Collective ! 🎯

## KPIs essentiels à mettre en avant

### 1. KPIs de production (Priorité 1)

**Production pondérée** 🎯
- **Pourquoi** : C'est le KPI principal qui détermine les commissions
- **Affichage** : Montant en euros, évolution mensuelle
- **Objectif** : Atteindre les seuils de commission

**Production brute** 📊
- **Pourquoi** : Montre la valeur réelle des contrats
- **Affichage** : Montant en euros, comparaison avec pondérée
- **Objectif** : Suivre la croissance des affaires

### 2. KPIs de commission (Priorité 1)

**Commission estimée** 💰
- **Pourquoi** : Motivation directe de l'utilisateur
- **Affichage** : Montant en euros, taux applicable
- **Objectif** : Visualiser les gains potentiels

**Seuil atteint** 🎯
- **Pourquoi** : Indique le niveau de performance
- **Affichage** : Nom du seuil, taux, progression
- **Objectif** : Encourager à franchir le seuil suivant

### 3. KPIs d'activité (Priorité 2)

**Nombre d'affaires nouvelles** 🆕
- **Pourquoi** : Indicateur de prospection et développement
- **Affichage** : Compteur, évolution mensuelle
- **Objectif** : Croissance du portefeuille

**Nombre de révisions** 🔄
- **Pourquoi** : Critère qualitatif important
- **Affichage** : Compteur, seuil minimum (ex: 4)
- **Objectif** : Maintenir la qualité du service

### 4. KPIs de performance (Priorité 2)

**Taux de conversion** 📈
- **Pourquoi** : Efficacité commerciale
- **Calcul** : (AN + Révisions) / Total activités
- **Affichage** : Pourcentage, évolution

**Prime moyenne par acte** 💵
- **Pourquoi** : Qualité des affaires
- **Calcul** : Production brute / Nombre d'activités
- **Affichage** : Montant en euros

### 5. KPIs de répartition (Priorité 3)

**Répartition par origine** 📊
- **Pourquoi** : Équilibre des sources d'affaires
- **Affichage** : Graphique en secteurs
- **Objectif** : Optimiser le mix commercial

**Répartition par compagnie** 🏢
- **Pourquoi** : Diversification du portefeuille
- **Affichage** : Graphique en barres
- **Objectif** : Équilibrer les partenaires

### Structure recommandée des KPIs

```typescript
interface SanteCollKPIs {
  // Production (Priorité 1)
  productionBrute: number;
  productionPondere: number;
  
  // Commission (Priorité 1)
  commissionEstimee: number;
  tauxCommission: number;
  seuilAtteint: string;
  prochainSeuil?: string;
  ecartProchainSeuil: number;
  
  // Activité (Priorité 2)
  nombreAffairesNouvelles: number;
  nombreRevisions: number;
  nombreAdhesionsGroupe: number;
  nombreTransfertsCourtage: number;
  totalActivites: number;
  
  // Performance (Priorité 2)
  tauxConversion: number;
  primeMoyenneParActe: number;
  critereQualitatifAtteint: boolean;
  
  // Répartition (Priorité 3)
  repartitionParOrigine: Record<SanteCollOrigine, number>;
  repartitionParCompagnie: Record<CompagnieType, number>;
  repartitionParType: Record<SanteCollActeType, number>;
}
```

### Affichage recommandé sur le dashboard

**Layout en cartes** :

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Production    │   Commission    │   Activité      │
│   Pondérée      │   Estimée       │   Nouvelles     │
│   12 000€       │   360€ (3%)     │   8 actes       │
│   ↗ +15%        │   Seuil SEUIL3  │   ↗ +2 ce mois  │
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│   Révisions     │   Prime Moyenne │   Taux Conv.    │
│   4 actes       │   1 500€        │   85%           │
│   ✅ Critère OK  │   ↗ +200€       │   ↗ +5%         │
└─────────────────┴─────────────────┴─────────────────┘
```

### Indicateurs visuels recommandés

**Couleurs et icônes** :
- 🎯 **Production pondérée** : Bleu (priorité absolue)
- 💰 **Commission** : Vert (motivation)
- 🆕 **Affaires nouvelles** : Orange (croissance)
- 🔄 **Révisions** : Violet (qualité)
- 📊 **Répartition** : Gris (information)

**Animations** :
- Compteurs animés pour les montants
- Barres de progression pour les seuils
- Graphiques interactifs pour les répartitions
- Indicateurs de tendance (↗ ↘)

Ces KPIs donnent une vision complète et motivante de la performance CDC Santé Collective ! 🎯
```

### Validation des données

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateSanteCollActivity(activity: Partial<SanteCollActivity>): ValidationResult {
  const errors: string[] = []

  // Validation origine
  if (!activity.origine || !Object.values(SanteCollOrigine).includes(activity.origine)) {
    errors.push('L\'origine de l\'affaire est obligatoire')
  }

  // Validation type d'acte
  if (!activity.type || !Object.values(SanteCollActeType).includes(activity.type)) {
    errors.push('Le type d\'acte est obligatoire')
  }

  // Validation compagnie
  if (!activity.compagnie || !Object.values(CompagnieType).includes(activity.compagnie)) {
    errors.push('La compagnie est obligatoire')
  }

  // Validation nom client
  if (!activity.clientName || activity.clientName.trim().length === 0) {
    errors.push('Le nom du client est obligatoire')
  }

  // Validation numéro contrat
  if (!activity.contractNumber || activity.contractNumber.trim().length === 0) {
    errors.push('Le numéro de contrat est obligatoire')
  }

  // Validation date d'effet
  if (!activity.dateEffet) {
    errors.push('La date d\'effet est obligatoire')
  } else {
    const dateEffet = new Date(activity.dateEffet)
    if (isNaN(dateEffet.getTime())) {
      errors.push('La date d\'effet doit être une date valide')
    }
  }

  // Validation prime brute
  if (!activity.primeBrute || activity.primeBrute <= 0) {
    errors.push('La prime brute doit être un montant positif')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### Composant Modal

```typescript
interface ModalActeSanteCollProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: CreateSanteCollActivity) => Promise<void>;
  loading?: boolean;
}

export function ModalActeSanteColl({ isOpen, onClose, onSave, loading = false }: ModalActeSanteCollProps) {
  const [formData, setFormData] = useState<Partial<CreateSanteCollActivity>>({})
  const [errors, setErrors] = useState<string[]>([])

  // Calcul automatique de la prime pondérée (origine × type × compagnie)
  const primePondere = useMemo(() => {
    if (formData.origine && formData.type && formData.compagnie && formData.primeBrute) {
      return calculatePrimePondereFinaleComplete(formData.origine, formData.type, formData.compagnie, formData.primeBrute)
    }
    return 0
  }, [formData.origine, formData.type, formData.compagnie, formData.primeBrute])

  // Date de saisie automatique
  const dateSaisie = new Date().toISOString()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateSanteCollActivity(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await onSave(formData as CreateSanteCollActivity)
      onClose()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel acte - Santé Collective</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date de saisie (lecture seule) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de saisie</Label>
              <Input 
                value={new Date(dateSaisie).toLocaleDateString('fr-FR')}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Origine */}
          <div>
            <Label>Origine de l'affaire *</Label>
            <Select value={formData.origine} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, origine: value as SanteCollOrigine }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'origine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SanteCollOrigine.PROACTIF}>Proactif</SelectItem>
                <SelectItem value={SanteCollOrigine.REACTIF}>Réactif</SelectItem>
                <SelectItem value={SanteCollOrigine.PROSPECTION}>Prospection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type d'acte */}
          <div>
            <Label>Type d'acte *</Label>
            <Select value={formData.type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, type: value as SanteCollActeType }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type d'acte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SanteCollActeType.AN_COLLECTIVE_SANTE}>AN Collective en Santé</SelectItem>
                <SelectItem value={SanteCollActeType.AN_COLLECTIVE_PREVOYANCE}>AN Collective en Prévoyance</SelectItem>
                <SelectItem value={SanteCollActeType.AN_COLLECTIVE_RETRAITE}>AN Collective en Retraite</SelectItem>
                <SelectItem value={SanteCollActeType.AN_INDIVIDUELLE_SANTE}>AN Individuelle en Santé</SelectItem>
                <SelectItem value={SanteCollActeType.AN_INDIVIDUELLE_PREVOYANCE}>AN Individuelle en Prévoyance</SelectItem>
                <SelectItem value={SanteCollActeType.AN_INDIVIDUELLE_RETRAITE}>AN Individuelle en Retraite</SelectItem>
                <SelectItem value={SanteCollActeType.ADHESION_RENFORT_COLLECTIVE}>Adhésion/Renfort en Collective</SelectItem>
                <SelectItem value={SanteCollActeType.REVISION_COLLECTIVE}>Révision Collective</SelectItem>
                <SelectItem value={SanteCollActeType.COURTAGE_VERS_ALLIANZ}>Courtage → Allianz</SelectItem>
                <SelectItem value={SanteCollActeType.ALLIANZ_VERS_COURTAGE}>Allianz → Courtage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compagnie */}
          <div>
            <Label>Compagnie *</Label>
            <Select value={formData.compagnie} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, compagnie: value as CompagnieType }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la compagnie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CompagnieType.ALLIANZ}>Allianz</SelectItem>
                <SelectItem value={CompagnieType.UNIM_UNICED}>Unim / Uniced</SelectItem>
                <SelectItem value={CompagnieType.COURTAGE}>Courtage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nom du client */}
          <div>
            <Label>Nom du client *</Label>
            <Input
              value={formData.clientName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Nom du client"
            />
          </div>

          {/* Numéro de contrat */}
          <div>
            <Label>Numéro de contrat *</Label>
            <Input
              value={formData.contractNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contractNumber: e.target.value }))}
              placeholder="Numéro de contrat"
            />
          </div>

          {/* Date d'effet */}
          <div>
            <Label>Date d'effet *</Label>
            <Input
              type="date"
              value={formData.dateEffet || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dateEffet: e.target.value }))}
            />
          </div>

          {/* Prime brute */}
          <div>
            <Label>Prime brute (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.primeBrute || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, primeBrute: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          {/* Prime pondérée (calculée) */}
          <div>
            <Label>Prime pondérée (€)</Label>
            <Input
              value={primePondere.toFixed(2)}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-600 mt-1">
              Calculée automatiquement : Prime brute × Origine × Type × Compagnie
            </p>
          </div>

          {/* Erreurs */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">Erreurs de validation :</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Prochaines étapes

**En attente** : Les coefficients de pondération pour chaque type d'acte

Une fois que vous me donnerez les coefficients, je pourrai :
1. Compléter la grille de pondération
2. Finaliser le calcul automatique de la prime pondérée
3. Ajouter la validation spécifique aux coefficients
4. Documenter les règles métier associées
