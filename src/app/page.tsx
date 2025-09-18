"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { LogIn, Shield, BarChart3, Users, Settings, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Animation de chargement
    const timer1 = setTimeout(() => setIsLoaded(true), 500)
    const timer2 = setTimeout(() => setShowContent(true), 1000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard CDC",
      description: "Pilotage des commissions commerciales et santé individuelle",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Gestion d'équipe",
      description: "Suivi des performances et objectifs de l'équipe",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Settings,
      title: "Administration",
      description: "Configuration et gestion des utilisateurs",
      color: "from-purple-500 to-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="relative z-10">
        <Header 
          variant="simple"
          showWeather={false}
          showUserActions={false}
          showThemeToggle={true}
          logoSize="medium"
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50"
        />
        {/* Bouton Admin Firebase */}
        <div className="absolute top-4 right-4 z-20">
          <Link href="/admin_firebase">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-4 w-4 mr-2" />
              Admin Firebase
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Section Hero */}
          <div className="text-center mb-16">
            {/* Logo Allianz avec animation */}
            <div className="mb-8 flex justify-center">
              <div className={`transition-all duration-1000 ${
                isLoaded 
                  ? 'animate-scale-in hover:scale-105' 
                  : 'opacity-0 scale-50'
              }`}>
                <div className="relative">
                  <Image
                    src="/allianz.svg"
                    alt="Allianz"
                    width={200}
                    height={200}
                    className="max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[200px] w-auto h-auto drop-shadow-lg"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Titres avec animation */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-poppins font-bold mb-4 text-slate-900 dark:text-white transition-all duration-1000 leading-tight ${
              showContent 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Allianz
              </span>{' '}
              <span className="text-slate-700 dark:text-slate-300">
                Marseille
              </span>
            </h1>
            
            <h2 className={`text-lg sm:text-xl md:text-2xl font-poppins font-medium mb-8 text-slate-600 dark:text-slate-400 transition-all duration-1000 delay-300 ${
              showContent 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              SaaS de pilotage réservé aux agents
            </h2>

            {/* CTA principal */}
            <div className={`transition-all duration-1000 delay-500 ${
              showContent 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  <LogIn className="h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform" />
                  Se Connecter
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Section Features */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transition-all duration-1000 delay-700 ${
            showContent 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover-lift group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Section Sécurité */}
          <div className={`text-center transition-all duration-1000 delay-1000 ${
            showContent 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-poppins font-semibold text-slate-900 dark:text-white mb-2">
                Accès sécurisé
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Plateforme réservée aux agents Allianz avec authentification sécurisée
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
