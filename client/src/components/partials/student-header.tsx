<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, NavLink } from "react-router-dom";
import ProfileMenu from "../elements/profile-menu";
import { selectIsLoggedIn, selectUserType } from "../../redux/reducers/authSlice";
import { useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { APP_LOGO } from "../../constants/common";
import LanguageToggle from "../common/LanguageToggle";
import ThemeToggle from "../common/theme-toggle";
import { useLanguage } from "../../contexts/LanguageContext";

type RRNavState = { isActive: boolean };
const linkBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
const linkActive = "bg-blue-gray-600 text-white";
const linkIdle = "text-blue-gray-700 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50";

const navKeys = [
  { key: "home", href: "/" },
  { key: "courses", href: "/courses" },
  { key: "tutors", href: "/tutors" },
  { key: "community", href: "/community" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

function classNames(...classes: any[]) {
=======
import React from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "../elements/profile-menu";
import { selectIsLoggedIn } from "../../redux/reducers/authSlice";
import { useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { APP_LOGO } from "../../constants/common";
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/theme-toggle';
import { useLanguage } from '../../contexts/LanguageContext';
import { selectUserType } from "../../redux/reducers/authSlice";

// Define navigation keys to allow translation via useLanguage().t()
const navKeys = [
  { key: 'home', href: '/' },
  { key: 'courses', href: '/courses' },
  { key: 'tutors', href: '/tutors' },
  { key: 'community', href: '/community' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
];

function classNames(...classes: any) {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  return classes.filter(Boolean).join(" ");
}

const StudentHeader: React.FC = () => {
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
<<<<<<< HEAD
  const userType = useSelector(selectUserType);
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build translated navigation from location + t (no external getLabel)
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
            {/* Top bar */}
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-14 md:h-14 lg:h-16">
                {/* Left: Logo + Desktop Nav */}
                <div className="flex items-center gap-4 lg:gap-6">
                  <Link to="/" className="flex-shrink-0">
                    <img className="h-8 md:h-9 lg:h-10 w-auto" src={APP_LOGO} alt="Logo" />
                  </Link>

                  {/* Desktop nav */}
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

                {/* Right: Desktop */}
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
                      <Link to="/login">
                        <button className="bg-blue-gray-600 hover:bg-blue-gray-700 text-white text-sm font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-gray-300">
                          {t("nav.login") || "Login"}
                        </button>
                      </Link>
                      <Link to="/register">
                        <button className="bg-blue-gray-600 hover:bg-blue-gray-700 text-white text-sm font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-gray-300">
                          {t("nav.register") || "Register"}
                        </button>
                      </Link>
                      <Link to="/instructors/login">
                        <button className="bg-purple-800 hover:bg-purple-900 text-white text-sm font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-300">
                          {t("nav.instructorLogin") || "Instructor Login"}
                        </button>
                      </Link>
                      <ThemeToggle />
                      <LanguageToggle />
                    </div>
                  )}
                </div>

                {/* Right: Tablet/Mobile */}
                <div className="flex items-center gap-2 lg:hidden">
                  {isLoggedIn && userType === "student" ? (
                    <>
                      <ProfileMenu />
                      <Disclosure.Button
                        className="inline-flex items-center justify-center rounded-md p-2 text-blue-gray-700 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Toggle main menu"
                      >
                        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                      </Disclosure.Button>
                    </>
                  ) : (
                    <>
                      <Disclosure.Button
                        className="inline-flex items-center justify-center rounded-md p-2 md:ml-1 text-blue-gray-700 dark:text-gray-200 hover:text-blue-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Toggle main menu"
                      >
                        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                      </Disclosure.Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Panel */}
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
                    <button className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-gray-300">
                      Dashboard
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => close()}>
                      <button className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-gray-300">
                        {t("nav.login") || "Login"}
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => close()}>
                      <button className="w-full bg-blue-gray-600 hover:bg-blue-gray-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-gray-300">
                        {t("nav.register") || "Register"}
                      </button>
                    </Link>
                    <Link to="/instructors/login" onClick={() => close()}>
                      <button className="w-full bg-purple-800 hover:bg-purple-900 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-300">
                        {t("nav.instructorLogin") || "Instructor Login"}
                      </button>
                    </Link>
                    <div className="flex justify-end items-center gap-2 pt-2">
=======
  const user = useSelector(selectUserType);
  const { t } = useLanguage();

  // Build translated navigation items with current state.
  // Each item contains a stable key for React, the href, a translated
  // label for display, and a `current` flag based on the current location.
  interface NavItem {
    key: string;
    href: string;
    label: string;
    current: boolean;
  }
  const navigation: NavItem[] = navKeys.map(({ key, href }) => ({
    key,
    href,
    // Look up navigation labels under `nav` instead of `header`. If the
    // translation is missing for this key the untranslated key is used as
    // a fallback. This ensures new links still render sensibly in other
    // languages until translations are added.
    label: t(`nav.${key}`) || key,
    current: href === location.pathname,
  }));

  const handleNavigation = (item: any) => {
    // This function is no longer needed to set current; navigation is built from location
    return;
  };

  return (
    <div className='bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700'>
      <Disclosure
        as='nav'
        className='bg-white dark:bg-[#2e3440] pl-8 pr-8 p-2 md:p-2 lg:p-3 lg:flex lg:justify-center'
      >
        {({ open }) => (
          <>
            <div className='max-w-full sm:px-6 lg:px-2 md:w-full lg:w-full  '>
              <div className='flex items-center justify-between md:h-14 lg:h-16'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0 '>
                    <Link to='/'>
                      <img className='h-10' src={APP_LOGO} alt='Your Company' />
                    </Link>
                  </div>
                  <div className='hidden md:block'>
                    <div className='ml-10 flex items-baseline space-x-4'>
                      {navigation.map((item) => (
                        <Link
                          key={item.key}
                          to={item.href}
                          onClick={() => handleNavigation(item)}
                          className={classNames(
                            item.current
                              ? 'bg-blue-gray-500 text-white font-semibold'
                              : 'text-blue-gray-600 dark:text-gray-200 hover:text-blue-gray-800 dark:hover:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.label}
                        </Link>
                      ))}
                      {/* <SearchBar /> */}
                    </div>
                  </div>
                </div>
                {isLoggedIn && user === 'student' ? (
                  <div className='hidden md:ml-5 md:flex items-center space-x-4'>
                    <Link to='/dashboard'>
                      <Button size='md' color='blue-gray'>
                        Dashboard
                      </Button>
                    </Link>
                    <ProfileMenu />
                    {/* Show theme toggle next to language toggle */}
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                ) : (
                  <div className='overflow-hidden'>
                    <div className='hidden h-8 w-auto lg:mt-3 lg:h-12 md:flex items-center space-x-4'>
                      <Link to='/login'>
                        <button className='bg-blue-gray-300 hover:bg-blue-gray-500 text-xs lg:text-sm text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline'>
                          {t('nav.login') || 'Login'}
                        </button>
                      </Link>
                      <Link to='/register'>
                        <button className='bg-blue-gray-300 hover:bg-blue-gray-500 text-xs lg:text-sm text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline'>
                          {t('nav.register') || 'Register'}
                        </button>
                      </Link>
                      <Link to='/instructors/login'>
                        <button className='bg-purple-800 hover:bg-purple-900 text-xs lg:text-sm text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline'>
                          {t('nav.instructorLogin') || 'Instructor Login'}
                        </button>
                      </Link>
                      {/* Theme and language toggles */}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
                      <ThemeToggle />
                      <LanguageToggle />
                    </div>
                  </div>
                )}
<<<<<<< HEAD
=======
                <div className='-mr-2 flex md:hidden'>
                  <Disclosure.Button className='inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-white'>
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
                    ) : (
                      <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            <Disclosure.Panel className='lg:hidden'>
              <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
                {navigation.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={() => handleNavigation(item)}
                    className={classNames(
                      item.current
                        ? 'bg-blue-gray-500 text-white'
                        : 'text-blue-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-blue-gray-800 dark:hover:text-gray-100',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className='border-t border-gray-700 dark:border-gray-600 pb-3 pt-4'>
                <div className='mt-3 space-y-1 px-2'>
                  <Link to='/login'>
                    <button className='w-full mb-2 block rounded-md px-3 py-2 text-base font-medium text-gray-200 bg-blue-gray-300 hover:bg-blue-gray-500 hover:text-white'>
                      {t('nav.login') || 'Login'}
                    </button>
                  </Link>
                  <Link to='/register'>
                    <button className='w-full mb-2 block rounded-md px-3 py-2 text-base font-medium text-gray-200 bg-blue-gray-300 hover:bg-blue-gray-500 hover:text-white'>
                      {t('nav.register') || 'Register'}
                    </button>
                  </Link>
                  <Link to='/instructors/login'>
                    <button className='w-full block bg-purple-800 hover:bg-purple-900 text-sm text-gray-200 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
                      {t('nav.instructorLogin') || 'Instructor Login'}
                    </button>
                  </Link>
                  <div className='flex justify-end items-center space-x-2 pt-2'>
                    {/* Theme and language toggles in mobile menu */}
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
<<<<<<< HEAD
    </header>
=======
    </div>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
};

export default StudentHeader;
