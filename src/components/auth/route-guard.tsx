"use client"

import { useUserStatus } from '@/hooks/use-user-status'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requireActive?: boolean
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  requireActive = true 
}: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { isAuthenticated, isActive, role, isLoading } = useUserStatus()

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return

    // Attendre que le chargement soit terminé
    if (loading || isLoading) return

    // Vérifier l'authentification
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Vérifier le statut actif si requis
    if (requireActive && !isActive) {
      router.push('/account-disabled')
      return
    }

    // Vérifier le rôle si spécifié
    if (requiredRole && role !== requiredRole) {
      router.push('/dashboard') // Rediriger vers le dashboard par défaut
      return
    }
  }, [isAuthenticated, isActive, role, loading, isLoading, router, requiredRole, requireActive])

  // Afficher un loader pendant la vérification
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  // Si l'utilisateur n'est pas actif et que c'est requis, ne rien afficher (redirection en cours)
  if (requireActive && !isActive) {
    return null
  }

  // Si le rôle ne correspond pas, ne rien afficher (redirection en cours)
  if (requiredRole && role !== requiredRole) {
    return null
  }

  // Tout est OK, afficher le contenu
  return <>{children}</>
}
