"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { AlertTriangle, Mail, Phone, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AccountDisabledPage() {
  const { user, signOut } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Image de fond avec flou léger */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dashboard.jpg"
          alt="Allianz Marseille"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Header
          variant="simple"
          showWeather={false}
          showUserActions={false}
          showThemeToggle={true}
          logoSize="medium"
          className="border-white/20 bg-black/10 backdrop-blur-sm"
        />
      </div>

      {/* Contenu principal centré */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader className="text-center pb-8">
              {/* Logo Allianz */}
              <div className="mb-6">
                <Image
                  src="/allianz.svg"
                  alt="Allianz"
                  width={120}
                  height={120}
                  className="mx-auto drop-shadow-lg dark:invert"
                />
              </div>

              {/* Icône d'alerte */}
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>

              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Compte Désactivé
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Votre accès au système Allianz SaaS a été temporairement suspendu.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informations utilisateur */}
              {user && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Informations du compte
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Email :</strong> {user.email}</p>
                    <p><strong>Rôle :</strong> {user.roleFront || user.role}</p>
                  </div>
                </div>
              )}

              {/* Message principal */}
              <div className="text-center space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Votre compte a été désactivé par un administrateur. 
                  Pour réactiver votre accès, veuillez contacter l'équipe technique.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Besoin d'aide ?</strong> Notre équipe est là pour vous accompagner.
                  </p>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@allianz-nogaro.fr</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Téléphone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">04 XX XX XX XX</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
                
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
