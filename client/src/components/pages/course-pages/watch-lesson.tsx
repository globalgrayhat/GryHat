<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import { BiVideo } from "react-icons/bi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

=======
import React, { useState, useEffect } from "react";
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
import VideoPlayer from "./video-player";
import AboutLesson from "./about-lesson";
import Quizzes from "./quizzes-page";
import Discussion from "./discussion-page";
<<<<<<< HEAD
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
=======
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getLessonById } from "../../../api/endpoints/course/lesson";
import { getLessonsByCourse } from "../../../api/endpoints/course/lesson";
import { ApiResponseLesson } from "../../../api/types/apiResponses/ap-response-lesson";
import { Media } from "../../../api/types/apiResponses/ap-response-lesson";
import { BiVideo } from "react-icons/bi";
import { useSelector } from "react-redux";
import { selectStudentId } from "../../../redux/reducers/studentSlice";
import { selectCourse } from "redux/reducers/courseSlice";
import ShimmerEffectWatchLessons from "../../shimmer/watch-lessons-shimmer";
import ShimmerVideoPlayer from "../../shimmer/shimmer-video-player";

const WatchLessons: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [isLoadingAllLessons, setIsLoadingAllLessons] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lesson, setLesson] = useState<ApiResponseLesson | null>(null);
  const [allLessons, setAllLessons] = useState<Array<ApiResponseLesson>>([]);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const { lessonId } = useParams();
  const location = useLocation();
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(
    lessonId
  );
  const studentId = useSelector(selectStudentId);
  const currentCourse = useSelector(selectCourse);
  const { courseId } = useParams();
  let isCoursePurchased = false;

  if (currentCourse) {
    isCoursePurchased = currentCourse.coursesEnrolled.includes(studentId);
  }
  console.log(currentCourse)
  console.log(currentCourse?.introduction.key)

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const fetchLessonsByCourse = async (courseId: string) => {
    try {
      setIsLoadingAllLessons(true);
      const response = await getLessonsByCourse(courseId);
      setAllLessons(response?.data);
      setTimeout(() => {
        setIsLoadingAllLessons(false);
      }, 3000);
    } catch (error: any) {
      setIsLoadingAllLessons(false);
      toast.error(error?.data?.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };
  const fetchLesson = async (lessonId: string) => {
    try {
      setIsLoadingLesson(true);
      const response = await getLessonById(lessonId);
      setLesson(response?.data);
      const key = response?.data?.media.find(
        (media: Media) => media.name === "lessonVideo"
      )?.key;
      setVideoKey(key);
      setTimeout(() => {
        setIsLoadingLesson(false);
      }, 2000);
    } catch (error: any) {
      setIsLoadingLesson(false);
      toast.error(error?.data?.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    currentLessonId && fetchLesson(currentLessonId);
  }, [currentLessonId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Hide the browser's scroll bar on component mount
    document.body.style.overflow = "hidden";
    courseId && fetchLessonsByCourse(courseId);
    // fetchVideoUrl()
    return () => {
      // Restore the browser's scroll bar on component unmount
      document.body.style.overflow = "auto";
    };
  }, []);

  let content = null;

  if (selectedItemIndex === 0) {
    content = <AboutLesson about={lesson?.description ?? ""} />;
  } else if (selectedItemIndex === 1) {
    content = <Discussion lessonId={currentLessonId ?? ""} />;
  } else {
    content = <Quizzes lessonId={lessonId} />;
  }
  if (isLoadingAllLessons && isLoadingLesson) {
    return <ShimmerEffectWatchLessons />;
  }
  return (
    <div className='flex h-screen pb-16'>
      {isLoadingLesson ? (
        <ShimmerVideoPlayer />
      ) : (
        <div className='md:w-3/4 w-full  overflow-y-scroll scrollbar-track-blue-gray-50 scrollbar-thumb-gray-400 scrollbar-thin scrollbar-h-md'>
          <div className='h-3/4'>
            <VideoPlayer
              videoKey={videoKey}
              isCoursePurchased={currentCourse && currentCourse.isPaid ? isCoursePurchased : true}
              />
          </div>
          <div className=''>
            <ul className='flex p-3'>
              {/* <li
                className={` block md:hidden ml-5 cursor-pointer ${
                  selectedItemIndex === 0
                    ? "border-b-4 rounded-b-md border-blue-gray-700"
                    : ""
                }`}
                onClick={() => handleItemClick(0)}
              >
                Lessons
              </li> */}
              <li
                className={`ml-5 cursor-pointer ${
                  selectedItemIndex === 0
                    ? "border-b-4 rounded-b-md border-blue-gray-700"
                    : ""
                }`}
                onClick={() => handleItemClick(0)}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
              >
                About
              </li>
              <li
<<<<<<< HEAD
                className={`ml-6 cursor-pointer ${selectedTab === 1 ? "border-b-4 rounded-b-md border-blue-gray-700" : ""}`}
                onClick={() => setSelectedTab(1)}
=======
                className={`ml-6 cursor-pointer ${
                  selectedItemIndex === 1
                    ? "border-b-4 rounded-b-md  border-blue-gray-700"
                    : ""
                }`}
                onClick={() => handleItemClick(1)}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
              >
                Discussion
              </li>
              <li
<<<<<<< HEAD
                className={`ml-6 cursor-pointer ${selectedTab === 2 ? "border-b-4 rounded-b-md border-blue-gray-700" : ""}`}
                onClick={() => setSelectedTab(2)}
=======
                className={`ml-6 cursor-pointer ${
                  selectedItemIndex === 2
                    ? "border-b-4 rounded-b-md  border-blue-gray-700"
                    : ""
                }`}
                onClick={() => handleItemClick(2)}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
              >
                Quizzes
              </li>
            </ul>
          </div>
<<<<<<< HEAD

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
=======
          <div className='pl-8 pr-8 pb-12 pt-4'>{content}</div>
        </div>
      )}
      <div className='w-1/4 hidden md:block flex-grow mt-3 mb-2 overflow-y-scroll  scrollbar-thumb-gray-400  scrollbar-rounded scrollbar-track-gray-200 scrollbar-thin'>
        <h1 className='font-semibold text-blue-gray-800 text-2xl border-b border-gray-300 p-2'>
          Lessons
        </h1>
        <ul>
          {/* <li
            onClick={() => {
              setCurrentLessonId(currentCourse?._id);
              setVideoKey(currentCourse?.introduction?.key??"")
            }}
            className={`p-6 border-b-2 flex items-center cursor-pointer 
              ${
                currentCourse?._id === currentLessonId
                  ? "bg-gray-200 hover:bg-gray-200"
                  : "hover:bg-gray-100"
              }  
              `}
          >
            <BiVideo className='mr-2 text-blue-500' />
            <span className='flex-1 text-sm font-light text-gray-700'>
              Episode 0{0} - Introduction to the course
            </span>
          </li> */}

          {allLessons.map((lesson, index) => (
            <li
              key={lesson._id}
              onClick={() => {
                setCurrentLessonId(lesson._id);
              }}
              className={`p-6 border-b-2 flex items-center cursor-pointer 
              ${
                lesson._id === currentLessonId
                  ? "bg-gray-200 hover:bg-gray-200"
                  : "hover:bg-gray-100"
              }  
              `}
            >
              <BiVideo className='mr-2 text-blue-500' />
              <span className='flex-1 text-sm font-light text-gray-700'>
                Episode 0{index + 1} - {lesson.title}
              </span>
            </li>
          ))}
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
        </ul>
      </div>
    </div>
  );
};

export default WatchLessons;
