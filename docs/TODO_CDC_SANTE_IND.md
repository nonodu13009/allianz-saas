# 📋 TODO - Module CDC Santé Individuelle

## 🎯 Objectif
Implémenter le module CDC Santé Individuelle en réutilisant le code factorisé du module CDC Commercial, suivant les spécifications détaillées dans `docs/cdc_sante_ind.md`.

## 📚 Références
- **Spécifications complètes** : `docs/cdc_sante_ind.md`
- **Code factorisé** : Module CDC Commercial existant
- **Architecture** : Next.js 15 + Firebase + TypeScript

---

## 📋 Spécifications détaillées

### 🎯 Accès et rôles
- **Accès exclusif** : Rôle `CD_sante_ind` uniquement
- **Redirection** : Si rôle invalide → `/dashboard`
- **Point d'entrée** : **Modification du dashboard existant** quand utilisateur connecté avec rôle `CD_sante_ind`
- **Pas de nouvelle page** : Intégration dans `/dashboard` avec affichage conditionnel

### 📅 Navigation mensuelle
- **Mois par défaut** : Mois courant
- **Contrôles** : Boutons "Mois précédent" / "Mois suivant"
- **Pilotage** : Le mois sélectionné contrôle l'historique et les KPI
- **Actions** : Création/édition s'appliquent au mois en cours

### 🎯 5 Types d'actes commerciaux
1. **Affaire nouvelle** (avec sélection Compagnie : Allianz | Courtage)
2. **Révision**
3. **Adhésion groupe**
4. **Courtage → Allianz**
5. **Allianz → Courtage**

### 📝 Champs des modales
**Champs communs** :
- `Date de saisie` (automatique, non éditable)
- `Nature de l'acte` (automatique, déduite du bouton)
- `Nom du client` (capitalisation intelligente à l'enregistrement)
- `Numéro de contrat`
- `Date d'effet` (date picker design)
- `CA` (euros, entier)
- `CA pondéré` (calculé automatiquement)

**Spécifique "Affaire nouvelle"** :
- `Compagnie` (select obligatoire) : `Allianz` | `Courtage`

### 📊 Grille de pondération (CA → CA pondéré)
- **Affaire nouvelle** : 100%
- **Révision** : 50%
- **Adhésion groupe** : 50%
- **Courtage → Allianz** : 75%
- **Allianz → Courtage** : 50%

**Formule** : `caPondere = roundToEuro(ca * taux)` avec `ca` entier en € et `taux ∈ {1.00, 0.50, 0.75}`

### 💰 Tableau progressif des commissions
| Seuil CA pondéré | Commission |
|------------------|------------|
| < 10 000 €      | 0%         |
| < 14 000 €      | 2%         |
| < 18 000 €      | 3%         |
| < 22 000 €      | 4%         |
| ≥ 22 000 €      | 6%         |

**Règle** : Si la production pondérée mensuelle est 19 000 €, alors 4% s'appliquent dès le 1er euro.

### ✅ Critère qualitatif
- **Minimum 4 révisions** dans le mois
- **Impact** : À préciser (bloquant ou bonus ?)

### 📈 KPIs mensuels
- Production brute mensuelle (somme des `CA`)
- Production pondérée mensuelle (somme des `CA pondéré`)
- Taux de commission applicable (0/2/3/4/6%)
- Commission estimée du mois
- Nombre d'actes par type (5 types)
- Nombre de révisions (contrôle du minimum de 4)

### 📋 Tableau de production
**Colonnes minimales** :
- `Jour de saisie`
- `Nom client`
- `Nature de l'acte`
- `N° contrat`
- `Date d'effet`
- `CA`
- `CA pondéré`
- `Compagnie` (si acte = "Affaire nouvelle")

**CRUD complet** :
- **Create** : Via modales (5 types d'actes)
  - Boutons d'action en haut de page
  - Modales adaptées au type d'acte
  - Validation en temps réel
- **Read** : Tableau de production complet
  - Affichage de toutes les colonnes
  - Tri par colonnes (ascendant/descendant)
  - Filtrage par type d'acte, date, client
  - Pagination si nécessaire
- **Update** : Modification des activités
  - Bouton "Modifier" sur chaque ligne
  - Modale d'édition avec données pré-remplies
  - Validation des modifications
  - Tant que le mois n'est pas verrouillé
- **Delete** : Suppression avec confirmation
  - Bouton "Supprimer" sur chaque ligne
  - Modal de confirmation avec détails
  - Suppression définitive après confirmation
  - Tant que le mois n'est pas verrouillé
- **Verrou** : Contrôle d'accès
  - Case `bloqué / débloqué` pilotée par l'administrateur
  - Désactivation des actions si verrouillé
  - Indicateur visuel de l'état (vert/rouge)

### 🔒 Système de verrouillage mensuel (2 phases)

**Phase 1 - Interface utilisateur (ÉTAPES 1-5)** :
- **Indicateur visuel** : Icône cadenas vert (ouvert) / rouge (bloqué)
- **Désactivation des actions** : Boutons CRUD grisés si verrouillé
- **Messages informatifs** : "Mois verrouillé par l'administrateur"
- **Lecture seule** : Affichage des données sans modification possible

**Phase 2 - Dashboard Admin (ÉTAPE 11)** :
- **Interface admin** : Identique au module CDC Commercial
- **Contrôles de verrouillage** : Boutons verrouiller/déverrouiller par mois
- **Gestion multi-utilisateurs** : Verrouillage par CDC spécifique
- **Audit trail** : Qui a verrouillé, quand, pourquoi
- **Contexte paie** : Commissions déterminent une partie du salaire
- **Objectif** : Éviter incohérences et litiges employeur/employé

---

## 🚀 Plan d'implémentation (10 étapes détaillées)

### ✅ ÉTAPE 1 : Types et Interfaces TypeScript
**Objectif** : Définir la structure de données complète
- [ ] Créer `src/types/sante-ind.ts`
- [ ] Types principaux : `SanteIndActivity`, `ActeType`, `Compagnie`
- [ ] Types calculs : `CA_PONDERE_RATES`, `COMMISSION_THRESHOLDS`
- [ ] Types KPIs : `KPIMensuel`, `ProductionStats`
- [ ] Types verrouillage : `MoisLock`, `LockStatus`
- [ ] Réutiliser les types communs du CDC Commercial
- [ ] Validation : Types compilent sans erreur

### ✅ ÉTAPE 2 : Services et Logique métier
**Objectif** : Centraliser toute la logique métier
- [ ] Créer `src/lib/sante-ind-service.ts`
- [ ] **Calcul CA pondéré** : Fonction `calculateCAPondere(acteType, ca)`
- [ ] **Calcul commissions** : Fonction `calculateCommission(caPondereTotal)`
- [ ] **Grille de pondération** : Constantes `PONDERATION_RATES`
- [ ] **Seuils de commission** : Constantes `COMMISSION_THRESHOLDS`
- [ ] **Critère qualitatif** : Fonction `checkMinimumRevisions(activities)`
- [ ] **Capitalisation noms** : Fonction `capitalizeClientName(name)`
- [ ] **Validation données** : Fonction `validateSanteIndActivity(activity)`
- [ ] Réutiliser les fonctions communes du CDC Commercial
- [ ] Validation : Tests unitaires passent

### ✅ ÉTAPE 3 : Composants UI
**Objectif** : Créer l'interface utilisateur avec design identique au CDC Commercial
- [ ] **Design identique** : Reprendre toutes les spécificités du CDC Commercial
- [ ] **Système de cartes** : Même layout et structure que CDC Commercial
- [ ] **KPIs** : Cartes avec même design (production brute/pondérée, taux commission, etc.)
- [ ] **CRUD complet** : Boutons, modales, tableaux avec même style
- [ ] **Cadenas vert** : Indicateur visuel identique (Phase 1 - affichage seulement)
- [ ] Créer `src/components/sante-ind/ModalActe.tsx` (modale générique pour 5 types)
- [ ] Créer `src/components/sante-ind/ProductionTable.tsx` (tableau avec design CDC Commercial)
- [ ] Créer `src/components/sante-ind/KPIsMensuels.tsx` (cartes avec même style)
- [ ] Créer `src/components/sante-ind/NavigationMensuelle.tsx` (timeline identique)
- [ ] Créer `src/components/sante-ind/LockIndicator.tsx` (cadenas vert identique)
- [ ] **Réutiliser** : Tous les composants UI existants (Button, Card, Dialog, etc.)
- [ ] Validation : Interface identique au CDC Commercial mais logique Santé Individuelle

### ✅ ÉTAPE 4 : API Routes Firebase
**Objectif** : Exposer les endpoints avec sécurité
- [ ] Créer `src/app/api/sante-ind-activities/month/route.ts` (GET/POST)
- [ ] Créer `src/app/api/sante-ind-activities/[id]/route.ts` (PATCH/DELETE)
- [ ] Créer `src/app/api/sante-ind-activities/lock/route.ts` (verrouillage admin)
- [ ] **Sécurité** : Vérification rôle `CD_sante_ind` sur toutes les routes
- [ ] **Validation** : Côté serveur avec `validateSanteIndActivity`
- [ ] **Gestion erreurs** : Firebase, validation, autorisation
- [ ] Validation : API fonctionnelle avec tests Postman

### ✅ ÉTAPE 5 : Intégration Dashboard
**Objectif** : Intégrer au dashboard principal existant
- [ ] **Modifier `src/app/dashboard/page.tsx`** : Affichage conditionnel selon le rôle
- [ ] **Logique d'affichage** : Si `user.role === 'CD_sante_ind'` → Afficher module Santé Individuelle
- [ ] **Sinon** : Afficher le dashboard standard (CDC Commercial, etc.)
- [ ] **Pas de nouvelle page** : Tout dans `/dashboard` avec rendu conditionnel
- [ ] Implémenter contrôle d'accès (rôle `CD_sante_ind`)
- [ ] Gérer l'état global des activités mensuelles
- [ ] Validation : Affichage conditionnel correct selon le rôle

### ✅ ÉTAPE 6 : Persistance et Cache
**Objectif** : Optimiser les performances
- [ ] Implémenter cache local avec sync Firebase
- [ ] **Collections Firestore** : `sante_ind_activities`, `sante_ind_locks`
- [ ] **Scripts Firebase** : Création et gestion des collections
- [ ] **Migration des données** : Scripts de migration depuis local
- [ ] **Backup/Restore** : Scripts de sauvegarde des données
- [ ] Gérer la synchronisation en temps réel
- [ ] Implémenter gestion des conflits
- [ ] Optimiser les requêtes Firestore avec indexes
- [ ] Validation : Performance < 200ms pour les opérations

### ✅ ÉTAPE 7 : Tests et Validation
**Objectif** : Assurer la qualité du code
- [ ] **Tests calculs** : CA pondéré, commissions, seuils
- [ ] **Tests critère qualitatif** : Minimum 4 révisions
- [ ] **Tests capitalisation** : Noms avec prénoms composés
- [ ] **Tests API** : Toutes les routes avec différents rôles
- [ ] **Tests E2E** : Workflow complet utilisateur
- [ ] Validation : Couverture de tests > 80%

### ✅ ÉTAPE 8 : Documentation
**Objectif** : Documenter le module
- [ ] Documentation technique (README)
- [ ] Documentation utilisateur (guide)
- [ ] Commentaires de code
- [ ] Diagrammes d'architecture
- [ ] Validation : Documentation complète et à jour

### ✅ ÉTAPE 9 : Optimisations
**Objectif** : Finaliser les performances
- [ ] Optimisation des requêtes Firestore
- [ ] Mise en cache intelligente
- [ ] Gestion de la mémoire
- [ ] Optimisation du bundle
- [ ] Validation : Lighthouse score > 90

### ✅ ÉTAPE 10 : Scripts Firebase
**Objectif** : Automatiser la gestion des données
- [ ] Créer `scripts/firebase/create-collections.js`
- [ ] Créer `scripts/firebase/setup-indexes.js`
- [ ] Créer `scripts/firebase/setup-rules.js`
- [ ] Créer `scripts/firebase/migrate-from-local.js`
- [ ] Créer `scripts/firebase/backup-collections.js`
- [ ] Créer `scripts/firebase/restore-collections.js`
- [ ] Ajouter commandes NPM dans `package.json`
- [ ] Validation : Scripts fonctionnels et testés

### ✅ ÉTAPE 11 : Fonctionnalités avancées et Dashboard Admin
**Objectif** : Ajouter les fonctionnalités de production et interface admin
- [ ] **Export et reporting** : Excel/PDF des données mensuelles
- [ ] **Mode offline** : Cache local et synchronisation
- [ ] **Accessibilité** : WCAG compliance et navigation clavier
- [ ] **Performance** : Lazy loading, memoization, error boundaries
- [ ] **Monitoring** : Logs structurés, health checks, analytics
- [ ] **Validation stricte** : Arrondis, dates, critère qualitatif détaillé
- [ ] **Dashboard Admin - Verrouillage** : Interface identique au CDC Commercial
  - [ ] Contrôles verrouiller/déverrouiller par mois et utilisateur
  - [ ] Audit trail des verrouillages
  - [ ] Gestion multi-utilisateurs CDC Santé Individuelle
- [ ] Validation : Fonctionnalités de production et admin complètes

### ✅ ÉTAPE 12 : Déploiement
**Objectif** : Mettre en production
- [ ] Configuration Firebase (indexes, rules)
- [ ] Tests de charge et sécurité
- [ ] Déploiement staging
- [ ] Déploiement production
- [ ] Validation : Module fonctionnel en production

---

## 🔥 Scripts Firebase et Collections

### 📊 **Collections Firestore**
```typescript
// Collection: sante_ind_activities
interface SanteIndActivity {
  id: string
  userId: string
  yearMonth: string // "2025-09"
  dateSaisie: string // ISO date
  natureActe: ActeType
  nomClient: string
  numeroContrat: string
  dateEffet: string // ISO date
  ca: number // Entier en euros
  caPondere: number // Calculé automatiquement
  compagnie?: Compagnie // Si "Affaire nouvelle"
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Collection: sante_ind_locks
interface SanteIndLock {
  id: string
  userId: string
  yearMonth: string // "2025-09"
  isLocked: boolean
  lockedBy: string // Admin user ID
  lockedAt: Timestamp
  reason?: string
}
```

### 🔧 **Scripts de gestion des données**

#### **Scripts de création**
- `scripts/firebase/create-collections.js` : Créer les collections avec structure
- `scripts/firebase/setup-indexes.js` : Créer les indexes Firestore
- `scripts/firebase/setup-rules.js` : Déployer les règles de sécurité

#### **Scripts de migration**
- `scripts/firebase/migrate-from-local.js` : Migration depuis données locales
- `scripts/firebase/validate-data.js` : Validation de l'intégrité des données

#### **Scripts de maintenance**
- `scripts/firebase/backup-collections.js` : Sauvegarde des collections
- `scripts/firebase/restore-collections.js` : Restauration depuis backup
- `scripts/firebase/cleanup-old-data.js` : Nettoyage des données anciennes

### 📋 **Commandes NPM**
```json
{
  "scripts": {
    "firebase:setup": "node scripts/firebase/create-collections.js",
    "firebase:migrate": "node scripts/firebase/migrate-from-local.js",
    "firebase:backup": "node scripts/firebase/backup-collections.js",
    "firebase:restore": "node scripts/firebase/restore-collections.js",
    "firebase:cleanup": "node scripts/firebase/cleanup-old-data.js"
  }
}
```

### 🔒 **Règles de sécurité Firestore**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection sante_ind_activities
    match /sante_ind_activities/{activityId} {
      allow read, write: if request.auth != null 
        && getUserRole(request.auth.uid) in ['cdc_sante_ind', 'sante', 'sante_ind']
        && resource.data.userId == request.auth.uid;
    }
    
    // Collection sante_ind_locks
    match /sante_ind_locks/{lockId} {
      allow read: if request.auth != null 
        && getUserRole(request.auth.uid) in ['cdc_sante_ind', 'sante', 'sante_ind'];
      allow write: if request.auth != null 
        && getUserRole(request.auth.uid) == 'administrateur';
    }
  }
}
```

### 📈 **Indexes Firestore**
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "sante_ind_activities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "yearMonth", "order": "DESCENDING" },
        { "fieldPath": "dateSaisie", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sante_ind_locks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "yearMonth", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## ⚠️ Points supplémentaires à intégrer

### 🔧 **Validation et arrondis**
- [ ] **Validation stricte** : CA en entiers € uniquement (pas de décimales)
- [ ] **Arrondi des montants** : Fonction `roundToEuro()` pour CA pondéré
- [ ] **Validation côté UI** : Masque de saisie pour les montants
- [ ] **Validation côté serveur** : Double vérification des données

### 📅 **Gestion des dates**
- [ ] **Format des dates** : ISO strings pour Firebase, format français pour UI
- [ ] **Date picker design** : Composant personnalisé (pas le sélecteur natif)
- [ ] **Validation des dates** : Date d'effet >= Date de saisie
- [ ] **Zones horaires** : Gestion UTC/local

### 🎯 **Critère qualitatif détaillé**
- [ ] **Impact sur commission** : Définir si bloquant ou bonus
- [ ] **Indicateur visuel** : Alerte si < 4 révisions
- [ ] **Calcul de bonus** : Si applicable, calculer le bonus
- [ ] **Historique des révisions** : Suivi mensuel

### 🔐 **Sécurité et autorisation**
- [ ] **Route guards** : Vérification côté client et serveur
- [ ] **Audit trail** : Log des modifications (qui, quand, quoi)
- [ ] **Session management** : Gestion des sessions utilisateur
- [ ] **Rate limiting** : Protection contre les abus

### 📊 **Export et reporting**
- [ ] **Export Excel** : Données mensuelles exportables
- [ ] **Export PDF** : Rapport de production mensuel
- [ ] **Historique des exports** : Log des exports effectués
- [ ] **Templates de rapport** : Formats prédéfinis

### 🔄 **Synchronisation et offline**
- [ ] **Mode offline** : Cache local pour fonctionnement sans connexion
- [ ] **Sync automatique** : Synchronisation en arrière-plan
- [ ] **Résolution de conflits** : Gestion des conflits de données
- [ ] **Indicateur de sync** : État de synchronisation visible

### 📱 **Accessibilité et UX**
- [ ] **WCAG compliance** : Accessibilité pour utilisateurs handicapés
- [ ] **Raccourcis clavier** : Navigation au clavier
- [ ] **Tooltips et aide** : Aide contextuelle
- [ ] **Loading states** : États de chargement appropriés

### 🚀 **Performance et monitoring**
- [ ] **Lazy loading** : Chargement différé des composants
- [ ] **Memoization** : Optimisation des calculs coûteux
- [ ] **Error boundaries** : Gestion des erreurs React
- [ ] **Analytics** : Suivi d'utilisation et performance

### 🔧 **Maintenance et DevOps**
- [ ] **Logs structurés** : Logging avec niveaux et contexte
- [ ] **Health checks** : Vérification de santé de l'application
- [ ] **Monitoring** : Alertes et métriques de performance
- [ ] **Rollback strategy** : Stratégie de retour en arrière

### 📋 **Tests supplémentaires**
- [ ] **Tests de charge** : Performance sous charge
- [ ] **Tests de sécurité** : Tests de pénétration
- [ ] **Tests d'accessibilité** : Validation WCAG
- [ ] **Tests de régression** : Suite de tests automatisés

---

## 🔄 Code factorisé à réutiliser

### 🎨 **Design et UI - Réutilisation complète du CDC Commercial**
- **Layout identique** : Même structure de page et organisation
- **Système de cartes** : Même design pour KPIs et informations
- **Couleurs et thème** : Palette identique (vert, bleu, etc.)
- **Typographie** : Mêmes polices et tailles
- **Espacement** : Même système de margins et paddings
- **Responsive** : Mêmes breakpoints et adaptations mobile

### 🧩 **Composants UI à réutiliser directement**
- `src/components/ui/button.tsx` → Boutons avec même style
- `src/components/ui/card.tsx` → Cartes KPI identiques
- `src/components/ui/input.tsx` → Champs de saisie
- `src/components/ui/dialog.tsx` → Modales avec même design
- `src/components/ui/table.tsx` → Tableaux avec même style
- `src/components/ui/month-timeline.tsx` → Timeline mensuelle identique
- `src/components/ui/badge.tsx` → Badges et indicateurs

### 🔧 **Composants CDC Commercial à adapter**
- `src/components/cdc/CDCButtons.tsx` → Adapter pour 5 types d'actes Santé Individuelle
- `src/components/cdc/CDCKPIs.tsx` → Adapter calculs mais garder design
- `src/components/cdc/ActivityTable.tsx` → Adapter colonnes mais garder style
- `src/components/cdc/CDCTimeline.tsx` → Réutiliser complètement
- `src/components/cdc/ModalAN.tsx` → Adapter pour modale générique 5 types

### 📊 **Services et logique**
- `src/lib/cdc-service.ts` → Logique de validation et normalisation
- `src/lib/cdc-persistence.ts` → Structure de persistance Firebase
- `src/lib/firebase.ts` → Configuration Firebase
- `src/lib/utils.ts` → Fonctions utilitaires communes

### 📝 **Types communs**
- `src/types/user.ts` → Types utilisateur
- `src/types/commission.ts` → Types commissions
- `src/types/cdc.ts` → Types CDC Commercial (base pour extension)

### 🪝 **Hooks**
- `src/hooks/use-user-status.ts` → Gestion des rôles utilisateur
- `src/hooks/use-cdc-activities.ts` → Structure pour `use-sante-ind-activities.ts`

---

## ✅ Critères d'acceptation détaillés

### 🔐 Accès et sécurité
- [ ] **Affichage conditionnel** : Module Santé Individuelle affiché si `user.role === 'CD_sante_ind'`
- [ ] **Dashboard standard** : Affiché pour tous les autres rôles (CDC Commercial, etc.)
- [ ] **Pas de redirection** : Tout dans `/dashboard` avec rendu conditionnel
- [ ] **Vérification rôle** sur toutes les routes API
- [ ] **Authentification Firebase** requise

### 📅 Navigation mensuelle
- [ ] **Mois par défaut** : Affichage du mois courant
- [ ] **Navigation fluide** : Boutons précédent/suivant fonctionnels
- [ ] **Synchronisation** : Contenu (tableau/KPI) se met à jour avec le mois
- [ ] **Actions contextuelles** : Création/édition s'appliquent au mois sélectionné

### 🎯 5 Boutons d'actes commerciaux
- [ ] **Boutons visibles** : Affaire nouvelle, Révision, Adhésion groupe, Courtage → Allianz, Allianz → Courtage
- [ ] **Ouverture modale** : Clic ouvre la modale correspondante
- [ ] **Champs automatiques** : Date de saisie et nature d'acte pré-remplis
- [ ] **Champs conditionnels** : Compagnie visible uniquement pour "Affaire nouvelle"

### 📝 Modales et saisie
- [ ] **Capitalisation intelligente** : Nom client capitalisé à l'enregistrement
- [ ] **Gestion prénoms composés** : "jean-michel" → "Jean-Michel"
- [ ] **Gestion apostrophes** : "d'arc" → "D'Arc"
- [ ] **Validation CA** : Entier en euros uniquement
- [ ] **Calcul automatique** : CA pondéré selon la grille
- [ ] **Messages d'erreur** : Clairs avec conservation des saisies

### 📊 Calculs métier
- [ ] **Grille de pondération** : Affaire nouvelle (100%), Révision (50%), Adhésion groupe (50%), Courtage → Allianz (75%), Allianz → Courtage (50%)
- [ ] **Seuils de commission** : 0% (<10k€), 2% (10-14k€), 3% (14-18k€), 4% (18-22k€), 6% (≥22k€)
- [ ] **Calcul progressif** : Commission appliquée dès le 1er euro selon le seuil
- [ ] **Critère qualitatif** : Vérification minimum 4 révisions dans le mois

### 📈 KPIs mensuels
- [ ] **Production brute** : Somme des CA du mois
- [ ] **Production pondérée** : Somme des CA pondéré du mois
- [ ] **Taux de commission** : Affichage du taux applicable (0/2/3/4/6%)
- [ ] **Commission estimée** : Calcul basé sur le CA pondéré et le taux
- [ ] **Volumes par type** : Nombre d'actes pour chaque type (5 types)
- [ ] **Compteur révisions** : Nombre de révisions avec indicateur seuil

### 📋 Tableau de production
- [ ] **Colonnes complètes** : Jour, Client, Nature, Contrat, Effet, CA, CA pondéré, Compagnie (si applicable)
- [ ] **Tri par colonnes** : Fonctionnel sur toutes les colonnes (ascendant/descendant)
- [ ] **Filtrage** : Par type d'acte, date, client
- [ ] **Pagination** : Si nécessaire pour de gros volumes
- [ ] **Actions CRUD complètes** :
  - [ ] **Create** : Boutons d'action → Modales → Validation → Enregistrement
  - [ ] **Read** : Affichage complet avec tri et filtres
  - [ ] **Update** : Bouton "Modifier" → Modale pré-remplie → Validation → Sauvegarde
  - [ ] **Delete** : Bouton "Supprimer" → Modal confirmation → Suppression définitive
- [ ] **Indicateur verrou** : Icône vert (ouvert) / rouge (bloqué)
- [ ] **Lecture seule** : Si mois verrouillé, toutes modifications désactivées
- [ ] **États de chargement** : Indicateurs pendant les opérations

### 🔒 Système de verrouillage
- [ ] **Interface admin** : Verrouillage/déverrouillage des mois
- [ ] **Effet immédiat** : Désactivation des modifications si verrouillé
- [ ] **Indicateur visuel** : État du verrou clairement visible
- [ ] **Contexte paie** : Protection des données pour calcul des commissions

### 🔧 Technique et performance
- [ ] **Code TypeScript** : Sans erreurs de compilation
- [ ] **Tests unitaires** : Couverture > 80%
- [ ] **Performance** : Temps de chargement < 2s
- [ ] **Responsive** : Interface adaptée mobile/desktop
- [ ] **Sécurité** : Validation côté client et serveur
- [ ] **Gestion d'erreurs** : Messages clairs et récupération gracieuse

---

## 📊 Métriques de succès

- **Performance** : Temps de chargement < 2s
- **Fiabilité** : Taux d'erreur < 1%
- **Maintenabilité** : Couverture de tests > 80%
- **Sécurité** : Validation côté client et serveur
- **UX** : Interface intuitive et responsive
- **Calculs** : Précision des commissions à 100%
- **Capitalisation** : Gestion correcte de 100% des noms

---

---

## 📊 Architecture technique détaillée

### 🏗️ **Structure des dossiers**
```
src/
├── types/
│   └── sante-ind.ts              # Types TypeScript
├── lib/
│   ├── sante-ind-service.ts      # Logique métier
│   ├── sante-ind-persistence.ts  # Persistance Firebase
│   └── sante-ind-utils.ts        # Utilitaires
├── components/
│   └── sante-ind/
│       ├── ModalActe.tsx         # Modale générique
│       ├── ProductionTable.tsx   # Tableau de production
│       ├── KPIsMensuels.tsx      # KPIs mensuels
│       ├── NavigationMensuelle.tsx # Navigation mois
│       └── LockIndicator.tsx     # Indicateur verrou
├── app/
│   └── api/
│       └── sante-ind-activities/ # API routes
└── hooks/
    └── use-sante-ind-activities.ts # Hook personnalisé
```

### 🔧 **Dépendances techniques**
- **React 18** : Hooks, Context, Suspense
- **Next.js 15** : App Router, API Routes, Server Components
- **TypeScript 5** : Strict mode, interfaces, enums
- **Firebase 10** : Firestore, Authentication, Admin SDK
- **Tailwind CSS** : Styling, responsive design
- **Jest + RTL** : Tests unitaires et d'intégration

### 📱 **Responsive Design**
- **Mobile First** : Interface adaptée mobile
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly** : Boutons et zones tactiles optimisées
- **Accessibility** : WCAG 2.1 AA compliance

### 🎨 **Design System - Cohérence avec CDC Commercial**
- **Palette de couleurs** : Identique (vert Allianz, bleu, gris)
- **Cartes KPI** : Même design avec icônes et couleurs
- **Boutons d'action** : Même style et comportement
- **Modales** : Même structure et animations
- **Tableaux** : Même style de lignes et colonnes
- **Timeline** : Même design avec pastilles colorées
- **Cadenas** : Même indicateur vert/rouge (Phase 1)
- **Typography** : Mêmes polices et hiérarchie
- **Espacements** : Même système de spacing Tailwind

### 🔐 **Sécurité**
- **Authentification** : Firebase Auth avec tokens
- **Autorisation** : Rôles et permissions granulaires
- **Validation** : Côté client et serveur
- **Sanitization** : Protection XSS et injection
- **HTTPS** : Communication chiffrée

---

## 📋 Cas d'usage et scénarios de test

### 🎭 **Cas d'usage principaux**

#### **UC1 - Saisie d'une affaire nouvelle**
1. Utilisateur CDC Santé Individuelle se connecte
2. **Accède au dashboard** (module Santé Individuelle affiché automatiquement)
3. Clique sur "Affaire nouvelle"
4. Saisit les informations (client, contrat, CA, compagnie)
5. Valide la saisie
6. Vérifie que l'activité apparaît dans le tableau

#### **UC2 - Calcul des commissions**
1. Utilisateur saisit plusieurs activités dans le mois
2. Navigue entre différents types d'actes
3. Vérifie le calcul automatique du CA pondéré
4. Consulte les KPIs mensuels
5. Vérifie l'application du bon taux de commission

#### **UC3 - Navigation mensuelle**
1. Utilisateur consulte le mois courant
2. Navigue vers le mois précédent
3. Consulte l'historique des activités
4. Revient au mois courant
5. Saisit une nouvelle activité

#### **UC4 - Verrouillage mensuel**
1. Administrateur accède au dashboard admin
2. Verrouille le mois de septembre pour un CDC
3. CDC tente de modifier une activité de septembre
4. Vérifie que les modifications sont bloquées
5. Consulte l'indicateur de verrouillage

### 🧪 **Scénarios de test**

#### **Tests fonctionnels**
- [ ] Saisie des 5 types d'actes commerciaux
- [ ] Calcul correct du CA pondéré selon la grille
- [ ] Application des seuils de commission progressifs
- [ ] Navigation mensuelle fluide
- [ ] Verrouillage/déverrouillage des mois
- [ ] Export des données en Excel/PDF

#### **Tests de validation**
- [ ] Validation des champs obligatoires
- [ ] Capitalisation intelligente des noms
- [ ] Validation des montants (entiers €)
- [ ] Validation des dates (cohérence)
- [ ] Gestion des erreurs utilisateur

#### **Tests de sécurité**
- [ ] Accès refusé pour rôles non autorisés
- [ ] Validation côté serveur des données
- [ ] Protection contre les injections
- [ ] Audit trail des modifications

#### **Tests de performance**
- [ ] Chargement rapide du tableau (< 2s)
- [ ] Calculs optimisés des KPIs
- [ ] Synchronisation Firebase efficace
- [ ] Interface responsive sur mobile

### 🐛 **Gestion des erreurs**
- **Erreurs réseau** : Retry automatique, mode offline
- **Erreurs validation** : Messages clairs, conservation des saisies
- **Erreurs Firebase** : Fallback gracieux, logs détaillés
- **Erreurs utilisateur** : Guidance et aide contextuelle

---

## 🗺️ Roadmap et phases de déploiement

### 📅 **Phase 1 - MVP (4-6 semaines)**
**ÉTAPES 1-6** : Fonctionnalités de base
- Types et interfaces TypeScript
- Services et logique métier
- Composants UI de base
- API Routes Firebase
- Intégration dashboard
- Persistance et cache

**Livrables** :
- Module fonctionnel pour saisie d'activités
- Calculs de CA pondéré et commissions
- Navigation mensuelle
- Interface utilisateur complète

### 📅 **Phase 2 - Tests et validation (2-3 semaines)**
**ÉTAPES 7-8** : Qualité et documentation
- Tests unitaires et d'intégration
- Documentation technique et utilisateur
- Validation des calculs métier
- Correction des bugs

**Livrables** :
- Couverture de tests > 80%
- Documentation complète
- Module testé et validé

### 📅 **Phase 3 - Production (3-4 semaines)**
**ÉTAPES 9-12** : Déploiement et fonctionnalités avancées
- Scripts Firebase et maintenance
- Fonctionnalités avancées (export, offline, accessibilité)
- Dashboard admin avec verrouillage
- Déploiement en production

**Livrables** :
- Module en production
- Interface admin complète
- Scripts de maintenance
- Monitoring et analytics

### 🎯 **Critères de succès par phase**

#### **Phase 1 - MVP**
- [ ] Tous les types d'actes fonctionnels
- [ ] Calculs corrects des commissions
- [ ] Interface utilisateur responsive
- [ ] Persistance Firebase opérationnelle

#### **Phase 2 - Tests**
- [ ] Couverture de tests > 80%
- [ ] Documentation à jour
- [ ] Performance < 2s de chargement
- [ ] Sécurité validée

#### **Phase 3 - Production**
- [ ] Module déployé et stable
- [ ] Interface admin fonctionnelle
- [ ] Scripts de maintenance testés
- [ ] Monitoring en place

### 📊 **Métriques de suivi**
- **Performance** : Temps de chargement, temps de réponse API
- **Qualité** : Couverture de tests, bugs détectés
- **Utilisation** : Nombre d'activités saisies, utilisateurs actifs
- **Satisfaction** : Feedback utilisateurs, temps de formation

---

## 🎯 Prochaine étape
**ÉTAPE 1** : Créer les types et interfaces TypeScript dans `src/types/sante-ind.ts`