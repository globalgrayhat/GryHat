import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

import StudentHeader from "./components/partials/student-header";
import StudentFooter from "./components/partials/student-footer";
import YouAreOffline from "./components/common/you-are-offline";
import SessionExpired from "./components/common/session-expired-modal";

import InstructorSideNav from "./components/pages/instructors/instructor-side-nav";
import InstructorHeader from "./components/pages/instructors/instructor-header";
import InstructorLoginPage from "./components/pages/instructors/instructor-login-page";

import AdminLoginPage from "./components/pages/admin/admin-login-page";
import { AdminSideNav } from "./components/pages/admin/admin-side-nav";

import { selectIsLoggedIn, selectUserType } from "./redux/reducers/authSlice";
import { selectStudent, fetchStudentData } from "./redux/reducers/studentSlice";
import { selectInstructor, setDetails } from "./redux/reducers/instructorSlice";
import { selectIsFooterVisible } from "./redux/reducers/helperSlice";

import { getInstructorDetails } from "./api/endpoints/instructor";
import useIsOnline from "./hooks/useOnline";
import { toast } from "react-toastify";
import { useLanguage } from "./contexts/LanguageContext";

/**
 * Layouts for Student / Instructor / Admin apps
 * - Theme-aware backgrounds (light/dark)
 * - i18n-aware direction (rtl/ltr)
 * - Correct effect dependencies so data is fetched when auth state changes
 * - Avoid calling instructor API when not logged in as instructor
 */

// Typed dispatch if you use thunks; adjust to your AppDispatch type if available
// const dispatch = useDispatch<AppDispatch>();
// For generic safety:
type AnyDispatch = ReturnType<typeof useDispatch>;
=======
import StudentHeader from "./components/partials/student-header";
import "react-toastify/dist/ReactToastify.css";
import { Outlet } from "react-router-dom";
import AdminLoginPage from "./components/pages/admin/admin-login-page";
// import { Sidenav } from "./components/pages/admin/widgets/layout";  
import { useSelector, useDispatch } from "react-redux";
import InstructorSideNav from "./components/pages/instructors/instructor-side-nav";
import InstructorHeader from "./components/pages/instructors/instructor-header";
import useIsOnline from "./hooks/useOnline";
import YouAreOffline from "./components/common/you-are-offline";
import StudentFooter from "./components/partials/student-footer";
import { selectIsLoggedIn, selectUserType } from "./redux/reducers/authSlice";
import { selectStudent } from './redux/reducers/studentSlice';
import { selectInstructor } from './redux/reducers/instructorSlice';
import { selectIsFooterVisible } from "./redux/reducers/helperSlice";
import { fetchStudentData } from "./redux/reducers/studentSlice";
import SessionExpired from "./components/common/session-expired-modal";
import InstructorLoginPage from "./components/pages/instructors/instructor-login-page";
import { getInstructorDetails } from "./api/endpoints/instructor";
import { setDetails } from "./redux/reducers/instructorSlice";
import { AdminSideNav } from "./components/pages/admin/admin-side-nav";
import { toast } from "react-toastify";   
import { useLanguage } from './contexts/LanguageContext';
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

export const Student: React.FC = () => {
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
<<<<<<< HEAD
  const userType = useSelector(selectUserType);
  const footerVisible = useSelector(selectIsFooterVisible);
  const student = useSelector(selectStudent);

  const dispatch: AnyDispatch = useDispatch();
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const handleCloseSessionExpired = () => setShowSessionExpired(false);

  // Listen for "sessionExpired" events from interceptor
  useEffect(() => {
    const handleSessionExpired = () => setShowSessionExpired(true);
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, []);

  // Fetch student data when user logs in as student (and when auth state changes)
  useEffect(() => {
    if (isLoggedIn && userType === "student") {
      dispatch(fetchStudentData());
    }
  }, [dispatch, isLoggedIn, userType]);

  // Header wrapper classes (theme-aware)
  const headerWrapper =
    "bg-gray-100 dark:bg-gray-900 opacity-100 transition-opacity duration-300";

  if (!isOnline) return <YouAreOffline />;

  // Blocked student
  if (student?.studentDetails?.isBlocked) {
    return (
      <div
        dir={dir}
        className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-6"
      >
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          {t("auth.blockedTitle") || "Account Blocked"}
        </h1>
        <p className="mt-2 max-w-md text-center text-gray-700 dark:text-gray-300">
          {t("auth.blockedMessage") ||
            "Your account has been blocked and you cannot access the platform."}
        </p>
      </div>
    );
  }
=======
  const footerVisible = useSelector(selectIsFooterVisible);
  const dispatch = useDispatch();
  const isHeaderVisible = true;
  const user = useSelector(selectUserType);
  const student = useSelector(selectStudent);
  const { t } = useLanguage();
  // usePreventBackButton(isLoggedIn);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const handleCloseSessionExpired = () => {
    setShowSessionExpired(false);
  };

  // Listen for the "sessionExpired" event from the interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpired(true);
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  const headerClassName = `bg-gray-100 ${
    isHeaderVisible
      ? "opacity-100 transition-opacity duration-500 "
      : "opacity-0 "
  }`;

  useEffect(() => {
    if (isLoggedIn && user === "student") {
      dispatch(fetchStudentData());
    }
  }, [dispatch]);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

  return (
    <>
      {showSessionExpired && (
<<<<<<< HEAD
        <SessionExpired show={showSessionExpired} onClose={handleCloseSessionExpired} />
      )}

      <div
        dir={dir}
        className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans"
      >
        <div className={headerWrapper}>
          <StudentHeader />
        </div>

        <Outlet />

        {footerVisible && <StudentFooter />}
      </div>
=======
        <SessionExpired
          show={showSessionExpired}
          onClose={handleCloseSessionExpired}
        />
      )}
      {isOnline ? (
        student?.studentDetails?.isBlocked ? (
          // If the student account is blocked, show a simple message and no app content
          <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-[#2e3440]">
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              {t('auth.blockedTitle') || 'Account Blocked'}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-center max-w-md">
              {t('auth.blockedMessage') || 'Your account has been blocked and you cannot access the platform.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#2e3440] font-sans min-h-screen">
            <div className={`${headerClassName}`}>
              <StudentHeader />
            </div>
            <Outlet />
            {footerVisible && <StudentFooter />}
          </div>
        )
      ) : (
        <YouAreOffline />
      )}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    </>
  );
};

export const Instructor: React.FC = () => {
  const isOnline = useIsOnline();
<<<<<<< HEAD
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const instructor = useSelector(selectInstructor);
  const dispatch: AnyDispatch = useDispatch();
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Fetch instructor details only when logged in as instructor
  useEffect(() => {
    const load = async () => {
      try {
        const response = await getInstructorDetails();
        dispatch(setDetails({ details: response.data }));
      } catch {
        // Avoid noisy errors on guest/other roles
        if (isLoggedIn && userType === "instructor") {
          toast.error("Something went wrong", { position: "bottom-right" });
        }
      }
    };
    if (isLoggedIn && userType === "instructor") {
      load();
    }
  }, [dispatch, isLoggedIn, userType]);

  if (!isOnline) return <YouAreOffline />;

  // Not logged in as instructor
  if (!(isLoggedIn && userType === "instructor")) {
    return (
      <div dir={dir} className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <InstructorLoginPage />
      </div>
    );
  }

  // Blocked instructor
  if (instructor?.instructorDetails?.isBlocked) {
    return (
      <div
        dir={dir}
        className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-6"
      >
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          {t("auth.blockedTitle") || "Account Blocked"}
        </h1>
        <p className="mt-2 max-w-md text-center text-gray-700 dark:text-gray-300">
          {t("auth.blockedMessage") ||
            "Your account has been blocked and you cannot use the platform."}
        </p>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="fixed inset-0 flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
    >
      {/* Header */}
      <InstructorHeader />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side nav */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
          <InstructorSideNav />
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
=======
  const user = useSelector(selectUserType);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const instructor = useSelector(selectInstructor);
  const { t } = useLanguage();
  const fetchInstructor = async () => {
    try {
      const response = await getInstructorDetails();
      dispatch(setDetails({details:response.data}))
    } catch (error) {
      toast.error("Something went wrong")
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, []);

  return (
    <>
      {isOnline ? (
        isLoggedIn && user === "instructor" ? (
          instructor?.instructorDetails?.isBlocked ? (
            // Blocked instructor message
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#2e3440] p-4">
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {t('auth.blockedTitle') || 'Account Blocked'}
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-center max-w-md">
                {t('auth.blockedMessage') || 'Your account has been blocked and you cannot use the platform.'}
              </p>
            </div>
          ) : (
            <>
              <div className="fixed inset-x-0 top-0 flex flex-col font-sans">
                <InstructorHeader />
                <div className="flex flex-1">
                  <div className="w-64 h-screen overflow-y-auto">
                    <InstructorSideNav />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="p-4 bg-customBlueShade dark:bg-[#2e3440] overflow-y-scroll h-screen">
                      <Outlet />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        ) : (
          <div>
            <InstructorLoginPage />
          </div>
        )
      ) : (
        <YouAreOffline />
      )}
    </>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
};

export const Admin: React.FC = () => {
<<<<<<< HEAD
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);

  if (!isOnline) return <YouAreOffline />;

  // Logged in admin
  if (isLoggedIn && userType === "admin") {
    return (
      <div className="flex min-h-screen items-start justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans">
        <div className="w-80">
          <AdminSideNav />
        </div>
        <div className="mt-5 flex-1 max-h-screen overflow-y-auto pl-4">
          <Outlet />
        </div>
      </div>
    );
  }

  // Guest / non-admin user
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminLoginPage />
    </div>
=======
  const isAdminLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUserType);
  const isOnline = useIsOnline();
  return (
    <>
      {isOnline ? (
        isAdminLoggedIn && user === "admin" ? (
          <div className='bg-gray-100  items-center  flex justify-center font-sans overflow-y-hidden'>
            <div className='w-80'>   
              <AdminSideNav />  
            </div>
            <div className='flex-1 pl-4 h-screen max-h-full overflow-y-scroll mt-5'>
              {/* Use 'h-screen' and 'max-h-full' to allow the container to take the full screen height */}
              <Outlet />
            </div>   
          </div>
        ) : (    
          <div className='bg-gray-100'>
            <AdminLoginPage />
          </div>
        )
      ) : (
        <YouAreOffline />
      )}
    </>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
};
