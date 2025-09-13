"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(3)
  const [message, setMessage] = useState('Déconnexion en cours...')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    // Marquer comme monté côté client
    setMounted(true)

    // Déconnexion immédiate
    const performLogout = async () => {
      try {
        await signOut()
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }

    performLogout()

    // Compte à rebours
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setMessage('À bientôt ! 👋')
          
          // Redirection vers la homepage après 1 seconde
          setTimeout(() => {
            router.push('/')
          }, 1000)
          
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [signOut, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Particules flottantes - seulement côté client */}
      {mounted && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Contenu principal */}
      <div className="text-center z-10">
        {/* Logo Allianz */}
        <div className="mb-8 animate-pulse">
          <Image
            src="/allianz.svg"
            alt="Allianz"
            width={120}
            height={120}
            className="mx-auto drop-shadow-2xl dark:invert"
          />
        </div>

        {/* Message de déconnexion */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            {message}
          </h1>
          
          {countdown > 0 && (
            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-bounce">
              {countdown}
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Message de redirection */}
        {countdown === 0 && (
          <p className="text-lg text-gray-300 mt-8 animate-fade-in">
            Redirection vers la page d'accueil...
          </p>
        )}
      </div>

      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
    </div>
  )
}
