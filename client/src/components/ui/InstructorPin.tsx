import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/solid";

// English comments: Small UI badge for showing instructor name + avatar on cover image.
const InstructorPin: React.FC<{ name?: string; avatar?: string }> = ({ name, avatar }) => {
  if (!name && !avatar) return null;
  return (
    <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1">
      {name && (
        <span
          className="hidden sm:inline-block max-w-[200px] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-900 ring-1 ring-black/5 shadow-sm dark:bg-gray-900/95 dark:text-gray-100 dark:ring-white/15"
          title={name}
        >
          {name}
        </span>
      )}
      {avatar && (
        <div className="relative">
          <img
            src={avatar}
            alt={name || "Instructor"}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-900"
            loading="lazy"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 ring-2 ring-white flex items-center justify-center dark:bg-blue-500 dark:ring-gray-900">
            <AcademicCapIcon className="h-2.5 w-2.5 text-white" />
          </span>
        </div>
      )}
    </div>
  );
};

export default InstructorPin;
