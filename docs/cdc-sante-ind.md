# Cahier des charges - Module CDC Santé Individuelle

## Vue d'ensemble
Module simplifié de saisie d'actes santé individuelle pour les utilisateurs ayant le rôle `CDC_sante_ind`.

## Accès et navigation
- **Accès** : Bouton dans la sidebar pour les utilisateurs `CDC_sante_ind` (actuellement Kheira)
- **Design** : Cohérence avec le design global de l'application
- **Navigation** : 
  - Bouton retour vers le dashboard
  - Navigation mensuelle avec système de verrouillage

## Utilisateurs concernés
- **Actuel** : Kheira (rôle `CDC_sante_ind`)
- **Évolution** : D'autres utilisateurs pourront être ajoutés selon les besoins de l'agence

## Fonctionnalité principale

### Saisie d'actes uniquement
- **Objectif** : Permettre la saisie d'actes pour définir le CA brut, le CA pondéré et les commissions
- **Pas de gestion des clients** : Focus uniquement sur la saisie d'actes
- **Critère de déblocage** : Les commissions ne sont débloquées que si 4 révisions minimum dans le mois
- **KPIs de suivi** : Indicateurs pour suivre l'activité et les commissions

## Données à saisir par acte

### Informations de base
- **Type d'acte** : Sélection parmi les 5 types disponibles
- **Nom du client** : Saisie libre (capitalisation automatique)
- **Numéro de contrat** : Identifiant du contrat
- **Date d'effet** : Date de début de couverture
- **Prime annuelle** : Montant de la prime en euros (saisie manuelle, entiers avec séparateurs de milliers)
- **Prime pondérée** : Calculée automatiquement selon le coefficient du type d'acte (entiers avec séparateurs de milliers, affichage temps réel)
- **Date de saisie** : Automatique (date du jour), ne peut pas être modifiée

## Format des montants

### Règle générale
- **Tous les montants en euros** sont affichés en **entiers uniquement**
- **Séparateurs de milliers** : Espaces ou points selon les préférences locales
- **Exemples** : 1 500 €, 25 000 €, 150 000 €

### Application
- **Prime annuelle** : Saisie et affichage en entiers
- **Prime pondérée** : Calcul et affichage en entiers (arrondi automatique)
- **CA brut total** : Somme en entiers
- **CA pondéré total** : Somme en entiers
- **Commissions** : Calcul et affichage en entiers

## Règles de design professionnel

### Principes généraux
- **Modernité** : Interface contemporaine et épurée
- **Élégance** : Design sophistiqué sans surcharge visuelle
- **Professionnalisme** : Apparence sérieuse et crédible
- **Cohérence** : Harmonie avec le design global de l'application
- **Accessibilité** : Respect des standards WCAG 2.1 AA

### Palette de couleurs
- **Couleurs principales** :
  - Bleu Allianz : #0066CC (éléments principaux)
  - Vert succès : #10B981 (confirmations, seuils atteints)
  - Orange alerte : #F59E0B (alertes, proximité seuils)
  - Rouge erreur : #EF4444 (erreurs, seuils critiques)
  - Gris neutre : #6B7280 (textes secondaires)
- **Couleurs des actes** :
  - Affaire Nouvelle : Rouge foncé (#DC2626)
  - Révision : Marron (#92400E)
  - Adhésion salarié : Bleu (#2563EB)
  - COURT -> AZ : Violet (#7C3AED)
  - AZ -> Courtage : Indigo (#4F46E5)

### Typographie
- **Police principale** : Inter ou système sans-serif moderne
- **Hiérarchie** :
  - Titres : 24px, poids 700, couleur #1F2937
  - Sous-titres : 18px, poids 600, couleur #374151
  - Corps de texte : 14px, poids 400, couleur #4B5563
  - Labels : 12px, poids 500, couleur #6B7280
- **Espacement** : Ligne de 1.5 pour la lisibilité

### Composants UI
- **Boutons** :
  - Border-radius : 8px pour modernité
  - Padding : 12px 24px pour confort tactile
  - Transitions : 200ms ease-in-out
  - États : hover, active, disabled avec feedback visuel
- **Modals** :
  - Backdrop blur : 8px pour effet moderne
  - Shadow : 0 25px 50px -12px rgba(0, 0, 0, 0.25)
  - Border-radius : 16px pour élégance
  - Animation : fade-in + scale pour ouverture
- **Cartes KPIs** :
  - Shadow : 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  - Border-radius : 12px
  - Padding : 24px
  - Gradient subtil : background avec dégradé léger

### Icônes et illustrations
- **Style** : Icônes modernes et non dépassées
- **Interdiction** : Pas d'émojis, uniquement des icônes vectorielles professionnelles
- **Source** : Bibliothèques d'icônes modernes (Heroicons, Lucide, Feather)
- **Taille** : 20px pour actions, 24px pour KPIs
- **Couleurs** : Cohérentes avec la palette
- **Animation** : Micro-interactions subtiles (rotation, scale)

### Espacement et layout
- **Grid system** : 8px base unit
- **Marges** : 16px, 24px, 32px selon l'importance
- **Padding** : 12px, 16px, 24px pour les composants
- **Responsive** : Breakpoints 768px, 1024px, 1280px

### Animations et transitions
- **Durée** : 200ms pour micro-interactions, 300ms pour transitions
- **Easing** : ease-in-out pour naturel
- **Hover effects** : Scale 1.02, shadow enhancement
- **Loading states** : Skeleton screens pour chargement

### Spécifications techniques
- **Framework CSS** : Tailwind CSS pour cohérence
- **Composants** : Design system unifié
- **Responsive** : Mobile-first approach
- **Performance** : Optimisation des animations (60fps)
- **Accessibilité** : Focus visible, contrastes respectés
- **Dark mode** : Support du mode sombre (optionnel) - pas trop austère, couleurs chaleureuses
  - Fond principal : #1F2937 (gris chaud)
  - Fond secondaire : #374151 (gris moyen)
  - Texte principal : #F9FAFB (blanc cassé)
  - Accents : Couleurs des actes maintenues mais assombries

### Guidelines d'implémentation
- **Consistance** : Même composant = même style
- **Réutilisabilité** : Composants modulaires
- **Maintenabilité** : Code CSS organisé et documenté
- **Tests** : Validation visuelle sur différents écrans
- **Performance** : Lazy loading des animations complexes
- **Interdictions** : Pas d'émojis, pas d'icônes dépassées, pas de couleurs criardes

## Interface utilisateur

### Organisation de la page (comme CDC Commercial)

> **Note importante** : Toutes les données affichées (actes, KPIs, tableau) sont soumises à la navigation mensuelle et se mettent à jour automatiquement selon le mois sélectionné.

#### 1. Navigation mensuelle
- **Sélecteur de mois** : Navigation entre les mois (précédent/suivant)
- **Mois actuel** : Bouton pour revenir au mois en cours
- **Affichage** : Format "Septembre 2025"
- **Persistance** : Mémorisation du mois sélectionné
- **Impact global** : Toutes les données (actes, KPIs, tableau) sont filtrées par le mois sélectionné

#### Système de verrouillage des mois
- **Cadenas vert ouvert** : Indicateur visuel du statut du mois
- **Mois déverrouillé** : Cadenas vert ouvert - modifications autorisées
- **Mois verrouillé** : Cadenas fermé - modifications bloquées
- **Gestion admin** : Fonctionnalité réservée aux administrateurs
- **Blocage/Déblocage** : Possibilité de verrouiller/déverrouiller un mois
- **Impact** : Empêche les modifications une fois le mois verrouillé

#### 2. KPIs (Indicateurs clés de performance)
- **Affichage en cartes** : Design moderne avec icônes
- **Calculs automatiques** : Mise à jour en temps réel
- **Format monétaire** : Séparateurs de milliers, entiers uniquement
- **Position** : En haut de page, sous la navigation

#### 3. Rappel des règles de calcul
- **Section informative** : Règles de calcul des commissions
- **Tranches de commission** : Affichage des seuils
- **Coefficients par type d'acte** : Tableau récapitulatif
- **Critère des 4 révisions** : Explication du déblocage des commissions

#### 4. Saisie des actes
- **Boutons cliquables et colorés** : Design cohérent avec le module commercial
- **5 types d'actes** :
  1. **Affaire Nouvelle** (fond rouge foncé #DC2626)
  2. **Révision** (fond marron #92400E)
  3. **Adhésion salarié** (fond bleu #2563EB)
  4. **COURT -> AZ** (fond violet #7C3AED)
  5. **AZ -> Courtage** (fond indigo #4F46E5)
- **Modal de saisie** : Formulaire pré-rempli selon le type d'acte
- **Date automatique** : Pré-remplissage avec la date du jour

#### 5. Filtres
- **Filtrage par type d'acte** : Sélection multiple
- **Filtrage par période** : Date de saisie, date d'effet
- **Recherche** : Par nom de client, numéro de contrat
- **Reset** : Bouton pour réinitialiser les filtres

#### 6. Timeline
- **Chronologie des actes** : Affichage temporel des saisies par jour du mois
- **Visualisation** : Cercles colorés représentant chaque jour du mois
- **Couleurs des jours** :
  - Vert : Lundi-Vendredi (jours ouvrés)
  - Orange : Samedi
  - Rouge : Dimanche
  - Bordure blanche épaisse : Jour actuel (aujourd'hui)
- **Contenu des cercles** : Nombre total d'actes saisis ce jour
- **Tooltip au survol** : 
  - Date et jour de la semaine
  - Nombre total d'actes
  - Répartition par type d'acte (AN, Révisions, etc.)
  - Indication "Aujourd'hui" si c'est le jour actuel
- **Modal de détail** : Clic sur un cercle pour voir la liste complète des actes du jour
- **Filtrage** : Intégration avec les filtres principaux (type d'acte, période)
- **Responsive** : Adaptation mobile avec cercles plus petits

#### 7. Tableau récapitulatif
- **Données saisies** : Affichage de tous les actes saisis du mois sélectionné
- **Mise à jour automatique** : Chaque acte saisi apparaît immédiatement dans le tableau
- **Colonnes** :
  - Type d'acte
  - Nom du client
  - Numéro de contrat
  - Date d'effet
  - Date de saisie (automatique)
  - Prime annuelle (CA brut - saisie manuelle, entiers avec séparateurs de milliers)
  - Prime pondérée (CA pondéré - calculée automatiquement, entiers avec séparateurs de milliers)
  - Commission (selon les tranches, entiers avec séparateurs de milliers)
- **Tri et filtrage** : Fonctionnalités de recherche par type d'acte
- **Actions** : Modification/suppression des entrées

### Fonctionnement détaillé de la Timeline

#### Principe de fonctionnement
- **Génération automatique** : Création d'un cercle pour chaque jour du mois sélectionné
- **Données en temps réel** : Mise à jour automatique lors de l'ajout/suppression d'actes
- **Filtrage intégré** : Les cercles se mettent à jour selon les filtres actifs

#### Interface utilisateur
- **Layout** : Cercles disposés horizontalement avec espacement uniforme
- **Taille** : 48px (w-12 h-12) sur desktop, plus petits sur mobile
- **Animation** : Hover avec scale 1.1 et shadow enhancement
- **Loading state** : Skeleton avec cercles animés pendant le chargement

#### Système de couleurs
- **Logique métier** : Couleurs basées sur le type de jour (ouvré/week-end)
- **Indicateur spécial** : Bordure blanche épaisse pour le jour actuel
- **Accessibilité** : Contraste respecté pour tous les états

#### Interactions
- **Tooltip** : Informations détaillées au survol
- **Modal** : Liste complète des actes du jour sélectionné
- **Responsive** : Adaptation tactile sur mobile

#### Intégration avec les filtres
- **Réactivité** : Mise à jour immédiate des cercles selon les filtres
- **Cohérence** : Même logique de filtrage que le tableau
- **Performance** : Calcul optimisé avec useMemo

### Modal de saisie d'acte

#### Informations à saisir
- **Nom de l'acte** : Pré-rempli selon le bouton cliqué
- **Nom du client** : Saisie libre
- **Numéro de contrat** : Saisie libre
- **Date d'effet** : Date picker
- **Prime annuelle** : Montant en euros (saisie manuelle, entiers avec séparateurs de milliers)
- **Date de saisie** : Automatique (date du jour), non modifiable

#### Calcul automatique
- **Prime pondérée** : Calculée automatiquement selon le coefficient du type d'acte (entiers avec séparateurs de milliers)
- **Formule** : Prime annuelle × Coefficient
- **Affichage temps réel** : La prime pondérée s'affiche dès que le type d'acte et la prime annuelle sont renseignés

#### Coefficients par type d'acte
- **Affaire Nouvelle** : 100% (coefficient 1.0)
- **Révision** : 50% (coefficient 0.5)
- **Adhésion salarié** : 50% (coefficient 0.5)
- **COURT -> AZ** : 75% (coefficient 0.75)
- **AZ -> Courtage** : 50% (coefficient 0.5)

### Système de commissions

#### Calcul des commissions
- **Base de calcul** : CA pondéré (prime pondérée)
- **Application** : Pourcentage appliqué depuis le 1er euro de prime pondérée
- **Exemple** : Si dans la tranche 3%, commission = 3% × CA pondéré total

#### Tranches de commission
- **Seuil 1** : < 10.000 € → 0%
- **Seuil 2** : < 14.000 € → 2%
- **Seuil 3** : < 18.000 € → 3%
- **Seuil 4** : < 22.000 € → 4%
- **Seuil 5** : ≥ 22.000 € → 6%

#### Alertes de seuils de commissions
- **Calcul automatique** : Montant manquant pour le seuil suivant
- **Exemples d'alertes** :
  - "Il manque 3 200€ pour atteindre le seuil 2% (14 000€)"
  - "Il manque 1 500€ pour atteindre le seuil 4% (22 000€)"
  - "Seuil 6% atteint ! (22 000€+)"
- **Couleurs** : Rouge si loin, orange si proche, vert si atteint

#### Critère de révision
- **Seuil 3** : Critère de révision (indicateur spécial)

#### Critère qualitatif pour débloquer les commissions
- **Condition obligatoire** : Au moins 4 révisions dans le mois
- **Application** : Les commissions ne sont débloquées que si ce critère est respecté
- **Comptage** : Seules les révisions comptent pour ce critère
- **Impact** : Si moins de 4 révisions → Commission potentielle = 0€

#### 2. KPIs (Indicateurs clés de performance)
- **Affichage en cartes** : Design moderne avec icônes
- **Calculs automatiques** : Mise à jour en temps réel
- **Format monétaire** : Séparateurs de milliers, entiers uniquement
- **Position** : En haut de page, sous la navigation

##### KPIs à afficher
- **Total des actes** : Nombre total d'actes saisis dans le mois
- **Répartition par type** :
  - Nombre d'Affaires Nouvelles
  - Nombre de Révisions
  - Nombre d'Adhésions salarié
  - Nombre de COURT -> AZ
  - Nombre d'AZ -> Courtage
- **CA brut total** : Somme de toutes les primes annuelles du mois (entiers avec séparateurs de milliers)
- **CA pondéré total** : Somme de toutes les primes pondérées du mois (entiers avec séparateurs de milliers)
- **Commission potentielle** : Calculée selon les tranches (entiers avec séparateurs de milliers)
- **Commission réelle** : Débloquée si ≥ 4 révisions, sinon 0€ (entiers avec séparateurs de milliers)
- **Critère révisions** : Nombre de révisions / 4 (objectif) avec indicateur visuel

### Confirmations et alertes CRUD

#### Design cohérent
- **Style uniforme** : Cohérence avec le design global de l'application
- **Couleurs** : Utilisation de la palette de couleurs existante
- **Icônes** : Icônes modernes et non dépassées
- **Animations** : Transitions fluides et professionnelles

#### Opérations avec confirmations
- **Création d'acte** : 
  - Confirmation de succès avec icône verte
  - Message : "Acte créé avec succès"
  - Auto-fermeture après 3 secondes
- **Modification d'acte** :
  - Confirmation de succès avec icône verte
  - Message : "Acte modifié avec succès"
  - Auto-fermeture après 3 secondes
- **Suppression d'acte** :
  - Modal de confirmation avec icône d'alerte orange
  - Message : "Êtes-vous sûr de vouloir supprimer cet acte ?"
  - Boutons : "Annuler" (gris) et "Supprimer" (rouge)
  - Confirmation de suppression avec icône verte

#### Alertes d'erreur
- **Erreur de saisie** :
  - Alertes en rouge avec icône d'erreur
  - Messages clairs et explicites
  - Positionnement cohérent (toast ou inline)
- **Erreur de validation** :
  - Validation en temps réel
  - Messages d'erreur sous les champs concernés
  - Style cohérent avec le reste de l'interface

#### Notifications système
- **Sauvegarde automatique** : Indicateur discret de sauvegarde
- **Connexion perdue** : Alerte de reconnexion
- **Synchronisation** : Indicateur de synchronisation des données

#### Alertes de seuils
- **Seuils de commissions** :
  - Indication du montant manquant pour atteindre le seuil suivant
  - Exemple : "Il manque 2 500€ pour atteindre le seuil 4% (22 000€)"
  - Couleur : Orange pour proximité, vert pour atteint
- **Critère des 4 révisions** :
  - Compteur en temps réel : "3/4 révisions" avec barre de progression
  - Alerte si < 4 révisions : "Il manque X révisions pour débloquer les commissions"
  - Indicateur visuel : Rouge si < 4, orange si = 3, vert si ≥ 4
- **Objectifs mensuels** :
  - Alertes de proximité des seuils importants
  - Suggestions d'actions pour optimiser les commissions

## Résumé des fonctionnalités

### Ce qui est inclus
- ✅ **Saisie d'actes** : 5 types d'actes avec modal de saisie
- ✅ **Navigation mensuelle** : Sélecteur de mois avec système de verrouillage
- ✅ **Calculs automatiques** : CA brut, CA pondéré, commissions
- ✅ **KPIs de suivi** : Indicateurs temps réel avec critère des 4 révisions
- ✅ **Tableau récapitulatif** : Affichage de tous les actes du mois
- ✅ **Critère de déblocage** : Commissions débloquées uniquement si ≥ 4 révisions
- ✅ **Confirmations et alertes** : Design cohérent pour toutes les opérations CRUD
- ✅ **Alertes de seuils** : Indications des montants manquants pour les seuils de commissions et révisions
- ✅ **Design professionnel** : Règles de design moderne, élégant et professionnel

### Ce qui n'est PAS inclus
- ❌ **Gestion des clients** : Pas de base de données clients
- ❌ **Historique des contrats** : Pas de suivi des modifications
- ❌ **Communication clients** : Pas de suivi des échanges
- ❌ **Renouvellements** : Pas de gestion des échéances
- ❌ **Intégrations externes** : Pas de connexion API Allianz
- ❌ **Export/Reporting** : Pas de génération de rapports

## Règles de validation

### Validation des données
- **Nom du client** : Obligatoire, minimum 2 caractères
- **Numéro de contrat** : Obligatoire, format libre
- **Date d'effet** : Obligatoire, ne peut pas être dans le futur
- **Prime annuelle** : Obligatoire, minimum 1€, maximum 1 000 000€
- **Types d'actes** : Sélection obligatoire parmi les 5 types

### Contraintes métier
- **Unicité** : Pas de doublons sur le même mois (même client + même contrat)
- **Cohérence** : La date d'effet doit être dans le mois sélectionné
- **Limites** : Maximum 1000 actes par mois par utilisateur

## Gestion des erreurs

### Erreurs de saisie
- **Champs obligatoires** : Validation en temps réel
- **Format des montants** : Validation numérique uniquement
- **Dates** : Validation du format et de la cohérence
- **Doublons** : Détection automatique des doublons

### Erreurs système
- **Connexion perdue** : Sauvegarde locale et synchronisation différée
- **Erreur de calcul** : Recalcul automatique des KPIs
- **Erreur de sauvegarde** : Retry automatique avec notification

## Performance et accessibilité

### Performance
- **Temps de chargement** : < 2 secondes pour l'affichage initial
- **Calculs en temps réel** : Mise à jour instantanée des KPIs
- **Optimisation** : Pagination du tableau si > 100 actes
- **Cache** : Mise en cache des données pour navigation rapide entre mois

### Accessibilité
- **Navigation clavier** : Support complet de la navigation au clavier
- **Contraste** : Respect des standards WCAG 2.1 AA
- **Lecteurs d'écran** : Labels et descriptions appropriés
- **Responsive** : Adaptation mobile et tablette

## Support et maintenance

### Contact technique
- **Email** : jm.nogaro@allianz.fr
- **Téléphone** : +33 6 08 18 33 38
- **Disponibilité** : Du lundi au vendredi, 9h-18h

---

*Document créé le : Décembre 2024*  
*Version : 2.0 - Simplifié*  
*Dernière mise à jour : Décembre 2024*
