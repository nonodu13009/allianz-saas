"use client"

import { useTheme } from 'next-themes'
import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 128, height = 128, className = "" }: LogoProps) {
  const { theme } = useTheme()

  // Pour le mode sombre, on utilise le SVG avec une couleur claire
  // Pour le mode clair, on utilise le SVG avec une couleur foncée
  const logoSrc = theme === 'dark' ? '/allianz-white.svg' : '/allianz.svg'

  return (
    <Image
      src={logoSrc}
      alt="Allianz"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
