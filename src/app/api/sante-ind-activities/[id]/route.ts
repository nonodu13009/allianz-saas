import { NextRequest, NextResponse } from 'next/server'

import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  SanteIndActivity,
  SanteIndApiResponse
} from '@/types/sante-ind'

// ============================================================================
// GET - Récupérer une activité par ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params

    if (!id) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Récupérer l'activité
    const docRef = doc(db, 'santeIndActivities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'Activité non trouvée'
      }, { status: 404 })
    }

    const data = docSnap.data()
    const activity: SanteIndActivity = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as SanteIndActivity

    const response: SanteIndApiResponse<SanteIndActivity> = {
      success: true,
      data: activity,
      message: 'Activité récupérée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Mettre à jour une activité
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params
    const body = await request.json()
    const updates = body

    if (!id) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Vérifier que l'activité existe
    const docRef = doc(db, 'santeIndActivities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'Activité non trouvée'
      }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const firebaseUpdates = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    // Mettre à jour l'activité
    await updateDoc(docRef, firebaseUpdates)

    // Récupérer l'activité mise à jour
    const updatedDoc = await getDoc(docRef)
    const data = updatedDoc.data()
    
    const updatedActivity: SanteIndActivity = {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as SanteIndActivity

    const response: SanteIndApiResponse<SanteIndActivity> = {
      success: true,
      data: updatedActivity,
      message: 'Activité mise à jour avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Supprimer une activité
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params

    if (!id) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Vérifier que l'activité existe
    const docRef = doc(db, 'santeIndActivities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'Activité non trouvée'
      }, { status: 404 })
    }

    // Supprimer l'activité
    await deleteDoc(docRef)

    const response: SanteIndApiResponse = {
      success: true,
      message: 'Activité supprimée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
