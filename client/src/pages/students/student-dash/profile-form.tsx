/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/pages/students/profile-form.tsx

import React, {
  useEffect,
  useState,
  useCallback,
  memo,
  useRef,
} from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { Avatar } from "@material-tailwind/react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

import { useLanguage } from "../../../contexts/LanguageContext";
import { getStudentDetails, updateProfile } from "../../../api/endpoints/student";
import type { ApiResponseStudent } from "../../../api/types/apiResponses/api-response-student";
import type { UpdateProfileInfo } from "../../../api/types/student/student";
import { getFullUrl } from "../../../utils/helpers";

/** Reusable Field (modern input) */
interface FieldProps {
  label: string;
  name: string;
  value: string;
  icon: React.ElementType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}
const Field: React.FC<FieldProps> = memo(
  ({ label, name, value, onChange, disabled, icon: Icon, type = "text" }) => (
    <label className="relative block group">
      <span className="block mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </span>
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white/90 px-3 py-2.5 text-sm shadow-sm ring-1 ring-gray-200 transition-all dark:bg-[#3b4252] dark:ring-gray-700
        ${disabled ? "opacity-80" : "hover:shadow-md"} `}
      >
        <Icon className="w-4 h-4 text-gray-400" />
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
        />
      </div>
    </label>
  )
);
Field.displayName = "Field";

interface Props {
  editMode: boolean;
  setEditMode: (val: boolean) => void;
}

/**
 * ProfileForm (Modern)
 * - Loads once
 * - Sends only changed fields (FormData)
 * - Updates local state from API response (no extra GET)
 * - Modern UI: cards, rounded-2xl, soft shadows, subtle rings
 */
const ProfileForm: React.FC<Props> = ({ editMode, setEditMode }) => {
  const { t } = useLanguage();

  const dir: "rtl" | "ltr" =
    typeof document !== "undefined" && document.documentElement.dir === "rtl"
      ? "rtl"
      : "ltr";

  const [student, setStudent] = useState<ApiResponseStudent | null>(null);
  const [initialValues, setInitialValues] = useState<UpdateProfileInfo>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    profilePic: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);

  /** Load once */
  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStudentDetails();
      const data: ApiResponseStudent = response?.data || response || ({} as ApiResponseStudent);

      setStudent(data);
      const nextValues: UpdateProfileInfo = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        mobile: data.mobile || "",
        profilePic: null,
      };
      setInitialValues(nextValues);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          t("profile.loadFailed") ||
          "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  const formik = useFormik<UpdateProfileInfo>({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!student) return;

      const formData = new FormData();
      if (values.firstName && values.firstName !== student.firstName) {
        formData.append("firstName", values.firstName);
      }
      if (values.lastName && values.lastName !== student.lastName) {
        formData.append("lastName", values.lastName);
      }
      if (values.email && values.email !== student.email) {
        formData.append("email", values.email);
      }
      if (values.mobile && values.mobile !== student.mobile) {
        formData.append("mobile", values.mobile);
      }
      if (values.profilePic instanceof File) {
        formData.append("profilePic", values.profilePic);
      }

      if ([...formData.keys()].length === 0) {
        toast.info(t("profile.noChanges") || "No changes to update");
        setEditMode(false);
        return;
      }

      setSaving(true);
      try {
        const response = await updateProfile(formData);

        const updatedFromApi: ApiResponseStudent | undefined =
          response?.data?.data || response?.data?.student || response?.data?.user;

        const updated: ApiResponseStudent =
          updatedFromApi || {
            ...student,
            ...values,
            profilePic: student.profilePic,
          };

        setStudent(updated);

        const nextValues: UpdateProfileInfo = {
          firstName: updated.firstName || "",
          lastName: updated.lastName || "",
          email: updated.email || "",
          mobile: updated.mobile || "",
          profilePic: null,
        };
        setInitialValues(nextValues);
        formik.resetForm({ values: nextValues });

        setPreviewImage(null);
        if (lastObjectUrlRef.current) {
          URL.revokeObjectURL(lastObjectUrlRef.current);
          lastObjectUrlRef.current = null;
        }

        setEditMode(false);

        toast.success(
          response?.data?.message ||
            t("profile.updatedSuccessfully") ||
            "Profile updated successfully"
        );
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.data?.message ||
            error?.message ||
            t("profile.updateFailed") ||
            "Failed to update profile"
        );
      } finally {
        setSaving(false);
      }
    },
  });

  /** Avatar + preview */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      formik.setFieldValue("profilePic", file);

      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      lastObjectUrlRef.current = url;
      setPreviewImage(url);
    },
    [formik]
  );

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
    };
  }, []);

  const avatarUrl =
    previewImage ||
    (student?.profilePic?.url ? getFullUrl(student.profilePic.url) : "/Profile.svg");

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-sm text-gray-500">
          {t("profile.loading") || "Loading profile..."}
        </span>
      </div>
    );
  }

  return (
    <form
      dir={dir}
      onSubmit={formik.handleSubmit}
      className="
        rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur
        dark:border-gray-700 dark:bg-[#2e3440]/80
      "
    >
      {/* Header */}
      <div
        className="relative p-5 text-white  rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                src={avatarUrl}
                alt="Profile"
                size="lg"
                className="rounded-2xl ring-2 ring-white/60"
              />
              {editMode && (
                <label
                  htmlFor="file_input"
                  className="absolute grid text-gray-800 shadow-sm cursor-pointer  -bottom-1 -right-1 h-7 w-7 place-items-center rounded-xl bg-white/90 ring-1 ring-gray-200 hover:bg-white"
                  title={t("profile.changeAvatar") || "Change picture"}
                >
                  <CameraIcon className="w-4 h-4" />
                </label>
              )}
              <input
                id="file_input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {student?.firstName || ""} {student?.lastName || ""}
              </p>
              <p className="text-xs/5 opacity-90">{student?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="
                  rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/30
                  backdrop-blur transition hover:bg-white/25
                "
              >
                <span className="inline-flex items-center gap-1.5">
                  <PencilSquareIcon className="w-4 h-4" />
                  {t("profile.edit") || "Edit profile"}
                </span>
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="
                    rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-900
                    shadow-sm transition hover:bg-gray-100 disabled:opacity-60
                  "
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="w-4 h-4" />
                    {saving ? t("profile.saving") || "Saving..." : t("profile.save") || "Save"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setPreviewImage(null);
                    if (lastObjectUrlRef.current) {
                      URL.revokeObjectURL(lastObjectUrlRef.current);
                      lastObjectUrlRef.current = null;
                    }
                    formik.resetForm({ values: initialValues });
                  }}
                  className="
                    rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white
                    ring-1 ring-inset ring-white/30 transition hover:bg-white/15
                  "
                >
                  <span className="inline-flex items-center gap-1.5">
                    <XMarkIcon className="w-4 h-4" />
                    {t("profile.cancel") || "Cancel"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
        <Field
          label={t("profile.firstName") || "First name"}
          name="firstName"
          icon={UserIcon}
          value={formik.values.firstName || ""}
          onChange={formik.handleChange}
          disabled={!editMode}
        />
        <Field
          label={t("profile.lastName") || "Last name"}
          name="lastName"
          icon={UserIcon}
          value={formik.values.lastName || ""}
          onChange={formik.handleChange}
          disabled={!editMode}
        />
        <Field
          label={t("profile.email") || "Email"}
          name="email"
          icon={EnvelopeIcon}
          value={formik.values.email || ""}
          onChange={formik.handleChange}
          disabled
          type="email"
        />
        <Field
          label={t("profile.mobile") || "Mobile"}
          name="mobile"
          icon={PhoneIcon}
          value={formik.values.mobile || ""}
          onChange={formik.handleChange}
          disabled={!editMode}
          type="tel"
        />
      </div>

      {/* Tiny helper */}
      {editMode && (
        <p className="mt-2 text-[11px] text-gray-500">
          {t("profile.changeAvatar") || "Profile picture"} · JPG/PNG ~2MB
        </p>
      )}
    </form>
  );
};

export default ProfileForm;
