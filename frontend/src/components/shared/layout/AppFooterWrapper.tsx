'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/shared/ui/Footer';

export default function AppFooterWrapper() {
  const pathname = usePathname();

  // Hide customer storefront footer when inside the internal staff / admin portal
  if (pathname?.startsWith('/portal')) {
    return null;
  }

  return <Footer />;
}
