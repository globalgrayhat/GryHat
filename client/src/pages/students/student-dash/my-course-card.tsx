/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/pages/students/student-dash/my-course-card.tsx

import React, { memo, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { BsPlayCircle } from "react-icons/bs";
import type { CourseInterface } from "../../../types/course";
import { getFullUrl } from "@/utils/helpers";

interface MyCourseCardProps extends Partial<CourseInterface> {
  /**
   * Optional callback when "Watch now" is clicked.
   * Use this to navigate to the course/lesson from parent.
   */
  onWatch?: () => void;
}

/**
 * MyCourseCard
 * - Premium, compact course card for "My Courses" dashboard.
 * - Design goals:
 *   - Clean, consistent with the platform.
 *   - Stable layout: fixed image ratio, aligned text, subtle meta row.
 *   - Accessible & keyboard-friendly.
 * - Performance:
 *   - `memo` + `useMemo` + `useCallback` to avoid unnecessary renders.
 */
const MyCourseCardComponent: React.FC<MyCourseCardProps> = (props) => {
  const { title, description, duration, onWatch } = props;

  const safeTitle = (title || "").trim() || "Untitled course";

  // Resolve thumbnail from multiple possible API fields once per props change
  const coverSrc = useMemo(() => {
    const anyProps = props as any;

    const candidates: Array<unknown> = [
      anyProps.thumbnailUrl,
      anyProps.thumbnail,
      anyProps.thumbnail?.url,
      anyProps.image,
      anyProps.imageUrl,
      anyProps.coverImage,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return getFullUrl(candidate);
      }
    }

    // Fallback: static asset from public (make sure it exists)
    return "/course-placeholder.svg";
  }, [props]);

  const handleWatchClick = useCallback(() => {
    onWatch?.();
  }, [onWatch]);

  // Avoid infinite loop on bad URLs
  const handleImgError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!e.currentTarget.src.includes("course-placeholder.svg")) {
        e.currentTarget.src = "/course-placeholder.svg";
      }
    },
    []
  );

  return (
    <Card
      className="flex flex-col w-full max-w-xs overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
    >
      {/* Top image */}
      <CardHeader
        shadow={false}
        floated={false}
        className="relative w-full h-40 overflow-hidden bg-gray-100 rounded-none "
      >
        <img
          src={coverSrc}
          alt={`Thumbnail of ${safeTitle}`}
          loading="lazy"
          onError={handleImgError}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {/* subtle overlay gradient for better text contrast if needed later */}
        <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
      </CardHeader>

      {/* Content */}
      <CardBody className="flex flex-col flex-1 gap-2 px-3 py-3">
        {/* Title + duration */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Typography
            color="blue-gray"
            className="text-sm font-semibold leading-snug line-clamp-2"
          >
            {safeTitle}
          </Typography>

          {duration ? (
            <span className="ml-1 whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {duration}
            </span>
          ) : null}
        </div>

        {/* Description */}
        {description && (
          <Typography
            variant="small"
            className="line-clamp-2 text-[11px] text-gray-600"
          >
            {description}
          </Typography>
        )}

        {/* Meta row (optional, extend later if API supports it) */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
          {/* Example placeholders: adapt to your real CourseInterface fields if exist */}
          <span className="truncate">
            {/* {props.instructorName || "GrayHAT Instructor"} */}
            Enrolled course
          </span>
          {/* <span>{props.lessonsCount ? `${props.lessonsCount} lessons` : ""}</span> */}
        </div>
      </CardBody>

      {/* Action */}
      <CardFooter className="px-3 pt-0 pb-3">
        <Button
          ripple={false}
          fullWidth
          type="button"
          onClick={handleWatchClick}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            text-[11px]
            font-semibold
            text-white
            shadow-none
            transition-all
            duration-200
            hover:bg-blue-700
            hover:shadow-md
            hover:scale-[1.02]
            focus:outline-none
            focus:ring-2
            focus:ring-blue-300
            active:scale-100
          "
        >
          <BsPlayCircle className="text-base" />
          <span>Continue watching</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

const MyCourseCard = memo(MyCourseCardComponent);

export default MyCourseCard;
