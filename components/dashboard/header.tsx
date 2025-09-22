'use client';

import { useAuth } from '@/components/providers';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { Bell, Search } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <Logo size="sm" className="mr-4" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}