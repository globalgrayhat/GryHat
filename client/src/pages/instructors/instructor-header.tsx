import React from "react";
import { Navbar, Typography, IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { ProfileMenu } from "./profile-menu-instructor";
import LanguageToggle from "../../components/common/LanguageToggle";

interface Props {
  toggleSidebar: () => void;
}

export default function InstructorHeader({ toggleSidebar }: Props) {
  return (
    <Navbar className="sticky top-0 z-10 max-w-full py-2 px-4 lg:px-8 lg:py-4 bg-white/80 backdrop-blur-2xl border-b border-gray-200">
      <div className="flex items-center justify-between text-blue-gray-900">
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </IconButton>

        <Typography as="a" href="#" className="mr-4 cursor-pointer py-1.5 font-semibold text-xl hidden lg:block">
          Instructor Dashboard
        </Typography>

        <div className="flex items-center gap-4 ml-auto">
          <LanguageToggle />
          <ProfileMenu />
        </div>
      </div>
    </Navbar>
  );
}