import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface Props {
  /** Plain text about the lesson; can be empty */
  about?: string;
}

/**
 * AboutLesson
 * - Responsive, clean card for lesson overview text
 * - Uses subtle icon and brand-aligned colors
 * - Handles empty/whitespace-only content gracefully
 */
const AboutLesson: React.FC<Props> = ({ about }) => {
  const hasText = typeof about === "string" && about.trim().length > 0;

  return (
    <Card
      shadow={false}
      className="w-full bg-white border border-gray-200 rounded-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      <CardBody className="p-4 sm:p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center text-blue-600 h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400"
          >
            <DocumentTextIcon className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <Typography
              variant="h6"
              className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base"
            >
              About this lesson
            </Typography>

            {hasText ? (
              <Typography
                as="div"
                className="text-xs leading-6 text-gray-700 break-words whitespace-pre-wrap sm:text-sm md:text-base dark:text-gray-200"
              >
                {about}
              </Typography>
            ) : (
              <Typography
                className="text-xs text-gray-500 sm:text-sm dark:text-gray-400"
              >
                No description has been provided for this lesson yet.
              </Typography>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AboutLesson;
