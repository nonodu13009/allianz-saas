'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUsers, UserData, createUser, updateUser, deleteUser } from './firebase-users';

interface UsersContextType {
  users: UserData[];
  loading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  updateUserData: (uid: string, data: Partial<UserData>) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  children: ReactNode;
}

export function UsersProvider({ children }: UsersProviderProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousUsers, setPreviousUsers] = useState<UserData[]>([]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: fetchedUsers } = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
      console.error('Erreur lors du chargement des utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    // Sauvegarder l'état précédent pour rollback
    setPreviousUsers([...users]);
    
    try {
      const newUserId = await createUser(userData);
      
      // Mise à jour optimiste : ajouter l'utilisateur localement
      const newUser: UserData = {
        uid: newUserId,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUsers(prev => [newUser, ...prev]);
      
    } catch (err) {
      // Rollback en cas d'erreur
      setUsers(previousUsers);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (uid: string, data: Partial<UserData>) => {
    setLoading(true);
    setError(null);
    
    // Sauvegarder l'état précédent pour rollback
    setPreviousUsers([...users]);
    
    try {
      await updateUser(uid, data);
      
      // Mise à jour optimiste : modifier l'utilisateur localement
      setUsers(prev => prev.map(user => 
        user.uid === uid 
          ? { ...user, ...data, updatedAt: new Date() }
          : user
      ));
      
    } catch (err) {
      // Rollback en cas d'erreur
      setUsers(previousUsers);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur');
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (uid: string) => {
    setLoading(true);
    setError(null);
    
    // Sauvegarder l'état précédent pour rollback
    setPreviousUsers([...users]);
    
    try {
      await deleteUser(uid);
      
      // Mise à jour optimiste : supprimer l'utilisateur localement
      setUsers(prev => prev.filter(user => user.uid !== uid));
      
    } catch (err) {
      // Rollback en cas d'erreur
      setUsers(previousUsers);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    await loadUsers();
  };

  // Charger les utilisateurs au montage du provider
  useEffect(() => {
    loadUsers();
  }, []);

  const value: UsersContextType = {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    updateUserData,
    removeUser,
    refreshUsers
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
