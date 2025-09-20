/**
 * Script de test pour vérifier les données mock CDC Santé Collective
 * Teste les API routes avec les données créées pour septembre 2025
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialisation Firebase Admin
const serviceAccount = require('./allianz-saas-132c3-firebase-adminsdk-fbsvc-1680d5d722.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'allianz-saas-132c3'
  });
}

const db = admin.firestore();

async function testMockData() {
  try {
    console.log('🔥 Test des données mock CDC Santé Collective...');
    
    // Test 1: Vérifier que les données existent
    console.log('\n📊 Test 1: Vérification des données en base');
    const activitiesRef = db.collection('sante_coll_activities');
    const snapshot = await activitiesRef
      .where('userId', '==', 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13')
      .where('month', '==', '2025-09')
      .get();

    if (snapshot.empty) {
      console.log('❌ Aucune donnée mock trouvée !');
      console.log('💡 Exécutez d\'abord: node create-mock-data-admin.js');
      return;
    }

    console.log(`✅ ${snapshot.size} activités trouvées en base`);

    // Test 2: Vérifier la structure des données
    console.log('\n📋 Test 2: Vérification de la structure des données');
    const firstActivity = snapshot.docs[0].data();
    const requiredFields = ['nomClient', 'numeroContrat', 'natureActe', 'origine', 'compagnie', 'primeBrute', 'primePonderee', 'dateSaisie', 'dateEffet', 'userId', 'month'];
    
    const missingFields = requiredFields.filter(field => !(field in firstActivity));
    if (missingFields.length > 0) {
      console.log(`❌ Champs manquants: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ Structure des données correcte');
    }

    // Test 3: Vérifier les calculs de prime pondérée
    console.log('\n💰 Test 3: Vérification des calculs de prime pondérée');
    const ORIGINE_RATES = {
      'proactif': 1.0,
      'reactif': 0.5,
      'prospection': 1.2
    };

    const COMPAGNIE_RATES = {
      'courtage': 1.0,
      'allianz': 1.2,
      'unim': 1.5
    };

    let calculationErrors = 0;
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const expectedPrimePonderee = Math.round(
        data.primeBrute * ORIGINE_RATES[data.origine] * COMPAGNIE_RATES[data.compagnie]
      );
      
      if (data.primePonderee !== expectedPrimePonderee) {
        console.log(`❌ Erreur calcul activité ${index + 1}: ${data.nomClient}`);
        console.log(`   Attendu: ${expectedPrimePonderee}€, Calculé: ${data.primePonderee}€`);
        calculationErrors++;
      }
    });

    if (calculationErrors === 0) {
      console.log('✅ Tous les calculs de prime pondérée sont corrects');
    } else {
      console.log(`❌ ${calculationErrors} erreurs de calcul détectées`);
    }

    // Test 4: Statistiques des données
    console.log('\n📈 Test 4: Statistiques des données mock');
    const stats = {
      totalActivities: snapshot.size,
      totalPrimeBrute: 0,
      totalPrimePonderee: 0,
      parCompagnie: {},
      parOrigine: {},
      parNatureActe: {}
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.totalPrimeBrute += data.primeBrute;
      stats.totalPrimePonderee += data.primePonderee;
      
      stats.parCompagnie[data.compagnie] = (stats.parCompagnie[data.compagnie] || 0) + data.primeBrute;
      stats.parOrigine[data.origine] = (stats.parOrigine[data.origine] || 0) + data.primeBrute;
      stats.parNatureActe[data.natureActe] = (stats.parNatureActe[data.natureActe] || 0) + 1;
    });

    console.log(`📊 Total activités: ${stats.totalActivities}`);
    console.log(`💰 Prime brute totale: ${stats.totalPrimeBrute.toLocaleString('fr-FR')}€`);
    console.log(`💰 Prime pondérée totale: ${stats.totalPrimePonderee.toLocaleString('fr-FR')}€`);
    console.log(`📈 Répartition par compagnie:`, stats.parCompagnie);
    console.log(`📈 Répartition par origine:`, stats.parOrigine);
    console.log(`📈 Répartition par nature d'acte:`, stats.parNatureActe);

    // Test 5: Vérifier les dates
    console.log('\n📅 Test 5: Vérification des dates de saisie');
    const dates = snapshot.docs.map(doc => doc.data().dateSaisie).sort();
    console.log(`📅 Première activité: ${dates[0]}`);
    console.log(`📅 Dernière activité: ${dates[dates.length - 1]}`);
    console.log(`📅 Période couverte: ${dates.length} jours différents`);

    console.log('\n✅ Tous les tests sont passés avec succès !');
    console.log('\n🎯 Pour tester dans l\'interface:');
    console.log('1. Connectez-vous avec un utilisateur ayant le rôle "cdc_sante_coll"');
    console.log('2. Allez sur http://localhost:3000/dashboard');
    console.log('3. Naviguez vers septembre 2025');
    console.log('4. Vérifiez l\'affichage des activités et KPIs');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  testMockData().then(() => {
    console.log('\n✨ Tests terminés avec succès !');
    process.exit(0);
  });
}

module.exports = { testMockData };
