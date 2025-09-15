"use client"

import { useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { KPIETPCard } from '@/components/dashboard/kpi-etp-card'
import { KPIRatioCard } from '@/components/dashboard/kpi-ratio-card'

const getRoleSpecificContent = (role: string) => {
  switch (role) {
    case 'administrateur':
      return {
        description: 'Gestion complète du système Allianz SaaS'
      }
    case 'cdc_commercial':
      return {
        description: 'Gestion des activités commerciales et des clients'
      }
    case 'cdc_sante_coll':
      return {
        description: 'Gestion des contrats de santé collective'
      }
    case 'cdc_sante_ind':
      return {
        description: 'Gestion des contrats de santé individuelle'
      }
    case 'cdc_sinistre':
      return {
        description: 'Gestion et suivi des sinistres'
      }
    default:
      return {
        description: 'Bienvenue sur votre tableau de bord'
      }
  }
}

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const roleContent = getRoleSpecificContent(user.role)

  // Dashboard spécial pour les administrateurs
  if (user.role === 'administrateur') {
    return (
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* En-tête de bienvenue - Pleine largeur */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Effets de fond animés */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 animate-fade-in">
                Bonjour, {user.firstName} ! 👋
              </h1>
              <p className="text-blue-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {roleContent.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Connecté en tant que {user.roleFront || user.role}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Dashboard Administrateur</span>
                </div>
              </div>
            </div>
          </div>

                    {/* KPIs - Cartes compactes responsive */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                        <KPIETPCard />
                      </div>
                      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                        <KPIRatioCard />
                      </div>
                    </div>

        </div>
      </DashboardLayout>
    )
  }

  // Dashboard standard pour les autres rôles
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-4">
        {/* Bannière de bienvenue centrée */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 sm:p-6 lg:p-8 text-white text-center max-w-2xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Bonjour, {user.firstName} ! 👋
          </h1>
          <p className="text-blue-100 text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
            {roleContent.description}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm sm:text-base lg:text-lg text-blue-100">
              Connecté en tant que {user.roleFront || user.role}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}