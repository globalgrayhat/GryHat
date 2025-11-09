import React from "react";
import { NavLink } from "react-router-dom";
import { Card, CardBody, Tabs, TabsHeader } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { FaBan, FaEye } from "react-icons/fa";

const TopNav: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center w-full px-3 py-2 text-sm font-medium rounded-md transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <Card className="items-center justify-center mx-3 mb-5 lg:mx-4">
      <CardBody className="flex justify-center p-2">
        <div className="bg-gray-100 rounded-lg w-96">
          <Tabs value="view">
            <TabsHeader className="z-20 flex gap-1 bg-transparent">
              <NavLink to="/admin/instructors" className={linkClass}>
                <FaEye className="inline-block w-5 h-5 mr-2 -mt-1" />
                View
              </NavLink>
              <NavLink
                to="/admin/instructors/requests"
                className={linkClass}
              >
                <UserPlusIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                Requests
              </NavLink>
              <NavLink
                to="/admin/instructors/blocked"
                className={linkClass}
              >
                <FaBan className="inline-block w-5 h-5 mr-2 -mt-1" />
                Blocked
              </NavLink>
            </TabsHeader>
          </Tabs>
        </div>
      </CardBody>
    </Card>
  );
};

export default TopNav;
