import React, { useEffect, useMemo, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, NavLink } from "react-router-dom";
import ProfileMenu from "../elements/profile-menu";
import { selectIsLoggedIn, selectUserType } from "../../redux/reducers/authSlice";
import { useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import LanguageToggle from "../common/LanguageToggle";
import ThemeToggle from "../common/theme-toggle";
import { useLanguage } from "../../contexts/LanguageContext";

// Import modals for both students and instructors
import StudentLoginModal from "../pages/students/StudentLoginModal";
import StudentRegisterModal from "../pages/students/StudentRegisterModal";
import InstructorLoginModal from "../pages/instructors/instructor-login-modal";
import InstructorRegisterModal from "../pages/instructors/instructor-register-modal";

// Navigation items
const navKeys = [
  { key: "home", href: "/" },
  { key: "courses", href: "/courses" },
  { key: "tutors", href: "/tutors" },
  { key: "community", href: "/community" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

// Tailwind utility classes
const linkBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
const linkActive = "bg-blue-gray-600 text-white";
const linkIdle = "text-blue-gray-700 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50";

// Helper to join classes conditionally
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

// Type for NavLink
type RRNavState = { isActive: boolean };

// Main Component
const StudentHeader: React.FC = () => {
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const { t } = useLanguage();

  const [scrolled, setScrolled] = useState(false);

  // DRY: Handle all modals using a single state variable
  const [modal, setModal] = useState<null | "studentLogin" | "studentRegister" | "instructorLogin" | "instructorRegister">(null);

  // Modal open/close handlers
  const openModal = (type: typeof modal) => setModal(type);
  const closeModal = () => setModal(null);
  const switchModal = (type: typeof modal) => setModal(type);

  // Scroll effect to apply sticky header style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build navigation items with translation and active state
  const navigation = useMemo(
    () =>
      navKeys.map(({ key, href }) => ({
        key,
        href,
        label: t(`nav.${key}`) || key,
        current: href === location.pathname,
      })),
    [location.pathname, t]
  );

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 transition-all border-b",
          scrolled
            ? "backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
            : "backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-white/10 dark:border-gray-800",
        ].join(" ")}
      >
        <Disclosure as="nav" className="bg-transparent">
          {({ open, close }) => (
            <>
              {/* === Top Bar === */}
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-14 md:h-14 lg:h-16">
                  {/* === Left: Logo + Nav === */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    <Link to="/" className="flex-shrink-0">
                      <img className="h-8 md:h-9 lg:h-12 w-auto" src='/Profile.svg' alt="Logo" />
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden lg:block">
                      <div className="flex items-center space-x-1">
                        {navigation.map((item) => (
                          <NavLink
                            key={item.key}
                            to={item.href}
                            end
                            className={({ isActive }: RRNavState) =>
                              classNames(linkBase, isActive ? linkActive : linkIdle)
                            }
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* === Right: Desktop === */}
                  <div className="hidden lg:flex items-center gap-3">
                    {isLoggedIn && userType === "student" ? (
                      <>
                        <Link to="/dashboard">
                          <Button size="md" color="blue-gray">Dashboard</Button>
                        </Link>
                        <ProfileMenu />
                        <ThemeToggle />
                        <LanguageToggle />
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal("studentLogin")}
                          className="bg-blue-gray-600 hover:bg-blue-gray-700 text-white text-sm font-semibold py-2 px-3 rounded"
                        >
                          {t("nav.login") || "Login"}
                        </button>
                        <button
                          onClick={() => openModal("studentRegister")}
                          className="bg-blue-gray-600 hover:bg-blue-gray-700 text-white text-sm font-semibold py-2 px-3 rounded"
                        >
                          {t("nav.register") || "Register"}
                        </button>
                        <button
                          onClick={() => openModal("instructorLogin")}
                          className="bg-purple-800 hover:bg-purple-900 text-white text-sm font-semibold py-2 px-3 rounded"
                        >
                          {t("nav.instructorLogin") || "Instructor Login"}
                        </button>
                        <ThemeToggle />
                        <LanguageToggle />
                      </div>
                    )}
                  </div>

                  {/* === Right: Mobile === */}
                  <div className="flex items-center gap-2 lg:hidden">
                    {isLoggedIn && userType === "student" && <ProfileMenu />}
                    <Disclosure.Button
                      className="inline-flex items-center justify-center rounded-md p-2 text-blue-gray-700 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Toggle main menu"
                    >
                      {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              {/* === Mobile Panel === */}
              <Disclosure.Panel className="lg:hidden border-t border-white/10 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg">
                <div className="px-3 pt-3 pb-2 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.href}
                      end
                      onClick={() => close()}
                      className={({ isActive }: RRNavState) =>
                        classNames(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-blue-gray-600 text-white"
                            : "text-blue-gray-800 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                <div className="px-3 pt-2 pb-4 border-t border-white/10 dark:border-gray-800">
                  {isLoggedIn && userType === "student" ? (
                    <Link to="/dashboard" onClick={() => close()}>
                      <button className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded">
                        Dashboard
                      </button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          openModal("studentLogin");
                          close();
                        }}
                        className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded"
                      >
                        {t("nav.login") || "Login"}
                      </button>
                      <button
                        onClick={() => {
                          openModal("studentRegister");
                          close();
                        }}
                        className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded"
                      >
                        {t("nav.register") || "Register"}
                      </button>
                      <button
                        onClick={() => {
                          openModal("instructorLogin");
                          close();
                        }}
                        className="w-full bg-purple-800 hover:bg-purple-900 text-white font-semibold py-2 px-3 rounded"
                      >
                        {t("nav.instructorLogin") || "Instructor Login"}
                      </button>
                      <div className="flex justify-end items-center gap-2 pt-2">
                        <ThemeToggle />
                        <LanguageToggle />
                      </div>
                    </div>
                  )}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </header>

      {/* === All Modals: Centralized with single state === */}
      <StudentLoginModal
        isOpen={modal === "studentLogin"}
        onClose={closeModal}
        onSwitchToRegister={() => switchModal("studentRegister")}
      />
      <StudentRegisterModal
        isOpen={modal === "studentRegister"}
        onClose={closeModal}
        onSwitchToLogin={() => switchModal("studentLogin")}
      />
      <InstructorLoginModal
        isOpen={modal === "instructorLogin"}
        onClose={closeModal}
        onSwitchToRegister={() => switchModal("instructorRegister")}
      />
      <InstructorRegisterModal
        isOpen={modal === "instructorRegister"}
        onClose={closeModal}
        onSwitchToLogin={() => switchModal("instructorLogin")}
      />
    </>
  );
};

export default StudentHeader;
