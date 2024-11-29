'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
    }
    document.documentElement.className = storedTheme || theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-white py-2 px-4"
    >
      {theme == "light" ? (<FaMoon className='flex rounded-md text-gray-700 w-6 h-6'/>) : (<FaSun className='flex rounded-md text-orange-200 w-6 h-6'/>)}
    </button>
  );
};

export default ThemeSwitcher;
