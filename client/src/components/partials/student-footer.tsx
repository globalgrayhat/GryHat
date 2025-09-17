<<<<<<< HEAD
import React from "react";
import { NavLink } from "react-router-dom";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * StudentFooter
 * - Theme-aware (light/dark) with clear, non-faded text
 * - i18n via LanguageContext (reactive)
 * - RTL/LTR via lang
 * - NavLink with active styling
 * - No theme/lang buttons here
 */
export default function StudentFooter() {
  const { settings } = useSiteSettings();
  const platformName = settings?.platformName || "Academic Platform";
  const currentYear = new Date().getFullYear();

  const { t, lang } = useLanguage() as {
    t: (k: string) => string;
    lang?: "ar" | "en";
  };
  const dir = lang === "ar" ? "rtl" : "ltr";

  const categories = [
    {
      title: t("footer.explore") || "Explore",
      items: [
        { name: t("footer.courses") || "Courses", to: "/courses" },
        { name: t("footer.instructors") || "Instructors", to: "/instructors" },
        { name: t("footer.community") || "Community", to: "/community" },
        { name: t("footer.articles") || "Articles", to: "/articles" },
      ],
    },
    {
      title: t("footer.support") || "Support",
      items: [
        { name: t("footer.contact") || "Contact", to: "/contact" },
        { name: t("footer.helpCenter") || "Help Center", to: "/help-center" },
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
      ],
    },
  ];

<<<<<<< HEAD
  // Links: clear contrast in both themes
  const linkBase =
    "text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded";
  const linkIdle =
    "text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100";
  const linkActive = "font-semibold text-blue-700 dark:text-blue-300";

  return (
    <footer
      dir={dir}
      className="
        mt-20 border-t border-gray-200 bg-white
        dark:border-gray-800 dark:bg-gray-900
        transition-colors
      "
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand / About */}
=======
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-20 border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Platform name and brief description */}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          <div className="sm:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {platformName}
            </h2>
<<<<<<< HEAD
            <p className="mt-2 max-w-sm text-sm text-gray-700 dark:text-gray-300">
              {t("footer.tagline") ||
                "Your hub for knowledge and growth. Explore courses, connect with instructors and engage with the community."}
            </p>
          </div>

          {/* Navigation columns */}
          <nav aria-label="Footer" className="md:col-span-2 grid grid-cols-2 gap-8">
            {categories.map(({ title, items }) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {items.map(({ name, to }) => (
                    <li key={name}>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          [linkBase, isActive ? linkActive : linkIdle].join(" ")
                        }
                      >
                        {name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800" />

        {/* Copyright */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          &copy; {currentYear} {platformName}. {t("footer.rights") || "All rights reserved."}
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
        </div>
      </div>
    </footer>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
