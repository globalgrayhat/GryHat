import React, { useEffect, useState } from "react";
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

export const Student: React.FC = () => {
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
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

  return (
    <>
      {showSessionExpired && (
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
    </>
  );
};

export const Instructor: React.FC = () => {
  const isOnline = useIsOnline();
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
  );
};

export const Admin: React.FC = () => {
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
  );
};
