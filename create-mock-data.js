/**
 * Script de génération de données mock pour CDC Santé Collective
 * Génère 15 activités pour septembre 2025 avec différents types, origines et compagnies
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Types et constantes
const SanteCollActeType = {
  SOUSCRIPTION: 'souscription',
  RESILIATION: 'resiliation',
  MODIFICATION: 'modification',
  RENOUVELLEMENT: 'renouvellement',
  ADDITION: 'addition',
  RETRAIT: 'retrait',
  ANNULATION: 'annulation',
  REGULARISATION: 'regularisation',
  MIGRATION: 'migration',
  RACHAT: 'rachat'
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

const PONDERATION_RATES = {
  [SanteCollActeType.SOUSCRIPTION]: 1.0,
  [SanteCollActeType.RENOUVELLEMENT]: 0.8,
  [SanteCollActeType.MODIFICATION]: 0.6,
  [SanteCollActeType.ADDITION]: 0.7,
  [SanteCollActeType.RESILIATION]: -0.3,
  [SanteCollActeType.RETRAIT]: -0.2,
  [SanteCollActeType.ANNULATION]: -0.1,
  [SanteCollActeType.REGULARISATION]: 0.5,
  [SanteCollActeType.MIGRATION]: 0.4,
  [SanteCollActeType.RACHAT]: 0.3
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

// Données mock pour septembre 2025
const mockActivities = [
  {
    nomClient: "ENTREPRISE BOUCHERIE MARTIN",
    contractNumber: "SC2025001",
    natureActe: SanteCollActeType.SOUSCRIPTION,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.UNIM,
    primeBrute: 8500,
    dateSaisie: "2025-09-02"
  },
  {
    nomClient: "SOCIÉTÉ RESTAURANT DU CENTRE",
    contractNumber: "SC2025002", 
    natureActe: SanteCollActeType.RENOUVELLEMENT,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 12000,
    dateSaisie: "2025-09-03"
  },
  {
    nomClient: "SARL BOUTIQUE MODE ÉLÉGANCE",
    contractNumber: "SC2025003",
    natureActe: SanteCollActeType.MODIFICATION,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 6500,
    dateSaisie: "2025-09-05"
  },
  {
    nomClient: "ENTREPRISE GARAGE AUTOMOTION",
    contractNumber: "SC2025004",
    natureActe: SanteCollActeType.ADDITION,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 4200,
    dateSaisie: "2025-09-08"
  },
  {
    nomClient: "SOCIÉTÉ COIFFURE BEAUTÉ PLUS",
    contractNumber: "SC2025005",
    natureActe: SanteCollActeType.SOUSCRIPTION,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 9500,
    dateSaisie: "2025-09-09"
  },
  {
    nomClient: "ENTREPRISE PHARMACIE CENTRALE",
    contractNumber: "SC2025006",
    natureActe: SanteCollActeType.RESILIATION,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 7800,
    dateSaisie: "2025-09-10"
  },
  {
    nomClient: "SARL SUPERMARCHÉ QUARTIER",
    contractNumber: "SC2025007",
    natureActe: SanteCollActeType.RENOUVELLEMENT,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.UNIM,
    primeBrute: 15000,
    dateSaisie: "2025-09-12"
  },
  {
    nomClient: "ENTREPRISE BUREAUTIQUE MODERNE",
    contractNumber: "SC2025008",
    natureActe: SanteCollActeType.MODIFICATION,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 5800,
    dateSaisie: "2025-09-15"
  },
  {
    nomClient: "SOCIÉTÉ RESTAURANT GASTRONOMIE",
    contractNumber: "SC2025009",
    natureActe: SanteCollActeType.ADDITION,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 3200,
    dateSaisie: "2025-09-16"
  },
  {
    nomClient: "ENTREPRISE OPTIQUE VISION PLUS",
    contractNumber: "SC2025010",
    natureActe: SanteCollActeType.SOUSCRIPTION,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 7200,
    dateSaisie: "2025-09-18"
  },
  {
    nomClient: "SARL FLEURISTE NATURE",
    contractNumber: "SC2025011",
    natureActe: SanteCollActeType.REGULARISATION,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 4800,
    dateSaisie: "2025-09-19"
  },
  {
    nomClient: "ENTREPRISE ÉLECTRICITÉ SERVICES",
    contractNumber: "SC2025012",
    natureActe: SanteCollActeType.RENOUVELLEMENT,
    origine: OrigineType.REACTIF,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 11200,
    dateSaisie: "2025-09-22"
  },
  {
    nomClient: "SOCIÉTÉ INFORMATIQUE DIGITAL",
    contractNumber: "SC2025013",
    natureActe: SanteCollActeType.MIGRATION,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.ALLIANZ,
    primeBrute: 8900,
    dateSaisie: "2025-09-24"
  },
  {
    nomClient: "ENTREPRISE PLOMBERIE EAU CHAUDE",
    contractNumber: "SC2025014",
    natureActe: SanteCollActeType.RACHAT,
    origine: OrigineType.PROACTIF,
    compagnie: CompagnieType.UNIM,
    primeBrute: 5600,
    dateSaisie: "2025-09-26"
  },
  {
    nomClient: "SARL CAFÉ BRASSERIE DU SOIR",
    contractNumber: "SC2025015",
    natureActe: SanteCollActeType.SOUSCRIPTION,
    origine: OrigineType.PROSPECTION,
    compagnie: CompagnieType.COURTAGE,
    primeBrute: 6800,
    dateSaisie: "2025-09-29"
  }
];

async function createMockData() {
  try {
    console.log('🔥 Initialisation Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📊 Génération des données mock pour septembre 2025...');
    
    const promises = mockActivities.map(async (activity, index) => {
      // Calcul de la prime pondérée
      const primePonderee = calculatePrimePonderee(
        activity.primeBrute, 
        activity.origine, 
        activity.compagnie
      );

      const activityData = {
        ...activity,
        primePonderee,
        userId: 'test-user-id', // À remplacer par un vrai userId
        month: '2025-09',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log(`📝 Création activité ${index + 1}/15: ${activity.nomClient}`);
      console.log(`   - ${activity.natureActe} | ${activity.origine} | ${activity.compagnie}`);
      console.log(`   - Prime brute: ${activity.primeBrute}€ → Prime pondérée: ${primePonderee}€`);
      
      return addDoc(collection(db, 'sante_coll_activities'), activityData);
    });

    const results = await Promise.all(promises);
    
    console.log('✅ Toutes les activités mock ont été créées avec succès !');
    console.log(`📋 ${results.length} documents créés dans la collection sante_coll_activities`);
    
    // Résumé des données
    console.log('\n📊 Résumé des données mock:');
    const summary = mockActivities.reduce((acc, activity) => {
      acc.totalPrimeBrute += activity.primeBrute;
      acc.totalPrimePonderee += calculatePrimePonderee(activity.primeBrute, activity.origine, activity.compagnie);
      
      if (!acc.parCompagnie[activity.compagnie]) acc.parCompagnie[activity.compagnie] = 0;
      acc.parCompagnie[activity.compagnie] += activity.primeBrute;
      
      if (!acc.parOrigine[activity.origine]) acc.parOrigine[activity.origine] = 0;
      acc.parOrigine[activity.origine] += activity.primeBrute;
      
      return acc;
    }, { 
      totalPrimeBrute: 0, 
      totalPrimePonderee: 0, 
      parCompagnie: {}, 
      parOrigine: {} 
    });

    console.log(`💰 Prime brute totale: ${summary.totalPrimeBrute.toLocaleString('fr-FR')}€`);
    console.log(`💰 Prime pondérée totale: ${summary.totalPrimePonderee.toLocaleString('fr-FR')}€`);
    console.log(`📈 Répartition par compagnie:`, summary.parCompagnie);
    console.log(`📈 Répartition par origine:`, summary.parOrigine);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données mock:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  createMockData();
}

module.exports = { createMockData, mockActivities };
