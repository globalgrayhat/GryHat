import React from "react";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";
import type { ApiResponseTrending } from "../../api/types/apiResponses/api-response-home-page-listing";
import { getFullUrl } from "../../utils/helpers";
import { AcademicCapIcon } from "@heroicons/react/24/solid";

/* ---------- Tolerant Types ---------- */
type TrendStatus = "new" | "trending" | "hot";
type TrendingCardData = ApiResponseTrending & {
  status?: TrendStatus;
  rating?: number;
  price?: number;
  categoryName?: string;
  duration?: number;
  level?: string;
  createdAt?: string; // "YYYY/MM/DD"
};

interface Props {
  courseInfo: TrendingCardData;
}

/* ---------- Utils ---------- */
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/* ---------- UI Bits ---------- */
/** 12px star rating with theme-aware contrast */
const Stars: React.FC<{ rating?: number }> = ({ rating }) => {
  const r = Math.round(clamp(rating ?? 0, 0, 5));
  return (
    <div className="flex items-center gap-0.5 text-[12px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < r ? "text-amber-500" : "text-gray-300 dark:text-gray-500"}
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

/** Small status badge (always solid colors) */
const StatusChip: React.FC<{ status?: TrendStatus }> = ({ status }) => {
  if (!status) return null;
  const map: Record<TrendStatus, string> = {
    new: "bg-blue-600 text-white",
    trending: "bg-amber-500 text-white",
    hot: "bg-rose-600 text-white",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

/** Instructor pin: label (left) + avatar (right); theme-aware */
type PinPos = "top-right" | "top-left" | "bottom-right" | "bottom-left";
const posClass: Record<PinPos, string> = {
  "top-right": "top-2 right-2",
  "top-left": "top-2 left-2",
  "bottom-right": "bottom-2 right-2",
  "bottom-left": "bottom-2 left-2",
};

const InstructorPin: React.FC<{
  name: string;
  avatar: string;
  position?: PinPos;
  showLabelOnMobile?: boolean;
}> = ({ name, avatar, position = "top-right", showLabelOnMobile = false }) => (
  <div
    className={`pointer-events-none absolute ${posClass[position]} flex items-center gap-1`}
    aria-label={`Instructor: ${name}`}
  >
    <span
      className={[
        showLabelOnMobile ? "inline-block" : "hidden sm:inline-block",
        "max-w-[140px] truncate rounded-full px-2 py-1 text-[11px] font-medium",
        // Light: keep white chip; Dark: high-contrast subtle dark chip
        "bg-white/95 text-gray-900 ring-1 ring-black/5 shadow-sm",
        "dark:bg-gray-900/95 dark:text-gray-100 dark:ring-white/15",
      ].join(" ")}
      title={name}
    >
      {name}
    </span>
    <div className="relative">
      <img
        src={avatar}
        alt={name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-900"
        loading="lazy"
      />
      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
        <AcademicCapIcon className="h-2.5 w-2.5 text-white" />
      </span>
    </div>
  </div>
);

/* ---------- Card ---------- */
const TrendingCard: React.FC<Props> = ({ courseInfo }) => {
  const {
    title,
    thumbnailUrl,
    instructorFirstName,
    instructorLastName,
    instructorProfileUrl,
    enrolledCount,
    status,
    rating,
    price,
    categoryName,
    duration,
    level,
  } = courseInfo;

  // Resolve media URLs (support relative)
  const imageUrl = getFullUrl(thumbnailUrl);
  const profileUrl = getFullUrl(instructorProfileUrl);

  const instructorName = `${instructorFirstName} ${instructorLastName}`.trim();
  const hasImage = Boolean(imageUrl);
  const isFree = typeof price === "number" && price === 0;

  return (
    <Card
      shadow={false}
      className="
        group overflow-hidden rounded-2xl
        bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition
        dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500
      "
    >
      {/* Cover */}
      <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
          )}

          {/* Overlay: light subtle; darker in dark for readability */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-black/5 to-transparent dark:from-black/45 dark:via-black/15" />

          {/* Top-left badges (category, price, status) */}
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
            {typeof price === "number" && (
              <span
                className={
                  isFree
                    ? "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white bg-green-600 dark:bg-green-500"
                    : "rounded-full px-2.5 py-1 text-[11px] font-semibold text-gray-900 bg-white/95 ring-1 ring-black/5 dark:bg-indigo-500 dark:text-white dark:ring-indigo-400/40"
                }
              >
                {isFree ? "FREE" : `$${price}`}
              </span>
            )}
            <StatusChip status={status} />
          </div>

          {/* Instructor pin (top-right) */}
          <InstructorPin name={instructorName} avatar={profileUrl} position="top-right" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardBody className="p-4">
        {/* Title */}
        <Typography variant="h6" className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
          {title}
        </Typography>

        {/* Meta + rating */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-gray-700 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-2">
            {typeof duration === "number" && <span>⏱ {duration}h</span>}
            {level && <span>•</span>}
            {level && <span>🎯 {level}</span>}
            <span>•</span>
            <span>👥 {enrolledCount ?? 0}</span>
          </div>
          <Stars rating={rating} />
        </div>
      </CardBody>
    </Card>
  );
};

export default TrendingCard;
