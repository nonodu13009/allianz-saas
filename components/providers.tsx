'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UsersProvider } from '@/lib/users-context';
import { getUsers } from '@/lib/firebase-users';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  role_front: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Récupérer les utilisateurs depuis Firebase
      const firebaseUsers = await getUsers();
      
      // Chercher l'utilisateur par email
      const foundUser = firebaseUsers.find(u => u.email === email);
      
      if (foundUser && password === (foundUser.password || 'allianz')) {
        // Convertir les données Firebase vers le format attendu
        const userData = {
          id: foundUser.uid || '',
          prenom: foundUser.prenom || '',
          nom: foundUser.nom || '',
          email: foundUser.email,
          role: foundUser.role || '',
          role_front: foundUser.role_front || ''
        };
        setUser(userData);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        <UsersProvider>
          {children}
        </UsersProvider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within Providers');
  }
  return context;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Providers');
  }
  return context;
}