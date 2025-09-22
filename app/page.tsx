'use client';

import { useAuth } from '@/components/providers';
import { HomePage } from '@/components/pages/home-page';
import { DashboardPage } from '@/components/pages/dashboard-page';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <DashboardPage />;
  }

  return <HomePage />;
}