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

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    prenom: 'Jean-Michel',
    nom: 'Nogaro',
    email: 'jeanmichel@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général'
  },
  {
    id: '2',
    prenom: 'Julien',
    nom: 'Boetti',
    email: 'julien.boetti@allianz-nogaro.fr',
    role: 'administrateur',
    role_front: 'Agent Général'
  },
  {
    id: '3',
    prenom: 'Gwendal',
    nom: 'Clouet',
    email: 'gwendal.clouet@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  },
  {
    id: '4',
    prenom: 'Emma',
    nom: 'Nogaro',
    email: 'emma@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  },
  {
    id: '5',
    prenom: 'Joelle',
    nom: 'Abi Karam',
    email: 'joelle.abikaram@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  },
  {
    id: '6',
    prenom: 'Astrid',
    nom: 'Ulrich',
    email: 'astrid.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  },
  {
    id: '7',
    prenom: 'Karen',
    nom: 'Chollet',
    email: 'karen.chollet@allianz-nogaro.fr',
    role: 'cdc_sante_coll',
    role_front: 'CDC Santé Collective'
  },
  {
    id: '8',
    prenom: 'Kheira',
    nom: 'Bagnasco',
    email: 'kheira.bagnasco@allianz-nogaro.fr',
    role: 'cdc_sante_ind',
    role_front: 'CDC Santé Individuel'
  },
  {
    id: '9',
    prenom: 'Virginie',
    nom: 'Tommasini',
    email: 'virginie.tommasini@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre'
  },
  {
    id: '10',
    prenom: 'Nejma',
    nom: 'Hariati',
    email: 'nejma.hariati@allianz-nogaro.fr',
    role: 'cdc_sinistre',
    role_front: 'CDC Sinistre'
  },
  {
    id: '11',
    prenom: 'Corendin',
    nom: 'Ulrich',
    email: 'corentin.ulrich@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  },
  {
    id: '12',
    prenom: 'Donia',
    nom: 'Sahraoui',
    email: 'donia.sahraoui@allianz-nogaro.fr',
    role: 'cdc_commercial',
    role_front: 'CDC Commercial'
  }
];

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