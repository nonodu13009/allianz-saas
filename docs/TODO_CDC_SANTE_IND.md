# 📋 TODO - Module CDC Santé Individuelle

## 🎯 Objectif
Implémenter le module CDC Santé Individuelle en réutilisant le code factorisé du module CDC Commercial, suivant les spécifications définies dans `docs/cdc_sante_ind.md`.

## 📚 Références
- **Spécifications** : `docs/cdc_sante_ind.md`
- **Code factorisé** : Module CDC Commercial existant
- **Architecture** : Next.js 15 + Firebase + TypeScript

---

## 🚀 Plan d'implémentation (10 étapes)

### ✅ ÉTAPE 1 : Types et Interfaces
**Objectif** : Définir la structure de données TypeScript
- [ ] Créer `src/types/sante-ind.ts`
- [ ] Définir les types : `SanteIndActivity`, `ActeType`, `Compagnie`, `KPIs`
- [ ] Réutiliser les types communs du CDC Commercial
- [ ] Validation : Types compilent sans erreur

### ✅ ÉTAPE 2 : Services et Logique métier
**Objectif** : Centraliser la logique métier
- [ ] Créer `src/lib/sante-ind-service.ts`
- [ ] Implémenter calculs CA pondéré selon grille
- [ ] Implémenter calculs commissions (6% du CA pondéré)
- [ ] Implémenter validation des données
- [ ] Réutiliser les fonctions communes du CDC Commercial
- [ ] Validation : Tests unitaires passent

### ✅ ÉTAPE 3 : Composants UI
**Objectif** : Créer l'interface utilisateur
- [ ] Créer `src/components/sante-ind/ModalActe.tsx` (modale générique)
- [ ] Créer `src/components/sante-ind/ProductionTable.tsx`
- [ ] Créer `src/components/sante-ind/KPIsMensuels.tsx`
- [ ] Créer `src/components/sante-ind/NavigationMensuelle.tsx`
- [ ] Réutiliser les composants UI existants (Button, Card, etc.)
- [ ] Validation : Interface responsive et fonctionnelle

### ✅ ÉTAPE 4 : API Routes
**Objectif** : Exposer les endpoints Firebase
- [ ] Créer `src/app/api/sante-ind-activities/month/route.ts` (GET/POST)
- [ ] Créer `src/app/api/sante-ind-activities/[id]/route.ts` (PATCH/DELETE)
- [ ] Implémenter validation côté serveur
- [ ] Gestion des erreurs Firebase
- [ ] Validation : API fonctionnelle avec tests Postman

### ✅ ÉTAPE 5 : Intégration Dashboard
**Objectif** : Intégrer au dashboard principal
- [ ] Modifier `src/app/dashboard/page.tsx` pour inclure le module
- [ ] Ajouter navigation vers Santé Individuelle
- [ ] Implémenter contrôle d'accès (rôle `CD_sante_ind`)
- [ ] Gérer l'état global des activités
- [ ] Validation : Navigation fluide et sécurisée

### ✅ ÉTAPE 6 : Persistance et Cache
**Objectif** : Optimiser les performances
- [ ] Implémenter cache local avec sync Firebase
- [ ] Gérer la synchronisation en temps réel
- [ ] Implémenter gestion des conflits
- [ ] Optimiser les requêtes Firestore
- [ ] Validation : Performance < 200ms pour les opérations

### ✅ ÉTAPE 7 : Tests et Validation
**Objectif** : Assurer la qualité du code
- [ ] Tests unitaires pour les services
- [ ] Tests d'intégration pour les API
- [ ] Tests E2E pour les workflows complets
- [ ] Validation des calculs de commissions
- [ ] Validation : Couverture de tests > 80%

### ✅ ÉTAPE 8 : Documentation
**Objectif** : Documenter le module
- [ ] Documentation technique (README)
- [ ] Documentation utilisateur (guide)
- [ ] Commentaires de code
- [ ] Diagrammes d'architecture
- [ ] Validation : Documentation complète et à jour

### ✅ ÉTAPE 9 : Optimisations
**Objectif** : Finaliser les performances
- [ ] Optimisation des requêtes Firestore
- [ ] Mise en cache intelligente
- [ ] Gestion de la mémoire
- [ ] Optimisation du bundle
- [ ] Validation : Lighthouse score > 90

### ✅ ÉTAPE 10 : Déploiement
**Objectif** : Mettre en production
- [ ] Configuration Firebase (indexes, rules)
- [ ] Tests de charge
- [ ] Déploiement staging
- [ ] Déploiement production
- [ ] Validation : Module fonctionnel en production

---

## 🔄 Code factorisé à réutiliser

### Services
- `src/lib/cdc-service.ts` → Logique de validation et normalisation
- `src/lib/firebase.ts` → Configuration Firebase
- `src/lib/utils.ts` → Fonctions utilitaires communes

### Composants UI
- `src/components/ui/button.tsx` → Boutons
- `src/components/ui/card.tsx` → Cartes
- `src/components/ui/input.tsx` → Champs de saisie
- `src/components/ui/dialog.tsx` → Modales
- `src/components/ui/table.tsx` → Tableaux

### Types communs
- `src/types/user.ts` → Types utilisateur
- `src/types/commission.ts` → Types commissions

### Hooks
- `src/hooks/use-user-status.ts` → Gestion des rôles utilisateur

---

## ✅ Critères de validation

### Fonctionnels
- [ ] Tous les types d'actes commerciaux fonctionnels
- [ ] Calculs de CA pondéré corrects
- [ ] Calculs de commissions précis
- [ ] Navigation mensuelle fluide
- [ ] Contrôle d'accès par rôle

### Techniques
- [ ] Code TypeScript sans erreurs
- [ ] Tests unitaires passent
- [ ] Performance optimisée
- [ ] Sécurité Firebase respectée
- [ ] Interface responsive

### Qualité
- [ ] Code réutilise les composants existants
- [ ] Architecture cohérente
- [ ] Documentation complète
- [ ] Gestion d'erreurs robuste
- [ ] Logs de débogage appropriés

---

## 📊 Métriques de succès

- **Performance** : Temps de chargement < 2s
- **Fiabilité** : Taux d'erreur < 1%
- **Maintenabilité** : Couverture de tests > 80%
- **Sécurité** : Validation côté client et serveur
- **UX** : Interface intuitive et responsive

---

## 🎯 Prochaine étape
**ÉTAPE 1** : Créer les types et interfaces TypeScript dans `src/types/sante-ind.ts`