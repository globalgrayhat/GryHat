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
      ],
    },
  ];

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
        mt-10 border-t border-gray-200 bg-white
        dark:border-gray-800 dark:bg-gray-900
        transition-colors
      "
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand / About */}
          <div className="sm:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {platformName}
            </h2>
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
        </div>
      </div>
    </footer>
  );
}
