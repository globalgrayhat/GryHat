import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Reusable component that displays a simple blocked account message.  It
 * respects the current translation context and falls back to sensible
 * English defaults if a translation key is missing.
 */
const BlockedAccountMessage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#2e3440] p-4">
      <p className="text-xl font-semibold text-red-600 dark:text-red-400">
        {t('auth.blockedTitle') || 'Account Blocked'}
      </p>
      <p className="mt-2 text-gray-600 dark:text-gray-300 text-center max-w-md">
        {t('auth.blockedMessage') || 'Your account has been blocked and you cannot use the platform.'}
      </p>
    </div>
  );
};

export default BlockedAccountMessage;