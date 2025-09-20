# 📋 TODO - Module CDC Santé Collective

## 🎯 Objectif
Implémenter le module CDC Santé Collective en s'inspirant de l'architecture du module CDC Santé Individuelle, suivant les spécifications détaillées dans `docs/cdc_sante_coll.md`.

## 📚 Références
- **Spécifications complètes** : `docs/cdc_sante_coll.md`
- **Architecture de référence** : Module CDC Santé Individuelle (implémenté)
- **Architecture** : Next.js 15 + Firebase + TypeScript

---

## 🚀 Plan de Développement Étape par Étape

### 📋 **ÉTAPE 1 : Types et Interfaces** 
> **Durée estimée** : 1h | **Tests** : Compilation TypeScript

#### 1.1 Créer les types TypeScript
- [ ] **Créer** `src/types/sante-coll.ts`
  - [ ] Enum `SanteCollActeType` (10 types d'actes)
  - [ ] Enum `OrigineType` (Proactif, Réactif, Prospection)
  - [ ] Enum `CompagnieType` (Allianz, Courtage)
  - [ ] Interface `SanteCollActivity`
  - [ ] Interface `SanteCollKPI`
  - [ ] Interface `SanteCollLock`
  - [ ] Constante `PONDERATION_RATES` (Proactif: 100%, Réactif: 50%, Prospection: 120%)
  - [ ] Constante `COMMISSION_SEUILS` (5 seuils 0-6%)

#### 1.2 Tests de validation
- [ ] **Test 1** : Compilation TypeScript sans erreurs
- [ ] **Test 2** : Vérifier que tous les types sont exportés
- [ ] **Test 3** : Vérifier les constantes de pondération et commissions

**✅ Validation Étape 1** : Tous les tests passent → Passer à l'Étape 2

---

### 📋 **ÉTAPE 2 : Services et Logique Métier**
> **Durée estimée** : 2h | **Tests** : Tests unitaires

#### 2.1 Créer le service principal
- [ ] **Créer** `src/lib/sante-coll-service.ts`
  - [ ] Classe `SanteCollService` avec singleton pattern
  - [ ] Méthode `validateActivity()` avec validation complète
  - [ ] Méthode `normalizeActivity()` pour normalisation des données
  - [ ] Méthode `capitalizeClientName()` pour capitalisation intelligente
  - [ ] Méthode `calculatePrimePonderee()` selon origine
  - [ ] Méthode `calculateCommission()` selon seuils
  - [ ] Méthode `calculateKPIs()` pour calculs mensuels
  - [ ] Méthode `generateQualiteAlert()` pour alertes

#### 2.2 Créer les utilitaires
- [ ] **Créer** `src/lib/sante-coll.ts`
  - [ ] Fonction `formatEuroInt()` pour formatage monétaire
  - [ ] Fonction `formatPercentage()` pour formatage pourcentages
  - [ ] Fonction `getPonderationLabel()` pour labels d'origine
  - [ ] Fonction `filterActivities()` pour filtrage avancé

#### 2.3 Tests de validation
- [ ] **Test 1** : Service singleton fonctionne
- [ ] **Test 2** : Validation des activités avec données valides/invalides
- [ ] **Test 3** : Calculs de pondération (Proactif: 100%, Réactif: 50%, Prospection: 120%)
- [ ] **Test 4** : Calculs de commission selon seuils
- [ ] **Test 5** : Capitalisation intelligente des noms clients

**✅ Validation Étape 2** : Tous les tests passent → Passer à l'Étape 3

---

### 📋 **ÉTAPE 3 : Hook Personnalisé**
> **Durée estimée** : 1h | **Tests** : Tests de hooks

#### 3.1 Créer le hook de gestion d'état
- [ ] **Créer** `src/hooks/use-sante-coll-activities.ts`
  - [ ] Hook `useSanteCollActivities()` avec gestion complète
  - [ ] États : activities, kpis, loading, error, isMonthLocked
  - [ ] Actions : saveActivity, updateActivity, deleteActivity
  - [ ] Navigation : goToPreviousMonth, goToNextMonth, goToCurrentMonth
  - [ ] Filtres : filters, setFilters, filteredActivities
  - [ ] Synchronisation automatique avec Firebase

#### 3.2 Tests de validation
- [ ] **Test 1** : Hook se charge sans erreur
- [ ] **Test 2** : Navigation mensuelle fonctionne
- [ ] **Test 3** : Filtres appliquent correctement les données
- [ ] **Test 4** : États de chargement et erreur gérés

**✅ Validation Étape 3** : Tous les tests passent → Passer à l'Étape 4

---

### 📋 **ÉTAPE 4 : Garde de Route**
> **Durée estimée** : 30min | **Tests** : Tests d'authentification

#### 4.1 Créer la garde de route
- [ ] **Créer** `src/components/auth/sante-coll-route-guard.tsx`
  - [ ] Composant `SanteCollRouteGuard`
  - [ ] Vérification du rôle `cdc_sante_coll` ou `administrateur`
  - [ ] Page d'accès refusé avec message explicite
  - [ ] Redirection vers login si non authentifié
  - [ ] Design cohérent avec `SanteIndRouteGuard`

#### 4.2 Tests de validation
- [ ] **Test 1** : Utilisateur avec rôle `cdc_sante_coll` accède au contenu
- [ ] **Test 2** : Utilisateur sans rôle voit la page d'accès refusé
- [ ] **Test 3** : Utilisateur non connecté redirigé vers login
- [ ] **Test 4** : Administrateur peut accéder au module

**✅ Validation Étape 4** : Tous les tests passent → Passer à l'Étape 5

---

### 📋 **ÉTAPE 5 : Composants UI de Base**
> **Durée estimée** : 3h | **Tests** : Tests visuels et fonctionnels

#### 5.1 Créer les composants principaux
- [ ] **Créer** `src/components/sante-coll/SanteCollButtons.tsx`
  - [ ] Bouton unique "Nouvel acte" avec effets visuels
  - [ ] Désactivation si mois verrouillé
  - [ ] Design cohérent avec autres modules

- [ ] **Créer** `src/components/sante-coll/SanteCollFilters.tsx`
  - [ ] Filtre par origine (Tous | Proactif | Réactif | Prospection)
  - [ ] Filtre par nature d'acte (10 types)
  - [ ] Filtre par jour du mois
  - [ ] Bouton Reset pour effacer les filtres

- [ ] **Créer** `src/components/sante-coll/CommissionProgressChart.tsx`
  - [ ] Graphique de progression vers prochain seuil
  - [ ] Affichage du seuil actuel et suivant
  - [ ] Design cohérent avec CDC Santé Individuelle

#### 5.2 Tests de validation
- [ ] **Test 1** : Bouton "Nouvel acte" s'affiche et fonctionne
- [ ] **Test 2** : Filtres appliquent correctement les données
- [ ] **Test 3** : Graphique de commission s'affiche correctement
- [ ] **Test 4** : Responsive design sur mobile/desktop

**✅ Validation Étape 5** : Tous les tests passent → Passer à l'Étape 6

---

### 📋 **ÉTAPE 6 : Timeline Colorée**
> **Durée estimée** : 2h | **Tests** : Tests de navigation et couleurs

#### 6.1 Créer la timeline colorée
- [ ] **Créer** `src/components/sante-coll/SanteCollTimeline.tsx`
  - [ ] Calendrier mensuel avec couleurs selon jour de la semaine
    - Dimanche: rouge vif
    - Samedi: orange vif
    - Autres jours: vert vif
  - [ ] Pastilles avec compte d'activités par jour
  - [ ] Effet focus sur le jour sélectionné
  - [ ] Navigation précédent/suivant
  - [ ] Intégration avec `MonthTimeline` existant

#### 6.2 Tests de validation
- [ ] **Test 1** : Couleurs correctes selon jour de la semaine
- [ ] **Test 2** : Navigation mensuelle fonctionne
- [ ] **Test 3** : Pastilles affichent le bon nombre d'activités
- [ ] **Test 4** : Focus sur jour sélectionné
- [ ] **Test 5** : Responsive design

**✅ Validation Étape 6** : Tous les tests passent → Passer à l'Étape 7

---

### 📋 **ÉTAPE 7 : Modale de Saisie**
> **Durée estimée** : 3h | **Tests** : Tests de saisie et validation

#### 7.1 Créer la modale principale
- [ ] **Créer** `src/components/sante-coll/ModalActe.tsx`
  - [ ] Interface adaptative selon le type d'acte
  - [ ] Champs : Date de saisie, Nature de l'acte, Origine, Compagnie, Nom client, N° contrat, Prime brute, Prime pondérée
  - [ ] Validation en temps réel
  - [ ] Calcul automatique de la prime pondérée
  - [ ] Capitalisation intelligente des noms clients
  - [ ] Toast notifications pour succès/erreur

#### 7.2 Créer la modale simplifiée
- [ ] **Créer** `src/components/sante-coll/ModalActeSimple.tsx`
  - [ ] Version simplifiée pour tests
  - [ ] Validation des composants de base

#### 7.3 Tests de validation
- [ ] **Test 1** : Modale s'ouvre avec tous les champs
- [ ] **Test 2** : Validation des champs obligatoires
- [ ] **Test 3** : Calcul automatique de la prime pondérée
- [ ] **Test 4** : Capitalisation intelligente des noms
- [ ] **Test 5** : Sauvegarde avec succès/erreur
- [ ] **Test 6** : Fermeture de la modale

**✅ Validation Étape 7** : Tous les tests passent → Passer à l'Étape 8

---

### 📋 **ÉTAPE 8 : KPIs et Tableau**
> **Durée estimée** : 3h | **Tests** : Tests de données et affichage

#### 8.1 Créer les KPIs
- [ ] **Créer** `src/components/sante-coll/SanteCollKPIs.tsx`
  - [ ] Affichage des KPIs mensuels avec info-bulles
  - [ ] Production brute et pondérée
  - [ ] Commissions estimées
  - [ ] Répartition par origine et compagnie
  - [ ] Indicateur de critère qualitatif
  - [ ] Info-bulles explicatives

#### 8.2 Créer le tableau
- [ ] **Créer** `src/components/sante-coll/SanteCollTable.tsx`
  - [ ] Tableau responsive avec toutes les colonnes
  - [ ] Tri par colonnes
  - [ ] Actions édition/suppression
  - [ ] Indicateur de verrouillage
  - [ ] Filtres appliqués

#### 8.3 Tests de validation
- [ ] **Test 1** : KPIs s'affichent avec les bonnes valeurs
- [ ] **Test 2** : Info-bulles fonctionnent
- [ ] **Test 3** : Tableau affiche toutes les colonnes
- [ ] **Test 4** : Tri par colonnes fonctionne
- [ ] **Test 5** : Actions édition/suppression
- [ ] **Test 6** : Responsive design

**✅ Validation Étape 8** : Tous les tests passent → Passer à l'Étape 9

---

### 📋 **ÉTAPE 9 : API Routes**
> **Durée estimée** : 2h | **Tests** : Tests d'API

#### 9.1 Créer les routes API
- [ ] **Créer** `src/app/api/sante-coll-activities/route.ts`
  - [ ] GET : Récupération des activités par mois
  - [ ] POST : Création d'une nouvelle activité
  - [ ] Vérification des rôles et authentification

- [ ] **Créer** `src/app/api/sante-coll-activities/[id]/route.ts`
  - [ ] GET : Récupération d'une activité par ID
  - [ ] PUT : Modification d'une activité
  - [ ] DELETE : Suppression d'une activité

- [ ] **Créer** `src/app/api/sante-coll-activities/lock/route.ts`
  - [ ] GET : Vérification du statut de verrouillage
  - [ ] POST : Verrouillage/déverrouillage (admin uniquement)

#### 9.2 Tests de validation
- [ ] **Test 1** : GET /api/sante-coll-activities retourne les données
- [ ] **Test 2** : POST crée une nouvelle activité
- [ ] **Test 3** : PUT modifie une activité existante
- [ ] **Test 4** : DELETE supprime une activité
- [ ] **Test 5** : Vérification des rôles sur toutes les routes
- [ ] **Test 6** : Gestion des erreurs

**✅ Validation Étape 9** : Tous les tests passent → Passer à l'Étape 10

---

### 📋 **ÉTAPE 10 : Pages et Intégration**
> **Durée estimée** : 2h | **Tests** : Tests d'intégration

#### 10.1 Créer les pages
- [ ] **Créer** `src/app/dashboard/sante-collective/page.tsx`
  - [ ] Page principale avec tous les composants
  - [ ] Intégration du hook `useSanteCollActivities`
  - [ ] Gestion des états de chargement et erreur

- [ ] **Créer** `src/app/dashboard/sante-collective/simple/page.tsx`
  - [ ] Version simplifiée pour tests
  - [ ] Validation des composants de base

- [ ] **Créer** `src/app/dashboard/sante-collective/test/page.tsx`
  - [ ] Page de test pour validation
  - [ ] Tests des fonctionnalités de base

#### 10.2 Intégration dashboard
- [ ] **Modifier** `src/components/dashboard/sidebar.tsx`
  - [ ] Ajouter le bouton "Santé collective" pour rôle `cdc_sante_coll`
  - [ ] Lien vers `/dashboard/sante-collective`

- [ ] **Créer** `src/components/sante-coll/index.ts`
  - [ ] Export centralisé de tous les composants

#### 10.3 Tests de validation
- [ ] **Test 1** : Page principale se charge sans erreur
- [ ] **Test 2** : Tous les composants s'affichent
- [ ] **Test 3** : Navigation entre pages fonctionne
- [ ] **Test 4** : Bouton sidebar visible pour rôle `cdc_sante_coll`
- [ ] **Test 5** : Responsive design complet
- [ ] **Test 6** : Performance acceptable

**✅ Validation Étape 10** : Tous les tests passent → Passer à l'Étape 11

---

### 📋 **ÉTAPE 11 : Tests et Validation Complète**
> **Durée estimée** : 2h | **Tests** : Tests end-to-end

#### 11.1 Tests de parcours utilisateur
- [ ] **Test 1** : Connexion avec rôle `cdc_sante_coll`
- [ ] **Test 2** : Accès au module via sidebar
- [ ] **Test 3** : Navigation mensuelle
- [ ] **Test 4** : Création d'une activité complète
- [ ] **Test 5** : Modification d'une activité
- [ ] **Test 6** : Suppression d'une activité
- [ ] **Test 7** : Application des filtres
- [ ] **Test 8** : Vérification des KPIs
- [ ] **Test 9** : Timeline colorée
- [ ] **Test 10** : Info-bulles

#### 11.2 Tests de données
- [ ] **Test 1** : Sauvegarde en base Firebase
- [ ] **Test 2** : Calculs de pondération corrects
- [ ] **Test 3** : Calculs de commission corrects
- [ ] **Test 4** : Capitalisation des noms clients
- [ ] **Test 5** : Validation des données

#### 11.3 Tests de sécurité
- [ ] **Test 1** : Accès refusé pour rôles invalides
- [ ] **Test 2** : Vérification des rôles sur API
- [ ] **Test 3** : Authentification Firebase
- [ ] **Test 4** : Validation des données côté serveur

**✅ Validation Étape 11** : Tous les tests passent → **MODULE TERMINÉ** 🎉

---

## 🎯 **Critères de Succès Final**

### ✅ **Fonctionnalités Implémentées**
- [ ] **10 types d'actes** : Collective (5), Individuelle (3), Courtage (2)
- [ ] **Timeline colorée** : Calendrier avec couleurs selon jour de la semaine
- [ ] **Pondération par origine** : Proactif (100%), Réactif (50%), Prospection (120%)
- [ ] **Barème commissions** : 5 seuils spécifiques (0-6%) selon CA pondéré
- [ ] **Info-bulles** : Explications contextuelles sur les KPIs et calculs
- [ ] **Filtres avancés** : Par origine, nature d'acte et jour
- [ ] **CRUD complet** : Création, lecture, modification, suppression
- [ ] **Navigation mensuelle** : Précédent/suivant avec timeline
- [ ] **Sécurité** : Authentification et vérification des rôles
- [ ] **Responsive design** : Mobile et desktop

### ✅ **Architecture Technique**
- [ ] **Service singleton** : `SanteCollService` avec validation unifiée
- [ ] **Hook React** : `useSanteCollActivities` pour gestion d'état
- [ ] **API REST** : Routes complètes avec sécurité
- [ ] **Base de données** : Collections Firebase optimisées
- [ ] **Types TypeScript** : Interfaces complètes et typées
- [ ] **Composants UI** : Design system cohérent

### ✅ **Qualité et Performance**
- [ ] **Tests complets** : Unitaires, intégration, end-to-end
- [ ] **Performance** : Chargement rapide et réactif
- [ ] **Accessibilité** : Labels, ARIA, navigation clavier
- [ ] **Documentation** : Code commenté et README
- [ ] **Sécurité** : Validation côté client et serveur

---

## 🚀 **Prochaine Étape**

**Commencer par l'Étape 1** : Créer les types et interfaces TypeScript
- Créer le fichier `src/types/sante-coll.ts`
- Implémenter tous les types et constantes
- Valider avec les tests de compilation

**Temps total estimé** : 20-25 heures de développement
**Approche** : Développement incrémental avec tests à chaque étape
**Validation** : Tests complets avant passage à l'étape suivante
