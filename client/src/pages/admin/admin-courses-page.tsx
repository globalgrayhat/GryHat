import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useApiCall from "../../hooks/useApiCall";
import { getAllCourses } from "../../api/endpoints/course/course";
import type { CourseInterface } from "../../types/course";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
} from "@material-tailwind/react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

/**
 * AdminCoursesPage
 * Responsive courses table aligned with admin layout.
 */
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

  return (
    <div className="px-2 py-4 sm:px-4 lg:px-6">
      <Typography
        variant="h5"
        className="mb-3 font-semibold text-blue-gray-900"
      >
        {t("admin.courses") || "Courses"}
      </Typography>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <ExclamationCircleIcon className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <Card className="w-full bg-white border shadow-sm rounded-2xl border-blue-gray-50">
          <CardHeader
            floated={false}
            shadow={false}
            className="px-3 py-3 border-b rounded-none sm:px-4 lg:px-6 border-blue-gray-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <Typography variant="h6" className="text-blue-gray-900">
                  {t("admin.courses") || "Courses"}
                </Typography>
                <Typography
                  color="gray"
                  className="text-xs font-normal sm:text-sm"
                >
                  {t("admin.coursesDescription") ||
                    "Review and manage all courses on the platform."}
                </Typography>
              </div>
              <div className="w-full sm:w-72">
                <Input
                  label={t("admin.search") || "Search"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!text-sm"
                  crossOrigin={undefined}
                />
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("course.title") || "Title"}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("course.category") || "Category"}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("course.duration") || "Duration"}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("course.price") || "Price"}
                  </th>
                  <th className="px-4 py-3 sm:px-6" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.length > 0 ? (
                  filtered.map((course) => (
                    <tr
                      key={course._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-gray-900 sm:px-6 whitespace-nowrap sm:text-sm">
                        {course.title}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-[11px] sm:text-sm text-gray-600">
                        {course.category}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-[11px] sm:text-sm text-gray-600">
                        {course.duration}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-[11px] sm:text-sm text-gray-600">
                        {course.isPaid
                          ? course.price
                          : t("course.free") || "Free"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            className="px-2 py-1 text-[10px] sm:text-xs normal-case"
                          >
                            {t("common.edit") || "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="red"
                            className="px-2 py-1 text-[10px] sm:text-xs normal-case"
                          >
                            {t("common.delete") || "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-xs text-center text-gray-500 sm:px-6 sm:text-sm"
                    >
                      {t("admin.noCourses") || "No courses found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AdminCoursesPage;
