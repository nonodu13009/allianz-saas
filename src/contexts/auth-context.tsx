"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { UserService } from '@/lib/user-service'
import { User, AuthUser } from '@/types/user'

interface AuthContextType {
  // État d'authentification
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  
  // Actions d'authentification
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: {
    firstName: string
    lastName: string
    role: 'admin' | 'user' | 'manager' | 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
    company?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  
  // Actions utilisateur
  updateUser: (updates: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true)
      
      if (firebaseUser) {
        // Utilisateur connecté
        const authUserData: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber
        }
        setAuthUser(authUserData)

        // Récupérer les données utilisateur depuis Firestore
        try {
          const userData = await UserService.getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
            // Mettre à jour la dernière connexion
            await UserService.updateLastLogin(firebaseUser.uid)
          } else {
            // Utilisateur n'existe pas dans Firestore, le créer
            console.warn('User not found in Firestore, creating...')
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        // Utilisateur déconnecté
        setUser(null)
        setAuthUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string
      lastName: string
      role: 'admin' | 'user' | 'manager' | 'administrateur' | 'cdc_commercial' | 'cdc_sante_coll' | 'cdc_sante_ind' | 'cdc_sinistre'
      company?: string
    }
  ) => {
    try {
      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Mettre à jour le profil Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })

      // Créer l'utilisateur dans Firestore
      await UserService.createUser(firebaseUser.uid, userData, firebaseUser.email || undefined)
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      await UserService.updateUser(user.uid, updates)
      // Rafraîchir les données utilisateur
      await refreshUser()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    if (!authUser) return
    
    try {
      const userData = await UserService.getUser(authUser.uid)
      setUser(userData)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    authUser,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    updateUser,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
