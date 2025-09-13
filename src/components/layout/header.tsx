"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { WeatherWidget } from '@/components/dashboard/weather-widget'
import { LogOut, User, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

interface HeaderProps {
  variant?: 'dashboard' | 'login' | 'simple'
  showWeather?: boolean
  showUserActions?: boolean
  showThemeToggle?: boolean
  logoSize?: 'small' | 'medium' | 'large'
  className?: string
}

const logoSizes = {
  small: { width: 40, height: 40 },
  medium: { width: 128, height: 128 },
  large: { width: 240, height: 240 }
}

export function Header({
  variant = 'dashboard',
  showWeather = true,
  showUserActions = true,
  showThemeToggle = true,
  logoSize = 'large',
  className = ''
}: HeaderProps) {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleSignOut = () => {
    if (variant === 'dashboard') {
      // Redirection vers la page de déconnexion pour le dashboard
      window.location.href = '/logout'
    } else {
      // Déconnexion directe pour les autres pages
      signOut()
    }
  }

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const getHeaderHeight = () => {
    switch (variant) {
      case 'login':
        return 'h-16'
      case 'simple':
        return 'h-12'
      default:
        return 'h-24'
    }
  }

  const getLogoSize = () => {
    return logoSizes[logoSize]
  }

  const shouldShowWeather = showWeather && variant === 'dashboard'
  const shouldShowUserActions = showUserActions && user

  return (
    <header className={`${getHeaderHeight()} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm ${className}`}>
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/allianz.svg"
          alt="Allianz"
          width={getLogoSize().width}
          height={getLogoSize().height}
          className="dark:invert"
        />
      </div>

      {/* Météo et date - seulement pour le dashboard */}
      {shouldShowWeather && (
        <div className="flex-1 flex justify-center">
          <WeatherWidget />
        </div>
      )}

      {/* Actions utilisateur - seulement si connecté */}
      {shouldShowUserActions && (
        <div className="flex items-center space-x-6">
          {/* Informations utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {user?.roleFront || user?.role || 'Utilisateur'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-3">
            {showThemeToggle && (
              <button 
                onClick={handleThemeToggle}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                {theme === "light" ? (
                  <Moon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={handleSignOut}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/50 dark:hover:to-red-700/50 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      )}

      {/* Theme toggle seul - pour les pages non connectées */}
      {!user && showThemeToggle && (
        <div className="flex items-center">
          <button 
            onClick={handleThemeToggle}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            {theme === "light" ? (
              <Moon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      )}
    </header>
  )
}
