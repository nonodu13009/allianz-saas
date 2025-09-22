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

### Timeline mensuelle
- **Affichage** : Pastilles par jour sur toute la largeur
- **Début de mois** : Timeline commence le 1er jour du mois
- **Factorisation** : Composant réutilisable pour autres timelines du site
- **Couleurs** :
  - 🟢 Jours normaux (vert)
  - 🟠 Samedi (orange)
  - 🔴 Dimanche (rouge)
  - ⚪ Jour système (bordure blanche épaisse)
- **Données** : Nombre d'actes par jour

### KPIs du mois
- CA du mois
- Nombre de contrats total
- Nombre de contrats autres qu'auto
- Commissions potentielles
- Ratio autres/auto
- Nombre d'actes total
- Commissions réelles

### Tableau des saisies
- **Affichage** : Toutes les entrées saisies
- **Tri** : Possibilité de classer A-Z ou Z-A dans toutes les colonnes
- **Filtrage** : Impact sur timeline et tableau

### Saisie des actes commerciaux
**Interface** : 4 boutons cliquables pour les types d'actes
- `an` : Affaire nouvelle
- `m+3` : Process M+3  
- `préterme auto` : Préterme automatique
- `préterme iard` : Préterme IARD

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

### Système de filtres
**Filtres disponibles** :
- Type d'acte (4 options)
- Type de contrat
- Compagnie

**Fonctionnalités** :
- Par défaut : aucun filtre
- Sélection multiple par tags
- Bouton reset pour enlever tous les filtres
- Impact en temps réel sur timeline et tableau

## Structure technique

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