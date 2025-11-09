// client/src/pages/admin/admin-dash-board-page.tsx

import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import AdminLayout from "../../components/admin/AdminLayout";

import AdminHomePage from "./admin-home-page";
import AdminLoginPage from "./admin-login-page";

import ViewInstructorsIndex from "./instructor-management/view-instructors-index";
import ViewInstructorRequests from "./instructor-management/viewInstructor-requests";
import ViewMoreInstructorRequest from "./instructor-management/view-more-instructor-request";
import ViewBlockedInstructors from "./instructor-management/view-blocked-instructors";

import Categories from "../categories/category-page";
import ListCategories from "../categories/list-category";
import AddCategory from "../categories/add-category";
import EditCategory from "../categories/edit-category";

import AdminCoursesPage from "./admin-courses-page";
import AdminArticlesPage from "./admin-articles-page";
import AdminProfilePage from "./admin-profile-page";
import AdminSiteSettingsPage from "./site-settings-page";

import StudentsTab from "./student-management/students-tab";

import {
  selectIsLoggedIn,
  selectUserType,
} from "../../redux/reducers/authSlice";

/**
 * AdminProtected
 * - يحمي مسارات الأدمن.
 * - يسمح فقط للمستخدم الذي نوعه "admin" ومسجل دخول.
 * - غير ذلك → توجيه لصفحة /admin/login.
 */
const AdminProtected: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn || userType !== "admin") {
      navigate("/admin/login", {
        replace: true,
        state: { from: location },
      });
    }
  }, [isLoggedIn, userType, navigate, location]);

  if (!isLoggedIn || userType !== "admin") return null;
  return <>{children}</>;
};

/**
 * AdminDashboardRoutes
 * - كل مسارات لوحة التحكم.
 * - جميع الصفحات الداخلية تلتف داخل AdminLayout لتوحيد الواجهة.
 */
const AdminDashboardRoutes: React.FC = () => {
  return (
    <Routes>
      {/* صفحة تسجيل دخول الأدمن (بدون Layout) */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* الرئيسية */}
      <Route
        path="/"
        element={
          <AdminProtected>
            <AdminLayout>
              <AdminHomePage />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* المدربين (بما فيها الراوتس الداخلية داخل ViewInstructorsIndex + Outlet) */}
      <Route
        path="/instructors/*"
        element={
          <AdminProtected>
            <AdminLayout>
              <ViewInstructorsIndex />
            </AdminLayout>
          </AdminProtected>
        }
      >
        <Route path="requests" element={<ViewInstructorRequests />} />
        <Route path="requests/:id" element={<ViewMoreInstructorRequest />} />
        <Route path="blocked" element={<ViewBlockedInstructors />} />
      </Route>

      {/* الطلاب */}
      <Route
        path="/students"
        element={
          <AdminProtected>
            <AdminLayout>
              <StudentsTab />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* التصنيفات */}
      <Route
        path="/categories/*"
        element={
          <AdminProtected>
            <AdminLayout>
              <Categories />
            </AdminLayout>
          </AdminProtected>
        }
      >
        <Route index element={<ListCategories />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="edit-category/:categoryId" element={<EditCategory />} />
      </Route>

      {/* الكورسات */}
      <Route
        path="/courses"
        element={
          <AdminProtected>
            <AdminLayout>
              <AdminCoursesPage />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* المقالات */}
      <Route
        path="/articles"
        element={
          <AdminProtected>
            <AdminLayout>
              <AdminArticlesPage />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* بروفايل الأدمن */}
      <Route
        path="/profile"
        element={
          <AdminProtected>
            <AdminLayout>
              <AdminProfilePage />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* إعدادات الموقع */}
      <Route
        path="/settings"
        element={
          <AdminProtected>
            <AdminLayout>
              <AdminSiteSettingsPage />
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* الإشعارات (placeholder حاليًا) */}
      <Route
        path="/notifactions"
        element={
          <AdminProtected>
            <AdminLayout>
              <div className="p-4 bg-white border shadow-sm rounded-2xl border-blue-gray-50 sm:p-6">
                <h2 className="mb-1 text-lg font-semibold sm:text-xl">
                  Notifications
                </h2>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Connect this section with your notifications service.
                </p>
              </div>
            </AdminLayout>
          </AdminProtected>
        }
      />

      {/* أي مسار غير معروف → توجيه للرئيسية */}
      <Route path="*" element={<Navigate to="/admin/" replace />} />
    </Routes>
  );
};

export function Dashboard() {
  return <AdminDashboardRoutes />;
}

Dashboard.displayName = "/src/pages/admin/admin-dash-board-page.tsx";

export default AdminDashboardRoutes;
