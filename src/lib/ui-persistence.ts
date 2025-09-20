// Service de persistance des états UI
// Sauvegarde les préférences utilisateur et états temporaires

"use client"

// Clés de stockage
const UI_STATE_KEY = 'allianz_ui_state'
const FORM_DRAFTS_KEY = 'allianz_form_drafts'
const USER_PREFERENCES_KEY = 'allianz_user_preferences'

// Interface pour l'état UI global
export interface UIState {
  // Navigation
  currentYearMonth: string
  selectedDay?: number
  
  // Filtres
  cdcFilters: {
    type: string
    day?: number
  }
  santeIndFilters: {
    type: string
    compagnie?: string
    day?: number
  }
  
  // Modales
  modalStates: {
    cdc: {
      modalANOpen: boolean
      modalProcessOpen: boolean
      selectedProcessType?: string
    }
    santeInd: {
      modalActeOpen: boolean
      selectedActeType?: string
    }
  }
  
  // Préférences
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    autoSave: boolean
    notificationsEnabled: boolean
    defaultCompagnie?: string
  }
}

// Interface pour les brouillons de formulaires
export interface FormDraft {
  id: string
  type: 'cdc_an' | 'cdc_process' | 'sante_ind_acte'
  data: Record<string, any>
  timestamp: string
  userId: string
}

// Interface pour les préférences utilisateur
export interface UserPreferences {
  userId: string
  dashboard: {
    defaultYearMonth?: string
    defaultFilters?: Record<string, any>
    showAdvancedFilters?: boolean
  }
  forms: {
    autoSaveDrafts: boolean
    clearOnSuccess: boolean
    rememberLastValues: boolean
  }
  notifications: {
    enabled: boolean
    success: boolean
    errors: boolean
    warnings: boolean
  }
  theme: {
    mode: 'light' | 'dark' | 'auto'
    primaryColor?: string
  }
}

export class UIPersistenceService {
  private static instance: UIPersistenceService

  static getInstance(): UIPersistenceService {
    if (!UIPersistenceService.instance) {
      UIPersistenceService.instance = new UIPersistenceService()
    }
    return UIPersistenceService.instance
  }

  // 💾 Sauvegarde de l'état UI
  saveUIState(state: Partial<UIState>): void {
    try {
      const existingState = this.getUIState()
      const newState = { ...existingState, ...state }
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(newState))
    } catch (error) {
      console.error('Erreur sauvegarde état UI:', error)
    }
  }

  // 📖 Récupération de l'état UI
  getUIState(): UIState {
    try {
      const stored = localStorage.getItem(UI_STATE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erreur lecture état UI:', error)
    }

    // État par défaut
    const now = new Date()
    return {
      currentYearMonth: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      cdcFilters: { type: 'all' },
      santeIndFilters: { type: 'all' },
      modalStates: {
        cdc: {
          modalANOpen: false,
          modalProcessOpen: false
        },
        santeInd: {
          modalActeOpen: false
        }
      },
      preferences: {
        theme: 'auto',
        autoSave: true,
        notificationsEnabled: true
      }
    }
  }

  // 🗑️ Nettoyage de l'état UI
  clearUIState(): void {
    try {
      localStorage.removeItem(UI_STATE_KEY)
    } catch (error) {
      console.error('Erreur nettoyage état UI:', error)
    }
  }

  // 📝 Sauvegarde d'un brouillon de formulaire
  saveFormDraft(draft: FormDraft): void {
    try {
      const drafts = this.getFormDrafts()
      const existingIndex = drafts.findIndex(d => d.id === draft.id)
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft
      } else {
        drafts.push(draft)
      }
      
      // Garder seulement les 10 derniers brouillons
      const recentDrafts = drafts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
      
      localStorage.setItem(FORM_DRAFTS_KEY, JSON.stringify(recentDrafts))
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error)
    }
  }

  // 📖 Récupération des brouillons
  getFormDrafts(): FormDraft[] {
    try {
      const stored = localStorage.getItem(FORM_DRAFTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Erreur lecture brouillons:', error)
      return []
    }
  }

  // 🗑️ Suppression d'un brouillon
  deleteFormDraft(draftId: string): void {
    try {
      const drafts = this.getFormDrafts()
      const filteredDrafts = drafts.filter(d => d.id !== draftId)
      localStorage.setItem(FORM_DRAFTS_KEY, JSON.stringify(filteredDrafts))
    } catch (error) {
      console.error('Erreur suppression brouillon:', error)
    }
  }

  // ⚙️ Sauvegarde des préférences utilisateur
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error)
    }
  }

  // 📖 Récupération des préférences
  getUserPreferences(userId: string): UserPreferences | null {
    try {
      const stored = localStorage.getItem(USER_PREFERENCES_KEY)
      if (stored) {
        const prefs = JSON.parse(stored)
        return prefs.userId === userId ? prefs : null
      }
    } catch (error) {
      console.error('Erreur lecture préférences:', error)
    }
    return null
  }

  // 🔄 Auto-sauvegarde des données de formulaire
  autoSaveFormData(formId: string, formType: string, data: Record<string, any>, userId: string): void {
    const draft: FormDraft = {
      id: formId,
      type: formType as any,
      data,
      timestamp: new Date().toISOString(),
      userId
    }
    this.saveFormDraft(draft)
  }

  // 🧹 Nettoyage des données expirées (plus de 7 jours)
  cleanupExpiredData(): void {
    try {
      const drafts = this.getFormDrafts()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      const validDrafts = drafts.filter(draft => 
        new Date(draft.timestamp) > sevenDaysAgo
      )
      
      if (validDrafts.length !== drafts.length) {
        localStorage.setItem(FORM_DRAFTS_KEY, JSON.stringify(validDrafts))
        console.log(`Nettoyage: ${drafts.length - validDrafts.length} brouillons expirés supprimés`)
      }
    } catch (error) {
      console.error('Erreur nettoyage données:', error)
    }
  }

  // 📊 Statistiques de stockage
  getStorageStats(): {
    uiStateSize: number
    draftsCount: number
    totalSize: number
  } {
    try {
      const uiState = localStorage.getItem(UI_STATE_KEY) || ''
      const drafts = localStorage.getItem(FORM_DRAFTS_KEY) || ''
      
      return {
        uiStateSize: uiState.length,
        draftsCount: this.getFormDrafts().length,
        totalSize: uiState.length + drafts.length
      }
    } catch (error) {
      return { uiStateSize: 0, draftsCount: 0, totalSize: 0 }
    }
  }
}

// Hook React pour utiliser le service
export function useUIPersistence() {
  const service = UIPersistenceService.getInstance()
  
  return {
    saveUIState: service.saveUIState.bind(service),
    getUIState: service.getUIState.bind(service),
    clearUIState: service.clearUIState.bind(service),
    saveFormDraft: service.saveFormDraft.bind(service),
    getFormDrafts: service.getFormDrafts.bind(service),
    deleteFormDraft: service.deleteFormDraft.bind(service),
    autoSaveFormData: service.autoSaveFormData.bind(service),
    cleanupExpiredData: service.cleanupExpiredData.bind(service),
    getStorageStats: service.getStorageStats.bind(service)
  }
}
