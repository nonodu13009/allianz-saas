"use client"

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Animation de chargement
    const timer1 = setTimeout(() => setIsLoaded(true), 500)
    const timer2 = setTimeout(() => setShowText(true), 1000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image de fond avec flou léger */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dashboard.jpg"
          alt="Allianz Marseille"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Header 
          variant="simple"
          showWeather={false}
          showUserActions={false}
          showThemeToggle={false}
          logoSize="medium"
          className="border-white/20 bg-black/10 backdrop-blur-sm"
        />
        {/* Bouton Admin Firebase */}
        <div className="absolute top-4 right-4 z-20">
          <Link href="/admin_firebase">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Admin Firebase
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenu principal centré */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo Allianz avec animation */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className={`transition-all duration-1000 ${
              isLoaded 
                ? 'animate-pulse hover:scale-105 hover:rotate-2' 
                : 'opacity-0 scale-50'
            }`}>
              <Image
                src="/allianz.svg"
                alt="Allianz"
                width={200}
                height={200}
                className="drop-shadow-2xl max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px] xl:max-w-[200px] w-auto h-auto"
              />
            </div>
          </div>

          {/* Titres avec animation de typing */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-poppins font-bold mb-3 sm:mb-4 drop-shadow-2xl transition-all duration-1000 leading-tight ${
            showText 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <span className="inline-block animate-pulse">Allianz</span>{' '}
            <span className="inline-block animate-bounce">Marseille</span>
          </h1>
          
          <h2 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-poppins font-medium mb-4 sm:mb-6 drop-shadow-xl transition-all duration-1000 delay-500 ${
            showText 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            Saas de pilotage réservé
          </h2>

          {/* CTA avec effet glow */}
          <div className={`transition-all duration-1000 delay-1000 ${
            showText 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse hover:animate-none hover:scale-105 hover:shadow-white/50 hover:shadow-2xl w-full sm:w-auto"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Se Connecter
              </Button>
            </Link>
          </div>

          {/* Particules flottantes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
