# TODO - Développement CDC Commercial

> **Objectif** : Respecter les bonnes pratiques et arriver au résultat final sans casse  
> **Base** : Document CDC commercial (docs/cdc_commercial.md)  
> **Branche** : `cdc_commercial`  

---

## 🎯 Phase 1 : Architecture & Structure de base

### 1.1 Structure des dossiers
- [ ] **Créer** `src/components/cdc/` - Composants spécifiques CDC
- [ ] **Créer** `src/lib/cdc.ts` - Utilitaires et calculs CDC
- [ ] **Créer** `src/types/cdc.ts` - Types TypeScript CDC
- [ ] **Créer** `src/app/api/cdc-activities/` - API REST CDC
- [ ] **Modifier** `src/app/dashboard/page.tsx` - Intégration CDC dans page existante

### 1.2 Types et interfaces
- [ ] **Définir** `Activity` interface (AN + Process)
- [ ] **Définir** `ActivityType` enum (AN, M+3, Préterme Auto, Préterme IRD)
- [ ] **Définir** `ProductType` enum (9 types d'affaires)
- [ ] **Définir** `CDCLock` interface (verrouillage mensuel)
- [ ] **Définir** `CDCKPI` interface (métriques mensuelles)

### 1.3 Configuration Firestore
- [ ] **Créer** collection `cdcActivities` avec index
- [ ] **Créer** collection `cdcLocks` avec index
- [ ] **Définir** règles Firestore pour CDC
- [ ] **Tester** connexion Firestore CDC

---

## 🔧 Phase 2 : API & Services

### 2.1 API REST - Activités
- [ ] **Créer** `GET /api/cdc-activities/month` - Récupération mensuelle
- [ ] **Créer** `POST /api/cdc-activities/month` - Création activité
- [ ] **Créer** `PATCH /api/cdc-activities/[id]` - Modification activité
- [ ] **Créer** `DELETE /api/cdc-activities/[id]` - Suppression activité
- [ ] **Tester** toutes les routes API

### 2.2 API REST - Verrouillage
- [ ] **Créer** `GET /api/cdc-activities/lock` - Vérification verrou
- [ ] **Créer** `POST /api/cdc-activities/lock` - Verrouillage/déverrouillage
- [ ] **Tester** système de verrouillage

### 2.3 Services utilitaires
- [ ] **Créer** `capitalizeClientName()` - Capitalisation intelligente
- [ ] **Créer** `calculateCommission()` - Calcul commissions par barème
- [ ] **Créer** `formatEuroInt()` - Formatage monétaire
- [ ] **Créer** `validateActivity()` - Validation des données
- [ ] **Tester** toutes les fonctions utilitaires

---

## 🎨 Phase 3 : Interface utilisateur

### 3.1 Page principale CDC
- [ ] **Modifier** `src/app/dashboard/page.tsx` - Intégrer CDC dans page Accueil existante
- [ ] **Repositionner** message de bienvenue en haut, largeur complète
- [ ] **Ajouter** zone de saisie CDC sous le message de bienvenue
- [ ] **Ajouter** navigation mensuelle (précédent/suivant)
- [ ] **Ajouter** indicateur de mois courant
- [ ] **Garder** structure existante du dashboard
- [ ] **Tester** intégration et navigation

### 3.2 Boutons de saisie
- [ ] **Créer** `src/components/cdc/CDCButtons.tsx` - 4 boutons flashy (AN, M+3, Préterme Auto, Préterme IRD)
- [ ] **Styler** avec couleurs distinctes
- [ ] **Ajouter** états hover/disabled
- [ ] **Gérer** désactivation si mois verrouillé
- [ ] **Tester** interactions boutons

### 3.3 Modales de saisie
- [ ] **Créer** `src/components/cdc/ModalAN.tsx` - Modale Affaires Nouvelles
- [ ] **Créer** `src/components/cdc/ModalProcess.tsx` - Modale Process (3 variantes)
- [ ] **Implémenter** tous les champs selon spécifications
- [ ] **Ajouter** validation en temps réel
- [ ] **Gérer** calculs automatiques (commissions)
- [ ] **Tester** toutes les modales

### 3.4 Tableau des activités
- [ ] **Créer** `src/components/cdc/ActivityTable.tsx` - Tableau principal
- [ ] **Ajouter** colonnes selon type (AN vs Process)
- [ ] **Implémenter** tri par colonnes
- [ ] **Ajouter** actions édition/suppression
- [ ] **Gérer** colonne Verrou (cadenas)
- [ ] **Tester** CRUD complet

---

## 📊 Phase 4 : KPIs & Métriques

### 4.1 Calculs KPIs
- [ ] **Implémenter** nombre d'affaires nouvelles
- [ ] **Implémenter** nombre AUTO/MOTO vs autres
- [ ] **Implémenter** nombre de process (total + par type)
- [ ] **Implémenter** CA d'affaire cumulé
- [ ] **Implémenter** ratio (autres/AUTO/MOTO)
- [ ] **Implémenter** commissions potentielles/réelles
- [ ] **Tester** tous les calculs

### 4.2 Affichage KPIs
- [ ] **Créer** `src/components/cdc/CDCKPIs.tsx` - Composant affichage KPIs
- [ ] **Styler** avec cartes métriques
- [ ] **Ajouter** formatage approprié (€, %)
- [ ] **Gérer** mise à jour temps réel
- [ ] **Tester** affichage et actualisation

---

## 📅 Phase 5 : Timeline & Filtres

### 5.1 Timeline mensuelle
- [ ] **Créer** `src/components/cdc/MonthTimeline.tsx` - Timeline avec pastilles
- [ ] **Calculer** valeurs par jour (AN + Process)
- [ ] **Styler** pastilles avec couleurs progressives
- [ ] **Ajouter** scroll horizontal si nécessaire
- [ ] **Implémenter** clic pour filtrer par jour
- [ ] **Tester** interactions timeline

### 5.2 Système de filtres
- [ ] **Créer** `src/components/cdc/CDCFilters.tsx` - Toggle "Tous | AN | Process"
- [ ] **Ajouter** filtre Produit pour AN
- [ ] **Synchroniser** timeline + tableau
- [ ] **Gérer** états des filtres
- [ ] **Tester** tous les filtres

---

## 🔒 Phase 6 : Verrouillage & Sécurité

### 6.1 Système de verrouillage
- [ ] **Implémenter** logique de verrouillage mensuel
- [ ] **Ajouter** indicateurs visuels (pastille verte/rouge)
- [ ] **Désactiver** boutons si verrouillé
- [ ] **Bloquer** modifications dans tableau
- [ ] **Tester** tous les scénarios de verrouillage

### 6.2 Gestion des droits
- [ ] **Vérifier** rôle CDC Commercial
- [ ] **Ajouter** redirection si mauvais rôle
- [ ] **Sécuriser** routes API
- [ ] **Tester** accès et permissions

---

## 🧪 Phase 7 : Tests & Validation

### 7.1 Tests fonctionnels
- [ ] **Tester** parcours complet utilisateur
- [ ] **Valider** toutes les modales
- [ ] **Vérifier** calculs KPIs
- [ ] **Tester** navigation mensuelle
- [ ] **Valider** système de verrouillage

### 7.2 Tests de régression
- [ ] **Vérifier** que commissions existantes fonctionnent
- [ ] **Tester** dashboard principal non cassé
- [ ] **Valider** authentification/authorization
- [ ] **Vérifier** responsive design
- [ ] **Tester** performance

### 7.3 Tests de données
- [ ] **Valider** format des données Firestore
- [ ] **Tester** migration si nécessaire
- [ ] **Vérifier** cohérence des calculs
- [ ] **Valider** gestion des cas limites

---

## 🚀 Phase 8 : Déploiement & Finalisation

### 8.1 Optimisations
- [ ] **Optimiser** requêtes Firestore
- [ ] **Ajouter** cache si nécessaire
- [ ] **Optimiser** rendu des composants
- [ ] **Vérifier** bundle size

### 8.2 Documentation
- [ ] **Documenter** API endpoints
- [ ] **Créer** guide utilisateur CDC
- [ ] **Documenter** règles métier
- [ ] **Ajouter** commentaires code

### 8.3 Déploiement
- [ ] **Tester** en environnement de test
- [ ] **Valider** avec utilisateurs finaux
- [ ] **Déployer** en production
- [ ] **Monitorer** post-déploiement

---

## ✅ Critères d'acceptation

### Fonctionnels
- [ ] **Saisie quotidienne** : Les CDC peuvent saisir leur activité tous les jours
- [ ] **Navigation mensuelle** : Consultation des mois précédents/suivants
- [ ] **4 boutons de saisie** : AN, M+3, Préterme Auto, Préterme IRD fonctionnels
- [ ] **Modales adaptées** : Champs corrects selon le type sélectionné
- [ ] **Calculs automatiques** : Commissions selon barème par produit
- [ ] **Capitalisation intelligente** : Noms clients avec prénoms composés
- [ ] **KPIs temps réel** : Métriques mensuelles mises à jour
- [ ] **Timeline interactive** : Pastilles par jour avec filtres
- [ ] **Tableau CRUD** : Édition/suppression protégées par verrouillage
- [ ] **Système de verrouillage** : Blocage modifications mensuelles

### Techniques
- [ ] **Performance** : Interface fluide et réactive
- [ ] **Sécurité** : Accès restreint aux CDC Commercial
- [ ] **Robustesse** : Gestion d'erreurs et états de chargement
- [ ] **Maintenabilité** : Code propre et documenté
- [ ] **Responsive** : Interface adaptée mobile/desktop

---

## 📝 Notes de développement

### Bonnes pratiques à respecter
- ✅ **Validation** : Toujours valider les données côté client ET serveur
- ✅ **Gestion d'erreurs** : Messages explicites avec snackbars
- ✅ **États optimistes** : UI réactive pendant les requêtes
- ✅ **Accessibilité** : Labels, aria-labels, navigation clavier
- ✅ **Performance** : Lazy loading, memoization si nécessaire
- ✅ **Tests** : Tester chaque fonctionnalité avant passage à la suivante

### Points d'attention
- 🔍 **Capitalisation** : Appliquée uniquement à l'enregistrement (pas en temps réel)
- 🔍 **Commissions** : Toujours des entiers en euros (pas de décimales)
- 🔍 **Verrouillage** : Respecter la logique métier (salaires = données du mois précédent)
- 🔍 **Navigation** : Mise à jour cohérente timeline + tableau + KPIs
- 🔍 **Filtres** : Synchronisation parfaite entre tous les composants

---

**Status** : 🟡 En cours de développement  
**Dernière mise à jour** : [Date]  
**Prochaine étape** : Phase 1 - Architecture & Structure de base
