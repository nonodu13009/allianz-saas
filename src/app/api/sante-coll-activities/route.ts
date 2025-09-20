import { NextRequest, NextResponse } from 'next/server'

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  SanteCollActivity,
  SanteCollActivityCreate,
  SanteCollApiResponse
} from '@/types/sante-coll'

// ============================================================================
// POST - Créer une nouvelle activité Santé Collective
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const body = await request.json()
    const activityData: SanteCollActivityCreate = body

    // Validation des données
    if (!activityData.userId || !activityData.type || !activityData.clientName) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'Données manquantes: userId, type et clientName requis'
      }, { status: 400 })
    }

    // Vérifier les permissions (rôle CDC Santé Collective)
    // TODO: Implémenter la vérification des rôles
    
    // Calculer le CA pondéré selon le type d'acte
    const ponderationRates = {
      'AN Collective en Santé': 1.00,
      'AN Collective en Prévoyance': 1.00,
      'AN Collective en Retraite': 1.00,
      'AN Individuelle en Santé': 1.00,
      'AN Individuelle en Prévoyance': 1.00,
      'AN Individuelle en Retraite': 1.00,
      'Adhésion/Renfort en Collective': 0.50,
      'Révision Collective': 0.75,
      'Courtage → Allianz': 0.75,
      'Allianz → Courtage': 0.50
    }
    
    const caPondere = activityData.ca * (ponderationRates[activityData.type] || 1.00)

    // Préparer les données pour Firebase
    const firebaseData = {
      ...activityData,
      caPondere,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Sauvegarder en base
    const docRef = await addDoc(collection(db, 'sante_coll_activities'), firebaseData)

    const response: SanteCollApiResponse<SanteCollActivity> = {
      success: true,
      data: {
        id: docRef.id,
        ...activityData,
        caPondere,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Activité Santé Collective créée avec succès'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la création de l\'activité Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// GET - Récupérer les activités Santé Collective
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const yearMonth = searchParams.get('yearMonth')
    const type = searchParams.get('type')
    const origine = searchParams.get('origine')
    const compagnie = searchParams.get('compagnie')

    if (!userId) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'userId requis'
      }, { status: 400 })
    }

    // Construire la requête
    let q = query(
      collection(db, 'sante_coll_activities'),
      where('userId', '==', userId),
      orderBy('dateSaisie', 'desc')
    )

    // Filtrer par mois si spécifié
    if (yearMonth) {
      q = query(q, where('yearMonth', '==', yearMonth))
    }

    // Filtrer par type si spécifié
    if (type && type !== 'all') {
      q = query(q, where('type', '==', type))
    }

    // Filtrer par origine si spécifié
    if (origine) {
      q = query(q, where('origine', '==', origine))
    }

    // Filtrer par compagnie si spécifié
    if (compagnie) {
      q = query(q, where('compagnie', '==', compagnie))
    }

    // Exécuter la requête avec gestion d'erreur Firebase
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
    } catch (firebaseError) {
      console.error('Erreur Firebase lors de la récupération des activités:', firebaseError)
      
      // Retourner un tableau vide en cas d'erreur Firebase
      const response: SanteCollApiResponse<SanteCollActivity[]> = {
        success: true,
        data: [],
        message: '0 activité(s) Santé Collective récupérée(s) (service temporairement indisponible)'
      }

      return NextResponse.json(response)
    }
    const activities: SanteCollActivity[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as SanteCollActivity)
    })

    const response: SanteCollApiResponse<SanteCollActivity[]> = {
      success: true,
      data: activities,
      message: `${activities.length} activité(s) Santé Collective récupérée(s)`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération des activités Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
