import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Chip,
  Typography,
  Card,
  CardBody,
  Dialog,
  DialogBody,
} from "@material-tailwind/react";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { BiVideo } from "react-icons/bi";
import { IoBookSharp } from "react-icons/io5";
import { toast } from "react-toastify";

import CustomBreadCrumbs from "../../common/bread-crumbs";
import ViewCourseShimmer from "components/shimmer/view-course-shimmer";
import PaymentConfirmationModal from "./payment-confirmation-modal";
import LoginConfirmation from "../../common/login-confirmation-modal";

import { getIndividualCourse } from "../../../api/endpoints/course/course";
import { getLessonsByCourse } from "../../../api/endpoints/course/lesson";

import { CourseInterface } from "../../../types/course";
import { formatToINR, formatToUSD, getFullUrl } from "../../../utils/helpers";

import useApiData from "../../../hooks/useApiCall";
import { setCourse } from "../../../redux/reducers/courseSlice";
import { selectStudentId } from "../../../redux/reducers/studentSlice";
import { selectIsLoggedIn } from "../../../redux/reducers/authSlice";

/* =========================
   Helper utilities (pure, tiny)
   ========================= */

// Clamp numeric range
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Basic file type checks
const isPdfExt = (url?: string) => !!url && /\.pdf(\?|$)/i.test(url);
const isArchiveExt = (url?: string) => !!url && /\.(zip|rar|7z|tar|gz|bz2)$/i.test(url);

// Extract filename from URL for downloads
const filenameFromUrl = (url?: string) => {
  if (!url) return "file";
  try {
    const u = new URL(url, window.location.href);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || "file";
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || "file";
  }
};

// Bytes formatting for modal UX
const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Simple rating stars (12px)
const Stars: React.FC<{ rating?: number }> = ({ rating }) => {
  const r = Math.round(clamp(rating ?? 0, 0, 5));
  return (
    <div className="flex items-center gap-0.5 text-[11px] sm:text-[12px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < r ? "text-amber-500" : "text-gray-300 dark:text-gray-500"}>★</span>
      ))}
      <span className="ml-1 text-gray-700 dark:text-gray-200">{(rating ?? 0).toFixed(1)}</span>
    </div>
  );
};

// Instructor chip (name + avatar)
const InstructorPin: React.FC<{ name?: string; avatar?: string }> = ({ name, avatar }) => {
  if (!name && !avatar) return null;
  return (
    <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1">
      {name && (
        <span
          className="hidden sm:inline-block max-w-[200px] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-900 ring-1 ring-black/5 shadow-sm dark:bg-gray-900/95 dark:text-gray-100 dark:ring-white/15"
          title={name}
        >
          {name}
        </span>
      )}
      {avatar && (
        <div className="relative">
          <img
            src={avatar}
            alt={name || "Instructor"}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-900"
            loading="lazy"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 ring-2 ring-white flex items-center justify-center dark:bg-blue-500 dark:ring-gray-900">
            <AcademicCapIcon className="h-2.5 w-2.5 text-white" />
          </span>
        </div>
      )}
    </div>
  );
};

/* =========================
   Types (tolerant to API variability)
   ========================= */

// Backend sometimes returns objects for instructor/category/thumbnail.
// We keep CourseInterface for app contracts but tolerate raw object shapes via "any".
type CourseViewData = CourseInterface & {
  instructorId?: any;
  category?: any;
  thumbnail?: { url?: string };
  videoUrl?: any;
};

const ViewCourseStudent: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const studentId = useSelector(selectStudentId);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // UI state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [openPaymentConfirmation, setOpenPaymentConfirmation] = useState(false);
  const [loginConfirmation, setLoginConfirmation] = useState(false);
  const [successToastShown, setSuccessToastShown] = useState(false);

  // PDF lightbox state
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const zoomLevels = ["page-width", "100", "125", "150"] as const;
  const [zoomIndex, setZoomIndex] = useState(0);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null); // server URL
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);        // blob URL
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Non-PDF download confirm
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadTargetUrl, setDownloadTargetUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);

  // API calls
  const fetchCourse = async (id: string): Promise<CourseInterface> => {
    try {
      const course = await getIndividualCourse(id);
      return course?.data?.data as CourseInterface;
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to load course", { position: toast.POSITION.BOTTOM_RIGHT });
      throw error;
    }
  };

  const fetchLessons = async (id: string) => {
    try {
      const lessons = await getLessonsByCourse(id);
      return lessons?.data;
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to load lessons", { position: toast.POSITION.BOTTOM_RIGHT });
      throw error;
    }
  };

  const { data: courseRaw, isLoading, refreshData } = useApiData(fetchCourse, courseId);
  const { data: lessonsRaw, isLoading: isLessonsLoading } = useApiData(fetchLessons, courseId);

  const course = courseRaw as CourseViewData | null;
  if (course) dispatch(setCourse({ course }));

  // Normalize fields that may be objects/strings
  const categoryRaw = (course as any)?.category;
  const categoryName = typeof categoryRaw === "string" ? categoryRaw : categoryRaw?.name;

  const instructor = (course as any)?.instructorId;
  const instructorName = instructor ? `${instructor?.firstName ?? ""} ${instructor?.lastName ?? ""}`.trim() : undefined;
  const instructorAvatar = instructor?.profilePic?.url ? getFullUrl(instructor.profilePic.url) : undefined;

  const coverUrl = getFullUrl(course?.thumbnailUrl || (course as any)?.thumbnail?.url || "");

  // Intro video (YouTube/Vimeo/direct)
  const IntroVideo = course?.videoUrl ? getFullUrl(course.videoUrl) : undefined;
  const isSupportedVideo = (url: string): boolean =>
    !!url &&
    (url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      /\.(mp4|webm|ogg)$/i.test(url));

  // Guidelines URL: accept both `guidelinesUrl` and nested `guidelines.url`
  const guidelinesUrl = getFullUrl((course as any)?.guidelinesUrl || (course as any)?.guidelines?.url || "");

  const paidFlag =
    typeof course?.isPaid === "boolean"
      ? course.isPaid
      : typeof course?.price === "number"
      ? (course?.price ?? 0) > 0
      : false;
  const isFree = !paidFlag || (typeof course?.price === "number" && (course?.price ?? 0) === 0);

  const enrolled = useMemo(() => {
    if (!course || !Array.isArray(course.coursesEnrolled)) return false;
    return course.coursesEnrolled.includes(studentId ?? "");
  }, [course, studentId]);

  const lessons: any[] = useMemo(() => {
    const arr = Array.isArray(lessonsRaw) ? lessonsRaw : lessonsRaw?.data;
    return Array.isArray(arr) ? arr : [];
  }, [lessonsRaw]);

  const safeRating = clamp(typeof course?.rating === "number" ? course.rating : 0, 0, 5);

  // Toggle syllabus module
  const handleToggle = (index: number) => setExpandedIndex(index === expandedIndex ? null : index);

  // Enroll CTA
  const handleEnroll = () => {
    if (!isLoggedIn) setLoginConfirmation(true);
    else setOpenPaymentConfirmation(true);
  };

  // Open guidelines: PDF -> viewer; else -> download confirm
  const openGuidelines = () => {
    if (!guidelinesUrl) return;
    if (isPdfExt(guidelinesUrl)) {
      setViewerUrl(guidelinesUrl);
      setPdfPage(1);
      setZoomIndex(0);
      setPdfOpen(true);
    } else {
      setDownloadTargetUrl(guidelinesUrl);
      setDownloadOpen(true);
    }
  };

  // Success toast when redirected with #success
  useEffect(() => {
    if (location.hash === "#success" && !successToastShown) {
      toast.success("Successfully enrolled into the course", { position: toast.POSITION.BOTTOM_RIGHT });
      setSuccessToastShown(true);
    }
  }, [location.hash, successToastShown]);

  // Load PDF as blob to bypass frame-ancestors/XFO
  useEffect(() => {
    let revokeUrl: string | null = null;
    const loadPdf = async () => {
      if (!pdfOpen || !viewerUrl || !isPdfExt(viewerUrl)) return;
      setPdfLoading(true);
      setPdfError(null);
      try {
        // 1) Try simple GET (no headers/credentials) to avoid CORS preflight
        let res = await fetch(viewerUrl, { credentials: "omit" });
        if (!res.ok) {
          // 2) Retry with credentials/Authorization if needed
          const token = localStorage.getItem("token");
          res = await fetch(viewerUrl, {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (blob.type && !blob.type.toLowerCase().includes("pdf")) {
          throw new Error(`Unexpected content-type: ${blob.type}`);
        }
        const url = URL.createObjectURL(blob);
        revokeUrl = url;
        setPdfSrc(url);
      } catch (e: any) {
        setPdfError(`Failed to load PDF inline${e?.message ? `: ${e.message}` : ""}`);
        setPdfSrc(null);
      } finally {
        setPdfLoading(false);
      }
    };
    loadPdf();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
      setPdfSrc(null);
    };
  }, [pdfOpen, viewerUrl]);

  // Peek non-PDF size for better UX
  useEffect(() => {
    let active = true;
    const peek = async () => {
      if (!downloadOpen || !downloadTargetUrl || isPdfExt(downloadTargetUrl)) return;
      try {
        const head = await fetch(downloadTargetUrl, { method: "HEAD", credentials: "include" });
        const len = head.headers.get("content-length");
        if (active && len) setDownloadSize(parseInt(len, 10));
      } catch {
        if (active) setDownloadSize(null);
      }
    };
    peek();
    return () => {
      active = false;
    };
  }, [downloadOpen, downloadTargetUrl]);
  const getEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // ✅ YouTube
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      let videoId: string | null = null;

      if (parsed.hostname.includes("youtu.be")) {
        // https://youtu.be/VIDEO_ID
        videoId = parsed.pathname.slice(1);
      } else if (parsed.searchParams.has("v")) {
        // https://www.youtube.com/watch?v=VIDEO_ID
        videoId = parsed.searchParams.get("v");
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // ✅ Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      // https://vimeo.com/VIDEO_ID
      const videoId = parsed.pathname.split("/")[1];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // ❌ غير مدعوم
    return null;
  } catch {
    return null;
  }
};
  if (isLoading || isLessonsLoading) return <ViewCourseShimmer />;

  return (
    <div className="w-full bg-white dark:bg-gray-900">
      <LoginConfirmation confirm={loginConfirmation} setConfirm={setLoginConfirmation} />
      <PaymentConfirmationModal
        open={openPaymentConfirmation}
        setUpdated={refreshData}
        courseDetails={{ price: course?.price ?? 0, overview: course?.description ?? "", isPaid: course?.isPaid ?? false }}
        setOpen={setOpenPaymentConfirmation}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col px-3 sm:px-6 pt-3 md:pt-5 md:px-12 lg:px-20">
        <CustomBreadCrumbs paths={location.pathname} />
      </div>

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-6xl p-2 sm:p-4 md:p-6">
        <Card shadow={false} className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
          {/* Cover */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/10] rounded-2xl overflow-hidden  shadow-md transition-all duration-300">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt={course?.title || "Course cover"} 
                className="h-full cursor-pointer w-full object-contain transition-transform duration-300 hover:scale-105" 
                loading="lazy" 
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium">Course Cover</p>
                </div>
              </div>
            )}

            {/* Enhanced overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/15 to-transparent dark:from-black/60 dark:via-black/25" />

            {/* Badges (top-left) */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {categoryName && (
                <span className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white/95 text-gray-900 ring-1 ring-black/5 shadow-lg backdrop-blur-sm dark:bg-blue-500 dark:text-white dark:ring-blue-400/40">
                  {categoryName}
                </span>
              )}
              {(typeof course?.price === "number" || typeof course?.isPaid === "boolean") && (
                <span
                  className={
                    isFree
                      ? "rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-green-600 shadow-lg dark:bg-green-500"
                      : "rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-900 bg-white/95 ring-1 ring-black/5 shadow-lg backdrop-blur-sm dark:bg-indigo-500 dark:text-white dark:ring-indigo-400/40"
                  }
                >
                  {isFree ? "FREE" : formatToUSD?.(course?.price as number) ?? `$${course?.price}`}
                </span>
              )}
            </div>

            {/* Instructor (top-right) */}
            <InstructorPin name={instructorName} avatar={instructorAvatar} />

            {/* Enhanced Title + meta (bottom) */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6">
              <div className="rounded-2xl bg-white/95 p-4 sm:p-6 ring-1 ring-black/5 backdrop-blur-md shadow-xl dark:bg-gray-900/90 dark:ring-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Typography variant="h4" className="!m-0 font-bold text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                    {course?.title}
                  </Typography>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      {typeof course?.duration === "number" && (
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          <span>⏱</span>
                          <span className="font-medium">{course?.duration}h</span>
                        </span>
                      )}
                      {course?.level && (
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          <span>🎯</span>
                          <span className="font-medium">{course?.level}</span>
                        </span>
                      )}
                      {Array.isArray(course?.coursesEnrolled) && (
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          <span>👥</span>
                          <span className="font-medium">{course?.coursesEnrolled.length}</span>
                        </span>
                      )}
                    </div>
                    <Stars rating={safeRating} />
                  </div>
                </div>
                {course?.description && (
                  <p className="mt-3 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    {course?.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ===== BODY ===== */}
          <CardBody className="grid gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 md:grid-cols-[2fr_1fr]">
            {/* LEFT: Syllabus + About + Requirements */}
            <div className="min-w-0">
              {/* Syllabus */}
              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Syllabus</h3>
                <ul className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  {/* Module 1 */}
                  <li className="border-b border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleToggle(0)}
                      className={`flex w-full items-center gap-2 p-2.5 sm:p-3 text-left text-sm sm:text-base transition hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                        expandedIndex === 0 ? "bg-gray-50 dark:bg-gray-700/60" : ""
                      }`}
                    >
                      <span className="text-blue-500 text-lg sm:text-base">•</span>
                      <span className="flex-1">Module 1: Introduction to the Course</span>
                      {expandedIndex === 0 ? <FaAngleUp /> : <FaAngleDown />}
                    </button>

                    {expandedIndex === 0 && (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li>
                          {/* Introduction video (optional) */}
                          {IntroVideo && isSupportedVideo(IntroVideo) ? (
                            (() => {
                              const embedUrl = getEmbedUrl(IntroVideo);
                              if (embedUrl) {
                                return (
                                  <div className="aspect-video w-full">
                                    <iframe
                                      className="w-full h-full rounded-md"
                                      src={embedUrl}
                                      title="Intro Video"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                );
                              }
                              return (
                                <div className="w-full p-2.5 sm:p-3">
                                  <video controls className="w-full rounded-md" src={IntroVideo}>
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex items-center gap-2 p-2.5 sm:p-3 opacity-70">
                              <IoBookSharp />
                              <span className="flex-1">No introduction provided</span>
                            </div>
                          )}


                          {/* Guidelines entry (PDF in dialog, else confirm download) */}
                          {guidelinesUrl ? (
                            <button
                              type="button"
                              onClick={openGuidelines}
                              className="flex items-center justify-between w-full gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <IoBookSharp className="text-blue-500 text-lg sm:text-xl" />
                                <span className="text-sm sm:text-base font-medium">Important guidelines</span>
                              </div>
                              <Chip
                                variant="ghost"
                                size="sm"
                                value={isPdfExt(guidelinesUrl) ? "PDF" : isArchiveExt(guidelinesUrl) ? "ZIP" : "FILE"}
                                className="rounded-full text-xs sm:text-sm"
                              />
                            </button>
                          ) : (
                            <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 opacity-70 bg-gray-100 dark:bg-gray-800 rounded-md">
                              <div className="flex items-center gap-2">
                                <IoBookSharp className="text-gray-500 text-lg sm:text-xl" />
                                <span className="text-sm sm:text-base">No guidelines provided</span>
                              </div>
                            </div>
                          )}
                        </li>
                      </ul>
                    )}
                  </li>

                  {/* Module 2 */}
                  <li>
                    <button
                      type="button"
                      onClick={() => handleToggle(1)}
                      className={`flex w-full items-center gap-2 p-2.5 sm:p-3 text-left text-sm sm:text-base transition hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                        expandedIndex === 1 ? "bg-gray-50 dark:bg-gray-700/60" : ""
                      }`}
                    >
                      <span className="text-blue-500 text-lg sm:text-base">•</span>
                      <span className="flex-1">Module 2: Advanced Techniques</span>
                      {expandedIndex === 1 ? <FaAngleUp /> : <FaAngleDown />}
                    </button>

                    {expandedIndex === 1 && (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lessons.length === 0 && (
                          <li className="p-3 text-sm text-gray-500 dark:text-gray-400">Lessons will appear here once published.</li>
                        )}
                        {lessons.map((lesson: any) => (
                          <li key={lesson?._id}>
                            <Link to={`watch-lessons/${lesson?._id}`} className="flex items-center gap-2 p-2.5 sm:p-3 text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700/60">
                              <BiVideo className="text-blue-500" />
                              <span className="flex-1 truncate">{lesson?.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              </section>

              {/* About */}
              <section className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">About this course</h3>
                <div className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-white p-3 sm:p-4 text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {course?.about || "—"}
                </div>
              </section>

              {/* Requirements */}
              <section className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Requirements</h3>
                <ul className="mt-2 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                  {Array.isArray(course?.requirements) && (course?.requirements?.length ?? 0) > 0 ? (
                    ((course?.requirements ?? []) as string[]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 sm:p-3 text-gray-700 dark:text-gray-200">
                        <span className="pt-1 text-blue-500">•</span>
                        <span className="flex-1">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-sm text-gray-500 dark:text-gray-400">No specific requirements.</li>
                  )}
                </ul>
              </section>
            </div>

            {/* RIGHT: purchase card */}
            <aside className="md:sticky md:top-4">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {/* Price & CTA */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    {(typeof course?.price === "number" || typeof course?.isPaid === "boolean") &&
                      (isFree ? (
                        <Chip color="green" value="FREE" variant="filled" size="sm" className="rounded-full w-full md:w-auto" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatToUSD?.(course?.price as number) ?? `$${course?.price}`}
                        </span>
                      ))}
                  </div>
                  <Button
                    disabled={enrolled}
                    color={enrolled ? "green" : "blue"}
                    size="sm"
                    className="rounded-full w-full md:w-auto h-9 text-sm"
                    onClick={handleEnroll}
                  >
                    {enrolled ? "Enrolled" : "Enroll Now"}
                  </Button>
                </div>

                {/* Meta mini-cards */}
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300">
                  <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700">
                    <div className="font-semibold">Duration</div>
                    <div>{typeof course?.duration === "number" ? `${course?.duration}h` : "—"}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700">
                    <div className="font-semibold">Level</div>
                    <div>{course?.level || "—"}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-1.5 sm:p-2 text-center dark:border-gray-700">
                    <div className="font-semibold">Enrolled</div>
                    <div>{Array.isArray(course?.coursesEnrolled) ? course?.coursesEnrolled.length : 0}</div>
                  </div>
                </div>

                {/* Instructor */}
                {(instructorName || instructorAvatar) && (
                  <div className="mt-4 flex items-center gap-3">
                    {instructorAvatar ? (
                      <img src={instructorAvatar} className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover" alt={instructorName || "Instructor"} />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{instructorName || "—"}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Instructor</div>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="mt-3"><Stars rating={safeRating} /></div>
              </div>
            </aside>
          </CardBody>
        </Card>

        {/* ===== PDF Lightbox ===== */}
        <Dialog
          open={pdfOpen}
          handler={() => setPdfOpen(false)}
          size="xl"
          className="bg-transparent shadow-none flex items-center justify-center" // ensure centering
        >
          <DialogBody className="p-2 sm:p-3">
            <div
              className="
                mx-auto rounded-2xl ring-1 ring-black/10 dark:ring-white/10
                overflow-hidden bg-white dark:bg-gray-900
              "
              // EXACT 5px margins: width = viewport - 10px, but capped at 64rem (max-w-5xl)
              style={{ width: "min(calc(100vw - 10px), 64rem)" }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-2.5 py-2 sm:px-3 sm:py-2.5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setPdfPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-w-[70px] text-center">Page {pdfPage}</div>
                  <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setPdfPage((p) => p + 1)}>Next</Button>
                  <span className="mx-1.5 sm:mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                  <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}>-</Button>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-w-[56px] text-center">
                    {zoomLevels[zoomIndex] === "page-width" ? "Fit" : `${zoomLevels[zoomIndex]}%`}
                  </div>
                  <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setZoomIndex((i) => Math.min(zoomLevels.length - 1, i + 1))}>+</Button>
                  <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setZoomIndex(0)}>Fit</Button>
                </div>
                <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setPdfOpen(false)}>Close</Button>
              </div>

              {/* Viewer (kept inside rounded corners) */}
              <div
                className="relative bg-gray-50 dark:bg-gray-800"
                style={{ height: "min(76vh, 88svh)", overscrollBehavior: "contain", contain: "paint" }}
              >
                {pdfLoading && (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    Loading PDF…
                  </div>
                )}
                {!pdfLoading && pdfError && (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-red-600 dark:text-red-400">
                    {pdfError}
                  </div>
                )}
                {!pdfLoading && !pdfError && pdfSrc ? (
                  <div className="absolute inset-0 p-2 sm:p-3">
                    <div className="h-full w-full rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                      <iframe
                        key={`${pdfPage}-${zoomLevels[zoomIndex]}`}
                        src={`${pdfSrc}#page=${pdfPage}&zoom=${zoomLevels[zoomIndex]}&pagemode=none`}
                        title={`course-pdf-${course?._id || "doc"}`}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </DialogBody>
        </Dialog>

        {/* ===== Non-PDF download confirm ===== */}
        <Dialog open={downloadOpen} handler={() => setDownloadOpen(false)} size="sm" className="bg-transparent shadow-none">
          <DialogBody className="p-2">
            <div className="mx-auto w-[92vw] max-w-md rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
              <div className="px-3 pt-3 text-base font-semibold">Confirm download</div>
              <div className="px-3 pb-2 text-sm text-gray-700 dark:text-gray-300">
                You are about to download <span className="font-medium">{filenameFromUrl(downloadTargetUrl || undefined)}</span>
                {downloadSize ? ` (${formatBytes(downloadSize)})` : ""}. Proceed?
              </div>
              <div className="flex items-center justify-end gap-2 px-3 py-2">
                <Button variant="text" size="sm" className="normal-case" onClick={() => setDownloadOpen(false)}>Cancel</Button>
                <Button
                  color="blue"
                  size="sm"
                  className="normal-case"
                  disabled={downloading}
                  onClick={async () => {
                    if (!downloadTargetUrl) return;
                    setDownloading(true);
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(downloadTargetUrl, {
                        credentials: "include",
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = filenameFromUrl(downloadTargetUrl || undefined);
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      setDownloadOpen(false);
                    } catch {
                      toast.error("Download failed.");
                    } finally {
                      setDownloading(false);
                    }
                  }}
                >
                  {downloading ? (
                    <span className="inline-flex items-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Downloading…
                    </span>
                  ) : (
                    "Download"
                  )}
                </Button>
              </div>
            </div>
          </DialogBody>
        </Dialog>
      </section>
    </div>
  );
};

export default ViewCourseStudent;
