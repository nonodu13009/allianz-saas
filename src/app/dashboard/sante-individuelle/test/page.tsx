"use client"

import { useState } from 'react'
import { useAuth } from '../../../../contexts/auth-context'
import { SanteIndRouteGuard } from '../../../../components/auth/sante-ind-route-guard'

export default function TestPage() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(prev => prev + 1)
  }

  return (
    <SanteIndRouteGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Test CDC Santé Individuelle</h1>
        <p className="mb-4">Utilisateur: {user?.email}</p>
        <p className="mb-4">Rôle: {user?.role}</p>
        <button 
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Compteur: {count}
        </button>
      </div>
    </SanteIndRouteGuard>
  )
}
