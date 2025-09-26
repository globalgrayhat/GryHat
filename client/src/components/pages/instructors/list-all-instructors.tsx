import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "@material-tailwind/react";
import { RiSearchLine } from "react-icons/ri";
import { toast } from "react-toastify";

import InstructorCard from "./instructor-card";
import ShimmerListAllInstructors from "../../shimmer/shimmer-list-all-instructors";
import FilterInstructorSelectBox from "./filter-instructor-select-box";

import { getAllInstructors } from "../../../api/endpoints/instructor-management";
import { InstructorApiResponse } from "../../../api/types/apiResponses/api-response-instructors";
import { useLanguage } from "../../../contexts/LanguageContext";

/** Simple, reusable debounce hook */
function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const ListAllInstructors: React.FC = () => {
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [instructors, setInstructors] = useState<InstructorApiResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>(""); // subject/category
  const debouncedQuery = useDebounced(searchQuery, 250);

  // Fetch all instructors
  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const resp = await getAllInstructors();
      const data: InstructorApiResponse[] = resp?.data?.data ?? [];
      setInstructors(data);
    } catch {
      toast.error(t("common.error") || "Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Case-insensitive helpers
  const q = debouncedQuery.trim().toLowerCase();
  const filterLower = filterValue.trim().toLowerCase();

  /** Filtered list */
  const filtered = useMemo(() => {
    if (!instructors) return [];
    return instructors.filter((ins) => {
      const first = (ins.firstName ?? "").toLowerCase();
      const last = (ins.lastName ?? "").toLowerCase();
      const matchesSearch = q.length === 0 || first.includes(q) || last.includes(q);

      const subjects = Array.isArray(ins.subjects) ? ins.subjects : [];
      const matchesFilter =
        filterLower.length === 0 ||
        subjects.some((s) => (s ?? "").toLowerCase() === filterLower);

      return matchesSearch && matchesFilter;
    });
  }, [instructors, q, filterLower]);

  if (isLoading || instructors === null) {
    return <ShimmerListAllInstructors />;
  }

  return (
    <div
      dir={dir}
      className="
        min-h-screen pb-7
        bg-[var(--bg-app)] text-[var(--text-primary)]
        dark:bg-gray-900 dark:text-gray-100
      "
    >
      {/* Header */}
      <div
        className="
          w-full p-8 md:p-12 flex flex-col items-center justify-center text-center
          bg-[var(--surface-1)] border-b border-[var(--ring)]
          dark:bg-gray-800 dark:border-gray-700
        "
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          {t("tutors.title") || "Our Instructors"}
        </h1>
        <p className="mt-2 md:mt-3 text-base md:text-lg font-medium text-[var(--text-secondary)] dark:text-gray-300">
          {t("tutors.subtitle") || "Meet Gray Hat Subject Experts"}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface-1)] dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category/Subject filter */}
          <div className="w-full sm:w-[48%]">
            <FilterInstructorSelectBox handleSelect={setFilterValue} />
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-[48%]">
            <label htmlFor="instructor-search" className="sr-only">
              {t("tutors.searchLabel") || "Search instructors"}
            </label>
            <input
              id="instructor-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                h-10 w-full rounded-md
                border border-[var(--ring)] bg-[var(--surface-2)]
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
              "
              placeholder={t("tutors.searchPlaceholder") || "Search instructors..."}
            />
            <RiSearchLine
              size={18}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              style={dir === "rtl" ? { left: "0.75rem" } : { right: "0.75rem" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8 text-[var(--primary)] dark:text-gray-200" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((instructor) => (
              <Link key={instructor._id} to={`/tutors/${instructor._id}`} className="block">
                <InstructorCard {...instructor} />
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-xl border border-[var(--ring)] bg-[var(--surface-1)] p-8 text-center
              dark:border-gray-700 dark:bg-gray-800
            "
          >
            <p className="font-medium text-[var(--text-primary)] dark:text-gray-200">
              {t("tutors.noResults") || "No results found."}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-400">
              {t("tutors.tryAdjusting") || "Try adjusting your search or filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListAllInstructors;
