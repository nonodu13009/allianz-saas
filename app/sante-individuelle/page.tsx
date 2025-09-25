'use client';

import { NavigationProvider } from '@/lib/sante-ind-navigation-context';
import SanteIndPage from '@/components/pages/sante-ind-page';

export default function SanteIndividuelle() {
  return (
    <NavigationProvider>
      <SanteIndPage />
    </NavigationProvider>
  );
}