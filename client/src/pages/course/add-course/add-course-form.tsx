/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Formik,
  Field,
  Form,
  ErrorMessage,
  type FormikHelpers,
} from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  BookOpenIcon,
  ClockIcon,
  TagIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  DocumentArrowUpIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { addCourse } from "../../../api/endpoints/course/course";
import { getAllCategories } from "../../../api/endpoints/category";
import type { ApiResponseCategory } from "../../../api/types/apiResponses/api-response-category";

interface CourseFormValues {
  title: string;
  duration: number | "";
  categoryId: string;
  level: string;
  tags: string;
  price: number | "";
  isPaid: boolean;
  about: string;
  description: string;
  syllabus: string;
  requirements: string;
  videoSource: "local" | "s3" | "youtube" | "vimeo";
  videoUrl: string;
  introductionFile: File | null;
  guidelinesFile: File | null;
  thumbnailFile: File | null;
}

const initialValues: CourseFormValues = {
  title: "",
  duration: "",
  categoryId: "",
  level: "",
  tags: "",
  price: "",
  isPaid: false,
  about: "",
  description: "",
  syllabus: "",
  requirements: "",
  videoSource: "local",
  videoUrl: "",
  introductionFile: null,
  guidelinesFile: null,
  thumbnailFile: null,
};

const AddCourseValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  duration: Yup.number()
    .typeError("Duration must be a number")
    .positive("Duration must be positive")
    .required("Duration is required"),
  categoryId: Yup.string().required("Category is required"),
  level: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced"], "Invalid level")
    .required("Level is required"),
  tags: Yup.string().notRequired(),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .when("isPaid", {
      is: true,
      then: (schema) => schema.required("Price is required for paid courses"),
      otherwise: (schema) => schema.notRequired(),
    }),
  isPaid: Yup.boolean(),
  about: Yup.string().max(1000, "Too long"),
  description: Yup.string().max(3000, "Too long"),
  syllabus: Yup.string(),
  requirements: Yup.string(),
  videoSource: Yup.string()
    .oneOf(["local", "s3", "youtube", "vimeo"])
    .required("Video source is required"),
  videoUrl: Yup.string().when("videoSource", {
    is: (val: string) => val === "youtube" || val === "vimeo",
    then: (schema) =>
      schema
        .required("Video URL is required for YouTube/Vimeo")
        .url("Must be a valid URL"),
    otherwise: (schema) => schema.notRequired(),
  }),
  introductionFile: Yup.mixed().when("videoSource", {
    is: (val: string) => val === "local" || val === "s3",
    then: (schema) =>
      schema
        .required("Introduction video file is required")
        .test(
          "fileType",
          "Unsupported file format",
          (value) =>
            !value ||
            ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"].includes(
              (value as File).type
            )
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  guidelinesFile: Yup.mixed().notRequired(),
  thumbnailFile: Yup.mixed().notRequired(),
});

/**
 * AddCourseForm
 * - Fully responsive layout (1 column on mobile, 2 on md+)
 * - Consistent icons and spacing
 * - Dark mode friendly
 */
const AddCourseForm: React.FC = () => {
  const [categories, setCategories] = useState<ApiResponseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  const handleSubmit = async (
    values: CourseFormValues,
    { resetForm }: FormikHelpers<CourseFormValues>
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("duration", String(values.duration));
      formData.append("categoryId", values.categoryId);
      formData.append("level", values.level);

      values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append("tags[]", tag));

      formData.append("price", String(values.price || 0));
      formData.append("isPaid", String(values.isPaid));
      formData.append("about", values.about);
      formData.append("description", values.description);

      values.syllabus
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((syll) => formData.append("syllabus[]", syll));

      values.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)
        .forEach((req) => formData.append("requirements[]", req));

      formData.append("videoSource", values.videoSource);

      if (values.videoSource === "youtube" || values.videoSource === "vimeo") {
        formData.append("videoUrl", values.videoUrl);
      }

      if (
        (values.videoSource === "local" || values.videoSource === "s3") &&
        values.introductionFile
      ) {
        formData.append("introduction", values.introductionFile);
      }

      if (values.guidelinesFile) {
        formData.append("guidelines", values.guidelinesFile);
      }
      if (values.thumbnailFile) {
        formData.append("thumbnail", values.thumbnailFile);
      }

      const response = await addCourse(formData);
      toast.success(response.data.message || "Course added successfully");
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-5xl p-4 mx-auto my-6 bg-white border border-gray-200 shadow-sm rounded-2xl sm:p-6 md:p-8 dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 text-blue-600 rounded-2xl bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400"
        >
          <BookOpenIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Create a new course
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Fill in the course details, media, and requirements.
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={AddCourseValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Main grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <BookOpenIcon className="w-4 h-4 text-blue-500" />
                  Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Course title"
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="duration"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  Duration (weeks)
                </label>
                <Field
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="e.g., 8"
                  min={1}
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="duration"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Category
                </label>
                <Field
                  as="select"
                  id="categoryId"
                  name="categoryId"
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">Select category</option>
                  {categories.map(({ _id, name }) => (
                    <option key={_id} value={_id}>
                      {name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="categoryId"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Level */}
              <div>
                <label
                  htmlFor="level"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                  Level
                </label>
                <Field
                  as="select"
                  id="level"
                  name="level"
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Field>
                <ErrorMessage
                  name="level"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label
                  htmlFor="tags"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <TagIcon className="w-4 h-4 text-blue-500" />
                  Tags (comma separated)
                </label>
                <Field
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="React, JavaScript, Web"
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="tags"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Paid switch + price */}
              <div className="flex items-center gap-2 md:col-span-2">
                <Field
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isPaid"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Paid course?
                </label>
              </div>

              {values.isPaid && (
                <div>
                  <label
                    htmlFor="price"
                    className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                    Price
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min={0}
                    className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
              )}

              {/* About */}
              <div className="md:col-span-2">
                <label
                  htmlFor="about"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Short overview
                </label>
                <Field
                  as="textarea"
                  id="about"
                  name="about"
                  rows={3}
                  placeholder="A brief summary of what this course offers..."
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="about"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Detailed description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Explain the course content, outcomes, and structure..."
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Syllabus */}
              <div className="md:col-span-2">
                <label
                  htmlFor="syllabus"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Syllabus (one topic per line)
                </label>
                <Field
                  as="textarea"
                  id="syllabus"
                  name="syllabus"
                  rows={4}
                  placeholder="Module 1: ...
Module 2: ...
Module 3: ..."
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="syllabus"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Requirements */}
              <div className="md:col-span-2">
                <label
                  htmlFor="requirements"
                  className="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  Requirements (one per line)
                </label>
                <Field
                  as="textarea"
                  id="requirements"
                  name="requirements"
                  rows={3}
                  placeholder="Basic programming knowledge
Internet connection
..."
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <ErrorMessage
                  name="requirements"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Video source */}
              <div>
                <label
                  htmlFor="videoSource"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <VideoCameraIcon className="w-4 h-4 text-blue-500" />
                  Introduction video source
                </label>
                <Field
                  as="select"
                  id="videoSource"
                  name="videoSource"
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue("videoSource", e.target.value);
                    if (e.target.value === "youtube" || e.target.value === "vimeo") {
                      setFieldValue("introductionFile", null);
                    } else {
                      setFieldValue("videoUrl", "");
                    }
                  }}
                >
                  <option value="local">Local upload</option>
                  <option value="s3">S3 upload</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </Field>
                <ErrorMessage
                  name="videoSource"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Intro file (local / s3) */}
              {(values.videoSource === "local" ||
                values.videoSource === "s3") && (
                <div>
                  <label
                    htmlFor="introductionFile"
                    className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    <DocumentArrowUpIcon className="w-4 h-4 text-blue-500" />
                    Introduction video file
                  </label>
                  <input
                    id="introductionFile"
                    name="introductionFile"
                    type="file"
                    accept="video/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      setFieldValue("introductionFile", file || null);
                    }}
                    className="w-full px-3 py-2 mt-1 text-xs text-gray-700 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  />
                  <ErrorMessage
                    name="introductionFile"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
              )}

              {/* Video URL (YouTube / Vimeo) */}
              {(values.videoSource === "youtube" ||
                values.videoSource === "vimeo") && (
                <div>
                  <label
                    htmlFor="videoUrl"
                    className="text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    Video URL
                  </label>
                  <Field
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    placeholder={`Enter ${values.videoSource} video URL`}
                    className="w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <ErrorMessage
                    name="videoUrl"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
              )}

              {/* Guidelines */}
              <div className="md:col-span-2">
                <label
                  htmlFor="guidelinesFile"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <DocumentArrowUpIcon className="w-4 h-4 text-gray-500" />
                  Guidelines file (optional)
                </label>
                <input
                  id="guidelinesFile"
                  name="guidelinesFile"
                  type="file"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setFieldValue("guidelinesFile", file || null);
                  }}
                  className="w-full px-3 py-2 mt-1 text-xs text-gray-700 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                <ErrorMessage
                  name="guidelinesFile"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Thumbnail */}
              <div className="md:col-span-2">
                <label
                  htmlFor="thumbnailFile"
                  className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <PhotoIcon className="w-4 h-4 text-purple-500" />
                  Thumbnail image (optional)
                </label>
                <input
                  id="thumbnailFile"
                  name="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setFieldValue("thumbnailFile", file || null);
                  }}
                  className="w-full px-3 py-2 mt-1 text-xs text-gray-700 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                <ErrorMessage
                  name="thumbnailFile"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className={`
                flex w-full items-center justify-center gap-2 rounded-xl
                bg-blue-600 px-4 py-3 text-sm font-semibold text-white
                transition hover:bg-blue-700
                disabled:cursor-not-allowed disabled:bg-blue-400
              `}
            >
              {loading || isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Create course"
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCourseForm;
