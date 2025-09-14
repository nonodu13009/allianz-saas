# Configuration Firebase

Pour que la fonctionnalité de gestion des années fonctionne, vous devez configurer Firebase.

## 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou utilisez un projet existant
3. Activez Firestore Database

## 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Récupérer les valeurs Firebase

1. Dans Firebase Console, allez dans "Project Settings" (⚙️)
2. Dans l'onglet "General", trouvez la section "Your apps"
3. Si vous n'avez pas d'app web, cliquez sur "Add app" et choisissez "Web"
4. Copiez les valeurs de configuration dans votre fichier `.env.local`

## 4. Règles Firestore

Ajoutez ces règles dans Firestore pour permettre la lecture/écriture :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /agency_commissions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5. Redémarrer le serveur

Après avoir configuré les variables d'environnement :

```bash
npm run dev
```

## Dépannage

Si la création d'années ne fonctionne toujours pas :

1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que les variables d'environnement sont correctement définies
3. Vérifiez que Firestore est activé dans votre projet Firebase
4. Vérifiez que l'utilisateur est connecté (authentification requise)
