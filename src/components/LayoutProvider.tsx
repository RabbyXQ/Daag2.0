// components/LayoutProvider.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AppLayout from '@/layouts/AppLayout';

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup'].includes(pathname);

  return isAuthPage ? (
    <>{children}</>
  ) : (
    <AppLayout>{children}</AppLayout>
  );
}
