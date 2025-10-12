// client/src/components/pages/instructors/instructor-side-nav.tsx

// Import necessary libraries and hooks from React and react-router-dom
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Import UI components from @material-tailwind/react
import { Button, Typography } from "@material-tailwind/react";

// Import icons from @heroicons/react. Using the 'solid' version for a filled style.
import {
  HomeIcon,
  Square3Stack3DIcon,
  PlusCircleIcon,
  UsersIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon, // This icon is for the close button on mobile
} from "@heroicons/react/24/solid";

// Define a reusable style object for the icons to keep the code DRY (Don't Repeat Yourself)
const icon = {
  className: "w-5 h-5 text-inherit",
};

// Define the navigation routes as an array of objects. This makes the links easy to manage and map over.
const routes = [
  {
    title: "Home",
    icon: <HomeIcon {...icon} />,
    value: "home",
    path: "/instructors/",
  },
  {
    title: "View courses",
    icon: <Square3Stack3DIcon {...icon} />,
    value: "view-course",
    path: "/instructors/view-course",
  },
  {
    title: "Add courses",
    icon: <PlusCircleIcon {...icon} />,
    value: "add-course",
    path: "/instructors/add-course",
  },
  {
    title: "My students",
    icon: <UsersIcon {...icon} />,
    value: "view-students",
    path: "/instructors/view-students",
  },
  {
    title: "My Profile",
    icon: <UserCircleIcon {...icon} />,
    value: "view-profile",
    path: "/instructors/view-profile",
  },
  {
    title: "Channels",
    icon: <ChatBubbleLeftRightIcon {...icon} />,
    value: "view-channels",
    path: "/instructors/view-channels",
  },
];

// Define the type for the component's props (properties) using a TypeScript interface.
interface Props {
  isOpen: boolean; // A boolean to control whether the sidebar is visible or hidden
  toggleSidebar: () => void; // A function passed from the parent to change the isOpen state
}

// Define the Functional Component 'InstructorSideNav'
const InstructorSideNav: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  // useLocation hook from react-router-dom to get the current URL path
  const location = useLocation();

  // Process the URL to determine which nav item should be active.
  // Example: "/instructors/view-course" becomes "view-course"
  const currentPath = location.pathname.split("/").slice(2).join("/");

  // useState hook to keep track of the active navigation link.
  // It defaults to the current path or 'home' if the path is empty.
  const [isActive, setIsActive] = useState<string>(
    currentPath === "" ? "home" : currentPath
  );

  // A handler function to update the active state when a button is clicked.
  const handleClick = (active: string) => {
    setIsActive(active);
  };

  // The JSX that will be rendered
  return (
    // The main <nav> element for the sidebar.
    // It uses conditional classes for responsive behavior.
<nav
  className={`
    bg-white h-screen w-64 border-r border-gray-200 flex flex-col 
    fixed inset-y-0 left-0 z-30 
    transform transition-transform duration-300 ease-in-out
    lg:static lg:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>
  <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center">
    <Typography variant="h5" color="blue-gray">
      GrayHAT
    </Typography>
    <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>

  <ul className="flex-1 py-4 overflow-y-auto">
    {routes.map(({ title, icon, value, path }, index) => (
      <li key={index} className="px-4 py-2">
        <Link to={path}>
          <Button
            variant={isActive === value ? "gradient" : "text"}
            color={isActive === value ? "blue" : "gray"}
            className="flex items-center gap-4 capitalize"
            fullWidth
            onClick={() => handleClick(value)}
          >
            {icon}
            <Typography
              color={isActive === value ? "inherit" : "gray"}
              className="font-bold capitalize"
            >
              {title}
            </Typography>
          </Button>
        </Link>
      </li>
    ))}
  </ul>
</nav>

  );
};

// Export the component to be used in other parts of the application
export default InstructorSideNav;