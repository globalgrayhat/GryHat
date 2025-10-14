import React, { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import ChangePasswordForm from "./password-form";
import { PencilIcon, LockClosedIcon } from "@heroicons/react/24/outline"; // Importing icons from Heroicons
import { useLanguage } from "../../contexts/LanguageContext";

type Props = {};

const InstructorProfile: React.FC = (props: Props) => {
  const [editMode, setEditMode] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Data fetching logic can be added here if necessary
  }, []);

  const handleEditClick = () => {
    setEditMode(true); // Toggle edit mode for forms
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-gray-800 py-8">
      <div className="max-w-7xl w-full px-6 sm:px-8 lg:px-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            {t("settings.editProfileInfo") || "Edit Profile Information"}
          </h2>

          {/* Account Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account Info */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {t("settings.accountInfo") || "Account Info"}
                </h3>
                <button
                  onClick={handleEditClick}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <PencilIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6">
                <ProfileForm editMode={editMode} setEditMode={setEditMode} />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {t("settings.changePassword") || "Change Password"}
                </h3>
                <button
                  onClick={handleEditClick}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <LockClosedIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6">
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;
