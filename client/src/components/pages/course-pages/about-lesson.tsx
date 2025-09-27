import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

interface Props {
  /** Plain text about the lesson; can be empty */
  about?: string;
}

/**
 * AboutLesson
 * - Brand-aligned container (rounded-2xl, subtle border, dark mode)
 * - Mobile-friendly typography
 * - Handles empty/whitespace-only content gracefully
 */
const AboutLesson: React.FC<Props> = ({ about }) => {
  const hasText = typeof about === "string" && about.trim().length > 0;

  return (
    <Card
      shadow={false}
      className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <CardBody className="p-4 sm:p-6">
        {hasText ? (
          <Typography
            as="div"
            className="whitespace-pre-wrap break-words text-sm sm:text-base leading-6 text-gray-800 dark:text-gray-200"
          >
            {about}
          </Typography>
        ) : (
          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            No description provided for this lesson.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AboutLesson;
