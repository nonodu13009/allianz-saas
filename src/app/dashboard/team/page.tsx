"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Toggle } from '@/components/ui/toggle'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  X,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'
import { User } from '@/types/user'
import { UserService } from '@/lib/user-service'
import { UserStatusToggle } from '@/components/admin/user-status-toggle'
import { toast } from 'sonner'

export default function TeamPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // États pour les formulaires
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    genre: 'Homme' as 'Homme' | 'Femme',
    role: 'cdc_commercial' as User['role'],
    roleFront: '',
    etp: 1,
    isActive: true
  })


  // Charger les utilisateurs
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Récupérer tous les utilisateurs (vous devrez implémenter cette méthode)
      const allUsers = await UserService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roleFront?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fonctions CRUD
  const handleCreateUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      genre: 'Homme',
      role: 'cdc_commercial',
      roleFront: '',
      etp: 1,
      isActive: true
    })
    setShowPassword(false)
    setIsCreateDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      genre: user.genre || 'Homme',
      role: user.role,
      roleFront: user.roleFront || '',
      etp: user.etp || 1,
      isActive: user.isActive
    })
    setShowPassword(false)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      setFormLoading(true)
      await UserService.deleteUser(userToDelete.uid)
      toast.success('Utilisateur supprimé avec succès')
      loadUsers()
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de l\'utilisateur')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      // Ici vous devrez implémenter la création d'utilisateur
      // await UserService.createUser(formData)
      toast.success('Utilisateur créé avec succès')
      loadUsers()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création de l\'utilisateur')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    
    try {
      setFormLoading(true)
      await UserService.updateUser(selectedUser.uid, formData)
      toast.success('Utilisateur modifié avec succès')
      loadUsers()
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error('Erreur lors de la modification de l\'utilisateur')
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      genre: 'Homme',
      role: 'cdc_commercial',
      roleFront: '',
      etp: 1,
      isActive: true
    })
  }

  // Validation de l'email
  const validateEmail = (email: string) => {
    return email.endsWith('@allianz-nogaro.fr')
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrateur':
        return 'destructive'
      case 'cdc_commercial':
        return 'default'
      case 'cdc_sante_coll':
      case 'cdc_sante_ind':
        return 'secondary'
      case 'cdc_sinistre':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="administrateur">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des autorisations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez les utilisateurs et leurs permissions dans le système
            </p>
          </div>
          <Button 
            onClick={handleCreateUser}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>


        {/* Recherche et filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>ETP</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Allianz Nogaro
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.roleFront || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {user.etp || 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.genre || 'Non défini'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserStatusToggle 
                          user={user} 
                          onStatusChange={loadUsers}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de création */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouvel utilisateur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="nom@allianz-nogaro.fr"
                  required
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">L'email doit se terminer par @allianz-nogaro.fr</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Mot de passe <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Mot de passe"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm font-medium">Rôle <span className="text-red-500">*</span></label>
                         <select
                           value={formData.role}
                           onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value="administrateur">Administrateur</option>
                           <option value="cdc_commercial">CDC Commercial</option>
                           <option value="cdc_sante_coll">CDC Santé Collective</option>
                           <option value="cdc_sante_ind">CDC Santé Individuel</option>
                           <option value="cdc_sinistre">CDC Sinistre</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-sm font-medium">Rôle Front</label>
                         <Input
                           value={formData.roleFront}
                           onChange={(e) => setFormData({...formData, roleFront: e.target.value})}
                           placeholder="Ex: Agent Général"
                         />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm font-medium">ETP <span className="text-red-500">*</span></label>
                         <select
                           value={formData.etp}
                           onChange={(e) => setFormData({...formData, etp: parseFloat(e.target.value)})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value={0.5}>0.5</option>
                           <option value={0.6}>0.6</option>
                           <option value={1}>1</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-sm font-medium">Genre <span className="text-red-500">*</span></label>
                         <select
                           value={formData.genre}
                           onChange={(e) => setFormData({...formData, genre: e.target.value as 'Homme' | 'Femme'})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value="Homme">Homme</option>
                           <option value="Femme">Femme</option>
                         </select>
                       </div>
                     </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Utilisateur actif
                </label>
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData({...formData, isActive: checked})}
                  size="md"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Création...' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur sélectionné.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="nom@allianz-nogaro.fr"
                  required
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">L'email doit se terminer par @allianz-nogaro.fr</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Laisser vide pour ne pas changer"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm font-medium">Rôle <span className="text-red-500">*</span></label>
                         <select
                           value={formData.role}
                           onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value="administrateur">Administrateur</option>
                           <option value="cdc_commercial">CDC Commercial</option>
                           <option value="cdc_sante_coll">CDC Santé Collective</option>
                           <option value="cdc_sante_ind">CDC Santé Individuel</option>
                           <option value="cdc_sinistre">CDC Sinistre</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-sm font-medium">Rôle Front</label>
                         <Input
                           value={formData.roleFront}
                           onChange={(e) => setFormData({...formData, roleFront: e.target.value})}
                           placeholder="Ex: Agent Général"
                         />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm font-medium">ETP <span className="text-red-500">*</span></label>
                         <select
                           value={formData.etp}
                           onChange={(e) => setFormData({...formData, etp: parseFloat(e.target.value)})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value={0.5}>0.5</option>
                           <option value={0.6}>0.6</option>
                           <option value={1}>1</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-sm font-medium">Genre <span className="text-red-500">*</span></label>
                         <select
                           value={formData.genre}
                           onChange={(e) => setFormData({...formData, genre: e.target.value as 'Homme' | 'Femme'})}
                           className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                           required
                         >
                           <option value="Homme">Homme</option>
                           <option value="Femme">Femme</option>
                         </select>
                       </div>
                     </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Utilisateur actif
                </label>
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData({...formData, isActive: checked})}
                  size="md"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Modification...' : 'Modifier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userToDelete.firstName[0]}{userToDelete.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-red-900 dark:text-red-100">
                      {userToDelete.firstName} {userToDelete.lastName}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {userToDelete.email}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {userToDelete.roleFront || userToDelete.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                onClick={confirmDeleteUser}
                disabled={formLoading}
              >
                {formLoading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
