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
    
    // Restaurer l'utilisateur depuis les cookies
    if (typeof window !== 'undefined') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const storedUser = getCookie('user-session');
      if (storedUser) {
        try {
          const userData = JSON.parse(decodeURIComponent(storedUser));
          setUser(userData);
        } catch (error) {
          console.error('Erreur lors de la restauration de l\'utilisateur:', error);
          document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
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
      // Récupérer les utilisateurs depuis Firebase (nouvelle signature avec pagination)
      const { users: firebaseUsers } = await getUsers();
      
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
        
        // Sauvegarder l'utilisateur dans un cookie pour la persistance
        if (typeof window !== 'undefined') {
          const cookieValue = encodeURIComponent(JSON.stringify(userData));
          const isProduction = process.env.NODE_ENV === 'production';
          const cookieOptions = isProduction 
            ? `path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
            : `path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
          document.cookie = `user-session=${cookieValue}; ${cookieOptions}`;
        }
        
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
    if (typeof window !== 'undefined') {
      document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
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