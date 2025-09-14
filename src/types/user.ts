export interface User {
  uid: string
  email: string
  // Informations essentielles
  firstName: string
  lastName: string
  password: string // Mot de passe en clair pour l'admin
  role: 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
  roleFront: string
  etp: number // Équivalent temps plein (0.5, 0.6, 1)
  genre: 'Homme' | 'Femme'
  // Métadonnées
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
}

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
  roleFront: string
  etp: number
  genre: 'Homme' | 'Femme'
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
  roleFront?: string
  etp?: number
  genre?: 'Homme' | 'Femme'
  isActive?: boolean
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
}