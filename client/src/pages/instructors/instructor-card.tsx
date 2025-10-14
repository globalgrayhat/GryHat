import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
} from "@material-tailwind/react";
import { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";
import { AcademicCapIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { getFullUrl } from "../../utils/helpers";

/** Instructor card — clear in light mode, no overlay in front of transparent images */
type Props = Partial<InstructorApiResponse> & {
  profileUrl?: string;
  profilePic?: { url?: string; name?: string };
  coverUrl?: string; // optional cover; defaults to avatar
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-full bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-[10px] font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
    {children}
  </span>
);

const useSkillList = (skills?: string, max = 3) => {
  const list = (skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const visible = list.slice(0, max);
  const more = Math.max(list.length - visible.length, 0);
  return { visible, more };
};

const InstructorCard: React.FC<Props> = (props) => {
  const {
    firstName,
    lastName,
    subjects,
    qualification,
    skills,
    profilePic,
    profileUrl,
    coverUrl,
    about,
    isVerified,
    experience,
    dateJoined,
    certificates,
  } = props;

  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Instructor";
  const avatarUrl = getFullUrl(profilePic?.url || profileUrl || "");
  const cover = getFullUrl(coverUrl || profilePic?.url || profileUrl || "");

  const subjShort =
    Array.isArray(subjects) && subjects.length ? subjects.slice(0, 2) : [];
  const { visible: skillList, more: moreSkills } = useSkillList(skills, 3);

  // e.g. "Sep 2025"
  let joinedText: string | null = null;
  try {
    if (dateJoined) {
      const d = new Date(dateJoined);
      joinedText = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  } catch {
    joinedText = null;
  }
  const certCount = Array.isArray(certificates) ? certificates.length : 0;

  return (
    <Card
      shadow={false}
      className="
        w-full
        max-w-[18.5rem] sm:max-w-[19rem] md:max-w-[20rem]
        overflow-hidden rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600
        transition
      "
    >
      <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-0">
        {/* Cover — no front overlay to avoid dimming transparent PNGs */}
        <div className="px-3 pt-3">
          <div className="relative h-24 sm:h-24 md:h-28 w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
            {cover ? (
              <img
                src={cover}
                alt={`${fullName} cover`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              // Fallback gradient only when no cover
              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
            )}

            {/* Chips on top-left (no visual overlay layer) */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {qualification && <Chip>{qualification}</Chip>}
              {joinedText && <Chip>{joinedText}</Chip>}
              {certCount > 0 && <Chip>Certs: {certCount}</Chip>}
            </div>
          </div>
        </div>

        {/* Header row under the cover */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative shrink-0 -mt-6 z-20">
            <Avatar
              size="xl"
              variant="circular"
              alt={fullName}
              src={avatarUrl}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm object-cover"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 ring-2 ring-white dark:ring-gray-800">
                <CheckBadgeIcon className="h-4 w-4 text-white" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Typography
                as="h3"
                variant="h6"
                className="text-gray-900 dark:text-white font-semibold leading-6 tracking-[0.01em] truncate whitespace-nowrap"
                title={fullName}
              >
                {fullName}
              </Typography>
              <AcademicCapIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            </div>

            {subjShort.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {subjShort.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-4 pb-4 pt-3">
        {about && (
          <p className="text-[12px] leading-5 text-gray-800 dark:text-gray-300 line-clamp-2">
            {about}
          </p>
        )}

        {typeof props.experience === "string" && props.experience.trim() && (
          <div className="mt-1 text-[11px] text-gray-700 dark:text-gray-400">🧭 {props.experience}</div>
        )}

        {skillList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {skillList.map((sk) => (
              <span
                key={sk}
                className="rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {sk}
              </span>
            ))}
            {moreSkills > 0 && (
              <span className="rounded-full bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-[10px] font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                +{moreSkills} more
              </span>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default InstructorCard;
