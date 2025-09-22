'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-10 h-10 p-0 hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-transform hover:rotate-12" />
      ) : (
        <Sun className="h-5 w-5 transition-transform hover:rotate-12" />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
}