'use client';

import { NavigationProvider } from '@/lib/commercial-navigation-context';
import CommercialPage from '@/components/pages/commercial-page';

export default function Commercial() {
  return (
    <NavigationProvider>
      <CommercialPage />
    </NavigationProvider>
  );
}
