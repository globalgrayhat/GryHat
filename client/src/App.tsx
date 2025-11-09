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
import AdminSideNav from "./pages/admin/admin-side-nav";

// Redux Selectors & Actions
import {
  selectIsLoggedIn,
  selectUserType,
} from "./redux/reducers/authSlice";
import {
  selectStudent,
  fetchStudentData,
} from "./redux/reducers/studentSlice";
import {
  selectInstructor,
  setDetails as setInstructorDetails,
} from "./redux/reducers/instructorSlice";
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
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const footerVisible = useSelector(selectIsFooterVisible);
  const studentState = useSelector(selectStudent);
  const dispatch: AnyDispatch = useDispatch();

  const { t, lang } = useLanguage() as {
    t: (k: string) => string;
    lang?: "ar" | "en";
  };
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => setShowSessionExpired(true);
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (
      isLoggedIn &&
      userType === "student" &&
      !studentState.studentDetails &&
      !studentState.isFetching
    ) {
      dispatch(fetchStudentData());
    }
  }, [
    dispatch,
    isLoggedIn,
    userType,
    studentState.studentDetails,
    studentState.isFetching,
  ]);

  if (!isOnline) return <YouAreOffline />;

  if (studentState.studentDetails?.isBlocked) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-100"
      >
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          {t("auth.blockedTitle") || "Account Blocked"}
        </h1>
        <p className="max-w-md mt-2 text-center text-gray-700 dark:text-gray-300">
          {t("auth.blockedMessage") ||
            "Your account has been blocked and you cannot access the platform."}
        </p>
      </div>
    );
  }

  return (
    <>
      {showSessionExpired && (
        <SessionExpired
          show={showSessionExpired}
          onClose={() => setShowSessionExpired(false)}
        />
      )}

      <div
        dir={dir}
        className="min-h-screen font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-100"
      >
        <div className="bg-gray-100 dark:bg-gray-900">
          <StudentHeader />
        </div>

        <Outlet />

        {footerVisible && <StudentFooter />}
      </div>
    </>
  );
};

// =============================
// INSTRUCTOR LAYOUT
// =============================
export const Instructor: React.FC = () => {
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const instructorState = useSelector(selectInstructor);
  const dispatch: AnyDispatch = useDispatch();

  const { t, lang } = useLanguage() as {
    t: (k: string) => string;
    lang?: "ar" | "en";
  };
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getInstructorDetails();
        const data = response.data || response;
        dispatch(
          setInstructorDetails({
            details: data,
          })
        );
      } catch {
        if (isLoggedIn && userType === "instructor") {
          toast.error(
            t("toast.genericError") ||
              "Something went wrong while loading instructor profile",
            { position: "bottom-right" }
          );
        }
      }
    };

    if (
      isLoggedIn &&
      userType === "instructor" &&
      !instructorState.instructorDetails
    ) {
      void load();
    }
  }, [
    dispatch,
    isLoggedIn,
    userType,
    instructorState.instructorDetails,
    t,
  ]);

  if (!isOnline) return <YouAreOffline />;

  if (!(isLoggedIn && userType === "instructor")) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <InstructorLoginPage
          isOpen={true}
          onClose={() => undefined}
          onSwitchToRegister={() => undefined}
        />
      </div>
    );
  }

  if (instructorState.instructorDetails?.isBlocked) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-100"
      >
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          {t("auth.blockedTitle") || "Account Blocked"}
        </h1>
        <p className="max-w-md mt-2 text-center text-gray-700 dark:text-gray-300">
          {t("auth.blockedMessage") ||
            "Your account has been blocked and you cannot access the platform."}
        </p>
      </div>
    );
  }

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
  const isOnline = useIsOnline();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);

  if (!isOnline) return <YouAreOffline />;

  if (isLoggedIn && userType === "admin") {
    return (
      <div className="flex items-start justify-start min-h-screen font-sans text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
        <div className="w-72 lg:w-72 xl:w-80">
          <AdminSideNav />
        </div>
        <div className="flex-1 max-h-screen px-3 pt-4 pb-6 overflow-y-auto">
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
