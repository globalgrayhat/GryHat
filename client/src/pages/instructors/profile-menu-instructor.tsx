import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  ChevronDownIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { selectInstructor } from "../../redux/reducers/instructorSlice";
import { clearToken } from "../../redux/reducers/authSlice";
import { clearDetails } from "../../redux/reducers/instructorSlice";
import { USER_AVATAR } from "../../constants/common";
import { useNavigate } from "react-router-dom";
import { getFullUrl } from "../../utils/helpers";

const profileMenuItems = [
  { label: "My Profile", icon: UserCircleIcon, action: "profile" },
  { label: "Inbox", icon: InboxArrowDownIcon, action: "inbox" },
  { label: "Help", icon: LifebuoyIcon, action: "help" },
  { label: "Sign Out", icon: PowerIcon, action: "signout" },
];

export function ProfileMenu() {
  const instructor = useSelector(selectInstructor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === "signout") {
      dispatch(clearToken());
      dispatch(clearDetails());
      navigate("/");
    }
    // Add other actions if needed
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center gap-1 rounded-full p-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
          <img
            className="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover"
            src={getFullUrl(instructor.instructorDetails?.profilePic?.url) || USER_AVATAR}
            alt="Instructor avatar"
          />
          <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            {profileMenuItems.map(({ label, icon: Icon, action }) => {
              const isLastItem = action === "signout";
              return (
                <Menu.Item key={label}>
                  {({ active }) => (
                    <button
                      onClick={() => handleAction(action)}
                      className={`${
                        active
                          ? 'bg-indigo-600 text-white'
                          : isLastItem
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-900 hover:bg-gray-100'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-all`}
                    >
                      <Icon
                        className={`mr-2 h-5 w-5 ${
                          isLastItem && !active ? 'text-red-500' : ''
                        }`}
                        aria-hidden="true"
                      />
                      {label}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
