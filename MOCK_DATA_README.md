# 📊 Données Mock CDC Santé Collective

Ce dossier contient les scripts pour générer, tester et nettoyer les données mock pour le module CDC Santé Collective.

## 🎯 Objectif

Créer **15 activités de test** réparties sur **septembre 2025** pour valider le fonctionnement complet du système CDC Santé Collective.

## 📋 Scripts disponibles

### 1. `create-mock-data-admin.js` - Création des données mock
```bash
node create-mock-data-admin.js
```

**Fonctionnalités :**
- ✅ Génère 15 activités avec différents types d'actes
- ✅ Répartit sur différentes dates de septembre 2025
- ✅ Inclut les 3 compagnies (Allianz, Unim, Courtage)
- ✅ Inclut les 3 origines (Proactif, Réactif, Prospection)
- ✅ Calcule automatiquement les primes pondérées
- ✅ Utilise Firebase Admin SDK (plus fiable)

### 2. `test-mock-data.js` - Test des données mock
```bash
node test-mock-data.js
```

**Vérifications :**
- ✅ Existence des données en base
- ✅ Structure correcte des documents
- ✅ Calculs de prime pondérée corrects
- ✅ Statistiques détaillées
- ✅ Répartition par compagnie/origine/nature

### 3. `clear-mock-data.js` - Nettoyage des données mock
```bash
node clear-mock-data.js
```

**Fonctionnalités :**
- ✅ Supprime toutes les activités de test
- ✅ Nettoyage sélectif (seulement septembre 2025)
- ✅ Suppression en batch pour l'efficacité

## 📊 Données générées

### **Répartition des activités :**
- **📅 Période :** 2-29 septembre 2025 (15 jours différents)
- **🏢 Compagnies :** Allianz, Unim, Courtage
- **📈 Origines :** Proactif, Réactif, Prospection
- **📋 Types d'actes :** Souscription, Renouvellement, Modification, Addition, etc.

### **Statistiques des données mock :**
```
💰 Prime brute totale: 117 000€
💰 Prime pondérée totale: 145 252€
📈 Répartition par compagnie:
   - Unim: 43 400€ (×1.5)
   - Allianz: 38 100€ (×1.2)
   - Courtage: 35 500€ (×1.0)
📈 Répartition par origine:
   - Prospection: 50 600€ (×1.2)
   - Proactif: 37 700€ (×1.0)
   - Réactif: 28 700€ (×0.5)
```

## 🎯 Utilisation pour les tests

### **1. Préparation des tests :**
```bash
# Créer les données mock
node create-mock-data-admin.js

# Vérifier que tout est correct
node test-mock-data.js
```

### **2. Tests dans l'interface :**
1. **Connectez-vous** avec un utilisateur ayant le rôle `cdc_sante_coll`
2. **Allez sur** http://localhost:3000/dashboard
3. **Naviguez vers** septembre 2025
4. **Vérifiez :**
   - ✅ Affichage des 15 activités
   - ✅ Calculs des KPIs
   - ✅ Navigation temporelle
   - ✅ Filtres et recherche
   - ✅ Actions CRUD (édition, suppression, visualisation)

### **3. Nettoyage après tests :**
```bash
# Supprimer les données mock
node clear-mock-data.js
```

## 🔧 Configuration requise

### **Prérequis :**
- ✅ Node.js installé
- ✅ Firebase Admin SDK configuré
- ✅ Fichier de clé service Firebase présent
- ✅ Base de données Firestore accessible

### **Fichiers requis :**
- `allianz-saas-132c3-firebase-adminsdk-fbsvc-1680d5d722.json`
- Variables d'environnement Firebase configurées

## 📝 Exemples d'activités générées

```javascript
{
  nomClient: "ENTREPRISE BOUCHERIE MARTIN",
  contractNumber: "SC2025001",
  natureActe: "souscription",
  origine: "prospection",
  compagnie: "unim",
  primeBrute: 8500,
  primePonderee: 15300, // 8500 × 1.2 × 1.5
  dateSaisie: "2025-09-02"
}
```

## 🚨 Dépannage

### **Erreur "Aucune donnée mock trouvée" :**
```bash
# Vérifier que les données existent
node test-mock-data.js

# Si aucune donnée, recréer
node create-mock-data-admin.js
```

### **Erreur Firebase :**
- Vérifier que le fichier de clé service existe
- Vérifier les permissions Firebase
- Vérifier la connectivité réseau

### **Données corrompues :**
```bash
# Nettoyer et recréer
node clear-mock-data.js
node create-mock-data-admin.js
node test-mock-data.js
```

## 🎉 Validation du fonctionnement

Après création des données mock, vous devriez pouvoir :

1. **✅ Voir 15 activités** dans le tableau
2. **✅ Naviguer** dans la timeline septembre 2025
3. **✅ Voir les KPIs** calculés correctement
4. **✅ Utiliser les filtres** par compagnie/origine/nature
5. **✅ Éditer/supprimer** les activités
6. **✅ Voir les calculs** de prime pondérée avec les nouveaux coefficients

---

**💡 Conseil :** Utilisez ces données mock pour tester toutes les fonctionnalités avant la mise en production !
