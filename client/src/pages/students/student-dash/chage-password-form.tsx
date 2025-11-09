/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// client/src/pages/students/student-dash/chage-password-form.tsx

import React, { useState } from "react";
import { useFormik } from "formik";
import { changePassword } from "../../../api/endpoints/student";
import { toast } from "react-toastify";
import type { PasswordInfo } from "../../../api/types/student/student";
import { PasswordValidationSchema } from "../../../validations/student";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface Props {
  editMode: boolean;
  setEditMode: (val: boolean) => void;
}

const ChangePasswordForm: React.FC<Props> = ({ editMode, setEditMode }) => {
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const formik = useFormik<PasswordInfo>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      repeatPassword: "",
    },
    validationSchema: PasswordValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await changePassword(values);
        if (response?.data?.status === "success") {
          toast.success(response?.data?.message || "Password updated", {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          formik.resetForm();
          setEditMode(false);
        } else {
          throw new Error(response?.data?.message || "Failed");
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.data?.message ||
            error?.message ||
            "Failed to update password",
          { position: toast.POSITION.BOTTOM_RIGHT }
        );
      }
    },
  });

  const InputRow = (
    name: keyof PasswordInfo,
    label: string,
    visible: boolean,
    toggle: () => void
  ) => {
    const err = formik.touched[name] && formik.errors[name];
    return (
      <label className="relative block mb-4 group">
        <span className="block mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <div
          className={`flex items-center gap-2 rounded-2xl border bg-white/90 px-3 py-2.5 text-sm shadow-sm ring-1 transition-all dark:bg-[#3b4252]
            ${err ? "ring-red-300 border-red-300" : "ring-gray-200 border-transparent"}
            ${!editMode ? "opacity-70" : "hover:shadow-md"}
          `}
        >
          <input
            type={visible ? "text" : "password"}
            name={name}
            disabled={!editMode}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
            placeholder={label}
          />
          <button
            type="button"
            className="p-1 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            onClick={toggle}
            disabled={!editMode}
            aria-label="toggle-visibility"
          >
            {visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>
        {err && <div className="mt-1 text-xs text-red-500">{formik.errors[name] as string}</div>}
      </label>
    );
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      {InputRow("currentPassword", "Current Password", show.current, () =>
        setShow((s) => ({ ...s, current: !s.current }))
      )}
      {InputRow("newPassword", "New Password", show.next, () =>
        setShow((s) => ({ ...s, next: !s.next }))
      )}
      {InputRow("repeatPassword", "Confirm Password", show.confirm, () =>
        setShow((s) => ({ ...s, confirm: !s.confirm }))
      )}

      {editMode && (
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="
              rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white
              shadow-sm transition hover:bg-indigo-700
            "
          >
            Reset
          </button>
        </div>
      )}
    </form>
  );
};

export default ChangePasswordForm;
