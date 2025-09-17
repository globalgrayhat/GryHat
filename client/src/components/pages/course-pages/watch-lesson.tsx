import React, { useEffect, useMemo, useState } from "react";
import { BiVideo } from "react-icons/bi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import VideoPlayer from "./video-player";
import AboutLesson from "./about-lesson";
import Quizzes from "./quizzes-page";
import Discussion from "./discussion-page";
import ShimmerEffectWatchLessons from "../../shimmer/watch-lessons-shimmer";
import ShimmerVideoPlayer from "../../shimmer/shimmer-video-player";

import { getLessonById, getLessonsByCourse } from "../../../api/endpoints/course/lesson";
import { LessonDto } from "../../../types/video";
import { buildPlaybackFromLesson, isUserEnrolled, Playback } from "../../../utils/media";

import { selectStudentId } from "../../../redux/reducers/studentSlice";
import { selectCourse } from "../../../redux/reducers/courseSlice";

/**
 * WatchLessons
 * - Fetch lessons by course (existing API)
 * - Apply access rules (preview => public, else enrolled only)
 * - Build a unified playback object (s3/local/youtube/vimeo)
 */
const WatchLessons: React.FC = () => {
  const { lessonId, courseId } = useParams();

  const studentId = useSelector(selectStudentId);
  const currentCourse = useSelector(selectCourse);

  // UI state
  const [selectedTab, setSelectedTab] = useState<0 | 1 | 2>(0); // 0=About, 1=Discussion, 2=Quizzes
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isLoadingOne, setIsLoadingOne] = useState(false);

  const [allLessons, setAllLessons] = useState<LessonDto[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDto | null>(null);

  // Enrollment (robust for mixed types)
  const enrolled = useMemo(() => {
    return isUserEnrolled(currentCourse?.coursesEnrolled as any, studentId ?? null);
  }, [currentCourse?.coursesEnrolled, studentId]);

  // Can play? => preview OR enrolled
  const canPlay = useMemo(() => {
    if (!currentLesson) return false;
    return currentLesson.isPreview || enrolled;
  }, [currentLesson, enrolled]);

  // Typed empty playback to satisfy TS
  const EMPTY_PLAYBACK: Playback = { kind: "unknown", src: null, type: null };

  // Decide playback for current lesson
  const playback: Playback = useMemo(
    () => (currentLesson ? buildPlaybackFromLesson(currentLesson) : EMPTY_PLAYBACK),
    [currentLesson]
  );

  // Tabs content
  const content = useMemo(() => {
    if (selectedTab === 0) return <AboutLesson about={currentLesson?.description ?? ""} />;
    if (selectedTab === 1) return <Discussion lessonId={currentLesson?._id ?? ""} />;
    return <Quizzes lessonId={currentLesson?._id} />;
  }, [selectedTab, currentLesson]);

  // Fetch all lessons of the course
  const fetchLessonsByCourse = async (cid: string) => {
    try {
      setIsLoadingAll(true);
      const response = await getLessonsByCourse(cid);
      setAllLessons(response?.data ?? []);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to load lessons", { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Fetch a single lesson
  const fetchLesson = async (lid: string) => {
    try {
      setIsLoadingOne(true);
      const response = await getLessonById(lid);
      setCurrentLesson(response?.data ?? null);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to load lesson", { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setIsLoadingOne(false);
    }
  };

  // Init
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    if (courseId) fetchLessonsByCourse(courseId);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [courseId]);

  // Load initial/current lesson
  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId);
    } else if (allLessons.length) {
      // fallback to first lesson if no lessonId in route
      setCurrentLesson(allLessons[0]);
    }
  }, [lessonId, allLessons]);

  // Sidebar click
  const onPickLesson = (l: LessonDto) => setCurrentLesson(l);

  if (isLoadingAll && isLoadingOne) {
    return <ShimmerEffectWatchLessons />;
  }

  return (
    <div className="flex h-screen pb-16">
      {/* Left: Video + Tabs */}
      {isLoadingOne ? (
        <ShimmerVideoPlayer />
      ) : (
        <div className="md:w-3/4 w-full overflow-y-scroll scrollbar-track-blue-gray-50 scrollbar-thumb-gray-400 scrollbar-thin scrollbar-h-md">
          <div className="h-3/4">
            <VideoPlayer playback={playback} canPlay={!!canPlay} />
          </div>

          {/* Tabs */}
          <div>
            <ul className="flex p-3">
              <li
                className={`ml-5 cursor-pointer ${selectedTab === 0 ? "border-b-4 rounded-b-md border-blue-gray-700" : ""}`}
                onClick={() => setSelectedTab(0)}
              >
                About
              </li>
              <li
                className={`ml-6 cursor-pointer ${selectedTab === 1 ? "border-b-4 rounded-b-md border-blue-gray-700" : ""}`}
                onClick={() => setSelectedTab(1)}
              >
                Discussion
              </li>
              <li
                className={`ml-6 cursor-pointer ${selectedTab === 2 ? "border-b-4 rounded-b-md border-blue-gray-700" : ""}`}
                onClick={() => setSelectedTab(2)}
              >
                Quizzes
              </li>
            </ul>
          </div>

          {/* Tab content */}
          <div className="pl-8 pr-8 pb-12 pt-4">{content}</div>
        </div>
      )}

      {/* Right: Lessons list */}
      <div className="w-1/4 hidden md:block flex-grow mt-3 mb-2 overflow-y-scroll scrollbar-thumb-gray-400 scrollbar-rounded scrollbar-track-gray-200 scrollbar-thin">
        <h1 className="font-semibold text-blue-gray-800 text-2xl border-b border-gray-300 p-2">Lessons</h1>
        <ul>
          {allLessons.map((l, idx) => {
            const locked = !(l.isPreview || enrolled);
            return (
              <li
                key={l._id}
                onClick={() => onPickLesson(l)}
                className={`p-6 border-b-2 flex items-center cursor-pointer ${
                  currentLesson?._id === l._id ? "bg-gray-200 hover:bg-gray-200" : "hover:bg-gray-100"
                }`}
                title={locked ? "Locked — enroll to watch" : "Playable"}
              >
                <BiVideo className={`mr-2 ${locked ? "text-red-500" : "text-blue-500"}`} />
                <span className="flex-1 text-sm font-light text-gray-700">
                  Episode {String(idx + 1).padStart(2, "0")} — {l.title}
                  {l.isPreview && <span className="ml-2 text-green-600 text-xs font-semibold">(Preview)</span>}
                </span>
                {locked && <span className="ml-2 text-xs text-red-600 font-semibold">Locked</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default WatchLessons;
