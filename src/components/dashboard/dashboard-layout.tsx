"use client"

import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from './header'
import { DashboardSidebar } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: string
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  return (
    <RouteGuard requiredRole={requiredRole} requireActive={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header sur toute la largeur */}
        <DashboardHeader />
        
        {/* Contenu principal avec sidebar */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)]">
          {/* Sidebar */}
          <DashboardSidebar />
          
          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
