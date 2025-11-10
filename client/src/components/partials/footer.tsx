import { NavLink } from "react-router-dom";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * ModernStudentFooter
 * - Responsive grid layout
 * - Clear contrast for light/dark themes
 * - RTL/LTR support
 * - Active NavLink styling
 * - Modern spacing and hover effects
 */
export default function ModernStudentFooter() {
  const { settings } = useSiteSettings();
  const platformName = settings?.platformName || "Global Gray Hat";
  const currentYear = new Date().getFullYear();

  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
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
      ],
    },
  ];

  // Base link classes
  const linkBase =
    "text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded hover:text-blue-600 dark:hover:text-blue-300";
  const linkIdle = "text-gray-800 dark:text-gray-300";
  const linkActive = "font-semibold text-blue-700 dark:text-blue-300";

  return (
    <footer
      dir={dir}
      className="transition-colors bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand / About */}
          <div className="flex flex-col space-y-4 sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {platformName}
            </h2>
            {/* <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("footer.tagline") ||
                "Your hub for knowledge and growth. Explore courses, connect with instructors, and engage with the community."}
            </p> */}
          </div>

          {/* Navigation Columns */}
          {categories.map(({ title, items }) => (
            <div key={title} className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                {title}
              </h3>
              <ul className="flex flex-col space-y-2">
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
        </div>

        {/* Social Media / Optional */}
        <div className="flex justify-center mt-8 space-x-6 rtl:space-x-reverse">
          <a
            href="#"
            className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.12 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.5c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 17 22 12z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.28 4.28 0 001.88-2.36 8.53 8.53 0 01-2.7 1.03 4.26 4.26 0 00-7.27 3.88A12.1 12.1 0 013 4.77a4.25 4.25 0 001.32 5.69 4.22 4.22 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.17 4.27 4.27 0 01-1.92.07 4.27 4.27 0 003.98 2.96A8.55 8.55 0 012 19.54a12.07 12.07 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.39-.02-.58A8.72 8.72 0 0022.46 6z" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div className="w-full h-px my-8 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800" />

        {/* Copyright */}
        <div className="text-xs text-center text-gray-600 dark:text-gray-400">
          &copy; {currentYear} {platformName}. {t("footer.rights") || "All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
