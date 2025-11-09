/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/pages/students/student-home-page.tsx

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
} from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Typography } from "@material-tailwind/react";

import Carousel from "../../components/elements/carousel-page";
import TrendingCard from "../home/trending-card";
import RecommendedCard from "../home/recommended-card";
import TrendingCardShimmer from "@components/shimmer/shimmer-trending-course";

import {
  type ApiResponseRecommended,
  type ApiResponseTrending,
} from "../../api/types/apiResponses/api-response-home-page-listing";
import {
  getTrendingCourses,
  getRecommendedCourses,
} from "../../api/endpoints/course/course";

import {
  selectIsLoggedIn,
  selectUserType,
} from "../../redux/reducers/authSlice";

import { useLanguage } from "../../contexts/LanguageContext";

/* =============================================================================
 * Small Utilities
 * ============================================================================= */

/**
 * Extracts the first array-like payload from a flexible API response structure.
 * Works for:
 * - { data: [] }
 * - { data: { data: [] } }
 * - { items: [] }, { result: [] }, { records: [] }
 * - Or nested equivalents.
 */
function extractArray<T>(resp: unknown): T[] {
  const root = (resp as { data?: unknown })?.data ?? resp;

  const directCandidates = [
    root,
    (root as any)?.data,
    (root as any)?.items,
    (root as any)?.result,
    (root as any)?.records,
  ];

  for (const c of directCandidates) {
    if (Array.isArray(c)) return c as T[];
  }

  if (root && typeof root === "object") {
    for (const v of Object.values(root)) {
      if (Array.isArray(v)) return v as T[];
      if (v && typeof v === "object") {
        for (const vv of Object.values(v)) {
          if (Array.isArray(vv)) return vv as T[];
        }
      }
    }
  }
  return [];
}

/* =============================================================================
 * Reusable Presentational Components (memoized)
 * ============================================================================= */

interface SectionHeaderProps {
  title: string;
  ctaLabel?: string;
  ctaTo?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = memo(
  ({ title, ctaLabel, ctaTo }) => (
    <div className="flex items-center justify-between mb-4">
      <Typography
        variant="h1"
        className="text-2xl font-semibold text-gray-900 lg:text-4xl dark:text-gray-100"
      >
        {title}
      </Typography>

      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="px-4 py-2 text-sm font-semibold text-blue-700 transition rounded-full bg-blue-600/10 hover:bg-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

const LoadingGrid: React.FC<{ count?: number }> = memo(({ count = 6 }) => (
  <div
    className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    aria-busy="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <TrendingCardShimmer key={i} />
    ))}
  </div>
));
LoadingGrid.displayName = "LoadingGrid";

interface EmptyStateProps {
  label: string;
  browseLabel: string;
}

const EmptyState: React.FC<EmptyStateProps> = memo(
  ({ label, browseLabel }) => (
    <div className="p-8 mx-2 text-center bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-gray-900">
      <p className="font-medium text-gray-900 dark:text-gray-100">
        {label}
      </p>
      <Link
        to="/courses"
        className="inline-block mt-3 font-semibold text-blue-700 hover:underline dark:text-blue-300"
      >
        {browseLabel}
      </Link>
    </div>
  )
);
EmptyState.displayName = "EmptyState";

/* =============================================================================
 * Main: StudentHomePage
 * ============================================================================= */

const StudentHomePage: React.FC = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);

  const { t, lang } = useLanguage() as {
    t: (key: string) => string;
    lang?: "ar" | "en";
  };
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Data state
  const [trendingCourses, setTrendingCourses] = useState<ApiResponseTrending[]>(
    []
  );
  const [recommendedCourses, setRecommendedCourses] = useState<
    ApiResponseRecommended[]
  >([]);

  // Loading state
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);

  // Error state
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [recommendedError, setRecommendedError] = useState<string | null>(
    null
  );

  // Pagination / Load-more limits
  const [trendingLimit, setTrendingLimit] = useState(6);
  const [recommendedLimit, setRecommendedLimit] = useState(6);

  // Localized labels (computed once per language change)
  const {
    titleTrending,
    titleRecommended,
    labelViewMore,
    labelViewAll,
    labelBrowseAll,
    errTrending,
    errRecommended,
    emptyTrending,
    emptyRecommended,
  } = useMemo(
    () => ({
      titleTrending: t("home.trendingCourses") || "Trending Courses",
      titleRecommended:
        t("home.recommendedCourses") || "Recommended Courses",
      labelViewMore: t("home.viewMore") || "View More",
      labelViewAll: t("home.viewAll") || "View All",
      labelBrowseAll:
        t("home.browseAll") || "Browse all courses",
      errTrending:
        t("home.errors.trendingFail") ||
        "Unable to load trending courses right now.",
      errRecommended:
        t("home.errors.recommendedFail") ||
        "Unable to load your recommendations right now.",
      emptyTrending:
        t("home.empty.trending") ||
        "No trending courses at the moment.",
      emptyRecommended:
        t("home.empty.recommended") ||
        "No recommendations for you yet.",
    }),
    [t]
  );

  /**
   * Fetch trending courses (for all users).
   * Wrapped in useCallback to avoid useless effect re-runs.
   */
  const fetchTrending = useCallback(async () => {
    try {
      setIsLoadingTrending(true);
      setTrendingError(null);

      const resp = await getTrendingCourses();
      const arr = extractArray<ApiResponseTrending>(resp);

      setTrendingCourses(arr);
    } catch {
      setTrendingCourses([]);
      setTrendingError(errTrending);
    } finally {
      setIsLoadingTrending(false);
    }
  }, [errTrending]);

  /**
   * Fetch recommended courses (only for logged-in students).
   */
  const fetchRecommended = useCallback(async () => {
    // If not a logged-in student, clear recommended and stop.
    if (!(isLoggedIn && userType === "student")) {
      setRecommendedCourses([]);
      setRecommendedError(null);
      setIsLoadingRecommended(false);
      return;
    }

    try {
      setIsLoadingRecommended(true);
      setRecommendedError(null);

      const resp = await getRecommendedCourses();
      const arr = extractArray<ApiResponseRecommended>(resp);

      setRecommendedCourses(arr);
    } catch {
      setRecommendedCourses([]);
      setRecommendedError(errRecommended);
    } finally {
      setIsLoadingRecommended(false);
    }
  }, [errRecommended, isLoggedIn, userType]);

  /**
   * Initial + refresh fetches.
   * Separated by concern but both stable via useCallback.
   */
  useEffect(() => {
    void fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    void fetchRecommended();
  }, [fetchRecommended]);

  // Visible slices (memoized)
  const trendingVisible = useMemo(
    () => trendingCourses.slice(0, trendingLimit),
    [trendingCourses, trendingLimit]
  );

  const recommendedVisible = useMemo(
    () => recommendedCourses.slice(0, recommendedLimit),
    [recommendedCourses, recommendedLimit]
  );

  // Handlers
  const handleLoadMoreTrending = useCallback(() => {
    setTrendingLimit((prev) => prev + 6);
  }, []);

  const handleLoadMoreRecommended = useCallback(() => {
    setRecommendedLimit((prev) => prev + 6);
  }, []);

  return (
    <div
      dir={dir}
      className="min-h-screen text-gray-900 transition-colors bg-white dark:bg-gray-900 dark:text-gray-100"
    >
      {/* Hero / Carousel */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
        <div className="container px-4 mx-auto">
          {/* key={lang} ensures proper RTL/LTR re-render when language changes */}
          <div key={lang}>
            <Carousel />
          </div>
        </div>
      </div>

      {/* ===================== Trending Courses ===================== */}
      <section className="container px-4 pt-8 mx-auto lg:pt-12">
        <SectionHeader
          title={titleTrending}
          ctaLabel={labelViewAll}
          ctaTo="/courses"
        />

        {isLoadingTrending ? (
          <LoadingGrid />
        ) : trendingError ? (
          <EmptyState
            label={trendingError}
            browseLabel={labelBrowseAll}
          />
        ) : trendingCourses.length === 0 ? (
          <EmptyState
            label={emptyTrending}
            browseLabel={labelBrowseAll}
          />
        ) : (
          <>
            <div className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {trendingVisible.map((course) => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="block"
                >
                  <TrendingCard courseInfo={course} />
                </Link>
              ))}
            </div>

            {trendingCourses.length > trendingLimit && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMoreTrending}
                  className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {labelViewMore}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===================== Recommended Courses ===================== */}
      {isLoggedIn && userType === "student" && (
        <section className="container px-4 pt-10 mx-auto pb-14">
          <SectionHeader
            title={titleRecommended}
            ctaLabel={labelViewAll}
            ctaTo="/courses?tab=recommended"
          />

          {isLoadingRecommended ? (
            <LoadingGrid />
          ) : recommendedError ? (
            <EmptyState
              label={recommendedError}
              browseLabel={labelBrowseAll}
            />
          ) : recommendedCourses.length === 0 ? (
            <EmptyState
              label={emptyRecommended}
              browseLabel={labelBrowseAll}
            />
          ) : (
            <>
              <div className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recommendedVisible.map((course) => (
                  <Link
                    key={course._id}
                    to={`/courses/${course._id}`}
                    className="block"
                  >
                    <RecommendedCard courseInfo={course} />
                  </Link>
                ))}
              </div>

              {recommendedCourses.length > recommendedLimit && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMoreRecommended}
                    className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {labelViewMore}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default StudentHomePage;
