/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Card,
  Typography,
  List,
} from "@material-tailwind/react";
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
import { APP_LOGO } from "../../constants/common";
import { NavLink } from "react-router-dom";

/**
 * AdminSideNav
 *
 * Compact, responsive sidebar:
 * - Stays sticky on desktop.
 * - Uses NavLink for active state.
 * - Minimal padding, rounded, soft shadow.
 * - Designed to be used inside a fixed-width <aside>.
 */

export const AdminSideNav: React.FC = () => {
  const navItems = [
    { icon: PresentationChartBarIcon, label: "Dashboard", path: "" },
    { icon: AcademicCapIcon, label: "Instructors", path: "instructors" },
    { icon: UserGroupIcon, label: "Students", path: "students" },
    { icon: BookOpenIcon, label: "Categories", path: "categories" },
    { icon: Square3Stack3DIcon, label: "Courses", path: "courses" },
    { icon: DocumentTextIcon, label: "Articles", path: "articles" },
    { icon: UserCircleIcon, label: "Profile", path: "profile" },
    { icon: Cog6ToothIcon, label: "Settings", path: "settings" },
    { icon: PowerIcon, label: "Log Out", path: "login" },
  ];

  // Shared styles
  const baseItem =
    "flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] md:text-xs font-medium transition-all duration-150";
  const inactiveItem =
    "text-blue-gray-600 hover:bg-blue-50 hover:text-blue-600";
  const activeItem =
    "bg-indigo-500 text-white shadow-md shadow-indigo-200";

  return (
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
            className="text-[13px] font-semibold text-blue-gray-900 leading-tight"
          >
            GrayHAT
          </Typography>
          <span className="text-[9px] text-blue-gray-400">
            Admin Dashboard
          </span>
        </div>
      </div>

      <div className="h-px mx-2 mb-2 bg-blue-gray-50" />

      {/* Nav Items */}
      <List className="flex-1 pr-1 overflow-y-auto">
        {navItems.map(({ icon, label, path }) => (
          <NavLink
            key={label}
            to={`/admin/${path}`}
            end={path === ""} // exact for root dashboard
            className={({ isActive }) =>
              `${baseItem} ${isActive ? activeItem : inactiveItem}`
            }
          >
            {React.createElement(icon, {
              className: "w-4 h-4 md:w-5 md:h-5",
            })}
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </List>
    </Card>
  );
};

export default AdminSideNav;
