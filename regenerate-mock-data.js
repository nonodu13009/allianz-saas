/**
 * Script pour régénérer les données mock avec les 10 types d'actes conformes
 * et des dates de saisie/effet cohérentes
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

// Types et constantes conformes
const SanteCollActeType = {
  // Collective (5 types)
  COLL_AN_SANTE: 'coll_an_sante',
  COLL_AN_PREV: 'coll_an_prev',
  COLL_AN_RETRAITE: 'coll_an_retraite',
  COLL_ADHESION_RENFORT: 'coll_adhesion_renfort',
  COLL_REVISION: 'coll_revision',
  
  // Individuelle (3 types)
  IND_AN_SANTE: 'ind_an_sante',
  IND_AN_PREV: 'ind_an_prev',
  IND_AN_RETRAITE: 'ind_an_retraite',
  
  // Courtage (2 types)
  COURTAGE_TO_ALLIANZ: 'courtage_to_allianz',
  ALLIANZ_TO_COURT: 'allianz_to_court'
};

const OrigineType = {
  PROACTIF: 'proactif',
  REACTIF: 'reactif',
  PROSPECTION: 'prospection'
};

const CompagnieType = {
  ALLIANZ: 'allianz',
  UNIM: 'unim',
  COURTAGE: 'courtage'
};

const ORIGINE_RATES = {
  [OrigineType.PROACTIF]: 1.0,
  [OrigineType.REACTIF]: 0.5,
  [OrigineType.PROSPECTION]: 1.2
};

const COMPAGNIE_RATES = {
  [CompagnieType.COURTAGE]: 1.0,
  [CompagnieType.ALLIANZ]: 1.2,
  [CompagnieType.UNIM]: 1.5
};

// Fonction de calcul de la prime pondérée
function calculatePrimePonderee(primeBrute, origine, compagnie) {
  const tauxOrigine = ORIGINE_RATES[origine];
  const tauxCompagnie = COMPAGNIE_RATES[compagnie];
  return Math.round(primeBrute * tauxOrigine * tauxCompagnie);
}

// Données mock conformes avec les 10 types d'actes
const mockActivities = [
  {
    nomClient: "ENTREPRISE BOUCHERIE MARTIN",
    numeroContrat: "SC2025001",
    natureActe: SanteCollActeType.COLL_AN_SANTE,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.UNIM,
    primeBrute: 8500,
    dateSaisie: "2025-09-02",
    dateEffet: "2025-10-01"
  },
  {
    nomClient: "SOCIÉTÉ RESTAURANT DU CENTRE",
    numeroContrat: "SC2025002", 
    natureActe: SanteCollActeType.COLL_REVISION,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 12000,
    dateSaisie: "2025-09-03",
    dateEffet: "2025-10-01"
  },
  {
    nomClient: "SARL BOUTIQUE MODE ÉLÉGANCE",
    numeroContrat: "SC2025003",
    natureActe: SanteCollActeType.COLL_ADHESION_RENFORT,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 6500,
    dateSaisie: "2025-09-05",
    dateEffet: "2025-09-15"
  },
  {
    nomClient: "ENTREPRISE GARAGE AUTOMOTION",
    numeroContrat: "SC2025004",
    natureActe: SanteCollActeType.COLL_AN_PREV,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 4200,
    dateSaisie: "2025-09-08",
    dateEffet: "2025-09-20"
  },
  {
    nomClient: "SOCIÉTÉ COIFFURE BEAUTÉ PLUS",
    numeroContrat: "SC2025005",
    natureActe: SanteCollActeType.IND_AN_SANTE,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 9500,
    dateSaisie: "2025-09-09",
    dateEffet: "2025-10-01"
  },
  {
    nomClient: "ENTREPRISE PHARMACIE CENTRALE",
    numeroContrat: "SC2025006",
    natureActe: SanteCollActeType.IND_AN_PREV,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 7800,
    dateSaisie: "2025-09-10",
    dateEffet: "2025-12-31"
  },
  {
    nomClient: "SARL SUPERMARCHÉ QUARTIER",
    numeroContrat: "SC2025007",
    natureActe: SanteCollActeType.COLL_AN_RETRAITE,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.UNIM,
    primeBrute: 15000,
    dateSaisie: "2025-09-12",
    dateEffet: "2025-10-01"
  },
  {
    nomClient: "ENTREPRISE BUREAUTIQUE MODERNE",
    numeroContrat: "SC2025008",
    natureActe: SanteCollActeType.IND_AN_RETRAITE,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 5800,
    dateSaisie: "2025-09-15",
    dateEffet: "2025-09-25"
  },
  {
    nomClient: "SOCIÉTÉ RESTAURANT GASTRONOMIE",
    numeroContrat: "SC2025009",
    natureActe: SanteCollActeType.COURTAGE_TO_ALLIANZ,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 3200,
    dateSaisie: "2025-09-16",
    dateEffet: "2025-10-31"
  },
  {
    nomClient: "ENTREPRISE OPTIQUE VISION PLUS",
    numeroContrat: "SC2025010",
    natureActe: SanteCollActeType.ALLIANZ_TO_COURT,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 7200,
    dateSaisie: "2025-09-18",
    dateEffet: "2025-10-01"
  },
  {
    nomClient: "SARL FLEURISTE NATURE",
    numeroContrat: "SC2025011",
    natureActe: SanteCollActeType.COLL_AN_SANTE,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 4800,
    dateSaisie: "2025-09-19",
    dateEffet: "2025-09-30"
  },
  {
    nomClient: "ENTREPRISE ÉLECTRICITÉ SERVICES",
    numeroContrat: "SC2025012",
    natureActe: SanteCollActeType.COLL_AN_PREV,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 11200,
    dateSaisie: "2025-09-22",
    dateEffet: "2025-09-22"
  },
  {
    nomClient: "SOCIÉTÉ INFORMATIQUE DIGITAL",
    numeroContrat: "SC2025013",
    natureActe: SanteCollActeType.IND_AN_SANTE,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 8900,
    dateSaisie: "2025-09-24",
    dateEffet: "2025-11-01"
  },
  {
    nomClient: "ENTREPRISE PLOMBERIE EAU CHAUDE",
    numeroContrat: "SC2025014",
    natureActe: SanteCollActeType.COLL_REVISION,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 5600,
    dateSaisie: "2025-09-26",
    dateEffet: "2025-10-15"
  },
  {
    nomClient: "SARL CAFÉ BRASSERIE DU SOIR",
    numeroContrat: "SC2025015",
    natureActe: SanteCollActeType.IND_AN_PREV,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 6800,
    dateSaisie: "2025-09-29",
    dateEffet: "2025-10-01"
  }
];

async function regenerateMockData() {
  try {
    console.log('🔄 Régénération des données mock avec les 10 types d\'actes conformes...');
    
    const userId = 'jxRt3ZzCVqYVZ9aYd8Tu4I5ymu13';
    
    // Supprimer les anciennes données
    console.log('🗑️ Suppression des anciennes données...');
    const activitiesRef = db.collection('sante_coll_activities');
    const oldSnapshot = await activitiesRef
      .where('userId', '==', userId)
      .where('month', '==', '2025-09')
      .get();

    if (!oldSnapshot.empty) {
      const deleteBatch = db.batch();
      oldSnapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`✅ ${oldSnapshot.size} anciennes activités supprimées`);
    }
    
    // Créer les nouvelles données
    console.log('\n📊 Création des nouvelles données mock...');
    
    const batch = db.batch();
    
    mockActivities.forEach((activity, index) => {
      // Calcul de la prime pondérée
      const primePonderee = calculatePrimePonderee(
        activity.primeBrute, 
        activity.origine, 
        activity.compagnie
      );

      const activityData = {
        ...activity,
        primePonderee,
        userId,
        month: '2025-09',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      console.log(`📝 Création activité ${index + 1}/15: ${activity.nomClient}`);
      console.log(`   - Type: ${activity.natureActe} | Origine: ${activity.origine} | Compagnie: ${activity.compagnie}`);
      console.log(`   - Date saisie: ${activity.dateSaisie} | Date effet: ${activity.dateEffet}`);
      console.log(`   - Prime brute: ${activity.primeBrute}€ → Prime pondérée: ${primePonderee}€`);
      
      const docRef = activitiesRef.doc();
      batch.set(docRef, activityData);
    });

    await batch.commit();
    
    console.log('\n✅ Toutes les activités mock ont été régénérées avec succès !');
    console.log(`📋 15 documents créés avec les 10 types d'actes conformes`);
    
    // Résumé des données
    console.log('\n📊 Résumé des nouvelles données mock:');
    const summary = mockActivities.reduce((acc, activity) => {
      acc.totalPrimeBrute += activity.primeBrute;
      acc.totalPrimePonderee += calculatePrimePonderee(activity.primeBrute, activity.origine, activity.compagnie);
      
      if (!acc.parType[activity.natureActe]) acc.parType[activity.natureActe] = 0;
      acc.parType[activity.natureActe] += 1;
      
      if (!acc.parCompagnie[activity.compagnie]) acc.parCompagnie[activity.compagnie] = 0;
      acc.parCompagnie[activity.compagnie] += activity.primeBrute;
      
      if (!acc.parOrigine[activity.origine]) acc.parOrigine[activity.origine] = 0;
      acc.parOrigine[activity.origine] += activity.primeBrute;
      
      return acc;
    }, { 
      totalPrimeBrute: 0, 
      totalPrimePonderee: 0, 
      parType: {}, 
      parCompagnie: {}, 
      parOrigine: {} 
    });

    console.log(`💰 Prime brute totale: ${summary.totalPrimeBrute.toLocaleString('fr-FR')}€`);
    console.log(`💰 Prime pondérée totale: ${summary.totalPrimePonderee.toLocaleString('fr-FR')}€`);
    console.log(`📈 Répartition par type d'acte:`, summary.parType);
    console.log(`📈 Répartition par compagnie:`, summary.parCompagnie);
    console.log(`📈 Répartition par origine:`, summary.parOrigine);

    console.log('\n🎯 Types d\'actes utilisés:');
    Object.keys(summary.parType).forEach(type => {
      console.log(`   - ${type}: ${summary.parType[type]} activité(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la régénération des données mock:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  regenerateMockData().then(() => {
    console.log('\n✨ Script de régénération terminé avec succès !');
    process.exit(0);
  });
}

module.exports = { regenerateMockData };
