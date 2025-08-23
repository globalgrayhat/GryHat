import React from 'react';
// Import SiteSettingsContext and LanguageContext via relative paths. These contexts
// reside in src/contexts, which is two levels up from this file. Using
// relative imports ensures compatibility without relying on path aliases.
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * A translated footer component tailored for a digital academy platform. It
 * surfaces only relevant navigation links (courses, instructors, community,
 * articles, contact) and removes generic company/product sections. All
 * headings and links are translated through the LanguageContext. The
 * component respects dark mode styling via Tailwind's `dark:` variants. It
 * also displays the platform name and year, fetched from site settings.
 */
export default function StudentFooter() {
  // Access platform name from site settings; provide sensible fallback.
  const { settings } = useSiteSettings();
  const platformName = settings?.platformName || 'Academic Platform';
  const currentYear = new Date().getFullYear();

  // Translation hook
  const { t } = useLanguage();

  // Define navigation categories and translate labels using LanguageContext.
  const categories = [
    {
      title: t('footer.explore') || 'Explore',
      items: [
        { name: t('footer.courses') || 'Courses', href: '/courses' },
        { name: t('footer.instructors') || 'Instructors', href: '/instructors' },
        { name: t('footer.community') || 'Community', href: '/community' },
        { name: t('footer.articles') || 'Articles', href: '/articles' },
      ],
    },
    {
      title: t('footer.support') || 'Support',
      items: [
        { name: t('footer.contact') || 'Contact', href: '/contact' },
        { name: t('footer.helpCenter') || 'Help Center', href: '/help-center' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-20 border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Platform name and brief description */}
          <div className="sm:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {platformName}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              {t('footer.tagline') || 'Your hub for knowledge and growth. Explore courses, connect with instructors and engage with the community.'}
            </p>
          </div>
          {/* Navigation columns */}
          {categories.map(({ title, items }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wider uppercase mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {currentYear} {platformName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}