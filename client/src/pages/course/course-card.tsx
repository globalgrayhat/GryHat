import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { formatToINR, getFullUrl } from "../../utils/helpers";
import type { CourseInterface } from "../../types/course";
import { AcademicCapIcon } from "@heroicons/react/24/solid";

/** Tolerant type to match API variability (objects vs strings) */
type CourseCardData = CourseInterface & {
  instructorId?: {
    firstName?: string;
    lastName?: string;
    profilePic?: { url?: string };
  }; // may be object with firstName/lastName/profilePic
  category?: { name?: string }; // may be object with name
  thumbnail?: { url?: string }; // fallback if thumbnailUrl missing
  enrolledCount?: number; // optional
};

type Props = Partial<CourseCardData>;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** 12px star rating with good contrast in both themes */
const Stars: React.FC<{ rating?: number }> = ({ rating }) => {
  const r = Math.round(clamp(rating ?? 0, 0, 5));
  return (
    <div className="flex items-center gap-0.5 text-[12px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < r ? "text-amber-500" : "text-gray-300 dark:text-gray-500"
          }
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-gray-700 dark:text-gray-200">
        {(rating ?? 0).toFixed(1)}
      </span>
    </div>
  );
};

/** Instructor pin (name + avatar) — unchanged in light, more contrast in dark */
const InstructorPin: React.FC<{ name?: string; avatar?: string }> = ({
  name,
  avatar,
}) => {
  if (!name && !avatar) return null;
  return (
    <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1">
      {name && (
        <span
          className="
            hidden sm:inline-block max-w-[140px] truncate rounded-full
            bg-white/95 px-2 py-1 text-[11px] font-medium text-gray-900
            ring-1 ring-black/5 shadow-sm
            dark:bg-gray-900/95 dark:text-gray-100 dark:ring-white/15
          "
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
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-900"
            loading="lazy"
          />
          <span
            className="
              absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full
              bg-blue-600 ring-2 ring-white flex items-center justify-center
              dark:bg-blue-500 dark:ring-gray-900
            "
          >
            <AcademicCapIcon className="h-2.5 w-2.5 text-white" />
          </span>
        </div>
      )}
    </div>
  );
};

const CourseCard: React.FC<Props> = (props) => {
  const {
    title,
    description,
    duration,
    level,
    price,
    isPaid,
    rating,
    thumbnailUrl,
    coursesEnrolled,
  } = props;

  // Normalize category name
  const categoryRaw = (props as CourseCardData)?.category;
  const categoryName =
    typeof categoryRaw === "string"
      ? categoryRaw
      : (categoryRaw as { name?: string })?.name;

  // Normalize instructor data
  const instructor = (props as CourseCardData)?.instructorId;
  const instructorName = instructor
    ? `${instructor?.firstName ?? ""} ${instructor?.lastName ?? ""}`.trim()
    : undefined;
  const instructorAvatar = instructor?.profilePic?.url
    ? getFullUrl(instructor.profilePic.url)
    : undefined;

  // Cover URL
  const coverUrl = getFullUrl(
    thumbnailUrl || (props as CourseCardData)?.thumbnail?.url || ""
  );

  // Price / FREE
  const paidFlag =
    typeof isPaid === "boolean"
      ? isPaid
      : typeof price === "number"
      ? price > 0
      : false;
  const isFree = !paidFlag || (typeof price === "number" && price === 0);

  // Enrollment
  const enrolled =
    typeof (props as CourseCardData)?.enrolledCount === "number"
      ? (props as CourseCardData)?.enrolledCount
      : Array.isArray(coursesEnrolled)
      ? coursesEnrolled.length
      : undefined;

  const safeRating = clamp(typeof rating === "number" ? rating : 0, 0, 5);

  return (
    <Card
      shadow={false}
      className="
        group w-full max-w-[20rem] overflow-hidden rounded-2xl
        bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md
        transition
        dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500
      "
    >
      {/* Cover (16:9) */}
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-0"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title || "Course cover"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
          )}

          {/* Overlay: خفيف في اللايت (يحافظ على الشكل القديم)، أقوى قليلاً في الدارك للقراءة */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-black/5 to-transparent dark:from-black/45 dark:via-black/15" />

          {/* Top-left badges: 
              - في اللايت: نفس الشكل الأبيض القديم
              - في الدارك: بادج ملوّن بارز للفئة، والأخضر لـ FREE يبقى واضح */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {categoryName && (
              <span
                className="
                  rounded-full px-2.5 py-1 text-[11px] font-semibold
                  bg-white/95 text-gray-900 ring-1 ring-black/5
                  dark:bg-blue-500 dark:text-white dark:ring-blue-400/40
                "
              >
                {categoryName}
              </span>
            )}
            {(typeof price === "number" || typeof isPaid === "boolean") && (
              <span
                className={
                  isFree
                    ? "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white bg-green-600 dark:bg-green-500"
                    : "rounded-full px-2.5 py-1 text-[11px] font-semibold text-gray-900 bg-white/95 ring-1 ring-black/5 dark:bg-indigo-500 dark:text-white dark:ring-indigo-400/40"
                }
              >
                {isFree
                  ? "FREE"
                  : formatToINR?.(price as number) ?? `₹${price}`}
              </span>
            )}
          </div>

          {/* Top-right instructor pin */}
          <InstructorPin name={instructorName} avatar={instructorAvatar} />
        </div>
      </CardHeader>

      {/* Body */}
      <CardBody className="p-4">
        {/* Title — يحافظ على شكل اللايت، وكونتراست واضح في الدارك */}
        <Typography
          variant="h6"
          className="line-clamp-2 font-semibold text-gray-900 dark:text-white"
        >
          {title}
        </Typography>

        {/* Short description */}
        {description && (
          <p className="mt-1 text-[13px] leading-5 text-gray-700 dark:text-gray-200 line-clamp-2">
            {description}
          </p>
        )}

        {/* Meta + rating */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-gray-700 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-2">
            {typeof duration === "number" && <span>⏱ {duration}h</span>}
            {level && <span>•</span>}
            {level && <span>🎯 {level}</span>}
            {typeof enrolled === "number" && (
              <>
                <span>•</span>
                <span>👥 {enrolled}</span>
              </>
            )}
          </div>
          <Stars rating={safeRating} />
        </div>
      </CardBody>
    </Card>
  );
};

export default CourseCard;
