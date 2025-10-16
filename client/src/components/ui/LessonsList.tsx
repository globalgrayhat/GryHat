/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { BiVideo } from "react-icons/bi";
import { Link } from "react-router-dom";

// English comment: Always return a <ul> to avoid <li> nested directly inside another <li>.
// This prevents React's validateDOMNesting warning.
const LessonsList: React.FC<{ lessons: any[] }> = ({ lessons }) => {
  // Always render a UL element — even when there are no lessons.
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        <li className="p-3 text-sm text-gray-500 dark:text-gray-400">
          Lessons will appear here once published.
        </li>
      </ul>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {lessons.map((lesson) => (
        <li key={lesson?._id}>
          <Link
            to={`watch-lessons/${lesson?._id}`}
            className="flex items-center gap-2 p-2.5 sm:p-3 text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700/60"
          >
            <BiVideo className="text-blue-500" />
            <span className="flex-1 truncate">
              {lesson?.title ?? "Untitled lesson"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default LessonsList;
