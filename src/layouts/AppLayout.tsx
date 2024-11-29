'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSider from '@/components/AppSider';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import '../app/globals.css';
import { HomeIcon, UserIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Get the saved theme from localStorage if available
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.add(storedTheme);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-black dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen flex-col ${theme}`}>
      {/* Sidebar */}
      <AppSider />

      {/* Main Layout */}
      <div className="flex-1 pl-16">
        {/* Header */}
        <AppHeader toggleTheme={toggleTheme} handleLogout={handleLogout} />

        <main className="pt-16">
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;
