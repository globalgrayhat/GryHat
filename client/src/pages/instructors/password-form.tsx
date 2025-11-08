/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import { useFormik } from "formik";
import { changePassword } from "../../api/endpoints/instructor";
import { toast } from "react-toastify";
import type { PasswordInfo } from "../../api/types/student/student";
import { PasswordValidationSchema } from "../../validations/student";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ChangePasswordForm: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleSubmit = async (passwordInfo: PasswordInfo) => {
    try {
      const response = await changePassword(passwordInfo);
      if (response?.data?.status === "success") {
        formik.resetForm();
      }
      toast.success(response?.data?.message || "Password updated", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update password", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      repeatPassword: "",
    },
    validationSchema: PasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  const togglePasswordVisibility = (field: "current" | "new" | "repeat") => {
    if (field === "current") setShowCurrentPassword((v) => !v);
    if (field === "new") setShowNewPassword((v) => !v);
    if (field === "repeat") setShowRepeatPassword((v) => !v);
  };

  const typeFor = (field: "current" | "new" | "repeat") => {
    if (field === "current") return showCurrentPassword ? "text" : "password";
    if (field === "new") return showNewPassword ? "text" : "password";
    return showRepeatPassword ? "text" : "password";
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Current Password */}
      <div className="relative z-0 w-full mb-6 group">
        <input
          type={typeFor("current")}
          name="currentPassword"
          id="floating_current_password"
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent
          border-0 border-b-2 border-gray-300 appearance-none dark:text-white
          dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none
          focus:ring-0 focus:border-blue-600 peer ${
            formik.touched.currentPassword && formik.errors.currentPassword
              ? "border-red-500"
              : ""
          }`}
          placeholder=" "
        />
        <label
          htmlFor="floating_current_password"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400
          duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Current Password
        </label>
        <button
          type="button"
          className="absolute right-0 mr-2 -translate-y-1/2 top-1/2"
          onClick={() => togglePasswordVisibility("current")}
        >
          {showCurrentPassword ? (
            <AiOutlineEyeInvisible className="text-gray-500" />
          ) : (
            <AiOutlineEye className="text-gray-500" />
          )}
        </button>
        {formik.touched.currentPassword && formik.errors.currentPassword && (
          <div className="mt-1 text-xs text-red-500">
            {formik.errors.currentPassword}
          </div>
        )}
      </div>

      {/* New Password */}
      <div className="relative z-0 w-full mb-6 group">
        <input
          type={typeFor("new")}
          name="newPassword"
          id="floating_new_password"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent
          border-0 border-b-2 border-gray-300 appearance-none dark:text-white
          dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none
          focus:ring-0 focus:border-blue-600 peer ${
            formik.touched.newPassword && formik.errors.newPassword
              ? "border-red-500"
              : ""
          }`}
          placeholder=" "
        />
        <label
          htmlFor="floating_new_password"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400
          duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          New Password
        </label>
        <button
          type="button"
          className="absolute right-0 mr-2 -translate-y-1/2 top-1/2"
          onClick={() => togglePasswordVisibility("new")}
        >
          {showNewPassword ? (
            <AiOutlineEyeInvisible className="text-gray-500" />
          ) : (
            <AiOutlineEye className="text-gray-500" />
          )}
        </button>
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div className="mt-1 text-xs text-red-500">
            {formik.errors.newPassword}
          </div>
        )}
      </div>

      {/* Repeat Password */}
      <div className="relative z-0 w-full mb-6 group">
        <input
          type={typeFor("repeat")}
          name="repeatPassword"
          id="floating_repeat_password"
          value={formik.values.repeatPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent
          border-0 border-b-2 border-gray-300 appearance-none dark:text-white
          dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none
          focus:ring-0 focus:border-blue-600 peer ${
            formik.touched.repeatPassword && formik.errors.repeatPassword
              ? "border-red-500"
              : ""
          }`}
          placeholder=" "
        />
        <label
          htmlFor="floating_repeat_password"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400
          duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Confirm password
        </label>
        <button
          type="button"
          className="absolute right-0 mr-2 -translate-y-1/2 top-1/2"
          onClick={() => togglePasswordVisibility("repeat")}
        >
          {showRepeatPassword ? (
            <AiOutlineEyeInvisible className="text-gray-500" />
          ) : (
            <AiOutlineEye className="text-gray-500" />
          )}
        </button>
        {formik.touched.repeatPassword && formik.errors.repeatPassword && (
          <div className="mt-1 text-xs text-red-500">
            {formik.errors.repeatPassword}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-medium text-white shadow-sm"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
