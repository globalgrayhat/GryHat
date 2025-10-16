/* eslint-disable react-hooks/exhaustive-deps */
// File: src/pages/ViewCourseStudent/index.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import CustomBreadCrumbs from "../../components/common/bread-crumbs";
import ViewCourseShimmer from "../../components/shimmer/view-course-shimmer";
import PaymentConfirmationModal from "./payment-confirmation-modal";
import LoginConfirmation from "../../components/common/login-confirmation-modal";
import InstructorPin from "../../components/ui/InstructorPin";
import Stars from "../../components/ui/Stars";
import SyllabusSection from "../../components/ui/SyllabusSection";
import PurchaseCard from "../../components/ui/PurchaseCard";
import PDFLightbox from "../../components/ui/PDFLightbox";
import DownloadConfirmDialog from "../../components/ui/DownloadConfirmDialog";
import useViewCourseLogic from "../../components/ui/useViewCourseLogic";
import { setCourse } from "../../redux/reducers/courseSlice";
import { selectStudentId } from "../../redux/reducers/studentSlice";
import { selectIsLoggedIn } from "../../redux/reducers/authSlice";

const ViewCourseStudent: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const studentId = useSelector(selectStudentId);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // use the centralized hook — keeps behaviour identical
  const logic = useViewCourseLogic(courseId, studentId, isLoggedIn);

  const {
    course,
    lessons,
    isLoading,
    isLessonsLoading,
    instructorName,
    instructorAvatar,
    introduction,
    isSupportedVideo,
    coverUrl,
    guidelinesUrl,
    isFree,
    safeRating,
    enrolled,
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
    setPdfOpen,
    setPdfPage,
    setZoomIndex,
    setDownloadOpen,
    setOpenPaymentConfirmation,
    setLoginConfirmation,
    handleToggle,
    handleEnroll,
    openGuidelines,
    refreshData: refreshHookData,
  } = logic as any;

  // dispatch to redux only when course exists (preserve original logic)
  React.useEffect(() => {
    if (course && (course as any)?._id) {
      dispatch(setCourse({ course }));
    }
  }, [(course as any)?._id, dispatch]);

  if (isLoading || isLessonsLoading) return <ViewCourseShimmer />;

  return (
    <div className="w-full bg-white dark:bg-gray-900">
      <LoginConfirmation confirm={loginConfirmation} setConfirm={setLoginConfirmation} />
      <PaymentConfirmationModal open={openPaymentConfirmation} setUpdated={refreshHookData} courseDetails={{ price: course?.price ?? 0, overview: course?.description ?? "", isPaid: course?.isPaid ?? false }} setOpen={setOpenPaymentConfirmation} />

      <div className="flex flex-col px-3 sm:px-6 pt-3 md:pt-5 md:px-12 lg:px-20">
        <CustomBreadCrumbs paths={location.pathname} />
      </div>

      <section className="mx-auto max-w-6xl p-2 sm:p-4 md:p-6">
        <Card shadow={false} className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
          {/* Cover area */}
          <div className="relative aspect-[16/8] w-full sm:aspect-[16/8] md:aspect-[21/9]">
            {coverUrl ? (
              <img src={coverUrl} alt={course?.title ?? "Course cover"} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600" />
            )}

            <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-black/10 to-transparent dark:from-black/55 dark:via-black/20" />

            <div className="absolute top-2 left-2 flex flex-wrap gap-2">
              {course?.category && <span className="rounded-full px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-semibold bg-white/95 text-gray-900 ring-1 ring-black/5 dark:bg-blue-500 dark:text-white dark:ring-blue-400/40">{typeof course?.category === 'string' ? course?.category : (course?.category?.name ?? '')}</span>}
              {(typeof course?.price === "number" || typeof course?.isPaid === "boolean") && (
                <span className={isFree ? "rounded-full px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-semibold text-white bg-green-600 dark:bg-green-500" : "rounded-full px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-semibold text-gray-900 bg-white/95 ring-1 ring-black/5 dark:bg-indigo-500 dark:text-white dark:ring-indigo-400/40"}>
                  {isFree ? "FREE" : `₹${course?.price}`}
                </span>
              )}
            </div>

            <InstructorPin name={instructorName} avatar={instructorAvatar} />

            <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4">
              <div className="rounded-xl bg-white/95 p-2.5 sm:p-3 ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/85 dark:ring-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Typography variant="h5" className="!m-0 font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg lg:text-xl">{course?.title ?? "Untitled course"}</Typography>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[12px] text-gray-700 dark:text-gray-300">{typeof course?.duration === "number" && <span>⏱ {course?.duration}h</span>}{course?.level && <span>• 🎯 {course?.level}</span>}{Array.isArray(course?.coursesEnrolled) && <span>• 👥 {course?.coursesEnrolled.length}</span>}</div>
                    <Stars rating={safeRating} />
                  </div>
                </div>
                {course?.description ? <p className="mt-0.5 line-clamp-1 sm:line-clamp-2 text-[12px] sm:text-[13px] leading-5 text-gray-700 dark:text-gray-200">{course.description}</p> : null}
              </div>
            </div>
          </div>

          <CardBody className="grid gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 md:grid-cols-[2fr_1fr]">
            <div className="min-w-0">
              <SyllabusSection expandedIndex={expandedIndex} handleToggle={handleToggle} introduction={introduction} isSupportedVideo={isSupportedVideo} guidelinesUrl={guidelinesUrl} openGuidelines={openGuidelines} lessons={lessons} />

              <section className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">About this course</h3>
                <div className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-white p-3 sm:p-4 text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">{course?.about || "—"}</div>
              </section>

              <section className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Requirements</h3>
                <ul className="mt-2 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                  {Array.isArray(course?.requirements) && (course?.requirements?.length ?? 0) > 0 ? ((course?.requirements ?? []) as string[]).map((item, idx) => (<li key={idx} className="flex items-start gap-2 p-2.5 sm:p-3 text-gray-700 dark:text-gray-200"><span className="pt-1 text-blue-500">•</span><span className="flex-1">{item}</span></li>)) : (<li className="p-3 text-sm text-gray-500 dark:text-gray-400">No specific requirements.</li>)}
                </ul>
              </section>
            </div>

            <aside className="md:sticky md:top-4"><PurchaseCard course={course} isFree={isFree} enrolled={enrolled} handleEnroll={handleEnroll} instructorName={instructorName} instructorAvatar={instructorAvatar} safeRating={safeRating} /></aside>
          </CardBody>
        </Card>

        <PDFLightbox pdfOpen={pdfOpen} setPdfOpen={setPdfOpen} pdfLoading={pdfLoading} pdfError={pdfError} pdfSrc={pdfSrc} pdfPage={pdfPage} setPdfPage={setPdfPage} zoomLevels={zoomLevels} zoomIndex={zoomIndex} setZoomIndex={setZoomIndex} courseId={course?._id} />

        <DownloadConfirmDialog downloadOpen={downloadOpen} setDownloadOpen={setDownloadOpen} downloadTargetUrl={downloadTargetUrl} downloading={downloading} setDownloading={() => { } } downloadSize={downloadSize} setDownloadSize={function (): void {
          throw new Error("Function not implemented.");
        } } />
      </section>
    </div>
  );
};

export default ViewCourseStudent;
