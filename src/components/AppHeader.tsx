'use client'

import React, { useState, useEffect } from 'react';
import { FaMapMarked, FaMapMarkedAlt } from 'react-icons/fa';
import { exo, exo_2, josefine, mark_script } from '@/utils/fonts';


type AppHeaderProps = {
  toggleTheme: () => void;
  handleLogout: () => void;
};

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

const AppHeader: React.FC<AppHeaderProps> = ({ toggleTheme, handleLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage and apply the saved theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle theme toggle and apply 'dark' class
  const handleThemeSwitch = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    toggleTheme(); // Optional for additional actions
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch user data from API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve token from localStorage or wherever you store it
        const token = localStorage.getItem('token');
        
        // Add token to headers
        const response = await fetch('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Use Bearer token for Authorization
          }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-12 shadow-sm drop-shadow-2xl shadow-green-800 bg-green-500 dark:bg-green-800 flex items-center justify-between px-4 z-10">
      <div className="flex items-center ml-20 p-7 h-10 px-4">
        <FaMapMarkedAlt className="text-white w-12 h-12 p-2" />
        <h1 className={mark_script.className.concat(` text-white text-3xl font-bold`)}>Daag</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full focus:outline-none"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-full h-full rounded-full object-cover"
              src={user?.avatar || 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg'} 
              alt="User Avatar"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2">
              <div className="px-4 py-2">
                <p className="font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">{user?.email}</p>
              </div>
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </a>
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={handleThemeSwitch}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
