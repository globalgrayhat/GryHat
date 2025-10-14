import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { getInstructorDetails, updateProfile } from "../../api/endpoints/instructor";
import { UpdateProfileInfo } from "../../api/types/instructor/instructor";
import { Avatar } from "@material-tailwind/react";
import { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";
import { useLanguage } from '../../contexts/LanguageContext';
import { getFullUrl } from "../../utils/helpers";

import {
  PencilIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Props {
  editMode: boolean;
  setEditMode: (val: boolean) => void;
}

const ProfileForm: React.FC<Props> = ({ editMode, setEditMode }) => {
  const { t } = useLanguage();

  // State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [instructor, setInstructor] = useState<InstructorApiResponse | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [updated, setUpdated] = useState(false);

  // Fetch instructor data
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setProfileLoading(true);
        const response = await getInstructorDetails();
        setInstructor(response?.data);
      } catch {
        toast.error(t('settings.fetchError') || "Failed to fetch instructor data");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchInstructor();
  }, [updated, t]);

  // Update profile URL & form values when instructor changes
  useEffect(() => {
    if (instructor) {
      formik.setValues({
        email: instructor.email || "",
        firstName: instructor.firstName || "",
        lastName: instructor.lastName || "",
        mobile: instructor.mobile || "",
        qualification: instructor.qualification || "",
        experience: instructor.experience || "",
        skills: instructor.skills || "",
        about: instructor.about || "",
        profilePic: null,
      });
      setProfileUrl(getFullUrl(instructor.profilePic?.url) ?? "");
      setPreviewImage(null);
    }
  }, [instructor]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      mobile: "",
      qualification: "",
      experience: "",
      skills: "",
      about: "",
      profilePic: null,
    },
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        if (values.profilePic) formData.append("image", values.profilePic);
        formData.append("email", values.email);
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("mobile", values.mobile);
        formData.append("qualification", values.qualification);
        formData.append("experience", values.experience);
        formData.append("skills", values.skills);

        const response = await updateProfile(formData);
        toast.success(response?.data?.message || t('settings.updateSuccess'));
        setPreviewImage(null);
        (document.getElementById("file_input") as HTMLInputElement).value = "";
        setUpdated(prev => !prev);
        setEditMode(false);
      } catch (error: any) {
        toast.error(error?.data?.message || t('settings.updateError'));
      }
    },
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
    formik.setFieldValue("profilePic", file);
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <ArrowPathIcon className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="sr-only">{t('settings.loading') || "Loading..."}</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      {/* Profile Picture */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <Avatar
          src={previewImage || profileUrl || "../profile.jpg"}
          alt="avatar"
          size="xl"
          className="shadow-lg"
        />
        <div className="flex flex-col flex-1">
          <label
            htmlFor="file_input"
            className="flex items-center cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition font-semibold"
          >
            <PhotoIcon className="w-6 h-6 mr-2" />
            {t('settings.uploadProfilePhoto') || 'Upload Profile Photo'}
          </label>
          <input
            type="file"
            id="file_input"
            accept="image/*"
            disabled={!editMode}
            onChange={handleFileChange}
            className="hidden"
          />
          {previewImage && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('settings.imagePreview') || 'Image preview available'}
            </p>
          )}
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: "firstName", label: t('settings.firstName') || "First Name", required: true },
          { id: "lastName", label: t('settings.lastName') || "Last Name", required: true },
          { id: "email", label: t('settings.email') || "Email Address", type: "email", required: true, colSpan: 2 },
          { id: "mobile", label: t('settings.mobile') || "Mobile", required: true },
          { id: "qualification", label: t('settings.qualification') || "Qualification", required: true },
          { id: "experience", label: t('settings.experience') || "Experience", required: true },
          { id: "skills", label: t('settings.skills') || "Skills", required: true },
        ].map(({ id, label, type = "text", required = false, colSpan = 1 }) => (
          <InputField
            key={id}
            id={id}
            label={label}
            type={type}
            value={formik.values[id as keyof typeof formik.values] as string}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={!editMode}
            required={required}
            colSpan={colSpan}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        {editMode ? (
          <>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <XMarkIcon className="w-5 h-5" />
              {t('settings.cancel') || "Cancel"}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {t('settings.save') || "Save"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            <PencilIcon className="w-5 h-5" />
            {t('settings.editProfile') || "Edit Profile"}
          </button>
        )}
      </div>
    </form>
  );
};

// Reusable InputField component with floating labels
interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled: boolean;
  required?: boolean;
  colSpan?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  disabled,
  required = false,
  colSpan = 1,
}) => (
  <div className={`relative z-0 w-full mb-6 group ${colSpan > 1 ? `md:col-span-${colSpan}` : ""}`}>
    <input
      type={type}
      name={id}
      id={`floating_${id}`}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder=" "
      required={required}
      className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
        border-gray-300 appearance-none dark:text-white dark:border-gray-600
        dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer
        ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-text"}`}
    />
    <label
      htmlFor={`floating_${id}`}
      className={`peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400
        duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
        ${value ? "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0" : ""}
        peer-focus:scale-75 peer-focus:-translate-y-6`}
    >
      {label}
    </label>
  </div>
);

export default ProfileForm;
