## CDC Santé Collective — Suivi de la production (navigation mensuelle)

### Contexte
Document vivant. Outil de déclaration et de suivi de la production « Santé Collective », réservé au rôle `CDC_sante_coll` (ex. Karen Chollet). S'inspire du module « Santé Individuelle » pour l'UX: timeline mensuelle, filtres, info-bulles (i) cohérentes.

### État actuel : **EN CONSTRUCTION** 🚧

Le module CDC Santé Collective est actuellement en cours de développement. Les utilisateurs avec le rôle `cdc_sante_coll` voient un message "Module en construction" sur le dashboard.

### Fichiers impactés **À DÉVELOPPER** 📋

#### Pages et Routes
- `src/app/dashboard/sante-collective/page.tsx` — **À DÉVELOPPER** : Page principale CDC Santé Collective avec navigation mensuelle
- `src/app/dashboard/sante-collective/simple/page.tsx` — **À DÉVELOPPER** : Version simplifiée pour tests
- `src/app/dashboard/sante-collective/test/page.tsx` — **À DÉVELOPPER** : Page de test pour validation

#### Composants UI
- `src/components/sante-coll/ModalActe.tsx` — **À DÉVELOPPER** : Modale générique pour les 10 types d'actes commerciaux
- `src/components/sante-coll/ModalActeSimple.tsx` — **À DÉVELOPPER** : Version simplifiée de la modale
- `src/components/sante-coll/SanteCollButtons.tsx` — **À DÉVELOPPER** : Bouton unique "Nouvel acte" avec effets visuels
- `src/components/sante-coll/SanteCollTable.tsx` — **À DÉVELOPPER** : Tableau de production avec tri et actions
- `src/components/sante-coll/SanteCollKPIs.tsx` — **À DÉVELOPPER** : KPIs mensuels avec calculs de commissions et info-bulles
- `src/components/sante-coll/SanteCollTimeline.tsx` — **À DÉVELOPPER** : Timeline colorée mensuelle avec navigation
- `src/components/sante-coll/CommissionProgressChart.tsx` — **À DÉVELOPPER** : Graphique de progression des commissions
- `src/components/sante-coll/SanteCollFilters.tsx` — **À DÉVELOPPER** : Filtres par origine et nature d'acte
- `src/components/sante-coll/index.ts` — **À DÉVELOPPER** : Export centralisé des composants

#### Services et Logique Métier
- `src/lib/sante-coll-service.ts` — **À DÉVELOPPER** : Service unifié avec singleton pattern
- `src/lib/sante-coll.ts` — **À DÉVELOPPER** : Fonctions utilitaires pour calculs et normalisation
- `src/types/sante-coll.ts` — **À DÉVELOPPER** : Types TypeScript complets pour Santé Collective

#### Hooks et Contextes
- `src/hooks/use-sante-coll-activities.ts` — **À DÉVELOPPER** : Hook personnalisé pour gestion des activités
- `src/components/auth/sante-coll-route-guard.tsx` — **À DÉVELOPPER** : Garde de route avec vérification des rôles

#### API Routes
- `src/app/api/sante-coll-activities/route.ts` — **À DÉVELOPPER** : API GET/POST pour les activités
- `src/app/api/sante-coll-activities/[id]/route.ts` — **À DÉVELOPPER** : API GET/PUT pour les activités individuelles
- `src/app/api/sante-coll-activities/lock/route.ts` — **À DÉVELOPPER** : API pour le système de verrouillage mensuel

---

## Fonctionnalités principales **À DÉVELOPPER** 📋

### Accès et rôles **À DÉVELOPPER** 📋
- **Garde de route** : `SanteCollRouteGuard` vérifiera le rôle `cdc_sante_coll` ou `administrateur`
- **Redirection automatique** : Si rôle invalide → page d'accès refusé avec message explicite
- **Point d'entrée** : Bouton « Santé collective » dans la sidebar du dashboard (visible uniquement pour `cdc_sante_coll`)
- **Double authentification** : Rôle utilisateur + accès Firebase obligatoire
- **Vérification API** : Toutes les routes API vérifieront l'authentification Firebase et le rôle utilisateur
- **Collection Firebase** : `sante_coll_activities` pour la persistance des données

### Navigation mensuelle (timeline + filtres) **À DÉVELOPPER** 📋
- **Navigation mensuelle** : `SanteCollTimeline` avec contrôles précédent/suivant
- **Timeline colorée** : Calendrier mensuel avec couleurs selon jour de la semaine
  - Dimanche: rouge vif
  - Samedi: orange vif
  - Autres jours: vert vif
- **Pastilles interactives** : Compte d'activités par jour avec effet focus sur sélection
- **Mois par défaut** : Affichage automatique du mois courant au chargement
- **Pilotage centralisé** : Le mois sélectionné pilote toutes les données (tableau, KPIs, timeline)
- **Hook dédié** : `useSanteCollActivities` gérera la navigation et la synchronisation

### Filtres avancés **À DÉVELOPPER** 📋
- **Composant** : `SanteCollFilters` avec interface intuitive
- **Filtres disponibles** :
  - **Origine** : Tous | Proactif | Réactif | Prospection
  - **Nature de l'acte** : Filtrage par type d'acte (10 types disponibles)
  - **Jour** : Filtrage par jour du mois
- **Bouton Reset** : Efface tous les filtres appliqués
- **Persistance** : Les filtres sont mémorisés pendant la session

### Bouton de saisie **À DÉVELOPPER** 📋
- **Composant** : `SanteCollButtons` avec un seul bouton "Nouvel acte"
- **Design** : Bouton flashy avec effets visuels cohérents avec les autres modules
- **Action** : Ouverture de la modale `ModalActe` au clic
- **État** : Désactivation si le mois est verrouillé

### Modale — contenu **À DÉVELOPPER** 📋
- **Composant** : `ModalActe` avec interface adaptative selon le type d'acte
- **Champs communs** :
  - `Date de saisie` (automatique, non éditable, format ISO)
  - `Nature de l'acte` (select obligatoire) : 10 types d'actes disponibles
  - `Origine` (select obligatoire) : Proactif | Réactif | Prospection
  - `Compagnie` (select obligatoire) : Allianz | Courtage
  - `Nom du client` (capitalisation intelligente à l'enregistrement)
  - `N° de contrat` (validation obligatoire)
  - `Prime brute` (entier en euros, validation positive)
  - `Prime pondérée` (calculé automatiquement selon l'origine, affiché en temps réel)

### Types d'actes commerciaux (10 types) **À DÉVELOPPER** 📋
- **Collective** :
  - `coll an santé` - Assurance collective santé
  - `coll an prev` - Assurance collective prévoyance
  - `coll an retraite` - Assurance collective retraite
  - `coll adhésion / renfort` - Adhésion ou renfort collectif
  - `coll révision` - Révision collective
- **Individuelle** :
  - `ind an santé` - Assurance individuelle santé
  - `ind an prev` - Assurance individuelle prévoyance
  - `ind an retraite` - Assurance individuelle retraite
- **Courtage** :
  - `courtage → allianz (ind & coll)` - Transfert courtage vers Allianz
  - `allianz → court (ind & coll)` - Transfert Allianz vers courtage

### Grille de pondération (Prime → Prime pondérée) **À DÉVELOPPER** 📋
- **Service** : `SanteCollService.calculatePrimePonderee()` avec constante `PONDERATION_RATES`
- **Taux appliqués selon l'origine** :
  - Proactif: 100% (`1.00`)
  - Réactif: 50% (`0.50`)
  - Prospection: 120% (`1.20`)
- **Formule** : `primePonderee = Math.round(primeBrute * taux)` avec arrondi automatique
- **Validation** : Calcul automatique à la saisie et à l'enregistrement

### Info-bulles (i) **À DÉVELOPPER** 📋
- **Composant** : Info-bulles intégrées dans `SanteCollKPIs` et `ModalActe`
- **Icône** : (i) visible sur chaque KPI et champs sensibles de la modale
- **Contenu** : Texte concis expliquant la logique métier
  - "Prime pondérée = Prime brute x Taux selon Origine"
  - "Commission = CA pondéré x Taux selon seuil atteint"
  - "Prospection = +20% de pondération vs Proactif"
- **Design** : Tooltip moderne avec animation et positionnement intelligent

### KPI mensuels **À DÉVELOPPER** 📋
- **Composant** : `SanteCollKPIs` avec calculs en temps réel et info-bulles
- **Données affichées** :
  - Nombre d'actes du mois (avec répartition par type)
  - CA brut (somme des primes brutes)
  - CA pondéré (somme des primes pondérées)
  - Commissions estimées du mois (selon barème)
  - Répartition par origine (Proactif/Réactif/Prospection)
  - Répartition par compagnie (Allianz/Courtage)
- **Service** : `SanteCollService.calculateKPIs()` avec calculs automatiques
- **Mise à jour** : Automatique lors des modifications d'activités

### Barème commissions (sur CA pondéré du mois) **À DÉVELOPPER** 📋
- Seuil 1: `0 → 6 000 €` → 0 %
- Seuil 2: `6 001 → 10 000 €` → 2 %
- Seuil 3: `10 001 → 14 000 €` → 3 %
- Seuil 4: `14 001 → 18 000 €` → 4 %
- Seuil 5: `≥ 18 001 €` → 6 %

Règle: si la production pondérée du mois atteint un seuil, le taux s’applique « dès le 1er euro » sur tout le mois.
- Ex.: 15 000 € → 4 % sur 15 000 €.
- Ex.: 3 000 € → 0 %.
- Ex.: 23 000 € → 6 % sur 23 000 €.

### Tableau de production **À DÉVELOPPER** 📋
- **Composant** : `SanteCollTable` avec interface responsive et moderne
- **Colonnes affichées** :
  - `Jour`, `Nature de l'acte`, `Origine`, `Compagnie`, `Nom client`, `N° contrat`, `Prime brute`, `Prime pondérée`
  - Colonne actions avec boutons édition/suppression
- **Fonctionnalités CRUD** :
  - **Create** : Via modale `ModalActe` avec validation complète
  - **Read** : Tableau avec tri par colonnes et filtres avancés
  - **Update** : Édition en place tant que le mois n'est pas verrouillé
  - **Delete** : Suppression avec modal de confirmation
- **Système de verrouillage** :
  - Indicateur visuel de statut (vert = ouvert, rouge = bloqué)
  - Désactivation des actions de modification si mois verrouillé
  - Gestion via API `/api/sante-coll-activities/lock`

### Verrouillage mensuel (administrateur) **À DÉVELOPPER** 📋
- **Fonctionnement identique** aux autres modules CDC
- **Effet côté CDC** : Si le mois M est verrouillé, toutes les modifications sont désactivées sur M
- **Contexte paie** : Commissions déterminent une partie du salaire
- **Sécurité** : Aucune modification ultérieure possible une fois verrouillé

---

## État d'implémentation actuel : **EN CONSTRUCTION** 🚧

### Interface actuelle
- **Message d'information** : Les utilisateurs avec le rôle `cdc_sante_coll` voient un message "Module en construction"
- **Design cohérent** : Interface intégrée dans le dashboard principal
- **Message informatif** : Indication claire que le module sera bientôt disponible

### Fonctionnalités prévues (à développer)
- **Timeline colorée** : Calendrier mensuel avec couleurs selon jour de la semaine
- **10 types d'actes** : Coll AN Santé, Coll AN Prévoyance, Coll AN Retraite, etc.
- **Origine avec pondération** : Proactif (100%), Réactif (50%), Prospection (120%)
- **KPIs mensuels** : Production brute/pondérée, commissions, volumes par type
- **Filtres avancés** : Par origine et nature d'acte
- **Tableau de production** : CRUD complet avec verrouillage mensuel

### Checklist de développement (CDC Santé Collective) 📋
- [ ] Créer les types TypeScript pour Santé Collective
- [ ] Développer les fonctions utilitaires (calculs, capitalisation)
- [ ] Créer la modale générique pour tous les types d'actes
- [ ] Implémenter le tableau de production avec filtres
- [ ] Développer les KPIs mensuels avec info-bulles
- [ ] Créer la timeline colorée avec navigation mensuelle
- [ ] Intégrer le module dans le dashboard principal
- [ ] **Créer les API routes avec double authentification** :
  - [ ] `GET /api/sante-coll-activities/month?yearMonth=YYYY-MM`
  - [ ] `POST /api/sante-coll-activities/month?yearMonth=YYYY-MM`
  - [ ] `PATCH /api/sante-coll-activities/[id]`
  - [ ] `DELETE /api/sante-coll-activities/[id]`
- [ ] **Implémenter la vérification des rôles** : `cdc_sante_coll`, `santé collective`, `sante collective`
- [ ] **Créer la collection Firebase** : `sante_coll_activities`
- [ ] Tester et valider toutes les fonctionnalités

---

## Architecture Technique **À DÉVELOPPER** 📋

### Services et Logique Métier
- **`SanteCollService`** : Service singleton avec pattern de validation unifié
  - Validation des données avec messages d'erreur détaillés
  - Normalisation et capitalisation intelligente des noms clients
  - Calculs automatiques (Prime pondérée, commissions, KPIs)
  - Gestion des verrouillages mensuels
  - Support des 10 types d'actes commerciaux
- **`useSanteCollActivities`** : Hook React pour la gestion d'état
  - Synchronisation automatique avec Firebase
  - Navigation mensuelle fluide avec timeline colorée
  - Gestion des filtres avancés (origine, nature, jour)
  - Actualisation automatique des KPIs

### Base de Données Firebase
- **Collection `sante_coll_activities`** : Stockage des activités avec timestamps
- **Collection `sante_coll_locks`** : Gestion des verrouillages mensuels
- **Indexes** : Optimisés pour les requêtes par mois, utilisateur, origine et type
- **Sécurité** : Règles Firestore avec vérification des rôles `cdc_sante_coll`

### Interface Utilisateur
- **Design System** : Composants UI cohérents avec Tailwind CSS
- **Timeline colorée** : Calendrier mensuel avec couleurs selon jour de la semaine
- **Info-bulles** : Tooltips explicatifs sur les KPIs et champs sensibles
- **Responsive** : Adaptation mobile/desktop avec breakpoints
- **Accessibilité** : Labels, ARIA, navigation au clavier

### Types de Données Spécifiques
- **10 types d'actes** : Collective (5), Individuelle (3), Courtage (2)
- **3 origines** : Proactif (100%), Réactif (50%), Prospection (120%)
- **2 compagnies** : Allianz, Courtage
- **Barème commissions** : 5 seuils de 0% à 6% selon CA pondéré

### API Routes à développer
- `GET /api/sante-coll-activities?yearMonth=YYYY-MM&userId=xxx` : Charger les activités d'un mois
- `POST /api/sante-coll-activities` : Créer une nouvelle activité
- `GET /api/sante-coll-activities/[id]` : Récupérer une activité par ID
- `PUT /api/sante-coll-activities/[id]` : Modifier une activité existante
- `GET /api/sante-coll-activities/lock?yearMonth=YYYY-MM` : Vérifier le statut de verrouillage

**Sécurité** : Toutes les routes vérifieront l'authentification Firebase et le rôle `cdc_sante_coll`.

---

## Conclusion

Le module CDC Santé Collective est **prêt pour le développement** selon les spécifications détaillées ci-dessus. La documentation complète permet de développer un module cohérent avec l'architecture du CDC Santé Individuelle.

### 🎯 Spécificités du CDC Santé Collective
- **10 types d'actes** : Collective (5), Individuelle (3), Courtage (2)
- **Timeline colorée** : Calendrier avec couleurs selon jour de la semaine
- **Pondération par origine** : Proactif (100%), Réactif (50%), Prospection (120%)
- **Barème commissions** : 5 seuils spécifiques (0-6%) selon CA pondéré
- **Info-bulles** : Explications contextuelles sur les KPIs et calculs

### 🏗️ Architecture de développement
- **Structure identique** au CDC Santé Individuelle pour la cohérence
- **Services dédiés** : `SanteCollService` et `useSanteCollActivities`
- **Composants spécialisés** : Timeline colorée, filtres avancés, info-bulles
- **Sécurité renforcée** : Double authentification + vérification des rôles

### 📋 Prochaine étape
**Développement complet** du module selon cette documentation, en s'inspirant de l'architecture sécurisée et éprouvée du module CDC Santé Individuelle.

**Utilisateur cible** : Karen Chollet (rôle `cdc_sante_coll`) et autres utilisateurs Santé Collective.