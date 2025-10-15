import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import {
  getInstructorDetails,
  updateProfile,
} from "../../../api/endpoints/instructor";
import type { UpdateProfileInfo } from "../../../api/types/instructor/instructor";
import { Avatar } from "@material-tailwind/react";
import type { InstructorApiResponse } from "../../../api/types/apiResponses/api-response-instructors";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  PhotoIcon,
  PencilSquareIcon,
  // PencilIcon,
  XMarkIcon,
  CheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface Props {
  editMode: boolean;
  setEditMode: (val: boolean) => void;
}

const ProfileForm: React.FC<Props> = ({ editMode, setEditMode }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [instructor, setInstructor] = useState<InstructorApiResponse | null>(
    null
  );
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [updated, setUpdated] = useState(false);
  const { t } = useLanguage();

  const fetchInstructor = async () => {
    try {
      setProfileLoading(true);
      const response = await getInstructorDetails();
      setInstructor(response?.data);
      setProfileLoading(false);
    } catch {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [updated]);

  useEffect(() => {
    setProfileUrl(instructor?.profilePic?.url ?? "");
  }, [instructor]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      profilePic: null as File | null,
      email: instructor?.email || "",
      firstName: instructor?.firstName || "",
      lastName: instructor?.lastName || "",
      mobile: instructor?.mobile || "",
      qualification: instructor?.qualification || "",
      experience: instructor?.experience || "",
      skills: instructor?.skills || "",
      about: instructor?.about || "",
    },
    onSubmit: (values: UpdateProfileInfo & { profilePic?: File | null }) => {
      handleSubmit(values);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue("profilePic", file);
    } else {
      setPreviewImage(null);
      formik.setFieldValue("profilePic", null);
    }
  };

  const handleSubmit = async (
    profileInfo: UpdateProfileInfo & { profilePic?: File | null }
  ) => {
    try {
      const formData = new FormData();
      if (profileInfo.profilePic) {
        formData.append("image", profileInfo.profilePic);
      }
      formData.append("email", profileInfo.email || "");
      formData.append("firstName", profileInfo.firstName || "");
      formData.append("lastName", profileInfo.lastName || "");
      formData.append("mobile", profileInfo.mobile || "");
      formData.append("qualification", profileInfo.qualification || "");
      formData.append("experience", profileInfo.experience || "");
      formData.append("skills", profileInfo.skills || "");
      formData.append("about", profileInfo.about || "");

      const response = await updateProfile(formData);
      setPreviewImage(null);
      const fileInput = document.getElementById(
        "file_input"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setUpdated(!updated);
      setEditMode(false);
      toast.success(response?.data?.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (error: unknown) {
      setUpdated(!updated);
      toast.error(
        (error as { data?: { message?: string }; message?: string })?.data
          ?.message ||
          (error as { message?: string })?.message ||
          "Error",
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    }
  };

  if (profileLoading) {
    return (
      <div className="p-6 text-center">
        {t("common.loading") || "Loading..."}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Header with avatar and action buttons */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={previewImage || profileUrl || "../profile.jpg"}
              alt="avatar"
              size="xl"
            />
            <div className="absolute right-0 bottom-0 bg-white dark:bg-gray-700 rounded-full p-1 shadow -translate-x-1 translate-y-1">
              <label
                htmlFor="file_input"
                className="cursor-pointer flex items-center justify-center w-8 h-8"
              >
                <PhotoIcon className="w-5 h-5" />
              </label>
              <input
                id="file_input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {formik.values.firstName} {formik.values.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formik.values.qualification}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {t("settings.edit") || "Edit"}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        formik.resetForm();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {t("settings.cancel") || "Cancel"}
                      </span>
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {t("settings.save") || "Save"}
                      </span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="flex items-center gap-1 px-2 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Settings"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick info row */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="truncate">{formik.values.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span className="truncate">{formik.values.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4" />
                <span className="truncate">{formik.values.qualification}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form fields organized with icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithIcon
            id="firstName"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.firstName") || "First name"}
            Icon={UserIcon}
          />

          <InputWithIcon
            id="lastName"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.lastName") || "Last name"}
            Icon={UserIcon}
          />

          <InputWithIcon
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.email") || "Email address"}
            Icon={EnvelopeIcon}
            className="md:col-span-2"
          />

          <InputWithIcon
            id="mobile"
            name="mobile"
            value={formik.values.mobile}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.mobile") || "Mobile"}
            Icon={PhoneIcon}
          />

          <InputWithIcon
            id="qualification"
            name="qualification"
            value={formik.values.qualification}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.qualification") || "Qualification"}
            Icon={AcademicCapIcon}
          />

          <InputWithIcon
            id="experience"
            name="experience"
            value={formik.values.experience}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.experience") || "Experience"}
            Icon={BriefcaseIcon}
            className="md:col-span-2"
          />

          <InputWithIcon
            id="skills"
            name="skills"
            value={formik.values.skills}
            onChange={formik.handleChange}
            disabled={!editMode}
            placeholder={t("settings.skills") || "Skills"}
            Icon={SparklesIcon}
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <label htmlFor="about" className="block text-xs text-gray-500 mb-1">
              {t("settings.about") || "About"}
            </label>
            <textarea
              id="about"
              name="about"
              value={formik.values.about}
              onChange={formik.handleChange}
              disabled={!editMode}
              className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 bg-transparent"
              placeholder={t("settings.about") || "Short bio..."}
            />
          </div>
        </div>

        {/* Actions (visible on small screens too) */}
        {editMode && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                formik.resetForm();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md border"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>{t("settings.cancel") || "Cancel"}</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{t("settings.save") || "Save"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;

// -------------------- Helper component --------------------

type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
};
type IconComponent =
  | React.FunctionComponent<IconProps>
  | React.ForwardRefExoticComponent<
      IconProps & React.RefAttributes<SVGSVGElement>
    >;

interface InputWithIconProps {
  id: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  Icon?: IconComponent;
  className?: string;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  Icon,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`pl-12 pr-3 py-2 w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "opacity-80" : ""
        }`}
      />
    </div>
  );
};
