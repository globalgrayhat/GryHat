import { Navbar, Typography, IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { ProfileMenu } from "./profile-menu-instructor";
import LanguageToggle from "../../components/common/LanguageToggle";

interface Props {
  toggleSidebar: () => void;
}

export default function InstructorHeader({ toggleSidebar }: Props) {
  return (
    <Navbar className="sticky top-0 z-30 max-w-full px-3 py-2 border-b border-gray-200 sm:px-4 lg:px-8 bg-white/80 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 text-blue-gray-900">
        <div className="flex items-center gap-2">
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </IconButton>
          <Typography
            as="span"
            className="hidden lg:inline-block font-semibold text-[18px]"
          >
            Instructor Dashboard
          </Typography>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <LanguageToggle />
          <ProfileMenu />
        </div>
      </div>
    </Navbar>
  );
}
