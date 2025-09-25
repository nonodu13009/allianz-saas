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

## Interface utilisateur

### Structure de la page principale

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

#### 2. Boutons de saisie d'activité
- **Boutons colorés** : Design cohérent avec le module commercial
- **5 types d'actes** :
  1. **Affaire Nouvelle** (fond rouge foncé)
  2. **Révision** (fond marron)
  3. **Adhésion salarié** (fond bleu)
  4. **COURT -> AZ** (fond violet)
  5. **AZ -> Courtage** (fond à définir)
- **Modal de saisie** : Formulaire pré-rempli selon le type d'acte
- **Date automatique** : Pré-remplissage avec la date du jour

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

#### 3. KPIs (Indicateurs clés de performance)
- **Affichage en cartes** : Design moderne avec icônes
- **Calculs automatiques** : Mise à jour en temps réel
- **Format monétaire** : Séparateurs de milliers, entiers uniquement

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

#### 4. Tableau récapitulatif
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
