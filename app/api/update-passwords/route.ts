import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { bulkPasswordUpdateSchema, validateData } from '@/lib/validation-schemas';
import { apiLogger, measurePerformance } from '@/lib/logger';

// Initialiser Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(request: NextRequest) {
  return measurePerformance(async () => {
    try {
      apiLogger.info('Début de la synchronisation des mots de passe');
      
      const body = await request.json();
      
      // Valider les données d'entrée
      const validation = validateData(bulkPasswordUpdateSchema, body);
      if (!validation.success) {
        apiLogger.warn('Validation échouée', { errors: validation.errors });
        return NextResponse.json(
          { 
            error: 'Données invalides',
            details: validation.errors 
          },
          { status: 400 }
        );
      }
      
      const { users, newPassword } = validation.data!;
      apiLogger.info(`Synchronisation de ${users.length} utilisateurs`);

    const results = [];

    for (const user of users) {
      try {
        // 1. Mettre à jour le mot de passe dans Firebase Auth
        await adminAuth.updateUser(user.uid, {
          password: newPassword
        });

        // 2. Mettre à jour le mot de passe dans Firestore
        await adminDb.collection('users').doc(user.uid).update({
          password: newPassword,
          updatedAt: new Date()
        });

        results.push({
          success: true,
          uid: user.uid,
          email: user.email,
          message: `Mot de passe mis à jour pour ${user.prenom} ${user.nom}`
        });

      } catch (error: any) {
        console.error(`Erreur pour ${user.email}:`, error);
        results.push({
          success: false,
          uid: user.uid,
          email: user.email,
          error: error.message,
          message: `Erreur pour ${user.prenom} ${user.nom}: ${error.message}`
        });
      }
    }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      apiLogger.info('Synchronisation terminée', {
        total: users.length,
        success: successCount,
        failures: failureCount
      });

      return NextResponse.json({
        success: true,
        message: `Synchronisation terminée: ${successCount} succès, ${failureCount} échecs`,
        results,
        summary: {
          total: users.length,
          success: successCount,
          failures: failureCount
        }
      });

    } catch (error: any) {
      apiLogger.error('Erreur API update-passwords', error);
      return NextResponse.json(
        { 
          error: 'Erreur serveur lors de la synchronisation des mots de passe',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }, 'bulk-password-update');
}
