import React, { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import ChangePasswordForm from "./password-form";
import { PencilIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../contexts/LanguageContext";

const InstructorProfile: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Placeholder for fetching extra profile data if needed
  }, []);

  return (
    <div className="flex justify-center w-full py-6 bg-gray-50 dark:bg-gray-900 sm:py-8">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="p-4 bg-white shadow-md dark:bg-gray-800 rounded-2xl sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl dark:text-gray-100">
            {t("settings.editProfileInfo") || "Edit Profile Information"}
          </h2>

          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2 lg:gap-8">
            {/* Account Info */}
            <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t("settings.accountInfo") || "Account Info"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="p-1 text-indigo-600 hover:text-indigo-800"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <ProfileForm editMode={editMode} setEditMode={setEditMode} />
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t("settings.changePassword") || "Change Password"}
                </h3>
                <div className="p-1 text-indigo-600">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-4 sm:p-5">
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
