import React from "react";
import { Field, ErrorMessage } from "formik";

type Props = {
  name: string;
  label: string;
  type?: string;
  as?: string;
  rows?: number;
  dir?: "ltr" | "rtl";
  placeholder?: string;
};

const FormField: React.FC<Props> = ({ name, label, type = "text", as, rows, dir, placeholder }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        as={as}
        rows={rows}
        dir={dir}
        placeholder={placeholder}
        className="
          w-full rounded-xl border px-3 py-2 text-sm
          bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
          dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
        "
      />
      <ErrorMessage name={name} component="div" className="mt-1 text-xs font-medium text-rose-600" />
    </div>
  );
};

export default FormField;
