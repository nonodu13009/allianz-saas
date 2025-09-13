"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const getNavigationItems = (userRole: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      name: 'Accueil',
      href: '/dashboard',
      icon: Home,
      description: 'Vue d\'ensemble du dashboard'
    }
  ]

  // Ajouter "Équipe" seulement pour les administrateurs
  if (userRole === 'administrateur') {
    baseItems.push({
      name: 'Équipe',
      href: '/dashboard/team',
      icon: Users,
      description: 'Gestion des autorisations'
    })
  }

  return baseItems
}

export function DashboardSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const navigationItems = getNavigationItems(user.role)

  return (
    <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-6rem)] flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto min-h-12 px-4 py-3 text-left transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 mr-3 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  {item.description && (
                    <div className={cn(
                      "text-xs mt-1 leading-tight break-words",
                      isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0 ml-2" />
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Allianz SaaS v1.0
        </div>
      </div>
    </div>
  )
}