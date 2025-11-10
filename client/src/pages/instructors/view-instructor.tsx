import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getIndividualInstructors } from "../../api/endpoints/instructor-management";
import type { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";
import { toast } from "react-toastify";
import { Avatar } from "@material-tailwind/react";
import ViewInstructorShimmer from "../../components/shimmer/view-instructor-shimmer";
import { getFullUrl } from "../../utils/helpers";

const ViewInstructor: React.FC = () => {
  const [instructor, setInstructor] = useState<InstructorApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { tutorId } = useParams<{ tutorId: string }>();

  // Fetch instructor data
  const fetchInstructor = useCallback(async () => {
    if (!tutorId) return;
    try {
      setIsLoading(true);
      const response = await getIndividualInstructors(tutorId);
      setInstructor(response?.data?.data || null);
    } catch {
      toast.error("Something went wrong", { position: toast.POSITION.BOTTOM_RIGHT });
      setInstructor(null);
    } finally {
      setIsLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchInstructor();
  }, [fetchInstructor]);

  if (isLoading) return <ViewInstructorShimmer />;

  if (!instructor) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-600 dark:text-gray-400">Instructor not found or no longer available.</p>
      </div>
    );
  }

  const avatarSrc = instructor.profilePic?.url
    ? getFullUrl(instructor.profilePic.url)
    : "https://img.freepik.com/free-icon/user_318-159711.jpg";

  const coverSrc = instructor.profilePic?.url
    ? getFullUrl(instructor.profilePic.url)
    : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80";

  return (
    <section className="transition-colors bg-white dark:bg-gray-900">
      {/* Cover / Banner */}
      <div className="relative w-full h-40 overflow-hidden md:h-56 rounded-b-2xl">
        <img
          src={coverSrc}
          alt="Instructor Cover"
          className="object-cover object-center w-full h-full"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      </div>

      {/* Profile Avatar and Name */}
      <div className="container flex flex-col items-center px-4 mx-auto -mt-10 md:-mt-16">
        <Avatar
          src={avatarSrc}
          alt="Instructor Avatar"
          size="xxl"
          className="border-4 border-white shadow-lg dark:border-gray-900"
        />
        <h1 className="mt-3 text-2xl font-bold text-center text-gray-900 md:text-3xl dark:text-gray-100">
          {(instructor.firstName || "") + " " + (instructor.lastName || "")}
        </h1>
        {instructor.title && (
          <p className="mt-1 text-base font-medium text-center text-blue-600 md:text-lg dark:text-blue-300">
            {instructor.title}
          </p>
        )}
      </div>

      {/* Card Content */}
      <div className="container px-4 mx-auto mt-6 md:mt-10">
        <div className="bg-white dark:bg-[#111827] shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6 md:p-10 space-y-6">
          
          {/* About Me */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl dark:text-gray-100">
              About Me
            </h2>
            <p className="text-sm leading-7 text-gray-700 whitespace-pre-line md:text-base dark:text-gray-300">
              {instructor.about || "No biography provided."}
            </p>
          </section>

          {/* Skills */}
          {instructor.skills && (
            <section>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl dark:text-gray-100">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {instructor.skills.split(",").map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full md:text-sm bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Qualification and Experience */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-4 shadow-inner bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-1 text-sm text-gray-500 dark:text-gray-400">Qualification</h3>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {instructor.qualification || "Not specified"}
              </p>
            </div>
            <div className="p-4 shadow-inner bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-1 text-sm text-gray-500 dark:text-gray-400">Experience</h3>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {instructor.experience || "Not specified"}
              </p>
            </div>
          </div>

          {/* Optional Courses */}
          {/* {instructor.courses && instructor.courses.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl dark:text-gray-100">
                Courses
              </h2>
              <ul className="space-y-1 text-gray-700 list-disc list-inside dark:text-gray-300">
                {instructor.courses.map((course, idx) => (
                  <li key={idx}>{course.title}</li>
                ))}
              </ul>
            </section>
          )} */}
        </div>
      </div>

      <div className="pb-16" />
    </section>
  );
};

export default ViewInstructor;
