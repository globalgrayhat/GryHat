/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useApiCall from "../../hooks/useApiCall";
import { getAllCourses } from "../../api/endpoints/course/course";
import type { CourseInterface } from "../../types/course";
import { Button, Input, Chip, Typography } from "@material-tailwind/react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import AdminTable, {
  type AdminTableColumn,
} from "../../components/admin/AdminTable";

const AdminCoursesPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: coursesResponse, isLoading } = useApiCall(getAllCourses);
  const [search, setSearch] = useState("");

  const courses: CourseInterface[] = Array.isArray(coursesResponse?.data)
    ? coursesResponse.data
    : [];

  const filtered = useMemo(
    () =>
      courses.filter((c) =>
        `${c.title || ""} ${c.category || ""}`
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      ),
    [courses, search]
  );

  const columns: AdminTableColumn[] = [
    { key: "title", label: t("course.title") || "Title" },
    { key: "category", label: t("course.category") || "Category" },
    { key: "duration", label: t("course.duration") || "Duration", align: "center" },
    { key: "price", label: t("course.price") || "Price", align: "center" },
    { key: "actions", label: "", align: "right", width: "120px" },
  ];

  return (
    <AdminPageLayout
      title={t("admin.courses") || "Courses"}
      description={
        t("admin.coursesDescription") ||
        "Review and manage all courses on the platform."
      }
      actions={
        <>
          <div className="hidden sm:block w-52">
            <Input
              label={t("admin.search") || "Search"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!text-xs"
              crossOrigin={undefined}
            />
          </div>
          <Button
            size="sm"
            color="indigo"
            className="px-3 py-2 text-[10px] sm:text-xs normal-case rounded-xl"
          >
            {t("admin.addCourse") || "Add Course"}
          </Button>
        </>
      }
    >
      {/* Search for mobile */}
      <div className="mb-2 sm:hidden">
        <Input
          label={t("admin.search") || "Search"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!text-xs"
          crossOrigin={undefined}
        />
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage={t("admin.noCourses") || "No courses found."}
        renderRow={(course, index) => {
          return (
            <tr
              key={course._id || index}
              className="transition-colors hover:bg-blue-gray-50/40"
            >
              <td className="px-3 py-3 sm:px-4">
                <Typography className="text-[11px] sm:text-xs font-semibold text-blue-gray-900">
                  {course.title}
                </Typography>
                {course?.description && (
                  <Typography className="text-[9px] text-gray-500 line-clamp-1">
                    {course.description}
                  </Typography>
                )}
              </td>

              <td className="px-3 py-3 sm:px-4">
                <Typography className="text-[10px] text-gray-700">
                  {course.category || "-"}
                </Typography>
              </td>

              <td className="px-3 py-3 text-center sm:px-4">
                <Typography className="text-[10px] text-gray-700">
                  {course.duration || "-"}
                </Typography>
              </td>

              <td className="px-3 py-3 text-center sm:px-4">
                <Chip
                  size="sm"
                  variant="ghost"
                  color={course.isPaid ? "indigo" : "green"}
                  value={
                    course.isPaid
                      ? `${course.price || 0} ${t("course.currency") || ""}`
                      : t("course.free") || "Free"
                  }
                  className="px-2 py-0.5 text-[9px]"
                />
              </td>

              <td className="px-3 py-3 sm:px-4">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    color="indigo"
                    className="px-2 py-1 text-[9px] sm:text-[10px] normal-case rounded-lg"
                  >
                    {t("common.edit") || "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="red"
                    className="px-2 py-1 text-[9px] sm:text-[10px] normal-case rounded-lg"
                  >
                    {t("common.delete") || "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Optional error state example */}
      {isLoading && (
        <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
          <ExclamationCircleIcon className="w-4 h-4" />
          <span>{t("admin.loadingCourses") || "Fetching latest courses..."}</span>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminCoursesPage;
