// Composant des boutons de saisie CDC avec effets WOW
// 4 boutons flashy : AN, M+3, Préterme Auto, Préterme IRD

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ActivityType } from '@/types/cdc'
import { 
  PlusCircle, 
  TrendingUp, 
  Car, 
  Shield,
  Sparkles,
  Zap,
  Star,
  Rocket
} from 'lucide-react'

interface CDCButtonsProps {
  onButtonClick: (type: ActivityType) => void
  isLocked?: boolean
  disabled?: boolean
}

export function CDCButtons({ onButtonClick, isLocked = false, disabled = false }: CDCButtonsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [clickedButton, setClickedButton] = useState<string | null>(null)

  const handleButtonClick = (type: ActivityType) => {
    if (disabled || isLocked) return
    
    setClickedButton(type)
    onButtonClick(type)
    
    // Reset l'effet de clic après 300ms
    setTimeout(() => setClickedButton(null), 300)
  }

  const buttonConfigs = [
    {
      type: ActivityType.AN,
      label: 'Affaires Nouvelles',
      shortLabel: 'AN',
      icon: PlusCircle,
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      hoverGradient: 'from-emerald-400 via-green-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/50',
      hoverShadowColor: 'shadow-emerald-400/60',
      glowColor: 'shadow-emerald-400/40',
      description: 'Nouveau contrat',
      emoji: '✨',
      effects: ['sparkle', 'pulse', 'glow']
    },
    {
      type: ActivityType.M3,
      label: 'Process M+3',
      shortLabel: 'M+3',
      icon: TrendingUp,
      gradient: 'from-blue-500 via-indigo-600 to-purple-700',
      hoverGradient: 'from-blue-400 via-indigo-500 to-purple-600',
      shadowColor: 'shadow-blue-500/50',
      hoverShadowColor: 'shadow-blue-400/60',
      glowColor: 'shadow-blue-400/40',
      description: 'Prise de contact avec client récent',
      emoji: '📈',
      effects: ['wave', 'shimmer', 'glow']
    },
    {
      type: ActivityType.PRETERME_AUTO,
      label: 'Préterme Auto',
      shortLabel: 'Auto',
      icon: Car,
      gradient: 'from-orange-500 via-red-600 to-pink-700',
      hoverGradient: 'from-orange-400 via-red-500 to-pink-600',
      shadowColor: 'shadow-orange-500/50',
      hoverShadowColor: 'shadow-orange-400/60',
      glowColor: 'shadow-orange-400/40',
      description: 'Clients avec des majorations anormales en Auto',
      emoji: '🚗',
      effects: ['bounce', 'shake', 'glow']
    },
    {
      type: ActivityType.PRETERME_IRD,
      label: 'Préterme IRD',
      shortLabel: 'IRD',
      icon: Shield,
      gradient: 'from-violet-500 via-purple-600 to-indigo-700',
      hoverGradient: 'from-violet-400 via-purple-500 to-indigo-600',
      shadowColor: 'shadow-violet-500/50',
      hoverShadowColor: 'shadow-violet-400/60',
      glowColor: 'shadow-violet-400/40',
      description: 'Clients avec des majorations anormales en IARD',
      emoji: '🛡️',
      effects: ['float', 'pulse', 'glow']
    }
  ]

  return (
    <div className="w-full">
      {/* Titre de la section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Saisie d'Activité
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choisissez le type d'activité à saisir
        </p>
      </div>

      {/* Grille des boutons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {buttonConfigs.map((config, index) => {
          const IconComponent = config.icon
          const isHovered = hoveredButton === config.type
          const isClicked = clickedButton === config.type
          const isDisabled = disabled || isLocked

          return (
            <div
              key={config.type}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Effet de fond animé */}
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500
                bg-gradient-to-r ${config.gradient} blur-xl
                ${isHovered ? 'scale-110' : 'scale-100'}
              `} />

              {/* Bouton principal */}
              <Button
                onClick={() => handleButtonClick(config.type)}
                onMouseEnter={() => setHoveredButton(config.type)}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={isDisabled}
                className={`
                  relative w-full h-32 sm:h-36 p-4 rounded-2xl
                  bg-gradient-to-br ${config.gradient}
                  hover:bg-gradient-to-br ${config.hoverGradient}
                  shadow-lg ${config.shadowColor}
                  hover:shadow-xl ${config.hoverShadowColor}
                  hover:scale-105 active:scale-95
                  transition-all duration-300 ease-out
                  border-2 border-white/20
                  overflow-hidden
                  ${isClicked ? 'animate-pulse' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isHovered ? `shadow-2xl ${config.glowColor}` : ''}
                `}
              >
                {/* Effet de particules flottantes */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`
                        absolute w-1 h-1 bg-white/30 rounded-full
                        animate-float
                        ${isHovered ? 'animate-ping' : ''}
                      `}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + i * 10}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '3s'
                      }}
                    />
                  ))}
                </div>

                {/* Contenu du bouton */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                  {/* Icône avec effet de rotation */}
                  <div className={`
                    mb-2 transition-transform duration-300
                    ${isHovered ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}
                    ${isClicked ? 'animate-spin' : ''}
                  `}>
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  {/* Emoji avec effet de rebond */}
                  <div className={`
                    text-2xl sm:text-3xl mb-2 transition-transform duration-300
                    ${isHovered ? 'animate-bounce' : ''}
                    ${isClicked ? 'scale-125' : 'scale-100'}
                  `}>
                    {config.emoji}
                  </div>

                  {/* Labels */}
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-base mb-1">
                      {config.shortLabel}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90 leading-tight">
                      {config.label}
                    </div>
                  </div>

                  {/* Effet de brillance au survol */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                    transform -skew-x-12 translate-x-full
                    transition-transform duration-1000
                    ${isHovered ? 'translate-x-[-200%]' : 'translate-x-full'}
                  `} />
                </div>

                {/* Indicateur de verrouillage */}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔒</span>
                    </div>
                  </div>
                )}
              </Button>

              {/* Description au survol */}
              <div className={`
                absolute -bottom-16 left-1/2 transform -translate-x-1/2
                bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                px-3 py-2 rounded-lg text-xs font-medium
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                pointer-events-none z-20
                shadow-lg
              `}>
                {config.description}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Indicateur de statut */}
      {isLocked && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Mois verrouillé - Saisie impossible
          </div>
        </div>
      )}

      {/* Styles CSS personnalisés pour les animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
