// API REST pour la gestion du verrouillage mensuel CDC
// GET /api/cdc-activities/lock - Vérification du verrouillage
// POST /api/cdc-activities/lock - Verrouillage/déverrouillage d'un mois

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { CDCLock } from '@/types/cdc'
import { generateLockId } from '@/lib/cdc'

// GET - Vérification du verrouillage d'un mois
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const yearMonth = searchParams.get('yearMonth')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre userId est obligatoire' },
        { status: 400 }
      )
    }
    
    if (!yearMonth) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre yearMonth est obligatoire' },
        { status: 400 }
      )
    }
    
    // Validation du format yearMonth (YYYY-MM)
    const yearMonthRegex = /^\d{4}-\d{2}$/
    if (!yearMonthRegex.test(yearMonth)) {
      return NextResponse.json(
        { success: false, error: 'Format yearMonth invalide (attendu: YYYY-MM)' },
        { status: 400 }
      )
    }
    
    // Génération de l'ID du verrou
    const lockId = generateLockId(userId, yearMonth)
    
    // Récupération du verrou depuis Firestore
    const lockRef = doc(db, 'cdcLocks', lockId)
    const lockSnap = await getDoc(lockRef)
    
    let lockData: CDCLock
    
    if (lockSnap.exists()) {
      // Verrou existant
      const data = lockSnap.data()
      lockData = {
        id: lockId,
        userId,
        yearMonth,
        isLocked: data.isLocked || false,
        lockedAt: data.lockedAt?.toDate?.()?.toISOString() || data.lockedAt,
        lockedBy: data.lockedBy || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      }
    } else {
      // Pas de verrou (mois déverrouillé par défaut)
      lockData = {
        id: lockId,
        userId,
        yearMonth,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        lock: lockData,
        isLocked: lockData.isLocked
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la vérification du verrouillage:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Verrouillage/déverrouillage d'un mois
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Body reçu:', body)
    
    const { userId, yearMonth, isLocked, lockedBy } = body
    
    // Validation des champs obligatoires
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Le champ userId est obligatoire' },
        { status: 400 }
      )
    }
    
    if (!yearMonth) {
      return NextResponse.json(
        { success: false, error: 'Le champ yearMonth est obligatoire' },
        { status: 400 }
      )
    }
    
    if (typeof isLocked !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Le champ isLocked doit être un booléen' },
        { status: 400 }
      )
    }
    
    // Validation du format yearMonth (YYYY-MM)
    const yearMonthRegex = /^\d{4}-\d{2}$/
    if (!yearMonthRegex.test(yearMonth)) {
      return NextResponse.json(
        { success: false, error: 'Format yearMonth invalide (attendu: YYYY-MM)' },
        { status: 400 }
      )
    }
    
    // Génération de l'ID du verrou
    const lockId = generateLockId(userId, yearMonth)
    
    // Récupération du verrou existant (s'il existe)
    const lockRef = doc(db, 'cdcLocks', lockId)
    const lockSnap = await getDoc(lockRef)
    
    const now = new Date()
    let lockData: CDCLock
    let existingData: any = null
    
    if (lockSnap.exists()) {
      // Mise à jour du verrou existant
      existingData = lockSnap.data()
      lockData = {
        id: lockId,
        userId,
        yearMonth,
        isLocked,
        lockedAt: isLocked ? now.toISOString() : undefined,
        lockedBy: isLocked ? (lockedBy || userId) : undefined,
        createdAt: existingData.createdAt?.toDate?.()?.toISOString() || existingData.createdAt,
        updatedAt: now.toISOString()
      }
    } else {
      // Création d'un nouveau verrou
      lockData = {
        id: lockId,
        userId,
        yearMonth,
        isLocked,
        lockedAt: isLocked ? now.toISOString() : undefined,
        lockedBy: isLocked ? (lockedBy || userId) : undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    }
    
    // Sauvegarde en base de données
    await setDoc(lockRef, {
      ...lockData,
      createdAt: existingData ? existingData.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
      lockedAt: lockData.lockedAt ? serverTimestamp() : undefined
    })
    
    return NextResponse.json({
      success: true,
      data: {
        lock: lockData,
        message: isLocked ? 'Mois verrouillé avec succès' : 'Mois déverrouillé avec succès'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la gestion du verrouillage:', error)
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
