import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getIndividualInstructors } from "../../api/endpoints/instructor-management";
import type { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";
import { toast } from "react-toastify";
import { Avatar } from "@material-tailwind/react";
import ViewInstructorShimmer from "../../components/shimmer/view-instructor-shimmer";
import { getFullUrl } from "../../utils/helpers";

const ViewInstructor: React.FC = () => {
  const [instructor, setInstructor] = useState<InstructorApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { tutorId } = useParams<{ tutorId: string }>();

  const fetchInstructor = useCallback(async () => {
    if (!tutorId) return;
    try {
      setIsLoading(true);
      const response = await getIndividualInstructors(tutorId);
      setInstructor(response?.data?.data || null);
    } catch {
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setInstructor(null);
    } finally {
      setIsLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    const scrollPosition = window.pageYOffset;
    window.scrollTo(0, 0);
    return () => window.scrollTo(0, scrollPosition);
  }, []);

  useEffect(() => {
    fetchInstructor();
  }, [fetchInstructor]);

  if (isLoading) return <ViewInstructorShimmer />;

  if (!instructor) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-600">
          Instructor not found or no longer available.
        </p>
      </div>
    );
  }

  const avatarSrc = instructor.profilePic?.url
    ? getFullUrl(instructor.profilePic.url)
    : "https://img.freepik.com/free-icon/user_318-159711.jpg";

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col items-center justify-center w-full px-4 py-10 md:py-14 bg-skyBlueCustom">
        <h1 className="text-3xl font-bold md:text-4xl text-customFontColorBlack">
          Our Instructors
        </h1>
        <p className="mt-2 text-lg font-semibold md:text-xl text-customFontColorBlack">
          Meet Gray Hat Subject Experts
        </p>
      </div>

      {/* Card */}
      <div className="flex justify-center px-4 -mt-10 md:-mt-16">
        <div className="flex flex-col w-full max-w-4xl gap-6 p-5 bg-white border border-gray-200 shadow-xl rounded-2xl md:p-8 md:flex-row">
          {/* Left: Avatar */}
          <div className="flex justify-center w-full md:w-1/4 md:justify-start">
            <div className="flex flex-col items-center">
              <Avatar
                className="w-32 h-32 mx-auto"
                src={avatarSrc}
                alt="avatar"
                size="xxl"
              />
              <h3 className="mt-3 text-lg font-semibold text-center text-gray-900">
                {(instructor.firstName || "") +
                  " " +
                  (instructor.lastName || "")}
              </h3>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full space-y-5 md:w-3/4 text-customFontColorBlack">
            <section>
              <h2 className="mb-1 text-lg font-semibold">About Me</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {instructor.about || "No biography provided."}
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-semibold">Skills</h2>
              <p className="text-sm text-gray-700">
                {instructor.skills || "Not specified."}
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-semibold">Qualification</h2>
              <p className="text-sm text-gray-700">
                {instructor.qualification || "Not specified."}
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-semibold">Experience</h2>
              <p className="text-sm text-gray-700">
                {instructor.experience || "Not specified."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInstructor;
