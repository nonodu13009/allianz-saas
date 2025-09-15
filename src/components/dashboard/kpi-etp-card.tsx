"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { UserService } from '@/lib/user-service'

export function KPIETPCard() {
  const [totalETP, setTotalETP] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadETPData()
  }, [])

  const loadETPData = async () => {
    try {
      const users = await UserService.getAllUsers()
      const activeUsersList = users.filter(user => user.isActive)
      const calculatedETP = activeUsersList.reduce((sum, user) => sum + (user.etp || 1), 0)
      
      setTotalETP(calculatedETP)
      setActiveUsers(activeUsersList.length)
    } catch (error) {
      console.error('Erreur lors du chargement des données ETP:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border-blue-300/20 dark:border-purple-700/20 shadow-xl rounded-xl p-3 sm:p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-blue-800 dark:text-blue-200">
            ETP Agence
          </CardTitle>
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            <div className="w-full h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calcul des équivalents temps plein
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border-blue-300/20 dark:border-purple-700/20 shadow-xl rounded-xl p-3 sm:p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-blue-800 dark:text-blue-200">
          ETP Agence
        </CardTitle>
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
      </CardHeader>
      <CardContent className="mt-2">
        <div className="flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
            {totalETP.toFixed(1)}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
            ETP
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Équivalent Temps Plein total
        </p>
        
        <div className="mt-2 sm:mt-3">
          <div className="flex items-center space-x-2 bg-white/10 dark:bg-gray-800/20 rounded-lg p-1.5 sm:p-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-400">Actifs</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{activeUsers}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}