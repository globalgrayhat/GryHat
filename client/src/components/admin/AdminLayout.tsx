import React, { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import AdminSideNav from "../../pages/admin/admin-side-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout
 * - شيل عام للوحة تحكم الأدمن.
 * - يحتوي:
 *    - Sidebar (AdminSideNav)
 *    - Top bar بسيط في الموبايل
 *    - مساحة المحتوى لصفحات الأدمن (children)
 * - لا يفرض title/description: هذه وظيفة AdminPageLayout داخل كل صفحة.
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-blue-gray-50/70">
      <div className="flex w-full mx-auto max-w-7xl">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block">
          <AdminSideNav />
        </div>

        {/* Sidebar - Mobile (Drawer-style) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/30"
              onClick={closeMobile}
            />
            {/* Drawer */}
            <div className="relative z-50 w-64 h-full bg-white shadow-xl">
              <AdminSideNav onNavigate={closeMobile} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-h-screen">
          {/* Top Bar (Mobile only) */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b shadow-sm border-blue-gray-50 md:hidden">
            <button
              type="button"
              onClick={toggleMobile}
              className="inline-flex items-center justify-center w-8 h-8 border rounded-lg border-blue-gray-100 text-blue-gray-700 hover:bg-blue-gray-50"
            >
              {mobileOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-semibold text-blue-gray-900">
                Admin Dashboard
              </span>
              <span className="text-[9px] text-blue-gray-400">
                GrayHAT Panel
              </span>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-2 sm:p-3 lg:p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
