import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiSearchLine } from "react-icons/ri";
import { MdSentimentDissatisfied } from "react-icons/md";
import { debounce } from "lodash";
import { toast } from "react-toastify";

import CourseCard from "./course-card";
import ShimmerCard from "../../shimmer/shimmer-card";
import FilterCoursesSelectBox from "./filter-course-selectbox";

import { getAllCourses, searchCourse } from "../../../api/endpoints/course/course";
import { CourseInterface } from "../../../types/course";
import { useLanguage } from "../../../contexts/LanguageContext";

/**
 * Compact course listing:
 * - Tight grid gaps (reduced vertical + horizontal spacing)
 * - No extra margins around cards
 * - Responsive grid: 1 / 2 / 3 / 4 columns
 */
const ListCourse: React.FC = () => {
  const { t } = useLanguage();

  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");

  const searchPlaceholder = t("courses.searchPlaceholder") || "Search courses...";
  const emptyText = t("courses.empty") || "No results found for the search query.";

  const fetchCourse = async () => {
    try {
      const res = await getAllCourses();
      setCourses(res?.data?.data || []);
      setTimeout(() => setIsLoading(false), 400);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to load courses", { position: toast.POSITION.BOTTOM_RIGHT });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = debounce(async () => {
      const hasSearch = searchQuery.trim() !== "";
      const hasFilter = filterQuery.trim() !== "";

      try {
        if (hasSearch || hasFilter) {
          const response = await searchCourse(hasSearch ? searchQuery : "", hasFilter ? filterQuery : "");
          setCourses(response?.data?.data || response?.data || []);
        } else {
          fetchCourse();
        }
      } catch {
        toast.error(t("courses.searchFail") || "Failed to search course", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      }
    }, 300);

    run();
    return () => run.cancel();
  }, [searchQuery, filterQuery, t]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const handleSelect = (val: string) => setFilterQuery(val);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
          {/* Filters skeleton */}
          <div className="mt-4 rounded-xl border border-gray-100 p-3 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 animate-pulse rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600"
                />
              ))}
            </div>
          </div>
          {/* Cards skeleton (compact gaps) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4">
            {[...Array(8)].map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Filters row */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/70 backdrop-blur dark:border-gray-800 dark:bg-gray-800/70">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-3">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <FilterCoursesSelectBox handleSelect={handleSelect} />
            <div className="relative w-full sm:max-w-xs sm:ml-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border px-3 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700 dark:focus:border-blue-500"
                aria-label={searchPlaceholder}
              />
              <RiSearchLine
                size={18}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid (compact spacing) */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4">
          {courses.length ? (
            courses.map((course: CourseInterface) => (
              <Link
                to={`/courses/${course._id}`}
                key={course._id}
                className="block"
              >
                {/* No extra margins around the card to keep spacing tight */}
                <CourseCard {...course} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <MdSentimentDissatisfied
                className="mx-auto mb-3 text-gray-500 dark:text-gray-400"
                size={48}
                aria-hidden="true"
              />
              <p className="text-base text-gray-700 dark:text-gray-300">{emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListCourse;
