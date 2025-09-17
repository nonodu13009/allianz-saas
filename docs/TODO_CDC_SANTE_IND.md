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
- **Point d'entrée** : Bouton "Santé individuelle" dans la sidebar (visible uniquement pour `CD_sante_ind`)

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

**CRUD** :
- **Create** : Via modales
- **Read** : Tableau filtrable/triable
- **Update** : Tant que le mois n'est pas verrouillé
- **Delete** : Avec confirmation
- **Verrou** : Case `bloqué / débloqué` pilotée par l'administrateur

### 🔒 Système de verrouillage mensuel
- **Administrateur** : Verrouille/déverrouille un mois pour un CDC
- **Effet CDC** : Si le mois M est verrouillé, toutes les modifications sont désactivées
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
**Objectif** : Créer l'interface utilisateur complète
- [ ] Créer `src/components/sante-ind/ModalActe.tsx` (modale générique pour 5 types)
- [ ] Créer `src/components/sante-ind/ProductionTable.tsx` (tableau avec toutes les colonnes)
- [ ] Créer `src/components/sante-ind/KPIsMensuels.tsx` (6 KPIs + critère qualitatif)
- [ ] Créer `src/components/sante-ind/NavigationMensuelle.tsx` (précédent/suivant)
- [ ] Créer `src/components/sante-ind/LockIndicator.tsx` (indicateur verrouillage)
- [ ] Réutiliser les composants UI existants (Button, Card, Dialog, etc.)
- [ ] Validation : Interface responsive et fonctionnelle

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
**Objectif** : Intégrer au dashboard principal
- [ ] Modifier `src/app/dashboard/page.tsx` pour inclure le module
- [ ] Ajouter bouton "Santé individuelle" dans la sidebar (visibilité conditionnelle)
- [ ] Implémenter contrôle d'accès (rôle `CD_sante_ind`)
- [ ] Gérer l'état global des activités mensuelles
- [ ] Navigation fluide entre les modules
- [ ] Validation : Navigation sécurisée et fluide

### ✅ ÉTAPE 6 : Persistance et Cache
**Objectif** : Optimiser les performances
- [ ] Implémenter cache local avec sync Firebase
- [ ] Collection Firestore : `sante_ind_activities`
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

### ✅ ÉTAPE 10 : Déploiement
**Objectif** : Mettre en production
- [ ] Configuration Firebase (indexes, rules)
- [ ] Tests de charge
- [ ] Déploiement staging
- [ ] Déploiement production
- [ ] Validation : Module fonctionnel en production

---

## 🔄 Code factorisé à réutiliser

### Services
- `src/lib/cdc-service.ts` → Logique de validation et normalisation
- `src/lib/cdc-persistence.ts` → Persistance Firebase
- `src/lib/firebase.ts` → Configuration Firebase
- `src/lib/utils.ts` → Fonctions utilitaires communes

### Composants UI
- `src/components/ui/button.tsx` → Boutons
- `src/components/ui/card.tsx` → Cartes
- `src/components/ui/input.tsx` → Champs de saisie
- `src/components/ui/dialog.tsx` → Modales
- `src/components/ui/table.tsx` → Tableaux
- `src/components/ui/month-timeline.tsx` → Timeline mensuelle

### Types communs
- `src/types/user.ts` → Types utilisateur
- `src/types/commission.ts` → Types commissions
- `src/types/cdc.ts` → Types CDC Commercial (base)

### Hooks
- `src/hooks/use-user-status.ts` → Gestion des rôles utilisateur
- `src/hooks/use-cdc-activities.ts` → Gestion des activités CDC

---

## ✅ Critères d'acceptation détaillés

### 🔐 Accès et sécurité
- [ ] **Accès refusé** si rôle ≠ `CD_sante_ind` (redirection `/dashboard`)
- [ ] **Bouton visible** "Santé individuelle" uniquement pour `CD_sante_ind`
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
- [ ] **Tri par colonnes** : Fonctionnel sur toutes les colonnes
- [ ] **Actions CRUD** : Voir, Modifier, Supprimer avec confirmations
- [ ] **Indicateur verrou** : Icône vert (ouvert) / rouge (bloqué)
- [ ] **Lecture seule** : Si mois verrouillé, toutes modifications désactivées

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

## 🎯 Prochaine étape
**ÉTAPE 1** : Créer les types et interfaces TypeScript dans `src/types/sante-ind.ts`