/**
 * Script de test pour vérifier le calcul des commissions
 */

// Seuils de commission (copiés du fichier types)
const COMMISSION_SEUILS = [
  { seuil: 0, taux: 0.00 },        // 0 → 6 000 € → 0%
  { seuil: 6001, taux: 0.02 },     // 6 001 → 10 000 € → 2%
  { seuil: 10001, taux: 0.03 },    // 10 001 → 14 000 € → 3%
  { seuil: 14001, taux: 0.04 },    // 14 001 → 18 000 € → 4%
  { seuil: 18001, taux: 0.06 }     // ≥ 18 001 € → 6%
];

function calculateCommission(caPondere) {
  // Trouver le plus haut seuil atteint
  const seuilAtteint = COMMISSION_SEUILS
    .slice()
    .reverse()
    .find(seuil => caPondere >= seuil.seuil);

  if (!seuilAtteint) {
    return {
      taux: 0,
      seuilAtteint: 0,
      montant: 0,
      description: 'Aucun seuil atteint'
    };
  }

  const montant = Math.round(caPondere * seuilAtteint.taux);
  
  return {
    taux: seuilAtteint.taux,
    seuilAtteint: seuilAtteint.seuil,
    montant: montant,
    description: `Seuil ${seuilAtteint.seuil.toLocaleString('fr-FR')}€ atteint (${(seuilAtteint.taux * 100).toFixed(1)}%)`
  };
}

async function testCommissionCalculation() {
  try {
    console.log('🧮 Test du calcul des commissions...\n');
    
    // Test avec différentes valeurs de CA pondéré
    const testCases = [
      { caPondere: 5000, expected: 0 },      // < 6001€ → 0%
      { caPondere: 8000, expected: 160 },    // 6 001-10 000€ → 2%
      { caPondere: 12000, expected: 360 },   // 10 001-14 000€ → 3%
      { caPondere: 16000, expected: 640 },   // 14 001-18 000€ → 4%
      { caPondere: 20000, expected: 1200 },  // ≥ 18 001€ → 6%
      { caPondere: 145252, expected: 8715 }  // Notre cas réel
    ];
    
    for (const testCase of testCases) {
      const result = calculateCommission(testCase.caPondere);
      const expected = testCase.expected;
      const actual = result.montant;
      const status = actual === expected ? '✅' : '❌';
      
      console.log(`${status} CA pondéré: ${testCase.caPondere.toLocaleString('fr-FR')}€`);
      console.log(`   Taux appliqué: ${(result.taux * 100).toFixed(1)}%`);
      console.log(`   Commission calculée: ${actual.toLocaleString('fr-FR')}€`);
      console.log(`   Commission attendue: ${expected.toLocaleString('fr-FR')}€`);
      console.log(`   Seuil atteint: ${result.seuilAtteint.toLocaleString('fr-FR')}€`);
      console.log('');
    }
    
    console.log('🎯 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testCommissionCalculation();
