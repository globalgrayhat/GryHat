import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiSearchLine } from "react-icons/ri";
import { MdSentimentDissatisfied } from "react-icons/md";
import { debounce } from "lodash";
import { toast } from "react-toastify";

import CourseCard from "./course-card";
import ShimmerCard from "../../shimmer/shimmer-card";
import FilterCoursesSelectBox from "./filter-course-selectbox";

import {
  getAllCourses,
  searchCourse,
} from "../../../api/endpoints/course/course";

import { CourseInterface } from "../../../types/course";
import { useLanguage } from "../../../contexts/LanguageContext";

/**
 * Course listing with theme-aware styles (light/dark), translated labels,
 * non-faded readable text, and debounced search + category filtering.
 */
const ListCourse: React.FC = () => {
  const { t } = useLanguage();

  // Data / state
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");

  // Translated labels with sensible English fallbacks
  const title = t("courses.title") || "A broad selection of courses";
  const subtitle =
    t("courses.subtitle") ||
    `Choose from over ${courses?.length} online video courses with new additions published every month`;
  const searchPlaceholder =
    t("courses.searchPlaceholder") || "Search courses...";
  const emptyText =
    t("courses.empty") || "No results found for the search query.";

  /** Load all courses */
  const fetchCourse = async () => {
    try {
      const res = await getAllCourses();
      setCourses(res?.data?.data || []);
      // Small shimmer delay to smooth layout
      setTimeout(() => setIsLoading(false), 500);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to load courses", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Debounced search / filter handler */
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

  /** Handlers */
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  const handleSelect = (val: string) => setFilterQuery(val);

  /* ---------- Loading (shimmer) ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="pt-5 pb-5 px-9 mt-5 mx-auto flex justify-center">
          <div className="w-10/12 ml-2 pl-1 animate-pulse">
            <h1 className="h-8 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
            <p className="mt-2 h-4 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
          </div>
        </div>

        <div className="mx-auto px-10 flex justify-center">
          <div className="w-10/12 pl-1 border-b-2 border-b-gray-100 dark:border-b-gray-800 mx-auto animate-pulse">
            <div className="flex flex-wrap gap-2 py-2">
              <div className="h-8 w-16 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
              <div className="h-8 w-24 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
              <div className="h-8 w-20 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
              <div className="h-8 w-24 rounded bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
            </div>
          </div>
        </div>

        <div className="mx-auto flex justify-center">
          <div className="w-10/12">
            <div className="mt-3 flex flex-wrap justify-center">
              {[...Array(8)].map((_, index) => (
                <div className="m-2 py-3" key={index}>
                  <ShimmerCard />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Ready ---------- */
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header
      <div className="pt-5 pb-5 px-9 mt-5 mx-auto flex justify-center">
        <div className="w-10/12 ml-2 pl-1">
          <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-base md:text-lg text-gray-700 dark:text-gray-300">
            {subtitle}
          </p>
        </div>
      </div> */}

      {/* Filters row */}
      <div className="flex justify-center bg-gray-50 dark:bg-gray-800">
        <div className="w-full md:w-8/12 lg:w-6/12 p-5 flex flex-col md:flex-row gap-x-5">
          <FilterCoursesSelectBox handleSelect={handleSelect} />

          {/* Search input */}
          <div className="relative w-full md:w-1/2 mt-2 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder={searchPlaceholder}
              className="
                h-10 w-full rounded-md border px-3 pr-9 text-sm
                bg-white text-gray-900 placeholder:text-gray-500
                border-gray-300 focus:outline-none focus:border-blue-500
                dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700 dark:focus:border-blue-500
              "
              aria-label={searchPlaceholder}
            />
            <RiSearchLine
              size={20}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto flex justify-center">
        <div className="w-10/12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-4 gap-5 mt-3 justify-center">
            {courses.length ? (
              courses.map((course: CourseInterface) => (
                <Link to={`/courses/${course._id}`} key={course._id} className="mt-5">
                  <div className="m-2">
                    <CourseCard {...course} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="mt-8 pt-8 pb-14 text-center">
                <MdSentimentDissatisfied
                  className="mx-auto mb-4 text-gray-500 dark:text-gray-400"
                  size={58}
                  aria-hidden="true"
                />
                <p className="text-lg text-gray-700 dark:text-gray-300">{emptyText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCourse;
