## CDC commercial — Allianz sur Marseille

### Contexte
Document vivant. Je complète ce CDC au fil des informations partagées. Il servira d'entrée pour le fichier TODO d'implémentation.

### Fichiers impactés
 - `src/app/dashboard/page.tsx` — **IMPLÉMENTÉ** : Dashboard principal avec module CDC intégré
 - `src/components/cdc/ModalAN.tsx` — **IMPLÉMENTÉ** : Modale pour les affaires nouvelles
 - `src/components/cdc/ModalProcess.tsx` — **IMPLÉMENTÉ** : Modale pour les process (M+3, Préterme Auto, Préterme IRD)
 - `src/components/cdc/ActivityTable.tsx` — **IMPLÉMENTÉ** : Tableau des activités avec tri et actions
 - `src/components/MonthTimeline.tsx` — **IMPLÉMENTÉ** : Timeline mensuelle avec pastilles
 - `src/lib/utils.ts` — **IMPLÉMENTÉ** : Fonction de capitalisation des noms de clients
 - `src/app/api/cdc-activities/` — **IMPLÉMENTÉ** : API REST pour la gestion des activités

---

## Espace CDC Commercial — Saisie quotidienne & Historique

### Besoin utilisateur
- Les CDC saisissent leur activité tous les jours.
- Après authentification, ils accèdent à une interface dédiée permettant:
  - **Saisie quotidienne** de l’activité du jour.
  - **Consultation** des jours déjà saisis.
  - **Navigation mois par mois** pour consulter l’historique (mois précédent/suivant).

### Types de saisie
- **Affaires nouvelles (AN)**
- **Process** avec trois sous-types:
  - M+3
  - Préterme Auto
  - Préterme IRD

### UI & interactions
- **4 boutons « flashy »** en haut de la page CDC:
  - Bouton 1: AN
  - Bouton 2: M+3
  - Bouton 3: Préterme Auto
  - Bouton 4: Préterme IRD
- Au clic sur l’un de ces boutons, **ouverture d’une modale** adaptée au type choisi:
  - Modale AN (spécifique AN)
  - Modale Process (variant selon M+3 / Préterme Auto / Préterme IRD)
- La modale cible par défaut **la date du jour**; possibilité de changer le jour (contrainte à préciser).

### Modales — contenu **IMPLÉMENTÉ**
- **Modale AN** ✅
  - **Champs implémentés** :
    - Type affaire (select obligatoire) : AUTO/MOTO, IARD PART DIVERS, IARD PRO DIVERS, PJ, GAV, SANTE/PREV, NOP 50EUR, EPARGNE/RETRAITE, PU / VL
    - Nom client (texte obligatoire) avec **capitalisation automatique** des prénoms composés
    - N° contrat (texte optionnel)
    - Date d'effet (datepicker)
    - Prime annuelle (entier €) — affiché si Type ≠ PU / VL
    - Versement libre (entier €) — affiché si Type = PU / VL
    - Commission potentielle (calculée automatiquement, lecture seule)
    - Commentaire (textarea optionnel)
  - **Validation** : Nom client obligatoire, versement libre > 0 si PU / VL
  - **Calcul automatique** des commissions selon barème par type de produit

- **Modale Process (M+3 / Préterme Auto / Préterme IRD)** ✅
  - **Champs implémentés** :
    - Nom client (texte obligatoire) avec **capitalisation automatique**
    - Commentaire (textarea optionnel)
    - Date de saisie (automatique, non modifiable)
  - **Validation** : Nom client obligatoire
  - **Comportement** : Titre de modale adapté au sous-type sélectionné

- **Comportements communs** ✅
  - Boutons: Enregistrer / Annuler
  - Messages de confirmation via snackbar
  - Gestion d'erreurs avec conservation des saisies
  - **Capitalisation intelligente** des noms (Jean-Michel, Marie-Claire, etc.) appliquée à l'enregistrement
  - **Saisie libre** : Aucune transformation pendant la frappe, espaces préservés

### Spécifications détaillées de saisie **IMPLÉMENTÉES**

#### Process ✅
- **Titre de la modale** = "Process — {sous-type}" (M+3, Préterme Auto, Préterme IRD)
- **Champs implémentés**:
  - `Nom client` (texte obligatoire) avec **capitalisation automatique**
  - `Commentaire` (textarea optionnel)
  - `Date de saisie` automatique = date courante (non éditable)
- **Action Enregistrer**:
  - Sauvegarde en base via API `/api/cdc-activities/month`
  - Ajoute une ligne dans le tableau avec colonnes: `Jour de saisie`, `Type`, `Nom client`, `Détail`, `Montant`, `Commission`, `Actions`, `Verrou`
  - La ligne appartient au mois affiché (pilotage par navigation mensuelle)

#### Affaires nouvelles (AN) ✅
- **Titre de la modale** = "Affaire nouvelle"
- **Champs implémentés**:
  - `Type affaire` (select obligatoire) avec 9 options disponibles
  - `Nom client` (texte obligatoire) avec **capitalisation automatique**
  - `N° contrat` (texte optionnel)
  - `Date d'effet` (datepicker natif HTML5)
  - `Date de saisie` automatique = date courante (non modifiable)
  - `Prime annuelle` (entier €) — affiché si Type ≠ PU / VL
  - `Versement libre` (entier €) — affiché si Type = PU / VL
  - `Commission potentielle` (entier €) — **calculé automatiquement** selon barème
- **Action Enregistrer**:
  - Sauvegarde en base via API `/api/cdc-activities/month`
  - Ajoute une ligne dans le tableau avec toutes les colonnes détaillées
  - La ligne appartient au mois affiché (pilotage par navigation mensuelle)

### Règles de calcul — Commissions potentielles (AN) **IMPLÉMENTÉES** ✅
- **Format monétaire**: tous les montants saisis et calculés sont des entiers en euros (pas de décimales)
- **Barème par type** (implémenté dans `src/lib/cdc.ts`):
  - `AUTO/MOTO`: 10 €
  - `IARD PART DIVERS`: 20 €
  - `IARD PRO DIVERS`: 20 € + 10 € par tranche de 1000 € de prime (à partir de 999 €)
  - `PJ`: 30 €
  - `GAV`: 40 €
  - `SANTE/PREV`: 50 €
  - `NOP 50EUR`: 10 €
  - `EPARGNE/RETRAITE/PP`: 50 €
  - `PU / VL`: 1 % de la prime versée
- **Calcul automatique** : La commission potentielle est calculée en temps réel dans les modales
- **Affichage** : Formatage monétaire français avec `formatEuroInt()` (ex: "1 234 €")

### Comportement de saisie des noms de clients **IMPLÉMENTÉ** ✅
- **Pendant la saisie** : Aucune transformation, saisie totalement libre
  - L'utilisateur peut taper "jean michel dupont" sans aucune interruption
  - Les espaces sont préservés et fonctionnent normalement
  - Aucune capitalisation en temps réel qui pourrait gêner la frappe
- **À l'enregistrement** : Capitalisation automatique appliquée
  - Clic sur "Enregistrer" → `capitalizeClientName()` transforme le nom
  - "jean michel dupont" devient "Jean Michel Dupont"
  - Gestion des prénoms composés : "jean-michel" → "Jean-Michel"
  - Gestion des apostrophes : "d'arc" → "D'Arc"
- **Avantages** :
  - ✅ Expérience utilisateur fluide et naturelle
  - ✅ Aucun bug d'espace ou d'interruption
  - ✅ Capitalisation correcte garantie en base de données
  - ✅ Performance optimale (pas de calculs inutiles)
  - `IARD PRO DIVERS`: 20 € + 10 € par tranche pleine de 1 000 € de `Prime annuelle`
    - Formule: `commission = 20 + 10 * floor(primeAnnuelle / 1000)`
    - Exemples: 670 € → 20 €; 999 € → 20 €; 1 000 € → 30 €; 1 350 € → 30 €; 2 320 € → 40 €
  - `PJ`: 30 €
  - `GAV`: 40 €
  - `SANTE/PREV`: 50 €
  - `NOP 50EUR`: 10 €
  - `EPARGNE/RETRAITE/PP`: 50 €
  - `PU / VL`: 1 % de la `Prime versée` (champ `Versement libre`), arrondi à l’euro le plus proche.
- **Visibilité**: le champ « Commissions potentielles » est calculé automatiquement et affiché en lecture seule dans la modale AN.

### KPIs mensuels (dépendent de la navigation mois)
- **Périmètre**: tous les KPI ci-dessous sont calculés sur le mois affiché.
- **Définitions**:
  - `Nombre d'affaires nouvelles` = count des AN du mois.
  - `Nombre AUTO/MOTO` = count des AN avec type `AUTO/MOTO`.
  - `Nombre autres` = count des AN dont le type ≠ `AUTO/MOTO`.
  - `Nombre de process` (total) = count des saisies Process (tous types) du mois.
    - Détail par type: `M+3`, `Préterme Auto`, `Préterme IRD` (counts séparés).
  - `CA d'affaire cumulé` = somme(`Prime annuelle`) + somme(`Versement libre`) sur les AN du mois (entiers en €).
  - `Ratio` = `Nombre autres` / `Nombre AUTO/MOTO` en pourcentage.
    - Cas limite: si `Nombre AUTO/MOTO` = 0, alors `Ratio` = 100 % par défaut.
  - `Commissions potentielles` = somme des commissions calculées des AN du mois (entiers en €).
  - `Commissions réelles`:
    - Si les 3 conditions sont vraies, alors `Commissions réelles = Commissions potentielles`, sinon `0 €`.
      1) `Commissions potentielles` ≥ 200 €
      2) `Nombre de process` ≥ 15
      3) `Ratio` ≥ 100 %
- **Formatage**:
  - Montants affichés en € (entiers); `Ratio` en % (0 décimale).

### Timeline journalière (au-dessus du tableau)
- **Emplacement**: juste au‑dessus du tableau de saisie, dépend du mois sélectionné.
- **Rendu**: une rangée horizontale de pastilles (1 par jour du mois courant). Pastilles scrollables si nécessaire.
- **Valeur par pastille**: nombre total de saisies du jour (AN + Process). Par défaut `0` (ou icône « Ø » / « rien »).
- **Couleurs**: neutre si 0, intensité/progression lorsque > 0 (lisible en thème clair/sombre).
- **Filtres**:
  - Toggle: `Tous | AN | Process`. La timeline et le tableau se synchronisent avec ce filtre.
  - Si `AN` est actif: filtre additionnel `Produit` (valeurs du select AN) pour spécialiser la timeline et le tableau.
- **Interaction**: clic sur une pastille filtre le tableau sur ce jour (un second clic retire le filtre jour).
- **Verrouillage**: si le mois est verrouillé, la timeline reste visible et filtrable mais aucune action de création/édition n’est possible.

### Tableau de saisie (consultation)
- Vue type tableur (style "Excel")
  - Colonnes minimales Process: `Jour de saisie`, `Nom client`, `Process`.
  - Colonnes minimales AN: `Jour de saisie`, `Nom client`, `Type AN`, `N° contrat`, `Date d'effet`, `Prime annuelle`/`Versement libre`, `Commission`.
- **CRUD**:
  - `Create` via modales AN/Process.
  - `Read` via tableau filtrable/triable.
  - `Update` via édition (inline ou modale d’édition) tant que le mois n’est pas verrouillé.
  - `Delete` avec confirmation explicite (et protection si mois verrouillé).
- **Colonne Verrou**:
  - Affiche un cadenas `fermé` si le mois affiché est verrouillé par l’administrateur, `ouvert` sinon.
  - Pour l’instant, indicateur visuel uniquement côté CDC (pas d’action). L’intervention se fera plus tard depuis le dashboard Administrateur.
- La navigation mensuelle pilote le contenu du tableau (mois courant par défaut, possibilité mois précédent/suivant).

### Verrouillage mensuel **IMPLÉMENTÉ** ✅
- **API de verrouillage** : `/api/cdc-activities/lock` (GET/POST)
- **Collection Firestore** : `cdcLocks` avec documents `{userId}_{yearMonth}`
- **Interface utilisateur** :
  - Indicateur visuel : pastille verte/rouge "Mois éditable" / "Mois verrouillé"
  - Boutons de saisie désactivés quand verrouillé
  - Actions d'édition/suppression désactivées dans le tableau
  - Colonne "Verrou" dans le tableau avec icônes cadenas ouvert/fermé
- **Comportement** :
  - Lorsque le mois M est **verrouillé** :
    - Toutes les opérations de modification sont désactivées (création, édition, suppression)
    - Les modales ne s'ouvrent pas ou affichent un message d'erreur
    - La colonne Verrou affiche le cadenas `fermé` (rouge)
  - Lorsque le mois M est **déverrouillé** :
    - Toutes les opérations sont autorisées
    - La colonne Verrou affiche le cadenas `ouvert` (vert)
- **Justification métier** : En septembre 2025, les salaires sont calculés à partir des données d'août 2025; **aucune modification postérieure** ne doit être possible sur août 2025.

### Parcours cible
1. L’utilisateur se connecte et voit le menu « Activité commerciale » dans le dashboard.
2. Page CDC:
   - Bloc « Aujourd’hui »: formulaire rapide de saisie (ex: champs à préciser).
   - Liste/Calendrier des jours du mois courant avec état (saisi / non saisi).
   - Contrôles « Mois précédent » / « Mois suivant » pour naviguer.
3. Sélection d’un jour passé: consultation des données avec possibilité d’éditer si autorisé.

### Règles d’accès
- Réservé aux profils CDC Commercial.
- Redirection vers `/dashboard` si le rôle ne correspond pas (déjà en place dans le route guard).

### Hypothèses / À préciser
- Schéma de données pour une « activité » (champs exacts, validations, pièces jointes?).
- Autorisation d’édition rétroactive (jusqu’à J-? ou illimitée?).
- Affichage par calendrier vs. tableau liste (préférence UX?).
- Stratégie de stockage du verrou mensuel (ex.: collection `locks` par `{userId, yearMonth}` ou champ au niveau agrégé).

### Critères d’acceptation (draft)
- Depuis la page CDC, je peux saisir l’activité du jour et la retrouver instantanément.
- Je peux changer de mois et voir les jours saisis de ce mois.
- Une timeline afﬁche autant de pastilles que de jours dans le mois avec le nombre de saisies/jour; elle se met à jour selon les filtres et la navigation mensuelle.
- Filtres: `Tous | AN | Process` et, pour `AN`, un filtre `Produit` affinent à la fois la timeline et le tableau.
- L’état de chaque jour est visible (saisi/non saisi) et cliquable pour détail.
- Je vois 4 boutons (AN, M+3, Préterme Auto, Préterme IRD) et, au clic, la modale correspondante s’ouvre.
- Je peux enregistrer une saisie AN et une saisie Process et les consulter ensuite.
- La date de saisie d’un Process est remplie automatiquement.
- La date de saisie d’une AN est remplie automatiquement et non modifiable.
- Les champs AN s’affichent/masquent selon le `Type affaire` (`Prime annuelle` si ≠ `PU / VL`, `Versement libre` si = `PU / VL`).
- La commission potentielle est calculée automatiquement selon le barème ci-dessus et affichée en lecture seule (entiers en €).
- Les KPI affichés se mettent à jour lorsque je change de mois et respectent les formules (montants entiers).
- Le tableau est CRUD tant que le mois n’est pas verrouillé; si le mois est verrouillé, toutes les modifications sont impossibles et un cadenas fermé l’indique.
- Le changement de mois met à jour le contenu du tableau en conséquence.

## État d'implémentation actuel ✅

### Fonctionnalités implémentées
- ✅ **Interface utilisateur complète** : Dashboard intégré dans `/dashboard` avec module CDC
- ✅ **Navigation mensuelle** : Boutons précédent/suivant + reset vers mois courant
- ✅ **4 boutons de saisie** : AN, M+3, Préterme Auto, Préterme IRD avec couleurs distinctes
- ✅ **Modales fonctionnelles** : ModalAN et ModalProcess avec tous les champs requis
- ✅ **Capitalisation intelligente** : Noms de clients avec gestion des prénoms composés (appliquée à l'enregistrement)
- ✅ **Calcul automatique** : Commissions potentielles selon barème par type de produit
- ✅ **Tableau des activités** : Tri par colonnes, actions édition/suppression, indicateur de verrouillage
- ✅ **Timeline mensuelle** : Pastilles par jour avec valeurs de saisies, scroll horizontal
- ✅ **Filtres avancés** : Tous/AN/Process + filtre par produit pour AN
- ✅ **KPIs en temps réel** : Affaires nouvelles, process, commissions, ratio
- ✅ **Système de verrouillage** : API + interface pour bloquer les modifications mensuelles
- ✅ **API REST complète** : CRUD pour activités, gestion des verrous
- ✅ **Gestion d'erreurs** : Snackbars, validation, états optimistes
- ✅ **Responsive design** : Interface adaptée mobile/desktop

### API Endpoints implémentés
- `GET /api/cdc-activities/month?yearMonth=YYYY-MM` — Récupération des activités mensuelles
- `POST /api/cdc-activities/month` — Création d'une nouvelle activité
- `PATCH /api/cdc-activities/[id]` — Modification d'une activité existante
- `DELETE /api/cdc-activities/[id]` — Suppression d'une activité
- `GET /api/cdc-activities/lock?userId=xxx&yearMonth=YYYY-MM` — Vérification du verrouillage
- `POST /api/cdc-activities/lock` — Verrouillage/déverrouillage d'un mois

### Collections Firestore
- `cdcActivities` — Stockage des activités (AN + Process)
- `cdcLocks` — Gestion des verrous mensuels par utilisateur

### Corrections de bugs récentes 🐛➡️✅
- **Bug d'espace dans la saisie des noms** : Amélioration de l'expérience utilisateur pour la saisie des noms de clients
  - **Problème** : Impossible de taper des espaces dans le champ "Nom client" (capitalisation en temps réel)
  - **Solution 1** : Modification de la fonction `capitalizeClientName()` pour préserver les espaces
  - **Solution 2** : Déplacement de la capitalisation vers le moment de l'enregistrement (`handleSave`)
  - **Résultat** : Saisie totalement libre + capitalisation automatique à l'enregistrement

### Checklist de suivi (module CDC) ✅ COMPLÈTE
- [x] Créer UI saisie « Aujourd'hui »
- [x] Visualiser l'état des jours du mois courant
- [x] Ajouter navigation mois précédent/suivant
- [x] Afficher l'historique d'un mois sélectionné
- [x] Gérer droits d'accès (CDC uniquement) — implémenté
- [x] Définir modèle de données et validations — implémenté
- [x] Ajouter 4 boutons de saisie (AN, M+3, Préterme Auto, Préterme IRD)
- [x] Ouvrir une modale spécifique selon le bouton cliqué
- [x] Construire formulaire AN (champs/validations confirmés)
- [x] Construire formulaire Process (M+3/Auto/IRD) (champs/validations confirmés)
- [x] Implémenter date de saisie auto pour Process
- [x] **BONUS** : Capitalisation intelligente des noms de clients (appliquée à l'enregistrement)
- [x] **BONUS** : Système de verrouillage mensuel complet
- [x] **BONUS** : KPIs en temps réel avec calculs métier
- [x] **BONUS** : Interface responsive et moderne
- [x] Implémenter date de saisie auto pour AN
- [x] Implémenter logique conditionnelle AN (Prime annuelle vs Versement libre)
- [x] Calculer automatiquement la commission potentielle selon le barème (entiers)
- [x] Créer table de consultation avec tri/filtre
- [x] Relier la table à la navigation mensuelle
- [x] Calculer et afficher les KPI mensuels (formules + cas limites, montants entiers)
- [x] Ajouter CRUD complet sur le tableau (édition/suppression protégées)
- [x] Afficher colonne Verrou (cadenas ouvert/fermé) et bloquer le mois si fermé
- [x] Préparer le modèle/stockage du verrou mensuel en vue du dashboard Admin
- [x] Ajouter la timeline journalière (pastilles, valeurs par filtre, clic pour filtrer le jour)

## Améliorations futures possibles 🚀

### Fonctionnalités avancées
- **Export des données** : CSV/Excel pour les rapports mensuels
- **Graphiques de performance** : Courbes d'évolution des KPIs
- **Notifications** : Alertes pour objectifs non atteints
- **Historique des modifications** : Audit trail des changements
- **Import en masse** : Chargement de données depuis fichiers externes
- **Templates de saisie** : Modèles pré-remplis pour gagner du temps

### Optimisations techniques
- **Cache intelligent** : Mise en cache des données fréquemment consultées
- **Pagination** : Pour les tableaux avec beaucoup de données
- **Recherche avancée** : Filtres par nom client, montant, période
- **Synchronisation offline** : Travail hors ligne avec sync automatique
- **API GraphQL** : Pour des requêtes plus flexibles

### Intégrations
- **Système de commissions** : Calcul automatique des salaires
- **Rapports automatiques** : Génération de PDFs mensuels
- **Intégration CRM** : Synchronisation avec outils externes
- **API webhooks** : Notifications en temps réel vers autres systèmes

---

## Conclusion

Le module CDC Commercial est **entièrement fonctionnel** et répond à tous les besoins exprimés dans le cahier des charges initial. L'implémentation inclut même des fonctionnalités bonus comme la capitalisation intelligente des noms et un système de verrouillage complet.

**Prêt pour la production** ✅
