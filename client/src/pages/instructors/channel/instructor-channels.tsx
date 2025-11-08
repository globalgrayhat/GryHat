/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

type Props = {};

const InstructorChannels: React.FC<Props> = () => {
  return (
    <div className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl p-6 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-xl font-semibold text-gray-800">
          Channels & Communication
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          This section will allow you to manage your discussion channels,
          announcements, and direct communication with students.
        </p>
        <div className="inline-flex items-center justify-center px-4 py-1 mt-4 rounded-full bg-indigo-50">
          <span className="text-[11px] font-medium text-indigo-600">
            Coming soon...
          </span>
        </div>
      </div>
    </div>
  );
};

export default InstructorChannels;
