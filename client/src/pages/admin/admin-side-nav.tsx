// client/src/pages/admin/admin-side-nav.tsx

import React, { useState, useCallback } from "react";
import { Card, Typography, List } from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  Cog6ToothIcon,
  PowerIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  Square3Stack3DIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";

import { APP_LOGO } from "../../constants/common";
import LogoutConfirmationModal from "../../components/elements/student-logout-modal";

interface AdminSideNavProps {
  /** Optional callback for mobile drawer: close after navigation */
  onNavigate?: () => void;
}

/**
 * AdminSideNav
 * - Shared sidebar for all admin pages.
 * - Uses NavLink for active route styles.
 * - Shows confirmation modal before logout.
 */
const AdminSideNav: React.FC<AdminSideNavProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Centralized nav definition (DRY)
  const navItems = [
    { icon: PresentationChartBarIcon, label: "Dashboard", path: "/admin" },
    { icon: AcademicCapIcon, label: "Instructors", path: "/admin/instructors" },
    { icon: UserGroupIcon, label: "Students", path: "/admin/students" },
    { icon: BookOpenIcon, label: "Categories", path: "/admin/categories" },
    { icon: Square3Stack3DIcon, label: "Courses", path: "/admin/courses" },
    { icon: DocumentTextIcon, label: "Articles", path: "/admin/articles" },
    { icon: UserCircleIcon, label: "Profile", path: "/admin/profile" },
    { icon: Cog6ToothIcon, label: "Settings", path: "/admin/settings" },
  ];

  /** Common click handler for nav items to support mobile drawers */
  const handleNavClick = useCallback(() => {
    if (onNavigate) onNavigate();
  }, [onNavigate]);

  /** Open confirmation dialog instead of logging out immediately */
  const handleLogoutClick = useCallback(() => {
    setLogoutModalOpen(true);
  }, []);

  /** Actual logout logic (used by confirmation modal) */
  const handleConfirmLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      // Clear auth-related storage keys
      localStorage.removeItem("gh_auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("persist:root");
    }

    setLogoutModalOpen(false);
    navigate("/", { replace: true });

    if (onNavigate) onNavigate();
  }, [navigate, onNavigate]);

  // Shared styles (avoids repetition)
  const baseItem =
    "flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] md:text-xs font-medium transition-all duration-150";
  const inactiveItem =
    "text-blue-gray-600 hover:bg-blue-50 hover:text-blue-600";
  const activeItem =
    "bg-indigo-500 text-white shadow-md shadow-indigo-200";

  return (
    <>
      <Card
        className="
          h-[100vh]
          md:h-[calc(100vh-1.5rem)]
          w-full
          max-w-[17rem]
          md:max-w-[18rem]
          p-3 md:p-4
          m-0 md:m-3
          rounded-2xl
          border border-blue-gray-50
          shadow-md shadow-blue-gray-900/5
          flex flex-col
          sticky md:top-2
          bg-white
        "
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-1">
          <img
            src={APP_LOGO}
            alt="GrayHAT"
            className="object-contain w-8 h-8 rounded-lg"
          />
          <div className="flex flex-col">
            <Typography
              variant="h6"
              className="text-[13px] font-semibold leading-tight text-blue-gray-900"
            >
              GrayHAT
            </Typography>
            <span className="text-[9px] text-blue-gray-400">
              Admin Dashboard
            </span>
          </div>
        </div>

        <div className="h-px mx-2 mb-2 bg-blue-gray-50" />

        {/* Navigation */}
        <List className="flex-1 pr-1 overflow-y-auto">
          {navItems.map(({ icon, label, path }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : inactiveItem}`
              }
              onClick={handleNavClick}
            >
              {React.createElement(icon, {
                className: "h-4 w-4 md:h-5 md:w-5",
              })}
              <span className="truncate">{label}</span>
            </NavLink>
          ))}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className={`${baseItem} mt-1 text-red-500 hover:bg-red-50 hover:text-red-600`}
          >
            <PowerIcon className="w-4 h-4 md:h-5 md:w-5" />
            <span className="truncate">Log Out</span>
          </button>
        </List>
      </Card>

      {/* Logout confirmation modal */}
      <LogoutConfirmationModal
        open={logoutModalOpen}
        setOpen={setLogoutModalOpen}
        onConfirmLogout={handleConfirmLogout}
      />
    </>
  );
};

export default AdminSideNav;
export { AdminSideNav };
