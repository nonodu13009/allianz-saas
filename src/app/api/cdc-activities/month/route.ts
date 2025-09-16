// API REST pour la gestion des activités CDC mensuelles
// GET /api/cdc-activities/month - Récupération des activités mensuelles
// POST /api/cdc-activities/month - Création d'une nouvelle activité

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { validateActivity, generateActivityId, calculateCommission } from '@/lib/cdc'

// GET - Récupération des activités mensuelles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearMonth = searchParams.get('yearMonth')
    const userId = searchParams.get('userId')
    
    if (!yearMonth) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre yearMonth est obligatoire' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre userId est obligatoire' },
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
    
    // Construction de la requête Firestore
    const activitiesRef = collection(db, 'cdcActivities')
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      where('yearMonth', '==', yearMonth),
      orderBy('dateSaisie', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const activities: Activity[] = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      } as Activity)
    })
    
    return NextResponse.json({
      success: true,
      data: {
        activities,
        yearMonth,
        userId,
        count: activities.length
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Création d'une nouvelle activité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des champs obligatoires
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'Le champ userId est obligatoire' },
        { status: 400 }
      )
    }
    
    if (!body.type || !Object.values(ActivityType).includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Le type d\'activité est obligatoire et valide' },
        { status: 400 }
      )
    }
    
    // Construction de l'objet activité
    const now = new Date()
    const yearMonth = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0')
    
    const activityData: Omit<Activity, 'id'> = {
      userId: body.userId,
      type: body.type,
      clientName: body.clientName?.trim() || '',
      comment: body.comment?.trim() || '',
      dateSaisie: now.toISOString(),
      yearMonth,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
    
    // Ajout des champs spécifiques aux Affaires Nouvelles
    if (body.type === ActivityType.AN) {
      if (!body.productType || !Object.values(ProductType).includes(body.productType)) {
        return NextResponse.json(
          { success: false, error: 'Le type de produit est obligatoire pour les affaires nouvelles' },
          { status: 400 }
        )
      }
      
      activityData.productType = body.productType
      activityData.contractNumber = body.contractNumber?.trim() || ''
      activityData.dateEffet = body.dateEffet || ''
      
      // Gestion des montants selon le type de produit
      if (body.productType === ProductType.PU_VL) {
        activityData.versementLibre = parseInt(body.versementLibre) || 0
        activityData.primeAnnuelle = undefined
      } else {
        activityData.primeAnnuelle = parseInt(body.primeAnnuelle) || 0
        activityData.versementLibre = null
      }
      
      // Calcul automatique de la commission potentielle
      activityData.commissionPotentielle = calculateCommission(
        body.productType,
        activityData.primeAnnuelle,
        activityData.versementLibre
      )
    }
    
    // Validation de l'activité
    const validation = validateActivity(activityData)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreurs de validation',
          validationErrors: validation.errors.map(error => ({
            field: 'general',
            message: error,
            code: 'VALIDATION_ERROR'
          }))
        },
        { status: 400 }
      )
    }
    
    // Sauvegarde en base de données
    const activitiesRef = collection(db, 'cdcActivities')
    const docRef = await addDoc(activitiesRef, {
      ...activityData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Récupération de l'activité créée pour confirmation
    const createdActivity: Activity = {
      id: docRef.id,
      ...activityData
    }
    
    return NextResponse.json({
      success: true,
      data: {
        activity: createdActivity,
        message: 'Activité créée avec succès'
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
