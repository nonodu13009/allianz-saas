# Cahier des charges - Module Commercial

## Vue d'ensemble
Module de saisie et de suivi de l'activité commerciale pour les utilisateurs ayant le rôle `cdc_commercial`.

## Accès et navigation
- **Accès** : Bouton dans la sidebar pour les utilisateurs `cdc_commercial` (6 utilisateurs concernés)
- **Design** : Cohérence avec le design global de l'application
- **Navigation** : 
  - Bouton retour vers le dashboard
  - Navigation mensuelle avec bouton retour vers le mois système

## Données à saisir

### Informations de base
- **Date de saisie** : Automatique (date du jour)
- **Nom du client** : Capitalisation automatique, gestion des noms composés
- **Numéro de contrat** : Saisie libre
- **Date d'effet** : Date picker

### Typologie des actes
**Type d'acte** (select) :
- `an` : Affaire nouvelle
- `m+3` : Process M+3
- `préterme auto` : Préterme automatique
- `préterme iard` : Préterme IARD

### Produits et tarification
**Type de produit** (select) avec commissions potentielles :
- `auto/moto` : 10 €
- `iard part` : 20 €
- `iard pro` : 20 € + 10 € par tranche de 1000 € au-delà de 999 €
- `pj` : 30 €
- `gav` : 40 €
- `santé/prévoyance` : 50 €
- `nop50eur` : 10 €
- `vie pp` : 50 €
- `vie pu` : 1% du versement

### Compagnie et montants
- **Compagnie** (select) : Allianz, Unim/Uniced, Courtage
- **Prime annuelle ou versée** : Montant en euros
- **Commission potentielle** : Calculée automatiquement selon le produit

## Règles de validation des commissions

### Conditions pour transformer les commissions potentielles en réelles
1. **Minimum 15 process dans le mois** (m+3, préterme auto, préterme iard)
2. **Ratio contrats autres / contrats auto ≥ 100%**
   - Si aucun contrat auto : ratio de 100% par défaut
   - Exemple : 3 PJ et 0 auto = 100%
3. **Commissions potentielles ≥ 200 €**

## Interface utilisateur

### Navigation mensuelle - PRIORITÉ ABSOLUE
**Position dans l'interface** :
- **Emplacement** : Entre l'en-tête de page et les KPIs
- **Centrage** : Centré horizontalement sur la page
- **Espacement** : Marges égales en haut et en bas

**Composants visuels** :
- **Container** : Card avec fond blanc (mode clair) / gris foncé (mode sombre)
- **Bordure** : Bordure subtile avec ombre légère
- **Padding** : Espacement interne confortable (16px)

**Boutons de navigation** :
- **Bouton précédent** : Flèche gauche (`<`) à gauche
- **Bouton suivant** : Flèche droite (`>`) à droite
- **Style** : Boutons outline avec icônes Lucide
- **Taille** : Boutons compacts mais cliquables

**Affichage du mois** :
- **Format** : "septembre 2025" (français, première lettre minuscule)
- **Taille** : Texte XL, gras, centré
- **Couleur** : Texte principal (noir/gris foncé)

**Bouton retour rapide** :
- **Texte** : "Retour au mois actuel"
- **Position** : Sous le mois affiché
- **Style** : Bouton ghost, texte petit
- **Couleur** : Texte secondaire (gris)

**Comportement du bouton retour** :
- **Visibilité** : Toujours visible, même sur le mois actuel
- **État actuel** : Bouton désactivé/grisé quand on est sur le mois actuel
- **Navigation passée** : Bouton actif et cliquable
- **Action** : Retour immédiat au mois en cours (date du jour)
- **Feedback** : Animation de transition fluide vers le mois actuel
- **Persistance** : Le mois actuel reste sélectionné après retour

**États et interactions** :
- **Hover** : Effet de survol sur tous les boutons
- **Loading** : Indicateur de chargement pendant les requêtes
- **Disabled** : Boutons désactivés pendant le chargement
- **Responsive** : Adaptation mobile avec boutons plus grands

### Timeline mensuelle - DÉTAILS IMPORTANTS

**Position et structure** :
- **Emplacement** : Sous les KPIs et boutons d'actes
- **Largeur** : Toute la largeur disponible
- **Disposition** : Pastilles alignées horizontalement
- **Espacement** : Gap égal entre chaque pastille

**Design des pastilles** :
- **Forme** : Cercles parfaits
- **Taille** : Diamètre fixe (ex: 40px)
- **Bordure** : Bordure fine pour délimiter chaque jour
- **Fond** : Couleur selon le type de jour
- **Hover** : Effet de survol avec légère élévation

**Couleurs des pastilles** :
- 🟢 **Jours normaux** : Vert (lundi-vendredi)
- 🟠 **Samedi** : Orange
- 🔴 **Dimanche** : Rouge
- ⚪ **Jour système** : Bordure blanche épaisse (jours spéciaux)

**Contenu des pastilles** :
- **Nombre d'actes** : Chiffre centré dans chaque pastille
- **Police** : Texte blanc, gras, taille adaptée
- **Format** : Nombre simple (ex: "5", "12", "0")
- **Zéro** : Pastille vide ou avec "0" selon le design

**Types d'actes affichés** :
- **AN** : Affaires nouvelles
- **Process** : M+3, Préterme Auto, Préterme IARD
- **Total** : Somme de tous les actes de la journée
- **Filtrage** : Seuls les actes filtrés sont comptés

**Interactions** :
- **Clic** : Ouverture d'une modale avec détail du jour
- **Hover** : Tooltip avec répartition par type d'acte
- **État vide** : Pastille grisée si aucun acte
- **État chargé** : Animation d'apparition des chiffres

**Responsive** :
- **Desktop** : Pastilles alignées sur une ligne
- **Tablet** : Pastilles plus petites, 2 lignes si nécessaire
- **Mobile** : Pastilles compactes, scroll horizontal si besoin

### KPIs du mois - EXACTEMENT CES 7 KPIs
- CA du mois
- Nombre de contrats total
- Nombre de contrats autres qu'auto
- Commissions potentielles
- Ratio autres/auto
- Nombre d'actes total
- Commissions réelles

### Commissions réelles - Effet hover explicatif
**Comportement** :
- **Trigger** : Survol de la carte "Commissions réelles"
- **Délai** : Apparition après 500ms de hover
- **Position** : Tooltip/modal centré au-dessus de la carte
- **Fermeture** : Disparition après 1 seconde sans hover

**Contenu de la modale explicative** :
- **Titre** : "Comment passer de commissions potentielles à réelles ?"
- **Explication** : "Les commissions deviennent réelles lorsque 3 conditions sont remplies :"
- **Liste des conditions** :
  1. ✅ **Minimum 15 process dans le mois** (M+3, Préterme Auto, Préterme IARD)
  2. ✅ **Ratio contrats autres / contrats auto ≥ 100%**
  3. ✅ **Commissions potentielles ≥ 200 €**

**Design de la modale** :
- **Style** : Card avec bordure et ombre
- **Fond** : Blanc (mode clair) / Gris foncé (mode sombre)
- **Couleurs** : Texte principal avec icônes de validation vertes
- **Taille** : Modale compacte mais lisible
- **Animation** : Apparition/disparition fluide

**Indicateurs visuels** :
- **Icône info** : Petit point d'interrogation ou icône "i" sur la carte
- **Couleur** : Texte secondaire discret
- **Hover** : L'icône devient plus visible au survol
- **État** : Différent selon si les conditions sont remplies ou non

**États de la carte** :
- **Commissions potentielles** : Carte normale, icône info discrète
- **Commissions réelles** : Carte avec badge "✓ Réelles", icône info plus visible
- **Transition** : Animation douce lors du passage potentiel → réel

### Tableau des saisies
- **Affichage** : Toutes les entrées saisies
- **Tri** : Possibilité de classer A-Z ou Z-A dans toutes les colonnes
- **Filtrage** : Impact sur timeline et tableau

### Saisie des actes commerciaux - INTERFACE PRINCIPALE

**Position des boutons** :
- **Emplacement** : Sous les KPIs, avant la Timeline
- **Disposition** : 4 boutons en ligne horizontale
- **Espacement** : Gap égal entre les boutons
- **Responsive** : Sur mobile, disposition en 2x2 ou verticale

**Design des boutons** :
- **Style** : Boutons primaires avec couleurs distinctes
- **Taille** : Boutons larges et hauts pour faciliter le clic
- **Icônes** : Icône représentative à gauche du texte
- **Hover** : Effet de survol avec légère élévation
- **Active** : État actif pendant l'ouverture de la modale

**Les 4 boutons d'actes** :

1. **AN - Affaire Nouvelle**
   - **Couleur** : Bleu (primary)
   - **Icône** : `Plus` ou `FileText`
   - **Texte** : "AN - Affaire Nouvelle"
   - **Description** : "Nouveau contrat client"
   - **Valeur** : `actType: 'an'`

2. **M+3 - Process M+3**
   - **Couleur** : Vert (success)
   - **Icône** : `RefreshCw` ou `Clock`
   - **Texte** : "M+3 - Process M+3"
   - **Description** : "Processus M+3"
   - **Valeur** : `actType: 'm+3'`

3. **Préterme Auto**
   - **Couleur** : Orange (warning)
   - **Icône** : `Car` ou `Zap`
   - **Texte** : "Préterme Auto"
   - **Description** : "Préterme automatique"
   - **Valeur** : `actType: 'preterme_auto'`

4. **Préterme IARD**
   - **Couleur** : Rouge (destructive)
   - **Icône** : `Shield` ou `Building`
   - **Texte** : "Préterme IARD"
   - **Description** : "Préterme IARD"
   - **Valeur** : `actType: 'preterme_iard'`

**Comportement des boutons** :
- **Clic** : Ouverture immédiate de la modale de saisie
- **Pré-remplissage** : Le type d'acte est automatiquement sélectionné
- **État** : Bouton légèrement surligné pendant la saisie
- **Fermeture** : Retour à l'état normal après sauvegarde/annulation

**Modale de saisie** :
- **Ouverture** : Clic sur un bouton d'acte
- **Process** : Pré-renseigné selon le bouton cliqué
- **Date de saisie** : Automatique (date du jour)
- **Champs à compléter** :
  - Nom du client (capitalisation auto)
  - Numéro de contrat
  - Date d'effet
  - Type de produit (select)
  - Compagnie (select)
  - Prime annuelle ou versée
  - Commission potentielle (calculée auto)

### Système de filtres - IMPACT SUR TIMELINE ET TABLEAU

**Filtres disponibles** :
- **Type d'acte** : AN, M+3, Préterme Auto, Préterme IARD
- **Type de contrat** : Auto/Moto, IARD Part, IARD Pro, PJ, GAV, etc.
- **Compagnie** : Allianz, Unim/Uniced, Courtage

**Fonctionnalités** :
- **Par défaut** : Aucun filtre actif
- **Sélection multiple** : Plusieurs filtres peuvent être actifs simultanément
- **Tags visuels** : Filtres actifs affichés sous forme de badges
- **Bouton reset** : "Effacer tous les filtres" pour revenir à l'état initial
- **Impact temps réel** : Mise à jour immédiate de tous les composants

**Impact sur la Timeline** :
- **Pastilles** : Seuls les actes filtrés sont comptés dans chaque pastille
- **Couleurs** : Les pastilles gardent leurs couleurs (jour de semaine)
- **Chiffres** : Les nombres dans les pastilles reflètent les filtres actifs
- **État vide** : Pastilles à "0" si aucun acte ne correspond aux filtres
- **Animation** : Transition fluide lors du changement de filtre

**Impact sur le Tableau de production** :
- **Lignes affichées** : Seules les lignes correspondant aux filtres sont visibles
- **Tri** : Le tri est maintenu sur les données filtrées
- **Pagination** : Adaptée au nombre de résultats filtrés
- **Compteurs** : "X résultats sur Y total" selon les filtres
- **Export** : L'export respecte les filtres actifs

**Synchronisation Timeline ↔ Tableau** :
- **Cohérence** : Les mêmes données sont affichées dans les deux composants
- **Filtres partagés** : Les filtres s'appliquent simultanément aux deux
- **État global** : Les filtres sont stockés dans le contexte React
- **Persistance** : Les filtres restent actifs lors de la navigation mensuelle

## Structure technique

### Navigation mensuelle - PRIORITÉ DE DÉVELOPPEMENT

**Ordre de développement** :
1. **Navigation mensuelle** (PREMIER)
2. **Chargement des données** par mois
3. **Permanence des données** en base
4. **Interface utilisateur** (KPIs, boutons, timeline)

**Architecture de navigation** :
- **État global** : `currentMonth` dans le contexte React
- **Format** : `YYYY-MM` (ex: "2024-12" pour décembre 2024)
- **Persistence** : localStorage pour conserver le mois sélectionné
- **Synchronisation** : Tous les composants se mettent à jour automatiquement
- **Date réelle** : Utilise la date système actuelle comme référence

**Gestion des données par mois** :
- **Requête Firestore** : `where('month', '==', currentMonth)` (date réelle)
- **Cache local** : Stockage des données par mois dans le state
- **Rechargement** : Automatique lors du changement de mois
- **Optimisation** : Éviter les requêtes inutiles si données déjà en cache

**Permanence des données** :
- **Collection Firestore** : `commercial_activities`
- **Champ mois** : `month: currentMonth` (date réelle) dans chaque document
- **Indexation** : Index composite sur `userId` + `month`
- **Rétention** : Données conservées indéfiniment
- **Sauvegarde** : Automatique à chaque création/modification

**Évolution des données mois par mois** :
- **Isolation** : Chaque mois est indépendant
- **Cumul** : Possibilité de calculer des totaux annuels
- **Historique** : Accès à tous les mois précédents
- **Projection** : Calculs de tendances et moyennes

**Implémentation technique de la navigation** :

**Contexte React** :
```typescript
interface NavigationContext {
  currentMonth: string; // "2024-12" (date réelle)
  setCurrentMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isLoading: boolean;
}
```

**Hooks personnalisés** :
- `useNavigation()` : Accès au contexte de navigation
- `useMonthlyData(month)` : Chargement des données pour un mois
- `useMonthCache()` : Gestion du cache local par mois

**Fonctions de navigation** :
- `navigateToMonth(month)` : Navigation directe vers un mois
- `loadMonthData(month)` : Chargement des données d'un mois
- `cacheMonthData(month, data)` : Mise en cache des données
- `getCachedMonthData(month)` : Récupération du cache
- `goToCurrentMonth()` : Retour au mois actuel (date du jour)
- `isCurrentMonth(month)` : Vérification si le mois est le mois actuel

**Gestion d'état** :
- **État global** : `currentMonth` dans le contexte
- **Cache local** : `monthlyDataCache` par mois
- **État de chargement** : `isLoading` par mois
- **Erreurs** : `error` par mois pour gestion des erreurs
- **Mois actuel** : `currentDate` pour comparaison et bouton retour

**États du bouton retour** :
- **Mois actuel** : Bouton désactivé, texte grisé
- **Mois passé** : Bouton actif, cliquable
- **Mois futur** : Bouton actif, cliquable
- **Transition** : Animation fluide lors du retour
- **Feedback** : Indicateur visuel du retour au mois actuel

**Optimisations** :
- **Cache intelligent** : Éviter les requêtes si données en cache
- **Préchargement** : Charger le mois précédent/suivant en arrière-plan
- **Débounce** : Éviter les changements trop rapides de mois
- **Cleanup** : Nettoyer le cache des mois non utilisés

### Format monétaire
**Règles d'affichage** :
- **Séparateur de milliers** : Espace (ex: `50 000 €`)
- **Pas de fractions** : Entiers uniquement (ex: `50 000 €` pas `50 000,50 €`)
- **Devise** : Toujours affichée après le montant
- **Cohérence** : Même format partout (timeline, tableau, KPIs, modales)

### Base de données
Collection Firestore : `commercial_activities`

```typescript
interface CommercialActivity {
  id?: string;
  userId: string; // UID du commercial
  dateCreated: Date; // Date de saisie (auto)
  clientName: string; // Nom capitalisé
  contractNumber: string;
  effectDate: Date;
  actType: 'an' | 'm+3' | 'preterme_auto' | 'preterme_iard';
  productType: 'auto_moto' | 'iard_part' | 'iard_pro' | 'pj' | 'gav' | 'sante_prevoyance' | 'nop50eur' | 'vie_pp' | 'vie_pu';
  company: 'allianz' | 'unim_uniced' | 'courtage';
  annualPremium: number;
  potentialCommission: number; // Calculée auto
  isCommissionReal: boolean; // Calculée selon les règles
  month: string; // Format: "YYYY-MM" pour faciliter les requêtes
  year: number;
}
```

### Calculs automatiques
- **Commission potentielle** : Calculée selon le type de produit
- **Commission réelle** : Basée sur les 3 conditions de validation
- **Ratios et KPIs** : Mise à jour en temps réel à chaque saisie d'acte
- **Suivi par utilisateur** : Chaque acte rattaché à un userId pour éviter toute confusion

### Sécurité Firestore
**Règles de sécurité** :
- Lecture : Utilisateur authentifié peut lire ses propres données (`userId == request.auth.uid`)
- Écriture : Utilisateur authentifié peut créer/modifier ses propres données
- Suppression : Utilisateur authentifié peut supprimer ses propres données
- Isolation : Impossible d'accéder aux données d'autres utilisateurs

### Navigation et UX
- **Routes** : `/commercial` pour l'accès principal
- **Navigation mensuelle** : Sélecteur de mois/année
- **Responsive** : Adaptation mobile et desktop
- **Performance** : Pagination et filtrage côté serveur si nécessaire

### Navigation mensuelle - DÉTAILS IMPORTANTS
**Interface de navigation** :
- **Position** : Centrée entre l'en-tête et les KPIs
- **Design** : Card avec bordure, ombre et fond blanc/gris foncé
- **Boutons** : Flèches gauche/droite pour mois précédent/suivant
- **Affichage** : Mois et année en français (ex: "septembre 2025")
- **Bouton retour** : "Retour au mois actuel" sous le mois affiché

**Fonctionnement** :
- **Chargement automatique** : Les données se rechargent à chaque changement de mois
- **Format de requête** : `YYYY-MM` pour les requêtes Firestore
- **État persistant** : Le mois sélectionné reste en mémoire pendant la session
- **KPIs dynamiques** : Tous les KPIs se mettent à jour selon le mois sélectionné
- **Timeline** : Affiche uniquement les activités du mois sélectionné

**Comportement attendu** :
- **Clic précédent** : Mois -1, rechargement des données
- **Clic suivant** : Mois +1, rechargement des données  
- **Clic "Retour au mois actuel"** : Retour au mois courant, rechargement
- **Chargement** : Indicateur de chargement pendant les requêtes
- **Données vides** : Message "Aucune activité ce mois-ci" si pas de données

**Intégration avec les KPIs** :
- **CA du mois** : Calculé uniquement sur le mois sélectionné
- **Nombre de contrats** : Comptage du mois sélectionné
- **Commissions** : Potentielles et réelles du mois sélectionné
- **Ratio** : Calculé sur les données du mois sélectionné

### Bonnes pratiques implémentées
**Validation et sauvegarde** :
- Validation côté client avant sauvegarde
- Messages d'erreur spécifiques et clairs
- Sauvegarde avec bouton "Enregistrer" explicite
- Persistance des données en base après sauvegarde
- Confirmation visuelle de sauvegarde réussie

**Filtres et navigation** :
- Filtres persistants (localStorage) pour améliorer l'UX
- Combinaison de filtres possible
- Animation fluide lors du filtrage
- Bouton reset pour enlever tous les filtres
- Impact en temps réel sur timeline et tableau

**Composant Timeline réutilisable** :
- Props : `month`, `year`, `data`, `onDayClick`, `itemType`
- Support des différents types d'items selon le rôle
- Responsive avec adaptation mobile
- Factorisation pour autres modules du site

## Priorisation des développements

### Phase 1 - MVP
1. Interface de saisie basique
2. Calcul des commissions potentielles
3. Tableau des saisies
4. KPIs de base

### Phase 2 - Fonctionnalités avancées
1. Timeline interactive
2. Système de filtres
3. Calcul des commissions réelles
4. Export des données

### Phase 3 - Optimisations
1. Analytics avancées
2. Comparaisons période sur période
3. Notifications et alertes
4. Intégration avec le module commissions

---

*Document mis à jour le : $(date)*
*Version : 1.0*