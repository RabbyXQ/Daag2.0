// app/layout.tsx
import { ReactNode } from 'react';
import './globals.css';
import { NextUIProvider } from '@nextui-org/react';
import { josefine } from "@/utils/fonts"; // Make sure this path is correct
import LayoutProvider from '@/components/LayoutProvider';
import AppLayout from '../layouts/AppLayout';

export const metadata = {
  title: 'MyApp',
  description: 'A description of MyApp',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={josefine.className}>
        <NextUIProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
