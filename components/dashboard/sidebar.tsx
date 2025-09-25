'use client';

import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  Home,
  FileText,
  Calendar,
  MessageSquare,
  User,
  LogOut,
  TrendingUp,
  Briefcase,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

const navigationItems = {
      administrateur: [
        { icon: Home, label: 'Tableau de bord', href: '/', active: true },
        { icon: Users, label: 'Gestion équipe', href: '/team-management', active: false },
        { icon: TrendingUp, label: 'Commissions', href: '/commissions-management', active: false },
        { icon: BarChart3, label: 'Analytics', href: '#', active: false },
        { icon: FileText, label: 'Contrats', href: '#', active: false },
        { icon: Calendar, label: 'Planning', href: '#', active: false },
        { icon: MessageSquare, label: 'Messages', href: '#', active: false },
        { icon: Settings, label: 'Administration', href: '#', active: false },
      ],
  cdc_commercial: [
    { icon: Home, label: 'Tableau de bord', href: '/', active: true },
    { icon: Briefcase, label: 'Module Commercial', href: '/commercial', active: false },
    { icon: Users, label: 'Mes clients', href: '#', active: false },
    { icon: BarChart3, label: 'Mes performances', href: '#', active: false },
    { icon: FileText, label: 'Mes contrats', href: '#', active: false },
    { icon: Calendar, label: 'Mon planning', href: '#', active: false },
    { icon: MessageSquare, label: 'Messages', href: '#', active: false },
    { icon: User, label: 'Mon profil', href: '#', active: false },
  ],
  cdc_sante_coll: [
    { icon: Home, label: 'Tableau de bord', href: '/', active: true },
    { icon: Heart, label: 'Module Santé Collective', href: '/sante-collective', active: false },
    { icon: Users, label: 'Clients collectifs', href: '#', active: false },
    { icon: BarChart3, label: 'Mes performances', href: '#', active: false },
    { icon: FileText, label: 'Contrats santé', href: '#', active: false },
    { icon: Calendar, label: 'Mon planning', href: '#', active: false },
    { icon: MessageSquare, label: 'Messages', href: '#', active: false },
    { icon: User, label: 'Mon profil', href: '#', active: false },
  ],
  cdc_sante_ind: [
    { icon: Home, label: 'Tableau de bord', href: '/', active: true },
    { icon: Heart, label: 'Module Santé Individuelle', href: '/sante-individuelle', active: false },
    { icon: Users, label: 'Clients individuels', href: '#', active: false },
    { icon: BarChart3, label: 'Mes performances', href: '#', active: false },
    { icon: FileText, label: 'Contrats santé', href: '#', active: false },
    { icon: Calendar, label: 'Mon planning', href: '#', active: false },
    { icon: MessageSquare, label: 'Messages', href: '#', active: false },
    { icon: User, label: 'Mon profil', href: '#', active: false },
  ],
  cdc_sinistre: [
    { icon: Home, label: 'Tableau de bord', href: '/', active: true },
    { icon: FileText, label: 'Dossiers sinistres', href: '#', active: false },
    { icon: BarChart3, label: 'Mes performances', href: '#', active: false },
    { icon: Users, label: 'Mes clients', href: '#', active: false },
    { icon: Calendar, label: 'Mon planning', href: '#', active: false },
    { icon: MessageSquare, label: 'Messages', href: '#', active: false },
    { icon: User, label: 'Mon profil', href: '#', active: false },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Tableau de bord');

  if (!user) return null;

  const items = navigationItems[user.role as keyof typeof navigationItems] || [];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Allianz Marseille
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Plateforme de gestion
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {user.role_front}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = activeItem === item.label;
          
          if (item.href && item.href !== '#') {
            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 py-3 px-4 text-left font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                  onClick={() => setActiveItem(item.label)}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                  )} />
                  {item.label}
                </Button>
              </Link>
            );
          } else {
            return (
              <Button
                key={item.label}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 py-3 px-4 text-left font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setActiveItem(item.label)}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                )} />
                {item.label}
              </Button>
            );
          }
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 py-3 px-4 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}