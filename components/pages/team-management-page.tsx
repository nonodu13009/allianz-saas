'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, UserPlus, RefreshCw, Eye, EyeOff, Key, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { useUsers } from '@/lib/users-context';
import { UserData, roleMapping } from '@/lib/firebase-users';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import Link from 'next/link';

export function TeamManagementPage() {
  const { user } = useAuth();
  const { users, loading, addUser, updateUserData, removeUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: 'allianz',
    prenom: '',
    nom: '',
    role: '',
    role_front: '',
    etp: '',
    genre: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  const handleCreateUser = async () => {
    try {
      const userData = {
        ...formData,
        password: formData.password || 'allianz'
      };
      await addUser(userData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUserData(editingUser.id, formData);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await removeUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: 'allianz',
      prenom: '',
      nom: '',
      role: '',
      role_front: '',
      etp: '',
      genre: ''
    });
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user: UserData) => {
    setFormData({
      email: user.email || '',
      password: '',
      prenom: user.prenom || '',
      nom: user.nom || '',
      role: user.role || '',
      role_front: user.role_front || '',
      etp: user.etp?.toString() || '',
      genre: user.genre || ''
    });
    setEditingUser(user);
  };

  const handleChangeAllPasswords = async () => {
    if (!newPassword) {
      alert('Veuillez saisir un nouveau mot de passe');
      return;
    }
    
    try {
      for (const user of users) {
        await updateUserData(user.id, { password: newPassword });
      }
      setShowChangePasswordDialog(false);
      setNewPassword('');
      alert('Tous les mots de passe ont été mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des mots de passe:', error);
    }
  };

  if (!user || user.role !== 'administrateur') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accès Refusé</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const isEdit = !!editingUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  Gestion d'équipe
                </h1>
                <p className="text-blue-100 text-lg">
                  Administration des utilisateurs et permissions
                </p>
                <p className="text-blue-200">
                  Gérez votre équipe et configurez les accès
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Membres de l'équipe</h2>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowPasswords(!showPasswords)} 
                    variant="outline"
                    className={showPasswords ? "bg-green-50 border-green-200 text-green-700" : ""}
                  >
                    {showPasswords ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Masquer mots de passe
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Afficher mots de passe
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowChangePasswordDialog(true)}
                    variant="outline"
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Changer tous les mots de passe
                  </Button>
                  <Dialog open={isCreateDialogOpen || !!editingUser} onOpenChange={(open) => {
                    if (!open) {
                      setIsCreateDialogOpen(false);
                      setEditingUser(null);
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un utilisateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
                        </DialogTitle>
                        <DialogDescription>
                          {isEdit ? 'Modifiez les informations de l\'utilisateur' : 'Remplissez les informations pour créer un nouvel utilisateur'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            placeholder="email@allianz.fr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Mot de passe</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleFormChange('password', e.target.value)}
                            placeholder="Mot de passe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prenom">Prénom</Label>
                          <Input
                            id="prenom"
                            value={formData.prenom}
                            onChange={(e) => handleFormChange('prenom', e.target.value)}
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom</Label>
                          <Input
                            id="nom"
                            value={formData.nom}
                            onChange={(e) => handleFormChange('nom', e.target.value)}
                            placeholder="Nom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Rôle</Label>
                          <Select value={formData.role} onValueChange={(value) => handleFormChange('role', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleMapping).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role_front">Rôle Front</Label>
                          <Input
                            id="role_front"
                            value={formData.role_front}
                            onChange={(e) => handleFormChange('role_front', e.target.value)}
                            placeholder="Rôle front"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="etp">ETP</Label>
                          <Input
                            id="etp"
                            type="number"
                            step="0.1"
                            value={formData.etp}
                            onChange={(e) => handleFormChange('etp', e.target.value)}
                            placeholder="1.0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genre">Genre</Label>
                          <Select value={formData.genre} onValueChange={(value) => handleFormChange('genre', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Masculin</SelectItem>
                              <SelectItem value="F">Féminin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setIsCreateDialogOpen(false);
                          setEditingUser(null);
                          resetForm();
                        }}>
                          Annuler
                        </Button>
                        <Button onClick={isEdit ? handleUpdateUser : handleCreateUser}>
                          {isEdit ? 'Modifier' : 'Créer'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tableau des utilisateurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Nom complet</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>ETP</TableHead>
                          <TableHead>Genre</TableHead>
                          {showPasswords && <TableHead>Mot de passe</TableHead>}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.prenom} {user.nom}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {roleMapping[user.role as keyof typeof roleMapping] || user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.etp || 'N/A'}</TableCell>
                            <TableCell>{user.genre || 'N/A'}</TableCell>
                            {showPasswords && (
                              <TableCell className="font-mono text-sm">
                                {user.password || 'allianz'}
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
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
                  )}
                </CardContent>
              </Card>

              {/* Dialog pour changer tous les mots de passe */}
              <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer tous les mots de passe</DialogTitle>
                    <DialogDescription>
                      Cette action changera le mot de passe de tous les utilisateurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                      />
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Cette action est irréversible. Tous les utilisateurs devront utiliser le nouveau mot de passe.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleChangeAllPasswords}>
                      Changer tous les mots de passe
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
