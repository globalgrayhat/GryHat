import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

// Common Components
import StudentHeader from "./components/partials/header";
import StudentFooter from "./components/partials/footer";
import YouAreOffline from "./components/common/you-are-offline";
import SessionExpired from "./components/common/session-expired-modal";

// Instructor Components
import InstructorLoginPage from "./pages/instructors/instructor-login-modal";
import InstructorLayout from "./pages/instructors/InstructorLayout";

// Admin Components
import AdminLoginPage from "./pages/admin/admin-login-page";
import { AdminSideNav } from "./pages/admin/admin-side-nav";

// Redux
import { selectIsLoggedIn, selectUserType } from "./redux/reducers/authSlice";
import { selectStudent, fetchStudentData } from "./redux/reducers/studentSlice";
import { selectInstructor, setDetails } from "./redux/reducers/instructorSlice";
import { selectIsFooterVisible } from "./redux/reducers/helperSlice";

// API & Hooks
import { getInstructorDetails } from "./api/endpoints/instructor";
import useIsOnline from "./hooks/useOnline";
import { toast } from "react-toastify";
import { useLanguage } from "./contexts/LanguageContext";

type AnyDispatch = ReturnType<typeof useDispatch>;

// =============================
// STUDENT LAYOUT
// =============================
export const Student: React.FC = () => {
  // ... (No changes in this section)
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

  useEffect(() => {
    const handleSessionExpired = () => setShowSessionExpired(true);
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, []);

  useEffect(() => {
    if (isLoggedIn && userType === "student") {
      dispatch(fetchStudentData());
    }
  }, [dispatch, isLoggedIn, userType]);

  const headerWrapper = "bg-gray-100 dark:bg-gray-900 opacity-100 transition-opacity duration-300";

  if (!isOnline) return <YouAreOffline />;

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
          {t("auth.blockedMessage") || "Your account has been blocked and you cannot access the platform."}
        </p>
      </div>
    );
  }

  return (
    <>
      {showSessionExpired && <SessionExpired show={showSessionExpired} onClose={handleCloseSessionExpired} />}
      <div dir={dir} className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans">
        <div className={headerWrapper}>
          <StudentHeader />
        </div>
        <Outlet />
        {footerVisible && <StudentFooter />}
      </div>
    </>
  );
};

// =============================
// INSTRUCTOR LAYOUT (UPDATED)
// =============================
export const Instructor: React.FC = () => {
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const instructor = useSelector(selectInstructor);
  const dispatch: AnyDispatch = useDispatch();
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Fetch instructor details (this logic remains the same)
  useEffect(() => {
    const load = async () => {
      try {
        const response = await getInstructorDetails();
        dispatch(setDetails({ details: response.data }));
      } catch {
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

  // Case 1: Not logged in as an instructor, show login page
  if (!(isLoggedIn && userType === "instructor")) {
    return (
      <div dir={dir} className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <InstructorLoginPage isOpen={false} onClose={function (): void {
          throw new Error("Function not implemented.");
        } } onSwitchToRegister={function (): void {
          throw new Error("Function not implemented.");
        } } />
      </div>
    );
  }

  // Case 2: Instructor is blocked, show blocked message
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
          {t("auth.blockedMessage") || "Your account has been blocked and you cannot use the platform."}
        </p>
      </div>
    );
  }

  // The <Outlet /> is now rendered inside the InstructorLayout component.
  return (
    <div dir={dir}>
      <InstructorLayout />
    </div>
  );
};


// =============================
// ADMIN LAYOUT
// =============================
export const Admin: React.FC = () => {
  // ... (No changes in this section)
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);

  if (!isOnline) return <YouAreOffline />;

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminLoginPage />
    </div>
  );
};