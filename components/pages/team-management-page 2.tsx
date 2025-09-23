'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { createUser, updateUser, deleteUser, getUsers, UserData } from '@/lib/firebase-users';

export function TeamManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: 'allianz', // Mot de passe par défaut
    prenom: '',
    nom: '',
    role: '',
    role_front: '',
    etp: '',
    genre: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const userData = {
        ...formData,
        password: formData.password || 'allianz' // Mot de passe par défaut
      };
      await createUser(userData);
      await loadUsers();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.uid) return;
    
    try {
      const updateData = {
        ...formData,
        etp: formData.etp ? parseFloat(formData.etp) : 1
      };
      await updateUser(editingUser.uid, updateData);
      await loadUsers();
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await deleteUser(uid);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: 'allianz', // Mot de passe par défaut
      prenom: '',
      nom: '',
      role: '',
      role_front: '',
      etp: '',
      genre: ''
    });
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      prenom: user.prenom || '',
      nom: user.nom || '',
      role: user.role || '',
      role_front: user.role_front || '',
      etp: user.etp ? user.etp.toString() : '',
      genre: user.genre || ''
    });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.prenom && user.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    Gestion d'équipe
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Gérez les utilisateurs et leurs informations complémentaires
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Nouvel utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                      <DialogDescription>
                        Ajoutez un nouvel utilisateur à votre équipe
                      </DialogDescription>
                    </DialogHeader>
                    <UserForm 
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleCreateUser}
                      isEdit={false}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profils complets</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users.filter(u => u.prenom && u.nom && u.role).length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En attente</CardTitle>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users.filter(u => !u.prenom || !u.nom || !u.role).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des utilisateurs</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher un utilisateur..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Chargement...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>ETP</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.uid || user.email}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {user.prenom && user.nom 
                                    ? `${user.prenom} ${user.nom}` 
                                    : user.email
                                  }
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.role || 'Non défini'}</div>
                                {user.role_front && (
                                  <div className="text-sm text-gray-500">{user.role_front}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{user.etp || '-'}</TableCell>
                            <TableCell>{user.genre || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                user.prenom && user.nom && user.role 
                                  ? 'default' 
                                  : 'secondary'
                              }>
                                {user.prenom && user.nom && user.role 
                                  ? 'Complet' 
                                  : 'Incomplet'
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.uid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.uid!)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier l'utilisateur</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les informations de l'utilisateur
                  </DialogDescription>
                </DialogHeader>
                <UserForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleUpdateUser}
                  isEdit={true}
                />
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  );
}

// Composant formulaire utilisateur
function UserForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit 
}: { 
  formData: any; 
  setFormData: (data: any) => void; 
  onSubmit: () => void; 
  isEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        {!isEdit && (
          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="allianz (mot de passe par défaut)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mot de passe par défaut : <span className="font-mono bg-gray-100 px-1 rounded">allianz</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Rôle *</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administrateur">Administrateur</SelectItem>
              <SelectItem value="cdc_commercial">CDC Commercial</SelectItem>
              <SelectItem value="cdc_sante_coll">CDC Santé Collective</SelectItem>
              <SelectItem value="cdc_sante_ind">CDC Santé Individuel</SelectItem>
              <SelectItem value="cdc_sinistre">CDC Sinistre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role_front">Rôle front</Label>
          <Input
            id="role_front"
            value={formData.role_front}
            onChange={(e) => setFormData({ ...formData, role_front: e.target.value })}
            placeholder="Ex: Responsable commercial"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="etp">ETP</Label>
          <Input
            id="etp"
            value={formData.etp}
            onChange={(e) => setFormData({ ...formData, etp: e.target.value })}
            placeholder="Ex: 0.8"
          />
        </div>
        <div>
          <Label htmlFor="genre">Genre</Label>
          <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Homme">Homme</SelectItem>
              <SelectItem value="Femme">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => isEdit ? setFormData({}) : onSubmit()}>
          Annuler
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </div>
  );
}
