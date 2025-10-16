/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getIndividualCourse } from "../../api/endpoints/course/course";
import { getLessonsByCourse } from "../../api/endpoints/course/lesson";
import type { CourseInterface } from "../../types/course";
import { getFullUrl } from "../../utils/helpers";
import useApiData from "../../hooks/useApiCall";

/** Helper utilities kept identical to original file */
// English comments: utilities used across components
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export const isPdfExt = (url?: string) => !!url && /\.pdf(\?|$)/i.test(url);
export const isArchiveExt = (url?: string) =>
  !!url && /\.(zip|rar|7z|tar|gz|bz2)$/i.test(url);
export const filenameFromUrl = (url?: string) => {
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
export const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Hook that encapsulates all logic and state from the original ViewCourseStudent
export default function useViewCourseLogic(
  courseId?: string | undefined,
  studentId?: string | null,
  isLoggedIn?: boolean
) {
  // UI state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Payment & login modals
  const [openPaymentConfirmation, setOpenPaymentConfirmation] = useState(false);
  const [loginConfirmation, setLoginConfirmation] = useState(false);

  // PDF viewer state
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const zoomLevels = ["page-width", "100", "125", "150"] as const;
  const [zoomIndex, setZoomIndex] = useState(0);

  // viewer url vs object url (blob)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfRevokeRef = useRef<string | null>(null);

  // download confirm (non-pdf)
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadTargetUrl, setDownloadTargetUrl] = useState<string | null>(
    null
  );
  const [downloading, setDownloading] = useState(false);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);

//   const [successToastShown, setSuccessToastShown] = useState(false);

  // Stable API callers — memoized to avoid refetch churn
  const fetchCourse = useCallback(
    async (id: string): Promise<CourseInterface | null> => {
      if (!id) return null;
      try {
        const course = await getIndividualCourse(id);
        return course?.data?.data as CourseInterface;
      } catch (error: any) {
        // show a toast but rethrow for the hook consumer to handle
        toast.error(error?.data?.message || "Failed to load course", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        throw error;
      }
    },
    []
  );

  const fetchLessons = useCallback(async (id: string) => {
    if (!id) return [];
    try {
      const lessons = await getLessonsByCourse(id);
      return lessons?.data;
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          "Failed to load lessons",
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
      throw error;
    }
  }, []);

  // Data hooks
  const { data: courseRaw, isLoading, refreshData } = useApiData(
    fetchCourse,
    courseId
  );
  const { data: lessonsRaw, isLoading: isLessonsLoading } = useApiData(
    fetchLessons,
    courseId
  );

  const course = (courseRaw as CourseInterface | null) ?? null;

  // derived values
  const instructor = (course as any)?.instructorId;
  const instructorName = useMemo(
    () =>
      instructor
        ? `${instructor?.firstName ?? ""} ${instructor?.lastName ?? ""}`.trim()
        : undefined,
    [instructor?.firstName, instructor?.lastName]
  );

  const instructorAvatar = useMemo(
    () =>
      instructor?.profilePic?.url ? getFullUrl(instructor.profilePic.url) : undefined,
    [instructor?.profilePic?.url]
  );

  const introduction = useMemo(
    () => (course?.introduction?.url ? getFullUrl(course.introduction.url) : undefined),
    [course?.introduction?.url]
  );

  const isSupportedVideo = (url: string): boolean => {
    if (!url) return false;
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      /\.(mp4|webm|ogg)$/i.test(url)
    );
  };

  const coverUrl = useMemo(
    () => getFullUrl(course?.thumbnailUrl || (course as any)?.thumbnail?.url || ""),
    [course?.thumbnailUrl, (course as any)?.thumbnail?.url]
  );

  const guidelinesUrl = useMemo(
    () => getFullUrl(course?.guidelinesUrl || ""),
    [course?.guidelinesUrl]
  );

  const paidFlag =
    typeof course?.isPaid === "boolean"
      ? course.isPaid
      : typeof course?.price === "number"
      ? (course?.price ?? 0) > 0
      : false;
  const isFree =
    !paidFlag || (typeof course?.price === "number" && (course?.price ?? 0) === 0);

  const enrolled = useMemo(() => {
    if (!course || !Array.isArray((course as any).coursesEnrolled)) return false;
    return (course as any).coursesEnrolled.includes(studentId ?? "");
  }, [course, studentId]);

  const lessons = useMemo(() => {
    const arr = Array.isArray(lessonsRaw) ? lessonsRaw : lessonsRaw?.data;
    return Array.isArray(arr) ? arr : [];
  }, [lessonsRaw]);

  const safeRating = clamp(typeof course?.rating === "number" ? course.rating : 0, 0, 5);

  // handlers
  const handleToggle = (index: number) => setExpandedIndex(index === expandedIndex ? null : index);
  const handleEnroll = () => {
    if (!isLoggedIn) setLoginConfirmation(true);
    else setOpenPaymentConfirmation(true);
  };

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

  // PDF loader effect (keeps identical behavior)
  useEffect(() => {
    let mounted = true;
    const loadPdf = async () => {
      if (!pdfOpen || !viewerUrl || !isPdfExt(viewerUrl)) return;
      setPdfLoading(true);
      setPdfError(null);

      try {
        let res = await fetch(viewerUrl, { credentials: "omit" });
        if (!res.ok) {
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

        if (pdfRevokeRef.current) {
          URL.revokeObjectURL(pdfRevokeRef.current);
          pdfRevokeRef.current = null;
        }

        const url = URL.createObjectURL(blob);
        pdfRevokeRef.current = url;
        if (mounted) setPdfSrc(url);
      } catch (e: unknown) {
        if (mounted) {
          setPdfError(
            `Failed to load PDF inline${(e as { message?: string })?.message ? `: ${(e as { message?: string }).message}` : ""}`
          );
          setPdfSrc(null);
        }
      } finally {
        if (mounted) setPdfLoading(false);
      }
    };

    loadPdf();

    return () => {
      mounted = false;
    };
  }, [pdfOpen, viewerUrl]);

  useEffect(() => {
    if (!pdfOpen) {
      if (pdfRevokeRef.current) {
        URL.revokeObjectURL(pdfRevokeRef.current);
        pdfRevokeRef.current = null;
      }
      setPdfSrc(null);
    }
    return () => {
      if (pdfRevokeRef.current) {
        URL.revokeObjectURL(pdfRevokeRef.current);
        pdfRevokeRef.current = null;
      }
    };
  }, [pdfOpen]);

  // Download size probe
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

  return {
    // data
    course,
    lessons,
    isLoading,
    isLessonsLoading,
    refreshData,

    // derived
    instructorName,
    instructorAvatar,
    introduction,
    isSupportedVideo,
    coverUrl,
    guidelinesUrl,
    isFree,
    safeRating,
    enrolled,

    // state
    expandedIndex,
    pdfOpen,
    pdfPage,
    pdfSrc,
    pdfLoading,
    pdfError,
    zoomLevels,
    zoomIndex,
    downloadOpen,
    downloadTargetUrl,
    downloading,
    downloadSize,
    openPaymentConfirmation,
    loginConfirmation,

    // setters & handlers
    setPdfOpen,
    setPdfPage,
    setZoomIndex,
    setViewerUrl,
    setDownloadOpen,
    setDownloadTargetUrl,
    setOpenPaymentConfirmation,
    setLoginConfirmation,
    setDownloading,

    handleToggle,
    handleEnroll,
    openGuidelines,
    fetchCourse,
    fetchLessons,
  } as const;
}
