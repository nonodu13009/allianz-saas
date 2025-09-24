# Cahier des charges - Module CDC Santé Individuelle

## Vue d'ensemble
Module de gestion et de suivi des activités santé individuelle pour les utilisateurs ayant le rôle `CDC_sante_ind`.

## Accès et navigation
- **Accès** : Bouton dans la sidebar pour les utilisateurs `CDC_sante_ind` (actuellement Kheira, d'autres utilisateurs pourront être ajoutés)
- **Design** : Cohérence avec le design global de l'application
- **Navigation** : 
  - Bouton retour vers le dashboard
  - Navigation intuitive entre les différentes sections

## Utilisateurs concernés
- **Actuel** : Kheira (rôle `CDC_sante_ind`)
- **Évolution** : D'autres utilisateurs pourront être ajoutés selon les besoins de l'agence

## Fonctionnalités principales

### 1. Gestion des contrats santé individuelle
- **Saisie de nouveaux contrats** : Formulaire complet pour l'enregistrement des contrats santé
- **Suivi des contrats existants** : Consultation et modification des contrats en cours
- **Historique des modifications** : Traçabilité des changements apportés aux contrats

### 2. Suivi des commissions
- **Calcul automatique** : Calcul des commissions selon les barèmes Allianz
- **Suivi mensuel** : Tableau de bord des commissions par mois
- **Historique** : Consultation des commissions passées

### 3. Gestion des clients
- **Base de données clients** : Fiche client complète avec historique
- **Communication** : Suivi des échanges avec les clients
- **Renouvellements** : Alertes et gestion des échéances

### 4. Reporting et analytics
- **Tableaux de bord** : KPIs spécifiques à la santé individuelle
- **Rapports mensuels** : Génération automatique des rapports d'activité
- **Analyses de performance** : Suivi des objectifs et indicateurs

## Données à saisir

### Informations contrat
- **Numéro de contrat** : Identifiant unique du contrat
- **Nom du client** : Capitalisation automatique, gestion des noms composés
- **Date de souscription** : Date de signature du contrat
- **Date d'effet** : Date de début de couverture
- **Date d'échéance** : Date de fin de contrat (si applicable)

### Informations produit
- **Type de garantie** : Hospitalisation, médecine de ville, dentaire, optique, etc.
- **Niveau de garantie** : Standard, Confort, Premium
- **Franchise** : Montant de la franchise applicable
- **Taux de remboursement** : Pourcentage de remboursement

### Informations financières
- **Prime annuelle** : Montant de la prime
- **Mode de paiement** : Mensuel, trimestriel, semestriel, annuel
- **Commission** : Calcul automatique selon les barèmes
- **Frais de gestion** : Frais applicables

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
- **Prime annuelle** : Montant en euros

#### Calcul automatique
- **Prime pondérée** : Calculée automatiquement selon le coefficient du type d'acte
- **Formule** : Prime annuelle × Coefficient

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

#### Critère de révision
- **Seuil 3** : Critère de révision (indicateur spécial)

#### Critère qualitatif pour débloquer les commissions
- **Condition obligatoire** : Au moins 4 révisions dans le mois
- **Application** : Les commissions ne sont débloquées que si ce critère est respecté
- **Comptage** : Seules les révisions comptent pour ce critère

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
- **CA pondéré total** : Somme de tous les CA pondérés du mois
- **Commission potentielle** : Calculée selon les tranches
- **Commission réelle** : Débloquée si ≥ 4 révisions
- **Critère révisions** : Nombre de révisions / 4 (objectif)

#### 4. Tableau récapitulatif
- **Données saisies** : Affichage de tous les actes saisis du mois sélectionné
- **Mise à jour automatique** : Chaque acte saisi apparaît immédiatement dans le tableau
- **Colonnes** :
  - Type d'acte
  - Nom du client
  - Numéro de contrat
  - Date d'effet
  - Prime annuelle
  - Prime pondérée (calculée automatiquement)
  - Commission (selon les tranches)
- **Tri et filtrage** : Fonctionnalités de recherche
- **Actions** : Modification/suppression des entrées

### Navigation
- **Menu latéral** : Accès aux différentes sections
- **Breadcrumb** : Indication de la position dans l'application
- **Recherche** : Fonction de recherche globale

### Responsive design
- **Mobile** : Interface adaptée aux écrans mobiles
- **Tablette** : Optimisation pour les tablettes
- **Desktop** : Interface complète sur ordinateur

## Sécurité et permissions

### Accès restreint
- **Authentification** : Connexion obligatoire
- **Autorisation** : Vérification du rôle `CDC_sante_ind`
- **Session** : Gestion sécurisée des sessions utilisateur

### Protection des données
- **Chiffrement** : Données sensibles chiffrées
- **Sauvegarde** : Sauvegardes automatiques régulières
- **Audit** : Traçabilité des accès et modifications

## Intégrations

### Système Allianz
- **API** : Connexion avec les systèmes Allianz
- **Synchronisation** : Mise à jour automatique des données
- **Validation** : Vérification des informations avec les systèmes centraux

### Outils externes
- **Email** : Envoi automatique de notifications
- **SMS** : Alertes par SMS (si configuré)
- **Export** : Export des données vers Excel/PDF

## Évolutions prévues

### Phase 1 (Actuelle)
- Interface de base
- Gestion des contrats
- Calcul des commissions

### Phase 2 (À venir)
- **Module admin** : Gestion des verrouillages de mois
- **Système de permissions** : Contrôle d'accès avancé
- Analytics avancés
- Intégrations supplémentaires
- Automatisations

### Phase 3 (Future)
- IA et prédictions
- Optimisations avancées
- Nouvelles fonctionnalités

## Support et maintenance

### Contact technique
- **Email** : jm.nogaro@allianz.fr
- **Téléphone** : +33 6 08 18 33 38
- **Disponibilité** : Du lundi au vendredi, 9h-18h

### Formation
- **Documentation** : Guides utilisateur disponibles
- **Support** : Assistance personnalisée
- **Évolution** : Formation aux nouvelles fonctionnalités

---

*Document créé le : $(date)*  
*Version : 1.0*  
*Dernière mise à jour : $(date)*
