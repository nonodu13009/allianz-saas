// Hook pour la persistance des états de modales
// Sauvegarde automatiquement l'état des modales et des formulaires

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUIPersistence } from '@/lib/ui-persistence'

interface ModalState {
  isOpen: boolean
  data?: Record<string, any>
  timestamp?: string
}

interface UseModalPersistenceOptions {
  modalId: string
  userId: string
  autoSave?: boolean
  autoSaveInterval?: number
  clearOnSuccess?: boolean
}

export function useModalPersistence({
  modalId,
  userId,
  autoSave = true,
  autoSaveInterval = 2000, // 2 secondes
  clearOnSuccess = true
}: UseModalPersistenceOptions) {
  const { saveFormDraft, getFormDrafts, deleteFormDraft, saveUIState, getUIState } = useUIPersistence()
  
  const [modalState, setModalState] = useState<ModalState>(() => {
    // Récupérer l'état sauvegardé au montage
    const savedState = getUIState()
    return {
      isOpen: savedState.modalStates[modalId as keyof typeof savedState.modalStates]?.isOpen || false,
      data: undefined,
      timestamp: undefined
    }
  })

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Sauvegarde automatique des données de formulaire
  const autoSaveFormData = useCallback((data: Record<string, any>) => {
    if (autoSave && Object.keys(data).length > 0) {
      const draft = {
        id: `${modalId}_${userId}_${Date.now()}`,
        type: modalId as any,
        data,
        timestamp: new Date().toISOString(),
        userId
      }
      saveFormDraft(draft)
    }
  }, [autoSave, modalId, userId, saveFormDraft])

  // Démarrage du timer d'auto-sauvegarde
  const startAutoSave = useCallback((data: Record<string, any>) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      autoSaveFormData(data)
    }, autoSaveInterval)

    setAutoSaveTimer(timer)
  }, [autoSaveTimer, autoSaveFormData, autoSaveInterval])

  // Arrêt du timer d'auto-sauvegarde
  const stopAutoSave = useCallback(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      setAutoSaveTimer(null)
    }
  }, [autoSaveTimer])

  // Ouverture de la modale
  const openModal = useCallback((initialData?: Record<string, any>) => {
    setModalState({
      isOpen: true,
      data: initialData,
      timestamp: new Date().toISOString()
    })

    // Charger les données initiales ou les dernières sauvegardées
    if (initialData) {
      setFormData(initialData)
    } else {
      // Chercher le dernier brouillon pour cette modale
      const drafts = getFormDrafts()
      const lastDraft = drafts
        .filter(d => d.type === modalId && d.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      if (lastDraft) {
        setFormData(lastDraft.data)
      }
    }

    // Sauvegarder l'état de la modale
    const uiState = getUIState()
    saveUIState({
      modalStates: {
        ...uiState.modalStates,
        [modalId]: { isOpen: true }
      }
    })
  }, [modalId, userId, getFormDrafts, getUIState, saveUIState])

  // Fermeture de la modale
  const closeModal = useCallback((clearData = false) => {
    stopAutoSave()
    
    setModalState({
      isOpen: false,
      data: undefined,
      timestamp: undefined
    })

    if (clearData) {
      setFormData({})
    }

    // Sauvegarder l'état de la modale
    const uiState = getUIState()
    saveUIState({
      modalStates: {
        ...uiState.modalStates,
        [modalId]: { isOpen: false }
      }
    })
  }, [modalId, stopAutoSave, getUIState, saveUIState])

  // Mise à jour des données de formulaire avec auto-sauvegarde
  const updateFormData = useCallback((newData: Record<string, any>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData }
      
      // Déclencher l'auto-sauvegarde
      if (modalState.isOpen) {
        startAutoSave(updated)
      }
      
      return updated
    })
  }, [modalState.isOpen, startAutoSave])

  // Sauvegarde manuelle
  const saveForm = useCallback((data: Record<string, any>) => {
    stopAutoSave()
    autoSaveFormData(data)
  }, [stopAutoSave, autoSaveFormData])

  // Sauvegarde réussie (nettoyage)
  const onSaveSuccess = useCallback(() => {
    if (clearOnSuccess) {
      setFormData({})
      // Supprimer les brouillons pour cette modale
      const drafts = getFormDrafts()
      drafts
        .filter(d => d.type === modalId && d.userId === userId)
        .forEach(draft => deleteFormDraft(draft.id))
    }
    closeModal(true)
  }, [clearOnSuccess, modalId, userId, getFormDrafts, deleteFormDraft, closeModal])

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopAutoSave()
    }
  }, [stopAutoSave])

  // Nettoyage périodique des données expirées
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const drafts = getFormDrafts()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      drafts
        .filter(draft => new Date(draft.timestamp) < sevenDaysAgo)
        .forEach(draft => deleteFormDraft(draft.id))
    }, 24 * 60 * 60 * 1000) // Toutes les 24h

    return () => clearInterval(cleanupInterval)
  }, [getFormDrafts, deleteFormDraft])

  return {
    // État
    isOpen: modalState.isOpen,
    formData,
    
    // Actions
    openModal,
    closeModal,
    updateFormData,
    saveForm,
    onSaveSuccess,
    
    // Utilitaires
    hasUnsavedChanges: Object.keys(formData).length > 0,
    lastSaved: modalState.timestamp
  }
}
