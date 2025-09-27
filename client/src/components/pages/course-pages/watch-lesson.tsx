import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { getLessonById, getLessonsByCourse } from "../../../api/endpoints/course/lesson";
import { LessonDto } from "../../../types/video";
import { buildPlaybackFromLesson, isUserEnrolled, Playback } from "../../../utils/media";

import VideoPlayer from "./video-player";
import AboutLesson from "./about-lesson";
import Discussion from "./discussion-page";
import Quizzes from "./quizzes-page";
import ShimmerEffectWatchLessons from "../../shimmer/watch-lessons-shimmer";
import ShimmerVideoPlayer from "../../shimmer/shimmer-video-player";

import { selectStudentId } from "../../../redux/reducers/studentSlice";
import { selectCourse } from "../../../redux/reducers/courseSlice";

import {
  Card,
  CardBody,
  Button,
  Dialog,
  DialogBody,
  Chip,
  Typography,
} from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { BiVideo } from "react-icons/bi";

/** -----------------------------
 * Design constants
 * ------------------------------*/
const TABS = [
  { key: 0, label: "About", icon: InformationCircleIcon },
  { key: 1, label: "Discussion", icon: ChatBubbleLeftRightIcon },
  { key: 2, label: "Quizzes", icon: QuestionMarkCircleIcon },
] as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** -----------------------------
 * Lesson list item (desktop & mobile)
 * ------------------------------*/
const LessonItem: React.FC<{
  lesson: LessonDto;
  index: number;
  active: boolean;
  locked: boolean;
  onClick: () => void;
}> = ({ lesson, index, active, locked, onClick }) => {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        title={locked ? "Locked — enroll to watch" : "Playable"}
        className={`w-full flex items-center gap-2 text-left px-3 sm:px-4 py-2.5 transition
          ${active ? "bg-gray-100 dark:bg-gray-700/40" : "hover:bg-gray-50 dark:hover:bg-gray-700/40"}`}
      >
        <BiVideo className={`${locked ? "text-red-500" : "text-blue-500"}`} />
        <span className="flex-1 text-[13px] sm:text-sm text-gray-800 dark:text-gray-200 truncate">
          {String(index + 1).padStart(2, "0")} — {lesson.title}
          {lesson.isPreview && (
            <span className="ml-2 text-green-600 dark:text-green-400 text-[11px] font-medium">
              (Preview)
            </span>
          )}
        </span>
        {locked && <span className="text-[11px] text-red-600 font-semibold">Locked</span>}
      </button>
    </li>
  );
};

/** -----------------------------
 * WatchLessons — brand-aligned, responsive
 * ------------------------------*/
const WatchLessons: React.FC = () => {
  const { lessonId, courseId } = useParams();

  const studentId = useSelector(selectStudentId);
  const currentCourse = useSelector(selectCourse);

  // Data state
  const [allLessons, setAllLessons] = useState<LessonDto[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDto | null>(null);

  // UI state
  const [selectedTab, setSelectedTab] = useState<0 | 1 | 2>(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isLoadingOne, setIsLoadingOne] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(false);

  // Scroll active lesson into view (desktop sidebar)
  const activeItemRef = useRef<HTMLLIElement | null>(null);

  // Access
  const enrolled = useMemo(
    () => isUserEnrolled(currentCourse?.coursesEnrolled as any, studentId ?? null),
    [currentCourse?.coursesEnrolled, studentId]
  );
  const locked = currentLesson ? !(currentLesson.isPreview || enrolled) : true;

  // Playback
  const EMPTY_PLAYBACK: Playback = { kind: "unknown", src: null, type: null };
  const playback: Playback = useMemo(
    () => (currentLesson ? buildPlaybackFromLesson(currentLesson) : EMPTY_PLAYBACK),
    [currentLesson]
  );
  const canPlay = !!currentLesson && (currentLesson.isPreview || enrolled);

  // Tab content
  const content = useMemo(() => {
    if (selectedTab === 0) return <AboutLesson about={currentLesson?.description ?? ""} />;
    if (selectedTab === 1) return <Discussion lessonId={currentLesson?._id ?? ""} />;
    return <Quizzes lessonId={currentLesson?._id} />;
  }, [selectedTab, currentLesson]);

  /** -----------------------------
   * Data fetchers
   * ------------------------------*/
  const fetchLessonsByCourse = async (cid: string) => {
    try {
      setIsLoadingAll(true);
      const res = await getLessonsByCourse(cid);
      setAllLessons(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to load lessons", { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setIsLoadingAll(false);
    }
  };

  const fetchLesson = async (lid: string) => {
    try {
      setIsLoadingOne(true);
      const res = await getLessonById(lid);
      setCurrentLesson(res?.data ?? null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to load lesson", { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setIsLoadingOne(false);
    }
  };

  /** -----------------------------
   * Effects
   * ------------------------------*/
  useEffect(() => {
    window.scrollTo(0, 0);
    if (courseId) fetchLessonsByCourse(courseId);
  }, [courseId]);

  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId);
    } else if (allLessons.length) {
      setCurrentLesson(allLessons[0]);
    }
  }, [lessonId, allLessons]);

  useEffect(() => {
    // Make sure active item is visible in desktop sidebar
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [currentLesson?._id]);

  /** -----------------------------
   * Navigation helpers
   * ------------------------------*/
  const indexOfCurrent = currentLesson ? allLessons.findIndex(l => l._id === currentLesson._id) : -1;
  const hasPrev = indexOfCurrent > 0;
  const hasNext = indexOfCurrent >= 0 && indexOfCurrent < allLessons.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    setCurrentLesson(allLessons[indexOfCurrent - 1]);
  };
  const goNext = () => {
    if (!hasNext) return;
    setCurrentLesson(allLessons[indexOfCurrent + 1]);
  };

  const onPickLesson = (l: LessonDto) => {
    setCurrentLesson(l);
    setLessonsOpen(false);
  };

  /** -----------------------------
   * Loading fallback
   * ------------------------------*/
  if (isLoadingAll && isLoadingOne) return <ShimmerEffectWatchLessons />;

  /** -----------------------------
   * Render
   * ------------------------------*/
  return (
    <div className="w-full bg-white dark:bg-gray-900">
      <section className="mx-auto max-w-6xl p-2 sm:p-4 md:p-6">
        {/* Header */}
        <div className="mb-2 sm:mb-3 md:mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <Typography
              variant="h5"
              className="!m-0 font-semibold text-gray-900 dark:text-white text-base sm:text-lg md:text-xl truncate"
              title={currentLesson?.title || "Lesson"}
            >
              {currentLesson?.title || "Lesson"}
            </Typography>
            <div className="mt-1 flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-600 dark:text-gray-300">
              <Chip
                size="sm"
                value={locked ? "Locked" : currentLesson?.isPreview ? "Preview" : "Enrolled"}
                color={locked ? "red" : currentLesson?.isPreview ? "green" : "blue"}
                className="rounded-full"
              />
              {allLessons.length > 0 && (
                <span>
                  Lesson {indexOfCurrent >= 0 ? indexOfCurrent + 1 : 1} of {allLessons.length}
                </span>
              )}
            </div>
          </div>

          {/* Mobile: open lessons dialog */}
          <div className="lg:hidden">
            <Button size="sm" variant="outlined" className="normal-case" onClick={() => setLessonsOpen(true)}>
              Lessons
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4 lg:gap-6">
          {/* LEFT: Video + Tabs */}
          <Card shadow={false} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardBody className="p-2 sm:p-3 md:p-4">
              {/* Video header actions */}
              <div className="mb-2 sm:mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-600 dark:text-gray-300">
                  {locked ? <LockClosedIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  <span>{locked ? "This lesson is locked" : "Ready to play"}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="text"
                    size="sm"
                    className="normal-case px-2 py-1"
                    onClick={goPrev}
                    disabled={!hasPrev}
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="text"
                    size="sm"
                    className="normal-case px-2 py-1"
                    onClick={goNext}
                    disabled={!hasNext}
                  >
                    Next <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Video area (rounded) */}
              <div className="rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-black">
                {isLoadingOne ? (
                  <ShimmerVideoPlayer />
                ) : (
                  <div className="relative">
                    <VideoPlayer playback={playback} canPlay={!!canPlay} />
                    {!canPlay && (
                      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="text-[12px] sm:text-[13px] text-white">
                          This lesson is locked. Enroll to watch full content.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Segmented tabs */}
              <div className="mt-3 sm:mt-4">
                <div
                  role="tablist"
                  aria-label="Lesson tabs"
                  className="inline-flex rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-0.5"
                >
                  {TABS.map(({ key, label, icon: Icon }) => {
                    const active = selectedTab === key;
                    return (
                      <button
                        key={label}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setSelectedTab(key as 0 | 1 | 2)}
                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] rounded-full transition
                          ${active
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="mt-3 sm:mt-4 text-gray-800 dark:text-gray-200">
                  {content}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* RIGHT: Lessons list (sticky on desktop) */}
          <aside className="hidden lg:block">
            <Card
              shadow={false}
              className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:sticky md:top-6"
            >
              <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2.5">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Lessons</h2>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allLessons.map((l, idx) => {
                    const itemLocked = !(l.isPreview || enrolled);
                    const active = currentLesson?._id === l._id;
                    return (
                      <li key={l._id} ref={active ? activeItemRef : undefined}>
                        <LessonItem
                          lesson={l}
                          index={idx}
                          active={active}
                          locked={itemLocked}
                          onClick={() => onPickLesson(l)}
                        />
                      </li>
                    );
                  })}
                  {allLessons.length === 0 && (
                    <li className="px-3 sm:px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No lessons yet.</li>
                  )}
                </ul>
              </div>
            </Card>
          </aside>
        </div>
      </section>

      {/* Mobile lessons list as Dialog (center + 5px margins right/left) */}
      <Dialog open={lessonsOpen} handler={() => setLessonsOpen(false)} className="bg-transparent shadow-none flex items-center justify-center">
        <DialogBody className="p-2 sm:p-3">
          <div
            className="mx-auto rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden"
            style={{ width: "min(calc(100vw - 10px), 42rem)" }} // exact 5px margins on both sides
          >
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Lessons</h3>
              <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={() => setLessonsOpen(false)}>
                Close
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {allLessons.map((l, idx) => {
                  const itemLocked = !(l.isPreview || enrolled);
                  const active = currentLesson?._id === l._id;
                  return (
                    <LessonItem
                      key={l._id}
                      lesson={l}
                      index={idx}
                      active={active}
                      locked={itemLocked}
                      onClick={() => onPickLesson(l)}
                    />
                  );
                })}
                {allLessons.length === 0 && (
                  <li className="px-3 sm:px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No lessons yet.</li>
                )}
              </ul>
            </div>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default WatchLessons;
