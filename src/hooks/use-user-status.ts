"use client"

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface UserStatus {
  isAuthenticated: boolean
  isActive: boolean
  role: string | null
  isLoading: boolean
  error: string | null
}

export function useUserStatus() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<UserStatus>({
    isAuthenticated: false,
    isActive: false,
    role: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (loading) {
      setStatus(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (!user) {
      setStatus({
        isAuthenticated: false,
        isActive: false,
        role: null,
        isLoading: false,
        error: null
      })
      return
    }

    // Vérifier si l'utilisateur est actif
    const isActive = user.isActive !== false // Par défaut true si non défini
    
    setStatus({
      isAuthenticated: true,
      isActive,
      role: user.role,
      isLoading: false,
      error: null
    })

    // Si l'utilisateur n'est pas actif, rediriger vers la page d'erreur
    if (!isActive) {
      router.push('/account-disabled')
    }
  }, [user, loading, router])

  return status
}
