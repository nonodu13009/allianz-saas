import { NextRequest, NextResponse } from 'next/server'

import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  SanteCollLock,
  SanteCollApiResponse
} from '@/types/sante-coll'

// ============================================================================
// GET - Vérifier le statut de verrouillage d'un mois
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

    if (!userId || !yearMonth) {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'userId et yearMonth requis'
      }, { status: 400 })
    }

    // Construire l'ID du verrou
    const lockId = `${userId}_${yearMonth}`

    // Récupérer le statut de verrouillage
    const lockRef = doc(db, 'sante_coll_locks', lockId)
    const lockSnap = await getDoc(lockRef)

    let lockStatus: SanteCollLock

    if (lockSnap.exists()) {
      const data = lockSnap.data()
      lockStatus = {
        id: lockSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as SanteCollLock
    } else {
      // Pas de verrou = mois déverrouillé
      lockStatus = {
        id: lockId,
        userId,
        yearMonth,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    const response: SanteCollApiResponse<SanteCollLock> = {
      success: true,
      data: lockStatus,
      message: `Mois ${yearMonth} ${lockStatus.isLocked ? 'verrouillé' : 'déverrouillé'}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la vérification du verrouillage Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
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
    //   return NextResponse.json<SanteCollApiResponse>({
    //     success: false,
    //     error: 'Non authentifié'
    //   }, { status: 401 })
    // }

    const body = await request.json()
    const { userId, yearMonth, isLocked, lockedBy } = body

    if (!userId || !yearMonth || typeof isLocked !== 'boolean') {
      return NextResponse.json<SanteCollApiResponse>({
        success: false,
        error: 'userId, yearMonth et isLocked requis'
      }, { status: 400 })
    }

    // Construire l'ID du verrou
    const lockId = `${userId}_${yearMonth}`

    // Préparer les données du verrou
    const lockData: Partial<SanteCollLock> = {
      userId,
      yearMonth,
      isLocked,
      updatedAt: serverTimestamp()
    }

    // Ajouter les métadonnées de verrouillage
    if (isLocked) {
      lockData.lockedAt = serverTimestamp()
      lockData.lockedBy = lockedBy || 'system'
    } else {
      lockData.lockedAt = null
      lockData.lockedBy = null
    }

    // Créer ou mettre à jour le verrou
    const lockRef = doc(db, 'sante_coll_locks', lockId)
    const lockSnap = await getDoc(lockRef)

    if (lockSnap.exists()) {
      // Mettre à jour le verrou existant
      await setDoc(lockRef, lockData, { merge: true })
    } else {
      // Créer un nouveau verrou
      await setDoc(lockRef, {
        ...lockData,
        id: lockId,
        createdAt: serverTimestamp()
      })
    }

    // Récupérer le verrou mis à jour
    const updatedLockSnap = await getDoc(lockRef)
    const data = updatedLockSnap.data()
    
    const lockStatus: SanteCollLock = {
      id: updatedLockSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as SanteCollLock

    const response: SanteCollApiResponse<SanteCollLock> = {
      success: true,
      data: lockStatus,
      message: `Mois ${yearMonth} ${isLocked ? 'verrouillé' : 'déverrouillé'} avec succès`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors du verrouillage Santé Collective:', error)
    
    return NextResponse.json<SanteCollApiResponse>({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
