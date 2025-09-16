## CDC Santé Collective — Suivi de la production (navigation mensuelle)

### Contexte
Document vivant. Outil de déclaration et de suivi de la production « Santé Collective », réservé au rôle `CDC_sante_coll` (ex. Karen Chollet). S'inspire du module « Santé Individuelle » pour l'UX: timeline mensuelle, filtres, info-bulles (i) cohérentes.

### État actuel : **EN CONSTRUCTION** 🚧

Le module CDC Santé Collective est actuellement en cours de développement. Les utilisateurs avec le rôle `cdc_sante_coll` voient un message "Module en construction" sur le dashboard.

### Fichiers impactés (prévisionnel)
- `src/app/dashboard/page.tsx` — **EN CONSTRUCTION** : Affichage du message "en construction"
- `src/components/sante-coll/` — **À DÉVELOPPER** : Composants à créer
- `src/lib/sante-coll.ts` — **À DÉVELOPPER** : Fonctions utilitaires à créer
- `src/types/index.ts` — **À DÉVELOPPER** : Types TypeScript à ajouter
- `src/app/api/sante-coll-activities/month/route.ts` — **À DÉVELOPPER** : API GET/POST pour les activités mensuelles
- `src/app/api/sante-coll-activities/[id]/route.ts` — **À DÉVELOPPER** : API PATCH/DELETE pour les activités individuelles

---

## Fonctionnalités principales

### Accès et rôles
- Accès exclusivement réservé au rôle `CDC_sante_coll` (sinon redirection vers `/dashboard`).
- **Double authentification requise** : Rôle utilisateur + accès Firebase
- **Vérification des rôles** : Les API routes vérifient le rôle `cdc_sante_coll`, `santé collective`, ou `sante collective`
- **Collection Firebase** : `sante_coll_activities` pour la persistance des données

### Navigation mensuelle (timeline + filtres)
- Mois courant par défaut, avec contrôles « précédent/suivant ».
- Timeline colorée (cohérente avec les autres modules):
  - Dimanche: rouge vif
  - Samedi: orange vif
  - Autres jours: vert vif
- Pastilles avec compte/jour et effet focus sur le jour sélectionné.
- Filtres inspirés de `cdc_sante_ind` (et visibles en dessous des KPI):
  - Filtre « Origine »: Tous | Proactif | Réactif | Prospection
  - Filtre « Nature de l’acte » (voir liste plus bas)
  - Bouton « Reset » (efface les filtres jour/origine/nature)

### Bouton de saisie
- Un seul bouton en haut de page: « Nouvel acte ».
- Au clic: ouverture d’une modale de saisie.

### Modale — contenu
- Champs:
  - `Date de saisie` (auto, non éditable)
  - `Nature de l’acte` (select):
    - coll an santé
    - coll an prev
    - coll an retraite
    - coll adhésion / renfort
    - coll révision
    - ind an santé
    - ind an prev
    - ind an retraite
    - courtage → allianz (ind & coll)
    - allianz → court (ind & coll)
  - `Origine` (select): Proactif | Réactif | Prospection
  - `Compagnie` (select): Allianz | Courtage
  - `Nom du client` (normaliser typographie; majuscules au premier mot)
  - `N° de contrat`
  - `Prime brute` (entier, €)
  - `Prime pondérée` (entier, €) — calculée automatiquement selon « Origine »:
    - Proactif: 100 %
    - Réactif: 50 %
    - Prospection: 120 %

Formule: `primePonderee = arrondiEuro(primeBrute * taux)`.

### Info-bulles (i)
- Icône (i) visible sur chaque KPI et sur certains champs sensibles de la modale.
- Texte concis expliquant la logique (ex.: « Prime pondérée = Prime brute x Taux selon Origine »).

### KPI mensuels
- Nombre d’actes du mois.
- CA brut (somme des primes brutes).
- CA pondéré (somme des primes pondérées).
- Commissions estimées du mois (voir barème).

### Barème commissions (sur CA pondéré du mois)
- Seuil 1: `0 → 6 000 €` → 0 %
- Seuil 2: `6 001 → 10 000 €` → 2 %
- Seuil 3: `10 001 → 14 000 €` → 3 %
- Seuil 4: `14 001 → 18 000 €` → 4 %
- Seuil 5: `≥ 18 001 €` → 6 %

Règle: si la production pondérée du mois atteint un seuil, le taux s’applique « dès le 1er euro » sur tout le mois.
- Ex.: 15 000 € → 4 % sur 15 000 €.
- Ex.: 3 000 € → 0 %.
- Ex.: 23 000 € → 6 % sur 23 000 €.

### Tableau de production
- Colonnes minimales: `Jour`, `Nature de l’acte`, `Origine`, `Compagnie`, `Nom client`, `N° contrat`, `Prime brute`, `Prime pondérée`.
- CRUD: création via modale, édition et suppression tant que le mois n’est pas verrouillé.
- Colonne « Verrou » (ou badge d’état) cohérente avec les autres modules: ouvert/fermé.

### Verrouillage mensuel (administrateur)
- Identique aux autres modules: si le mois est verrouillé côté admin, toute modification est désactivée pour l’utilisateur.

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

## Conclusion

Le module CDC Santé Collective est **en cours de développement**. Les utilisateurs avec le rôle `cdc_sante_coll` voient actuellement un message informatif indiquant que le module sera bientôt disponible.

### Sécurité et authentification
- **Double authentification** : Rôle utilisateur + accès Firebase obligatoire
- **Vérification des rôles** : Toutes les API routes vérifieront le rôle `cdc_sante_coll`
- **Collection Firebase** : `sante_coll_activities` pour la persistance des données
- **Cohérence** : Même architecture de sécurité que le module Santé Individuelle

### API Routes prévues
- `GET /api/sante-coll-activities/month?yearMonth=YYYY-MM` : Charger les activités d'un mois
- `POST /api/sante-coll-activities/month?yearMonth=YYYY-MM` : Créer une nouvelle activité
- `PATCH /api/sante-coll-activities/[id]` : Modifier une activité existante
- `DELETE /api/sante-coll-activities/[id]` : Supprimer une activité

**Prochaine étape** : Développement complet du module selon les spécifications du cahier des charges, en s'inspirant de l'architecture sécurisée du module Santé Individuelle.