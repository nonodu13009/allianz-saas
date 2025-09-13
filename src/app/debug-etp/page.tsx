"use client"

import { useEffect, useState } from 'react'
import { UserService } from '@/lib/user-service'
import { User } from '@/types/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugETPPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const allUsers = await UserService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  const activeUsers = users.filter(user => user.isActive)
  const totalETP = activeUsers.reduce((sum, user) => sum + (user.etp || 1), 0)

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug ETP - Données en base</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalETP.toFixed(1)}</div>
              <div className="text-sm text-gray-600">ETP Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
              <div className="text-sm text-gray-600">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total utilisateurs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détail des utilisateurs actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeUsers.map((user, index) => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.role} • {user.genre}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{user.etp || 1} ETP</div>
                  <div className="text-xs text-gray-500">
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calcul manuel attendu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>Jean-Michel Nogaro: 1.0 ETP</div>
            <div>Julien Boetti: 1.0 ETP</div>
            <div>Gwendal Clouet: 1.0 ETP</div>
            <div>Emma Nogaro: 0.5 ETP</div>
            <div>Joelle Abi Karam: 1.0 ETP</div>
            <div>Astrid Ulrich: 1.0 ETP</div>
            <div>Karen Chollet: 0.6 ETP</div>
            <div>Kheira Bagnasco: 1.0 ETP</div>
            <div>Virginie Tommasini: 1.0 ETP</div>
            <div>Nejma Hariati: 1.0 ETP</div>
            <div>Corentin Ulrich: 1.0 ETP</div>
            <div>Donia Sahraoui: 1.0 ETP</div>
            <div className="border-t pt-2 font-bold">Total attendu: 11.1 ETP</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
