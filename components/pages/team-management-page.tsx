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
    if (!editingUser || !editingUser.uid) return;
    
    try {
      const updateData = {
        ...formData,
        etp: formData.etp ? parseFloat(formData.etp) : 1
      };
      await updateUserData(editingUser.uid, updateData);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await removeUser(uid);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
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

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: 'allianz', // Mot de passe par défaut
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

  const totalUsers = users.length;
  const completeProfiles = users.filter(u => u.prenom && u.nom && u.role).length;
  const pendingProfiles = totalUsers - completeProfiles;

  const isEdit = !!editingUser;

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion d'équipe</h1>
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
          <Dialog open={isCreateDialogOpen || !!editingUser} onOpenChange={isEdit ? setEditingUser : setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}>
                <UserPlus className="mr-2 h-4 w-4" /> Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>{isEdit ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}</DialogTitle>
                <DialogDescription>
                  {isEdit ? 'Mettez à jour les informations de l\'utilisateur.' : 'Remplissez les informations pour créer un nouveau compte utilisateur.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      readOnly={isEdit}
                      className={isEdit ? "bg-gray-100 dark:bg-gray-700" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPasswords ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="allianz (mot de passe par défaut)"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mot de passe par défaut : <span className="font-mono bg-gray-100 px-1 rounded">allianz</span>
                    </p>
                  </div>
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
                    <Select value={formData.role} onValueChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        role: value,
                        role_front: roleMapping[value as keyof typeof roleMapping]
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrateur">Agent Général</SelectItem>
                        <SelectItem value="cdc_commercial">CDC Commercial</SelectItem>
                        <SelectItem value="cdc_sante_coll">CDC Santé Collective</SelectItem>
                        <SelectItem value="cdc_sante_ind">CDC Santé Individuel</SelectItem>
                        <SelectItem value="cdc_sinistre">CDC Sinistre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role_front">Rôle front (automatique)</Label>
                    <Input
                      id="role_front"
                      value={formData.role_front}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                      placeholder="Sélectionnez d'abord un rôle"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ce champ est automatiquement rempli selon le rôle sélectionné
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="etp">ETP</Label>
                    <Input
                      id="etp"
                      type="number"
                      step="0.1"
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
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  isEdit ? setEditingUser(null) : setIsCreateDialogOpen(false);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button onClick={isEdit ? handleUpdateUser : handleCreateUser}>
                  {isEdit ? 'Sauvegarder les modifications' : 'Créer l\'utilisateur'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-gray-500">Utilisateurs enregistrés</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils Complets</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeProfiles}</div>
            <p className="text-xs text-gray-500">Informations complètes</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils en Attente</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProfiles}</div>
            <p className="text-xs text-gray-500">Informations à compléter</p>
          </CardContent>
        </Card>
      </div>


      {/* User Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Liste des utilisateurs
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="w-full rounded-lg bg-gray-100 pl-8 md:w-[300px] dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Chargement des utilisateurs...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>ETP</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Mot de passe</TableHead>
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
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className={`font-mono text-sm ${showPasswords ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                          {showPasswords ? 'allianz' : '••••••••'}
                        </span>
                      </div>
                    </TableCell>
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

      {/* Dialog pour changer tous les mots de passe */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-orange-600" />
              Changer tous les mots de passe
            </DialogTitle>
            <DialogDescription>
              Ceci synchronisera le mot de passe pour tous les utilisateurs dans Firebase Auth ET Firestore.
              <br />
              <strong>✅ Sécurisé :</strong> Les connexions ne seront plus cassées après le changement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez le nouveau mot de passe"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mot de passe actuel : <span className="font-mono bg-gray-100 px-1 rounded">allianz</span>
              </p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> Cette action affectera {users.length} utilisateur(s). 
                Assurez-vous que le nouveau mot de passe est sécurisé.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => {
              setShowChangePasswordDialog(false);
              setNewPassword('');
            }}>
              Annuler
            </Button>
            <Button 
              onClick={async () => {
                if (!newPassword) return;
                
                try {
                  // Appeler l'API pour synchroniser Firebase Auth et Firestore
                  const response = await fetch('/api/update-passwords', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      users: users.filter(user => user.uid), // Seulement les utilisateurs avec UID
                      newPassword: newPassword
                    }),
                  });

                  const result = await response.json();

                  if (response.ok) {
                    // Succès : rafraîchir les données utilisateur
                    window.location.reload(); // Recharger pour voir les changements
                    
                    setShowChangePasswordDialog(false);
                    setNewPassword('');
                    
                    // Mettre à jour le mot de passe par défaut dans le formulaire
                    setFormData(prev => ({ ...prev, password: newPassword }));
                    
                    alert(`✅ Synchronisation réussie !\n${result.summary.success} utilisateurs mis à jour avec succès.`);
                  } else {
                    throw new Error(result.error || 'Erreur lors de la synchronisation');
                  }
                } catch (error: any) {
                  console.error('Erreur lors du changement de mot de passe:', error);
                  alert(`❌ Erreur lors de la synchronisation : ${error.message}`);
                }
              }}
              disabled={!newPassword}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Key className="mr-2 h-4 w-4" />
              Synchroniser Auth + Firestore ({users.filter(u => u.uid).length} utilisateurs)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
