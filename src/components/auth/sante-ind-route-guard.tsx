"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Shield, ArrowLeft, Heart } from 'lucide-react'

interface SanteIndRouteGuardProps {
  children: React.ReactNode
}

export function SanteIndRouteGuard({ children }: SanteIndRouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false)
    }
  }, [isLoading])

  // Vérifier si l'utilisateur a accès au module CDC Santé Individuelle
  const hasAccess = user?.role === 'cdc_sante_ind' || user?.role === 'administrateur'

  // Afficher un loader pendant la vérification
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    router.push('/login')
    return null
  }

  // Afficher la page d'accès refusé si l'utilisateur n'a pas les droits
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Accès refusé
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">CDC Santé Individuelle</span>
            </div>
            
            <p className="text-gray-600">
              Vous n'avez pas les autorisations nécessaires pour accéder au module 
              CDC Santé Individuelle.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Rôle requis :</strong> CD Santé Individuelle ou Administrateur
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Votre rôle actuel :</strong> {user.role}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au dashboard
              </Button>
              
              <Button
                onClick={() => router.push('/profile')}
                variant="default"
              >
                Vérifier mon profil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Afficher le contenu si l'utilisateur a accès
  return <>{children}</>
}
