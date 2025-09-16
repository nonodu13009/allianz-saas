// API REST pour la gestion des activités CDC individuelles
// PATCH /api/cdc-activities/[id] - Modification d'une activité existante
// DELETE /api/cdc-activities/[id] - Suppression d'une activité

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { Activity, ActivityType, ProductType } from '@/types/cdc'
import { validateActivity, calculateCommission } from '@/lib/cdc'

// PATCH - Modification d'une activité existante
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'activité est obligatoire' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Récupération de l'activité existante
    const activityRef = doc(db, 'cdcActivities', id)
    const activitySnap = await getDoc(activityRef)
    
    if (!activitySnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Activité non trouvée' },
        { status: 404 }
      )
    }
    
    const existingActivity = activitySnap.data() as Activity
    
    // Construction des données de mise à jour
    const updateData: Partial<Activity> = {
      updatedAt: new Date().toISOString()
    }
    
    // Mise à jour des champs modifiables
    if (body.clientName !== undefined) {
      updateData.clientName = body.clientName.trim()
    }
    
    if (body.comment !== undefined) {
      updateData.comment = body.comment.trim()
    }
    
    if (body.contractNumber !== undefined) {
      updateData.contractNumber = body.contractNumber.trim()
    }
    
    if (body.dateEffet !== undefined) {
      updateData.dateEffet = body.dateEffet
    }
    
    // Mise à jour des montants pour les Affaires Nouvelles
    if (existingActivity.type === ActivityType.AN) {
      if (body.primeAnnuelle !== undefined) {
        updateData.primeAnnuelle = parseInt(body.primeAnnuelle) || 0
      }
      
      if (body.versementLibre !== undefined) {
        updateData.versementLibre = parseInt(body.versementLibre) || 0
      }
      
      // Recalcul de la commission potentielle si nécessaire
      if (body.primeAnnuelle !== undefined || body.versementLibre !== undefined) {
        const productType = existingActivity.productType || body.productType
        if (productType) {
          updateData.commissionPotentielle = calculateCommission(
            productType,
            updateData.primeAnnuelle || existingActivity.primeAnnuelle,
            updateData.versementLibre || existingActivity.versementLibre
          )
        }
      }
    }
    
    // Validation des données mises à jour
    const updatedActivity = { ...existingActivity, ...updateData }
    const validation = validateActivity(updatedActivity)
    
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
    await updateDoc(activityRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
    
    // Récupération de l'activité mise à jour
    const updatedSnap = await getDoc(activityRef)
    const updatedActivityData = updatedSnap.data() as Activity
    
    return NextResponse.json({
      success: true,
      data: {
        activity: {
          ...updatedActivityData,
          id: updatedSnap.id,
          createdAt: updatedActivityData.createdAt?.toDate?.()?.toISOString() || updatedActivityData.createdAt,
          updatedAt: updatedActivityData.updatedAt?.toDate?.()?.toISOString() || updatedActivityData.updatedAt
        },
        message: 'Activité mise à jour avec succès'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Suppression d'une activité
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'activité est obligatoire' },
        { status: 400 }
      )
    }
    
    // Vérification de l'existence de l'activité
    const activityRef = doc(db, 'cdcActivities', id)
    const activitySnap = await getDoc(activityRef)
    
    if (!activitySnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Activité non trouvée' },
        { status: 404 }
      )
    }
    
    // Suppression de l'activité
    await deleteDoc(activityRef)
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Activité supprimée avec succès'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
