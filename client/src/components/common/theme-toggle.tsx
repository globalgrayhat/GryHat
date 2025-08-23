import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

/**
 * A reusable theme toggle component that switches between dark and light
 * modes. The button displays a sun icon in dark mode (indicating the
 * ability to switch to light) and a moon icon in light mode. It
 * automatically handles toggling via the ThemeContext. You can pass
 * additional className to position or size the button.
 */
const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center rounded-full p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      {isDark ? (
        <SunIcon className='h-6 w-6 text-yellow-400' />
      ) : (
        <MoonIcon className='h-6 w-6 text-blue-gray-700' />
      )}
    </button>
  );
};

export default ThemeToggle;