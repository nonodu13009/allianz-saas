"use client"

import { useState } from 'react'
import { useAuth } from '../../../../contexts/auth-context'
import { SanteIndRouteGuard } from '../../../../components/auth/sante-ind-route-guard'
import { ModalActeSimple } from '../../../../components/sante-ind/ModalActeSimple'

export default function SimpleSanteIndPage() {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <SanteIndRouteGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">CDC Santé Individuelle - Version Simple</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="mb-2">Utilisateur: {user?.email}</p>
          <p className="mb-4">Rôle: {user?.role}</p>
          
          <button 
            onClick={handleOpenModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ouvrir Modal Test
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Statut</h2>
          <p className="text-green-600">✅ Page chargée avec succès</p>
          <p className="text-green-600">✅ Authentification fonctionnelle</p>
          <p className="text-green-600">✅ Garde de route active</p>
        </div>

        <ModalActeSimple
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </SanteIndRouteGuard>
  )
}
