import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import adminConfig from '../../../../firebase-admin-config.json'

// Initialiser Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(adminConfig),
    })
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID requis' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur de Firebase Auth
    await getAuth().deleteUser(uid)
    
    console.log(`✅ Utilisateur ${uid} supprimé de Firebase Auth`)
    
    return NextResponse.json({
      success: true,
      message: `Utilisateur ${uid} supprimé de Firebase Auth`
    })
    
  } catch (error) {
    console.error('Erreur lors de la suppression de Firebase Auth:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de Firebase Auth' },
      { status: 500 }
    )
  }
}
