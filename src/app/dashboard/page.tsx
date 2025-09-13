"use client"

import { useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { KPIETPCard } from '@/components/dashboard/kpi-etp-card'

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
        <div className="space-y-8 p-6">
          {/* En-tête de bienvenue - Pleine largeur */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Effets de fond animés */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-5xl font-bold mb-4 animate-fade-in">
                Bonjour, {user.firstName} ! 👋
              </h1>
              <p className="text-blue-100 text-2xl mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {roleContent.description}
              </p>
              <div className="flex items-center justify-center space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Connecté en tant que {user.roleFront || user.role}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Dashboard Administrateur</span>
                </div>
              </div>
            </div>
          </div>

                 {/* KPI ETP - Carte compacte */}
                 <div className="flex justify-start">
                   <div className="w-1/4">
                     <KPIETPCard />
                   </div>
                 </div>

        </div>
      </DashboardLayout>
    )
  }

  // Dashboard standard pour les autres rôles
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        {/* Bannière de bienvenue centrée */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Bonjour, {user.firstName} ! 👋
          </h1>
          <p className="text-blue-100 text-xl mb-6">
            {roleContent.description}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-lg text-blue-100">
              Connecté en tant que {user.roleFront || user.role}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}