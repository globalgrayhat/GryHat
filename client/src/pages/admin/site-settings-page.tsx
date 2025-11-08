/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "react-toastify";

/**
 * AdminSiteSettingsPage
 *
 * Compact responsive card for global platform settings:
 * - Platform name.
 * - Login options toggles (student, instructor, Google).
 *
 * Reads initial values from SiteSettingsContext.
 * On save: currently shows success + refreshSettings().
 * You can plug in your real update API inside handleSubmit.
 */

const AdminSiteSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { t } = useLanguage();

  const [platformName, setPlatformName] = useState("");
  const [studentEnabled, setStudentEnabled] = useState(true);
  const [instructorEnabled, setInstructorEnabled] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load current settings into local state
  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platformName ?? "");
      setStudentEnabled(settings.loginOptions?.studentEnabled ?? true);
      setInstructorEnabled(settings.loginOptions?.instructorEnabled ?? true);
      setGoogleEnabled(settings.loginOptions?.googleEnabled ?? true);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!platformName.trim()) {
      toast.error(
        t("settings.errors.platformNameRequired") ||
          "Platform name cannot be empty"
      );
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with your backend:
      // await updateSiteSettings({
      //   platformName,
      //   loginOptions: {
      //     studentEnabled,
      //     instructorEnabled,
      //     googleEnabled,
      //   },
      // });

      toast.success(
        t("settings.successfullyUpdated") ||
          "Settings updated successfully (mock)"
      );

      await refreshSettings();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("settings.updateFailed") ||
          "Failed to update settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-3 py-4">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1f2933] rounded-2xl shadow-sm border border-blue-gray-50/70 p-4 sm:p-6">
        <h1 className="mb-2 text-lg font-semibold text-gray-800 sm:text-2xl dark:text-gray-100">
          {t("settings.siteSettings") || "Site Settings"}
        </h1>
        <p className="mb-4 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          {t("settings.siteSettingsDescription") ||
            "Configure global platform options and authentication preferences."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform Name */}
          <div>
            <label
              htmlFor="platformName"
              className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {t("settings.platformName") || "Platform Name"}
            </label>
            <input
              id="platformName"
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="mt-0.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-xs sm:text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={
                t("settings.platformNamePlaceholder") ||
                "Enter the platform name"
              }
            />
          </div>

          {/* Login Options */}
          <fieldset className="px-3 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl">
            <legend className="px-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {t("settings.loginOptions") || "Login Options"}
            </legend>
            <div className="mt-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-700 dark:text-gray-300">
                  {t("settings.enableStudentLogin") || "Enable Student Login"}
                </span>
                <input
                  id="studentEnabled"
                  type="checkbox"
                  checked={studentEnabled}
                  onChange={(e) => setStudentEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-700 dark:text-gray-300">
                  {t("settings.enableInstructorLogin") ||
                    "Enable Instructor Login"}
                </span>
                <input
                  id="instructorEnabled"
                  type="checkbox"
                  checked={instructorEnabled}
                  onChange={(e) => setInstructorEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-700 dark:text-gray-300">
                  {t("settings.enableGoogleLogin") || "Enable Google Login"}
                </span>
                <input
                  id="googleEnabled"
                  type="checkbox"
                  checked={googleEnabled}
                  onChange={(e) => setGoogleEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? t("settings.saving") || "Saving..."
                : t("settings.saveSettings") || "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSiteSettingsPage;
