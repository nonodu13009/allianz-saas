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
  SanteCollActivity,
  SanteCollApiResponse
} from '@/types/sante-coll'

// ============================================================================
// GET - Récupérer une activité Santé Collective par ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params

    if (!id) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Récupérer l'activité
    const docRef = doc(db, 'sante_coll_activities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'Activité Santé Collective non trouvée'
      }, { status: 404 })
    }

    const data = docSnap.data()
    const activity: SanteCollActivity = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as SanteCollActivity

    const response: SanteCollApiResponse<SanteCollActivity> = {
      success: true,
      data: activity,
      message: 'Activité Santé Collective récupérée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Mettre à jour une activité Santé Collective
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params
    const body = await request.json()
    const updates = body

    if (!id) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Vérifier que l'activité existe
    const docRef = doc(db, 'sante_coll_activities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'Activité Santé Collective non trouvée'
      }, { status: 404 })
    }

    // Recalculer le CA pondéré si le CA ou le type a changé
    let caPondere = updates.caPondere
    if (updates.ca !== undefined || updates.type !== undefined) {
      const currentData = docSnap.data()
      const ca = updates.ca !== undefined ? updates.ca : currentData.ca
      const type = updates.type !== undefined ? updates.type : currentData.type
      
      const ponderationRates = {
        'Affaire nouvelle': 1.00,
        'Révision': 0.50,
        'Adhésion groupe': 0.50,
        'Transfert courtage': 0.75
      }
      
      caPondere = ca * (ponderationRates[type] || 1.00)
    }

    // Préparer les données de mise à jour
    const firebaseUpdates = {
      ...updates,
      caPondere,
      updatedAt: serverTimestamp()
    }

    // Mettre à jour l'activité
    await updateDoc(docRef, firebaseUpdates)

    // Récupérer l'activité mise à jour
    const updatedDoc = await getDoc(docRef)
    const data = updatedDoc.data()
    
    const updatedActivity: SanteCollActivity = {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as SanteCollActivity

    const response: SanteCollApiResponse<SanteCollActivity> = {
      success: true,
      data: updatedActivity,
      message: 'Activité Santé Collective mise à jour avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Supprimer une activité Santé Collective
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { id } = params

    if (!id) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'ID requis'
      }, { status: 400 })
    }

    // Vérifier que l'activité existe
    const docRef = doc(db, 'sante_coll_activities', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'Activité Santé Collective non trouvée'
      }, { status: 404 })
    }

    // Supprimer l'activité
    await deleteDoc(docRef)

    const response: SanteCollApiResponse = {
      success: true,
      message: 'Activité Santé Collective supprimée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
