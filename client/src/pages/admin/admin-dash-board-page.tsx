import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { IconButton } from "@material-tailwind/react";
import { Cog6ToothIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

import { AdminSideNav } from "./admin-side-nav";
import AdminHomePage from "./admin-home-page";
import AdminLoginPage from "./admin-login-page";

import ViewInstructorsIndex from "../instructors/instructor-management/view-instructors-index";
import ViewInstructorRequests from "../instructors/instructor-management/viewInstructor-requests";
import ViewMoreInstructorRequest from "../instructors/instructor-management/view-more-instructor-request";
import ViewBlockedInstructors from "../instructors/instructor-management/view-blocked-instructors";

import Categories from "../categories/category-page";
import ListCategories from "../categories/list-category";
import AddCategory from "../categories/add-category";
import EditCategory from "../categories/edit-category";

import AdminCoursesPage from "./admin-courses-page";
import AdminArticlesPage from "./admin-articles-page";
import AdminProfilePage from "./admin-profile-page";
import AdminSiteSettingsPage from "./site-settings-page";

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-blue-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="flex-shrink-0 hidden w-64 lg:block xl:w-72">
        <AdminSideNav />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {/* Toggle Button */}
        <IconButton
          size="sm"
          color="white"
          className="fixed z-50 border shadow-lg top-3 left-3 bg-white/90 border-blue-gray-50"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <XMarkIcon className="w-5 h-5 text-blue-gray-700" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-blue-gray-700" />
          )}
        </IconButton>

        {/* Overlay + Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="w-64 h-full">
              <AdminSideNav />
            </div>
            <div
              className="flex-1 h-full bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 px-2 pb-6 sm:px-4 lg:px-6 pt-14 lg:pt-4 lg:ml-0">
        {/* Floating Settings Button */}
        <IconButton
          size="lg"
          color="white"
          className="fixed z-40 hidden border rounded-full shadow-xl bottom-6 right-6 bg-white/95 border-blue-gray-50 md:flex"
          ripple={false}
        >
          <Cog6ToothIcon className="w-5 h-5 text-blue-gray-700" />
        </IconButton>

        {/* Routes */}
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<AdminHomePage />} />

          {/* Instructors */}
          <Route path="/instructors" element={<ViewInstructorsIndex />}>
            <Route path="requests" element={<ViewInstructorRequests />} />
            <Route path="requests/:id" element={<ViewMoreInstructorRequest />} />
            <Route path="blocked" element={<ViewBlockedInstructors />} />
          </Route>

          {/* Students placeholder */}
          <Route
            path="/students"
            element={
              <div className="p-4 bg-white border shadow-sm sm:p-6 rounded-2xl border-blue-gray-50">
                <h2 className="mb-1 text-lg font-semibold sm:text-xl">
                  Students
                </h2>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Students management module coming soon.
                </p>
              </div>
            }
          />

          {/* Categories */}
          <Route path="/categories" element={<Categories />}>
            <Route index element={<ListCategories />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="edit-category/:categoryId" element={<EditCategory />} />
          </Route>

          {/* Courses */}
          <Route path="/courses" element={<AdminCoursesPage />} />

          {/* Articles */}
          <Route path="/articles" element={<AdminArticlesPage />} />

          {/* Profile */}
          <Route path="/profile" element={<AdminProfilePage />} />

          {/* Settings */}
          <Route path="/settings" element={<AdminSiteSettingsPage />} />

          {/* Notifications placeholder */}
          <Route
            path="/notifactions"
            element={
              <div className="p-4 bg-white border shadow-sm sm:p-6 rounded-2xl border-blue-gray-50">
                <h2 className="mb-1 text-lg font-semibold sm:text-xl">
                  Notifications
                </h2>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Connect this section with your notifications service.
                </p>
              </div>
            }
          />

          {/* Login */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export function Dashboard() {
  return <DashboardLayout />;
}

Dashboard.displayName = "/src/layout/dashboard.tsx";

export default DashboardLayout;
