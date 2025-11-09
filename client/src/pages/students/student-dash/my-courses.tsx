/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import MyCourseCard from "./my-course-card";
import { getCourseByStudent } from "../../../api/endpoints/course/course";
import { toast } from "react-toastify";
import type { CourseInterface } from "../../../types/course";
import { Link } from "react-router-dom";
import ProfileCardShimmer from "../../../components/shimmer/profile-card-shimmer";

type Props = Record<string, unknown>;

const extractCourses = (response: any): CourseInterface[] => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.courses)) return payload.courses;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

const MyCourses: React.FC<Props> = () => {
  const [courses, setCourses] = useState<CourseInterface[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCourseByStudent();
      const list = extractCourses(response);
      setCourses(list);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.data?.message ||
          "An error occurred",
        { position: toast.POSITION.BOTTOM_RIGHT }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-11/12">
        <div>
          <div className="w-full pt-5 pb-2">
            <h2 className="text-3xl font-semibold text-customFontColorBlack">
              Watch Courses
            </h2>
          </div>
          <div className="pt-3 mb-2">
            <h5 className="font-semibold text-customFontColorBlack">
              MY COURSES
            </h5>
          </div>
        </div>

        <div className="flex h-full pb-10 gap-x-10">
          <div className="w-full h-full bg-white rounded-md">
            <div className="flex flex-wrap items-center justify-center pt-10 pb-10 bg-white border border-gray-300 rounded-md gap-x-10 gap-y-5">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <ProfileCardShimmer key={index} />
                ))
              ) : courses && courses.length > 0 ? (
                courses.map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id}>
                    <MyCourseCard {...course} />
                  </Link>
                ))
              ) : (
                <div className="text-sm text-center text-gray-700">
                  Please enroll into a course.{" "}
                  <Link
                    to="/courses"
                    className="font-semibold text-blue-500 underline"
                  >
                    View available courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
