import React from "react";
import { Typography } from "@material-tailwind/react";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AdminPageLayout
 * - غلاف موحّد لصفحات الأدمن (الهيدر + الأكشنز + المحتوى).
 * - يُستخدم في: الكورسات، المقالات، الإعدادات... إلخ.
 */
const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  description,
  actions,
  children,
}) => {
  return (
    <div className="w-full px-2 py-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-sm font-semibold sm:text-lg"
          >
            {title}
          </Typography>
          {description && (
            <Typography className="mt-0.5 text-[9px] text-gray-500 sm:text-xs">
              {description}
            </Typography>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default AdminPageLayout;
