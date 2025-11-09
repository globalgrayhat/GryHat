import React, { useEffect, useState, useCallback } from "react";
import ProfileForm from "./profile-form";
import ChangePasswordForm from "./chage-password-form";
import { fetchStudentData } from "../../../redux/reducers/studentSlice";
import { useDispatch } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { useLanguage } from "../../../contexts/LanguageContext";

const MyProfile: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [editState, setEditState] = useState<{ mode: boolean; type: "" | "account" | "password" }>(
    { mode: false, type: "" }
  );

  useEffect(() => {
    dispatch(fetchStudentData());
  }, [dispatch]);

  const open = (type: "account" | "password") => setEditState({ mode: true, type });
  const setAccountMode = useCallback((val: boolean) => {
    setEditState({ mode: val, type: val ? "account" : "" });
  }, []);
  const setPasswordMode = useCallback((val: boolean) => {
    setEditState({ mode: val, type: val ? "password" : "" });
  }, []);

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-11/12">
        <div className="w-full pt-5 pb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings.editProfileInfo") || "Edit profile info"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("settings.profileSubtitle") || "Manage your personal information and password"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Account Card */}
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-[#2e3440]/80">
              <div className="flex items-center justify-between px-5 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.accountInfo") || "Account Info"}
                </h3>
                <button
                  type="button"
                  onClick={() => open("account")}
                  className="rounded-xl bg-gray-900/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-900 dark:bg-white/90 dark:text-gray-900"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FiEdit />
                    {t("profile.edit") || "Edit"}
                  </span>
                </button>
              </div>

              <div className="p-5">
                <ProfileForm
                  editMode={editState.mode && editState.type === "account"}
                  setEditMode={setAccountMode}
                />
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="md:col-span-5">
            <div className="rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-[#2e3440]/80">
              <div className="flex items-center justify-between px-5 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.changePassword") || "Change password"}
                </h3>
                <button
                  type="button"
                  onClick={() => open("password")}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FiEdit />
                    {t("profile.edit") || "Edit"}
                  </span>
                </button>
              </div>
              <div className="p-5">
                <ChangePasswordForm
                  editMode={editState.mode && editState.type === "password"}
                  setEditMode={setPasswordMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
