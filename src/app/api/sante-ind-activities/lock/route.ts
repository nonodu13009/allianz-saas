import { NextRequest, NextResponse } from 'next/server'

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  SanteIndLock,
  LockStatus,
  SanteIndApiResponse
} from '@/types/sante-ind'

// ============================================================================
// GET - Récupérer le statut de verrouillage d'un mois
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
    const yearMonth = searchParams.get('yearMonth')

    if (!yearMonth) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'yearMonth requis'
      }, { status: 400 })
    }

    // Récupérer le verrouillage du mois
    const lockRef = doc(db, 'santeIndLocks', yearMonth)
    const lockSnap = await getDoc(lockRef)

    let lockStatus: LockStatus = 'unlocked'
    let lockData: SanteIndLock | null = null

    if (lockSnap.exists()) {
      const data = lockSnap.data()
      lockData = {
        yearMonth,
        status: data.status as LockStatus,
        lockedBy: data.lockedBy,
        lockedAt: data.lockedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
      lockStatus = lockData.status
    }

    const response: SanteIndApiResponse<{ status: LockStatus; lock?: SanteIndLock }> = {
      success: true,
      data: {
        status: lockStatus,
        lock: lockData || undefined
      },
      message: `Statut de verrouillage récupéré pour ${yearMonth}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération du statut de verrouillage:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// POST - Verrouiller/Déverrouiller un mois
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

    // TODO: Vérifier que l'utilisateur a les droits d'administration
    // if (!hasAdminRole(session.user)) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Droits insuffisants'
    //   }, { status: 403 })
    // }

    const body = await request.json()
    const { yearMonth, status } = body

    if (!yearMonth || !status) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'yearMonth et status requis'
      }, { status: 400 })
    }

    if (!['locked', 'unlocked'].includes(status)) {
      return NextResponse.json<SanteIndApiResponse>({
        success: false,
        error: 'Status invalide (locked ou unlocked)'
      }, { status: 400 })
    }

    const lockRef = doc(db, 'santeIndLocks', yearMonth)
    
    if (status === 'locked') {
      // Créer ou mettre à jour le verrouillage
      const lockData = {
        yearMonth,
        status: 'locked' as LockStatus,
        lockedBy: session.user.email,
        lockedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(lockRef, lockData, { merge: true })

      const response: SanteIndApiResponse<SanteIndLock> = {
        success: true,
        data: {
          yearMonth,
          status: 'locked',
          lockedBy: session.user.email,
          lockedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: `Mois ${yearMonth} verrouillé avec succès`
      }

      return NextResponse.json(response)

    } else {
      // Déverrouiller le mois
      const lockSnap = await getDoc(lockRef)
      
      if (lockSnap.exists()) {
        await setDoc(lockRef, {
          status: 'unlocked' as LockStatus,
          lockedBy: null,
          lockedAt: null,
          updatedAt: serverTimestamp()
        }, { merge: true })
      }

      const response: SanteIndApiResponse = {
        success: true,
        message: `Mois ${yearMonth} déverrouillé avec succès`
      }

      return NextResponse.json(response)
    }

  } catch (error) {
    console.error('Erreur lors de la gestion du verrouillage:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// ============================================================================
// GET - Récupérer tous les verrouillages
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // TODO: Implémenter l'authentification
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json<SanteIndApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    // TODO: Vérifier que l'utilisateur a les droits d'administration

    // Récupérer tous les verrouillages
    const locksQuery = query(
      collection(db, 'santeIndLocks'),
      where('status', '==', 'locked')
    )
    
    const querySnapshot = await getDocs(locksQuery)
    const locks: SanteIndLock[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      locks.push({
        yearMonth: doc.id,
        status: data.status as LockStatus,
        lockedBy: data.lockedBy,
        lockedAt: data.lockedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    const response: SanteIndApiResponse<SanteIndLock[]> = {
      success: true,
      data: locks,
      message: `${locks.length} mois verrouillé(s) récupéré(s)`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la récupération des verrouillages:', error)
    
    return NextResponse.json<SanteIndApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
