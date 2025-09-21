import React, { useEffect, useMemo, useState, useCallback } from "react";
import Carousel from "../../elements/carousel-page";
import TrendingCard from "../home/trending-card";
import RecommendedCard from "../home/recommended-card";
import TrendingCardShimmer from "components/shimmer/shimmer-trending-course";
import {
  ApiResponseRecommended,
  ApiResponseTrending,
} from "../../../api/types/apiResponses/api-response-home-page-listing";
import { selectIsLoggedIn, selectUserType } from "../../../redux/reducers/authSlice";
import { useSelector } from "react-redux";
import { Typography } from "@material-tailwind/react";
import { getTrendingCourses, getRecommendedCourses } from "../../../api/endpoints/course/course";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

/* --------------------------------- Utils --------------------------------- */
/** Robust array extractor that tolerates guest/logged-in response shapes */
function extractArray<T = any>(resp: any): T[] {
  const payload = resp?.data ?? resp;

  // Common flat & nested keys
  const candidates = [
    payload,
    payload?.data,
    payload?.items,
    payload?.result,
    payload?.records,
    payload?.data?.data,
    payload?.data?.items,
    payload?.data?.result,
    payload?.data?.records,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as T[];
  }

  // Fallback: scan object values for the first array
  if (payload && typeof payload === "object") {
    for (const v of Object.values(payload)) {
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

/** Section header with optional CTA (theme-aware) */
const SectionHeader: React.FC<{ title: string; ctaLabel?: string; ctaTo?: string }> = ({
  title,
  ctaLabel,
  ctaTo,
}) => (
  <div className="mb-4 flex items-center justify-between">
    <Typography
      variant="h1"
      className="text-2xl font-semibold lg:text-4xl text-gray-900 dark:text-gray-100"
    >
      {title}
    </Typography>
    {ctaLabel && ctaTo && (
      <Link
        to={ctaTo}
        className="rounded-full bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
      >
        {ctaLabel}
      </Link>
    )}
  </div>
);

/** Shimmer grid reused for both sections */
const LoadingGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
    {Array.from({ length: count }).map((_, i) => (
      <TrendingCardShimmer key={`shimmer-${i}`} />
    ))}
  </div>
);

/** Empty state (matches ListCourse theme) */
const EmptyState: React.FC<{ label: string; browseLabel: string }> = ({ label, browseLabel }) => (
  <div className="mx-2 rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
    <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
    <Link to="/courses" className="mt-3 inline-block font-semibold text-blue-700 hover:underline dark:text-blue-300">
      {browseLabel}
    </Link>
  </div>
);

/* ------------------------------- Main Page -------------------------------- */
const StudentHomePage: React.FC = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userType = useSelector(selectUserType);

  // i18n
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Data
  const [trendingCourses, setTrendingCourses] = useState<ApiResponseTrending[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<ApiResponseRecommended[]>([]);

  // Loading
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  // Errors
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  // Limits
  const [trendingLimit, setTrendingLimit] = useState(6);
  const [recommendedLimit, setRecommendedLimit] = useState(6);

  // Labels (with English fallbacks)
  const titleTrending = t("home.trendingCourses") || "Trending Courses";
  const titleRecommended = t("home.recommendedCourses") || "Recommended Courses";
  const labelViewMore = t("home.viewMore") || "View More";
  const labelViewAll = t("home.viewAll") || "View All";
  const labelBrowseAll = t("home.browseAll") || "Browse all courses";
  const errTrending = t("home.errors.trendingFail") || "Unable to load trending courses right now.";
  const errRecommended =
    t("home.errors.recommendedFail") || "Unable to load your recommendations right now.";
  const emptyTrending = t("home.empty.trending") || "No trending courses at the moment.";
  const emptyRecommended = t("home.empty.recommended") || "No recommendations for you yet.";

  /** Load trending for everyone (guest + logged-in) */
  const fetchTrending = useCallback(async () => {
    setIsLoadingTrending(true);
    setTrendingError(null);
    try {
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

  /** Load recommended only for logged-in students */
  const fetchRecommended = useCallback(async () => {
    if (!(isLoggedIn && userType === "student")) {
      setRecommendedCourses([]);
      setRecommendedError(null);
      return;
    }
    setIsLoadingRecommended(true);
    setRecommendedError(null);
    try {
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

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  const trendingVisible = useMemo(
    () => trendingCourses.slice(0, trendingLimit),
    [trendingCourses, trendingLimit]
  );
  const recommendedVisible = useMemo(
    () => recommendedCourses.slice(0, recommendedLimit),
    [recommendedCourses, recommendedLimit]
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors" dir={dir}>
      {/* Hero / Carousel (aligned with ListCourse palette) */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div key={lang}>
            <Carousel />
          </div>
        </div>
      </div>

      {/* Trending — visible for all users */}
      <section className="container mx-auto px-4 pt-8 lg:pt-12">
        <SectionHeader title={titleTrending} ctaLabel={labelViewAll} ctaTo="/courses" />

        {isLoadingTrending ? (
          <LoadingGrid />
        ) : trendingError ? (
          <EmptyState label={trendingError} browseLabel={labelBrowseAll} />
        ) : trendingCourses.length === 0 ? (
          <EmptyState label={emptyTrending} browseLabel={labelBrowseAll} />
        ) : (
          <>
            <div className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {trendingVisible.map((course) => (
                <Link key={course._id} to={`/courses/${course._id}`} className="block">
                  <TrendingCard courseInfo={course} />
                </Link>
              ))}
            </div>

            {trendingCourses.length > trendingLimit && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setTrendingLimit((n) => n + 6)}
                  className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {labelViewMore}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Recommended — only when logged-in as student */}
      {isLoggedIn && userType === "student" && (
        <section className="container mx-auto px-4 pb-14 pt-10">
          <SectionHeader title={titleRecommended} ctaLabel={labelViewAll} ctaTo="/courses?tab=recommended" />

          {isLoadingRecommended ? (
            <LoadingGrid />
          ) : recommendedError ? (
            <EmptyState label={recommendedError} browseLabel={labelBrowseAll} />
          ) : recommendedCourses.length === 0 ? (
            <EmptyState label={emptyRecommended} browseLabel={labelBrowseAll} />
          ) : (
            <>
              <div className="grid gap-6 px-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recommendedVisible.map((course) => (
                  <Link key={course._id} to={`/courses/${course._id}`} className="block">
                    <RecommendedCard courseInfo={course} />
                  </Link>
                ))}
              </div>

              {recommendedCourses.length > recommendedLimit && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setRecommendedLimit((n) => n + 6)}
                    className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
