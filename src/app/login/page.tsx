'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { NextUIProvider, Button, Input } from '@nextui-org/react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state for form submission
  const [loadingPage, setLoadingPage] = useState(true); // Add loading state for page itself
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default theme

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard'); // Redirect to dashboard if already logged in
      return; // Prevent further loading of the page
    }

    // Check for a stored theme preference in localStorage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
    }

    setLoadingPage(false); // Set page loading to false after checks
  }, [router]);

  useEffect(() => {
    // Apply the theme to the <html> element
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme); // Save theme preference
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when request starts
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Store token
        router.push('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false); // Set loading to false when request completes
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login here
    console.log(`Login with ${provider}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (loadingPage) {
    return (<div className='flex items-center justify-center min-h-screen'>Loading...</div>); // Render loading text while checking token
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 shadow-md rounded-lg">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Login</h1>
          <ThemeSwitcher />
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={() => handleSocialLogin('Google')}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaGoogle size={24} className="text-[#DB4437]" />
          </Button>
          <Button
            onClick={() => handleSocialLogin('GitHub')}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaGithub size={24} className="text-[#333]" />
          </Button>
          <Button
            onClick={() => handleSocialLogin('Facebook')}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaFacebook size={24} className="text-[#4267B2]" />
          </Button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Sign Up
            </Link>
          </p>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
