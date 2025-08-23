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
  return classes.filter(Boolean).join(" ");
}

const StudentHeader: React.FC = () => {
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
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
                      <ThemeToggle />
                      <LanguageToggle />
                    </div>
                  </div>
                )}
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
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

export default StudentHeader;
