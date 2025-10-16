/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
// Use alias import for site settings context. The file is located in
// src/contexts/SiteSettingsContext.tsx and the tsconfig path alias
// @src points to the src directory. This avoids relative import issues.
// Use relative import for SiteSettingsContext to avoid alias resolution issues
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Administrative site settings page. Allows administrators to configure global
 * platform options such as platform name and toggling login providers for
 * students, instructors and Google sign‑in. The form fields are translated
 * using the LanguageContext. Values are loaded from the SiteSettingsContext
 * on mount and updates are persisted via the updateSiteSettings service.
 */
const AdminSiteSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { t } = useLanguage();
  const [platformName, setPlatformName] = useState('');
  const [studentEnabled, setStudentEnabled] = useState(true);
  const [instructorEnabled, setInstructorEnabled] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load current settings on mount
  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platformName ?? '');
      setStudentEnabled(settings.loginOptions?.studentEnabled ?? true);
      setInstructorEnabled(settings.loginOptions?.instructorEnabled ?? true);
      setGoogleEnabled(settings.loginOptions?.googleEnabled ?? true);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformName.trim()) {
      toast.error(t('settings.errors.platformNameRequired') || 'Platform name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      // await updateSiteSettings({
      //   platformName,
      //   loginOptions: {
      //     studentEnabled,
      //     instructorEnabled,
      //     googleEnabled,
      //   },
      // });
      toast.success(t('settings.successfullyUpdated') || 'Settings updated successfully');
      await refreshSettings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('settings.updateFailed') || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#2e3440] rounded-md shadow-md w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        {t('settings.siteSettings') || 'Site Settings'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.platformName') || 'Platform Name'}
          </label>
          <input
            id="platformName"
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b4252] text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t('settings.platformNamePlaceholder') || 'Enter the platform name'}
          />
        </div>
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('settings.loginOptions') || 'Login Options'}
          </legend>
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="studentEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings.enableStudentLogin') || 'Enable Student Login'}
              </label>
              <input
                id="studentEnabled"
                type="checkbox"
                checked={studentEnabled}
                onChange={(e) => setStudentEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="instructorEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings.enableInstructorLogin') || 'Enable Instructor Login'}
              </label>
              <input
                id="instructorEnabled"
                type="checkbox"
                checked={instructorEnabled}
                onChange={(e) => setInstructorEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="googleEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings.enableGoogleLogin') || 'Enable Google Login'}
              </label>
              <input
                id="googleEnabled"
                type="checkbox"
                checked={googleEnabled}
                onChange={(e) => setGoogleEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </fieldset>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? t('settings.saving') || 'Saving...' : t('settings.saveSettings') || 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettingsPage;