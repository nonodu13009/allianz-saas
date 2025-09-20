"use client"

import { useState } from 'react'
import { Button } from '../ui/button'

interface ModalActeSimpleProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalActeSimple({ isOpen, onClose }: ModalActeSimpleProps) {
  const [nomClient, setNomClient] = useState('')

  const handleSave = () => {
    console.log('Sauvegarde:', nomClient)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Test Modal</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nom du client
          </label>
          <input
            type="text"
            value={nomClient}
            onChange={(e) => setNomClient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ex: Jean Dupont"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline">
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  )
}
