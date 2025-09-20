import { NextRequest, NextResponse } from 'next/server'

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  SanteIndActivity,
  SanteIndActivityCreate,
  SanteIndApiResponse
} from '@/types/sante-ind'

// ============================================================================
// POST - Créer une nouvelle activité
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const body = await request.json()
    const activityData: SanteIndActivityCreate = body

    // Validation des données
    if (!activityData.userId || !activityData.natureActe || !activityData.nomClient) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'Données manquantes'
      }, { status: 400 })
    }

    // Vérifier les permissions (rôle CD_sante_ind)
    // TODO: Implémenter la vérification des rôles
    
    // Préparer les données pour Firebase
    const firebaseData = {
      ...activityData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Sauvegarder en base
    const docRef = await addDoc(collection(db, 'santeIndActivities'), firebaseData)

    const response: SanteIndApiResponse<SanteIndActivity> = {
      success: true,
      data: {
        id: docRef.id,
        ...activityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Activité créée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// GET - Récupérer les activités
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const yearMonth = searchParams.get('yearMonth')

    if (!userId) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'userId requis'
      }, { status: 400 })
    }

    // Construire la requête
    let q = query(
      collection(db, 'santeIndActivities'),
      where('userId', '==', userId),
      orderBy('dateSaisie', 'desc')
    )

    // Filtrer par mois si spécifié
    if (yearMonth) {
      q = query(q, where('yearMonth', '==', yearMonth))
    }

    // Exécuter la requête
    const querySnapshot = await getDocs(q)
    const activities: SanteIndActivity[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as SanteIndActivity)
    })

    const response: SanteIndApiResponse<SanteIndActivity[]> = {
      success: true,
      data: activities,
      message: `${activities.length} activité(s) récupérée(s)`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
