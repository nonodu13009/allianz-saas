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

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers();
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
    try {
      await createUser(userData);
      await loadUsers(); // Recharger après ajout
    } catch (err) {
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
    try {
      await updateUser(uid, data);
      await loadUsers(); // Recharger après mise à jour
    } catch (err) {
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
    try {
      await deleteUser(uid);
      await loadUsers(); // Recharger après suppression
    } catch (err) {
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
