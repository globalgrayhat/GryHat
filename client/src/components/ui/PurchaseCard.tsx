/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button, Chip } from "@material-tailwind/react";
import Stars from "./Stars";

// English comments: Purchase/summary card shown on the right-hand side.
const PurchaseCard: React.FC<{
  course: any;
  isFree: boolean;
  enrolled: boolean;
  handleEnroll: () => void;
  instructorName?: string;
  instructorAvatar?: string;
  safeRating: number;
}> = ({ course, isFree, enrolled, handleEnroll, instructorName, instructorAvatar, safeRating }) => {
  const formatToINR = (n: number) => `₹${n}`; // keep fallback formatting
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {(typeof course?.price === "number" || typeof course?.isPaid === "boolean") && (isFree ? (
            <Chip color="green" value="FREE" variant="filled" size="sm" className="rounded-full w-full md:w-auto" />
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatToINR?.(course?.price as number) ?? `₹${course?.price}`}</span>
          ))}
        </div>
        <Button disabled={enrolled} color={enrolled ? "green" : "blue"} size="sm" className="rounded-full w-full md:w-auto h-9 text-sm" onClick={handleEnroll}>{enrolled ? "Enrolled" : "Enroll Now"}</Button>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300">
        <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700"><div className="font-semibold">Duration</div><div>{typeof course?.duration === "number" ? `${course?.duration}h` : "—"}</div></div>
        <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700"><div className="font-semibold">Level</div><div>{course?.level || "—"}</div></div>
        <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700"><div className="font-semibold">Enrolled</div><div>{Array.isArray(course?.coursesEnrolled) ? course?.coursesEnrolled.length : 0}</div></div>
      </div>

      {(instructorName || instructorAvatar) && (
        <div className="mt-4 flex items-center gap-3">
          {instructorAvatar ? (
            <img src={instructorAvatar} className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover" alt={instructorName || "Instructor"} />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="min-w-0"><div className="text-sm font-medium text-gray-900 dark:text-white">{instructorName || "—"}</div><div className="text-xs text-gray-600 dark:text-gray-400">Instructor</div></div>
        </div>
      )}

      <div className="mt-3"><Stars rating={safeRating} /></div>
    </div>
  );
};

export default PurchaseCard;
