/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { BiVideo } from "react-icons/bi";
import { IoBookSharp } from "react-icons/io5";
import LessonsList from "./LessonsList";

// English comments: Renders syllabus with two modules (Introduction + Lessons).
const SyllabusSection: React.FC<{
  expandedIndex: number | null;
  handleToggle: (i: number) => void;
  introduction?: string | null;
  isSupportedVideo: (u: string) => boolean;
  guidelinesUrl?: string | null;
  openGuidelines: () => void;
  lessons: any[];
}> = ({ expandedIndex, handleToggle, introduction, isSupportedVideo, guidelinesUrl, openGuidelines, lessons }) => {
  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Syllabus</h3>
      <ul className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Module 1: Introduction */}
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
            <div className="p-2.5 sm:p-3 space-y-3">
              {/* Introduction Video */}
              {introduction && isSupportedVideo(introduction) ? (
                <>
                  {introduction.includes("youtube.com") || introduction.includes("youtu.be") ? (
                    <div className="aspect-video w-full">
                      <iframe className="w-full h-full rounded-md" src={introduction.replace("watch?v=","embed/")} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  ) : introduction.includes("vimeo.com") ? (
                    <div className="aspect-video w-full">
                      <iframe className="w-full h-full rounded-md" src={introduction.replace("vimeo.com","player.vimeo.com/video")} title="Vimeo video" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  ) : (
                    <div className="w-full">
                      <video controls className="w-full rounded-md" src={introduction}>Your browser does not support the video tag.</video>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 opacity-70"><BiVideo /><span className="flex-1">No introduction video provided</span></div>
              )}

              {/* Guidelines Document */}
              {guidelinesUrl ? (
                <button type="button" onClick={openGuidelines} className="flex items-center justify-between w-full gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2"><IoBookSharp className="text-blue-500 text-lg sm:text-xl" /><span className="text-sm sm:text-base font-medium">Important guidelines</span></div>
                  <div className="rounded-full text-xs sm:text-sm">FILE</div>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 opacity-70 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2"><IoBookSharp className="text-gray-500 text-lg sm:text-xl" /><span className="text-sm sm:text-base">No guidelines provided</span></div>
                </div>
              )}
            </div>
          )}
        </li>

        {/* Module 2: Lessons */}
        <li className="border-b border-gray-200 dark:border-gray-700">
          <button type="button" onClick={() => handleToggle(1)} className={`flex w-full items-center gap-2 p-2.5 sm:p-3 text-left text-sm sm:text-base transition hover:bg-gray-50 dark:hover:bg-gray-700/60 ${expandedIndex === 1 ? "bg-gray-50 dark:bg-gray-700/60" : ""}`}>
            <span className="text-blue-500 text-lg sm:text-base">•</span>
            <span className="flex-1">Module 2: Course Lessons</span>
            {expandedIndex === 1 ? <FaAngleUp /> : <FaAngleDown />}
          </button>
          {expandedIndex === 1 && <LessonsList lessons={lessons} />}
        </li>
      </ul>
    </section>
  );
};

export default SyllabusSection;
