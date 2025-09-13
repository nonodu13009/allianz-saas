"use client"

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react'

interface WeatherData {
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

const getWeatherIcon = (icon: string) => {
  switch (icon) {
    case '01d':
    case '01n':
      return <Sun className="h-5 w-5 text-yellow-500" />
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className="h-5 w-5 text-gray-500" />
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return <CloudRain className="h-5 w-5 text-blue-500" />
    case '11d':
    case '11n':
      return <CloudRain className="h-5 w-5 text-purple-500" />
    case '13d':
    case '13n':
      return <CloudSnow className="h-5 w-5 text-blue-300" />
    case '50d':
    case '50n':
      return <Wind className="h-5 w-5 text-gray-400" />
    default:
      return <Sun className="h-5 w-5 text-yellow-500" />
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    // Mettre à jour la date
    const updateDate = () => {
      setDate(new Date())
    }
    
    // Mettre à jour la date toutes les minutes
    const interval = setInterval(updateDate, 60000)
    
    // Simuler des données météo (en production, utiliser une vraie API)
    const fetchWeather = () => {
      setLoading(true)
      // Simulation de données météo pour Marseille
      setTimeout(() => {
        const weatherData: WeatherData = {
          temperature: Math.floor(Math.random() * 10) + 15, // 15-25°C
          description: ['Ensoleillé', 'Nuageux', 'Partiellement nuageux', 'Pluvieux'][Math.floor(Math.random() * 4)],
          icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
          windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
        }
        setWeather(weatherData)
        setLoading(false)
      }, 1000)
    }

    fetchWeather()
    
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="group relative">
      {/* Section principale avec effet hover */}
      <div className="flex items-center space-x-4 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500">
        {/* Date et heure */}
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
            {formatDate(date)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {formatTime(date)}
          </div>
        </div>

        {/* Séparateur */}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-300 dark:group-hover:bg-blue-500 transition-colors duration-300"></div>

        {/* Météo */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          ) : weather ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800/40 dark:group-hover:to-purple-800/40 transition-all duration-300">
                {getWeatherIcon(weather.icon)}
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                  {weather.temperature}°C
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {weather.description}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              Météo indisponible
            </div>
          )}
        </div>

        {/* Indicateur de localisation */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          <span>📍</span>
          <span className="font-medium">Marseille</span>
        </div>

        {/* Effet de brillance au hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  )
}
