import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

/**
 * LanguageToggle displays a small button allowing the user to switch
 * between English and Arabic. It shows the current language code as
 * its label. On click, it toggles to the other language.
 */
const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className={`flex items-center justify-center rounded-full p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      <GlobeAltIcon className='h-5 w-5 text-blue-gray-700 dark:text-gray-300' />
      {/* Provide accessible label for screen readers */}
      <span className='sr-only'>{language === 'en' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageToggle;