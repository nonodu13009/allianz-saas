"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { User } from '@/types/user'
import { UserService } from '@/lib/user-service'
import { toast } from 'sonner'
import { UserCheck, UserX } from 'lucide-react'

interface UserStatusToggleProps {
  user: User
  onStatusChange: () => void
}

export function UserStatusToggle({ user, onStatusChange }: UserStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true)
      await UserService.updateUser(user.uid, { isActive: checked })
      
      toast.success(
        checked 
          ? `${user.firstName} ${user.lastName} a été réactivé` 
          : `${user.firstName} ${user.lastName} a été désactivé`
      )
      
      onStatusChange()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Toggle
        checked={user.isActive}
        onChange={handleToggle}
        disabled={isUpdating}
        size="md"
      />
      <div className="flex items-center space-x-1">
        {user.isActive ? (
          <>
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Actif</span>
          </>
        ) : (
          <>
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">Inactif</span>
          </>
        )}
      </div>
    </div>
  )
}
