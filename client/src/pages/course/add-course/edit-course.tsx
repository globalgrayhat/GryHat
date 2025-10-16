/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getIndividualCourse, editCourse } from "../../../api/endpoints/course/course";
import { getAllCategories } from "../../../api/endpoints/category";
import type { ApiResponseCategory } from "../../../api/types/apiResponses/api-response-category";
import { useParams, useNavigate } from "react-router-dom";
import type { CourseInterface } from "../../../types/course";

interface CourseFormValues {
  title: string;
  duration: number | "";
  categoryId: string;
  level: string;
  tags: string; // comma separated string
  price: number | "";
  isPaid: boolean;
  about: string;
  description: string;
  syllabus: string; // multiline string
  requirements: string; // multiline string
  videoSource: "local" | "s3" | "youtube" | "vimeo" | "";
  videoUrl: string;
  introductionFile: File | null;
  guidelinesFile: File | null;
  thumbnailFile: File | null;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().notRequired(),
  duration: Yup.number()
    .typeError("Duration must be a number")
    .positive("Duration must be positive")
    .notRequired(),
  categoryId: Yup.string().notRequired(),
  level: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced", ""], "Invalid level")
    .notRequired(),
  tags: Yup.string().notRequired(),
  isPaid: Yup.boolean().notRequired(),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .when("isPaid", {
      is: true,
      then: (schema) => schema.required("Price is required for paid courses"),
      otherwise: (schema) => schema.notRequired(),
    }),
  about: Yup.string().notRequired(),
  description: Yup.string().notRequired(),
  syllabus: Yup.string().notRequired(),
  requirements: Yup.string().notRequired(),
  videoSource: Yup.string()
    .oneOf(["local", "s3", "youtube", "vimeo", ""], "Invalid video source")
    .notRequired(),
  videoUrl: Yup.string().when("videoSource", {
    is: (val: string) => val === "youtube" || val === "vimeo",
    then: (schema) => schema.required("Video URL is required").url("Must be a valid URL"),
    otherwise: (schema) => schema.notRequired(),
  }),
  introductionFile: Yup.mixed().notRequired(),
  guidelinesFile: Yup.mixed().notRequired(),
  thumbnailFile: Yup.mixed().notRequired(),
});

const transformCourseToFormValues = (course: CourseInterface): CourseFormValues => ({
  title: course.title || "",
  duration: course.duration || "",
  categoryId: course.category || "",
  level: course.level || "",
  tags: (course.tags && course.tags.join(", ")) || "",
  price: course.price || "",
  isPaid: !!course.isPaid,
  about: course.about || "",
  description: course.description || "",
  syllabus: (course.syllabus && course.syllabus.join("\n")) || "",
  requirements: (course.requirements && course.requirements.join("\n")) || "",
  videoSource: (course.introduction as any)?.source || "",
  videoUrl:
    (course.introduction as any)?.source === "youtube" || (course.introduction as any)?.source === "vimeo"
      ? (course.introduction as any)?.url || ""
      : "",
  introductionFile: null,
  guidelinesFile: null,
  thumbnailFile: null,
});

const prepareFormData = (
  values: CourseFormValues,
  initialValues: CourseFormValues
): FormData => {
  const formData = new FormData();

  const addIfChanged = (key: keyof CourseFormValues, value: any, initialValue: any) => {
    if (["tags", "syllabus", "requirements"].includes(key)) {
      const currentArray = (value as string)
        .split("\n")
        .join(",")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const initialArray = (initialValue as string)
        .split("\n")
        .join(",")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (JSON.stringify(currentArray) !== JSON.stringify(initialArray)) {
        if (key === "tags") currentArray.forEach((tag) => formData.append("tags[]", tag));
        else if (key === "syllabus") currentArray.forEach((item) => formData.append("syllabus[]", item));
        else if (key === "requirements") currentArray.forEach((item) => formData.append("requirements[]", item));
      }
    } else if (value instanceof File) {
      if (value) {
        if (key === "introductionFile") formData.append("introduction", value);
        else if (key === "guidelinesFile") formData.append("guidelines", value);
        else if (key === "thumbnailFile") formData.append("thumbnail", value);
      }
    } else {
      if (value !== initialValue) {
        formData.append(key, String(value));
      }
    }
  };

  (Object.keys(values) as Array<keyof CourseFormValues>).forEach((key) => {
    addIfChanged(key, values[key], initialValues[key]);
  });

  return formData;
};

const EditCourseForm: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ApiResponseCategory[]>([]);
  const [initialValues, setInitialValues] = useState<CourseFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID missing");
      navigate(-1);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, categoriesRes] = await Promise.all([
          getIndividualCourse(courseId),
          getAllCategories(),
        ]);
        const course = courseRes.data.data;
        setCategories(categoriesRes.data);

        const formVals = transformCourseToFormValues(course);
        setInitialValues(formVals);
      } catch (error) {
        toast.error("Failed to fetch course data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const onSubmit = async (
    values: CourseFormValues,
    { setSubmitting }: FormikHelpers<CourseFormValues>
  ) => {
    if (!initialValues || !courseId) return;

    try {
      setSubmitting(true);
      const formData = prepareFormData(values, initialValues);

      if (formData.entries().next().done) {
        toast.info("No changes detected");
        setSubmitting(false);
        return;
      }

      const toastId = toast.loading("Updating course...");
      await editCourse(courseId, formData);
      toast.update(toastId, {
        render: "Course updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading course data...</p>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Unable to load course data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow mt-10" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Course</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block mb-1 font-medium">
                Title
              </label>
              <Field
                id="title"
                name="title"
                placeholder="Course Title"
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label htmlFor="duration" className="block mb-1 font-medium">
                Duration (weeks)
              </label>
              <Field
                type="number"
                id="duration"
                name="duration"
                min={1}
                placeholder="Duration in weeks"
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="duration" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label htmlFor="categoryId" className="block mb-1 font-medium">
                Category
              </label>
              <Field
                as="select"
                id="categoryId"
                name="categoryId"
                className="w-full border rounded p-2"
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
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Level */}
            <div className="mb-4">
              <label htmlFor="level" className="block mb-1 font-medium">
                Level
              </label>
              <Field
                as="select"
                id="level"
                name="level"
                className="w-full border rounded p-2"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Field>
              <ErrorMessage name="level" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label htmlFor="tags" className="block mb-1 font-medium">
                Tags (comma separated)
              </label>
              <Field
                id="tags"
                name="tags"
                placeholder="e.g. React, JavaScript"
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="tags" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Is Paid & Price */}
            <div className="mb-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <Field
                  type="checkbox"
                  name="isPaid"
                  checked={values.isPaid}
                  onChange={() => setFieldValue("isPaid", !values.isPaid)}
                />
                <span>Paid Course?</span>
              </label>

              {values.isPaid && (
                <div className="flex-1">
                  <label htmlFor="price" className="block mb-1 font-medium">
                    Price
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min={0}
                    placeholder="Course price"
                    className="w-full border rounded p-2"
                  />
                  <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              )}
            </div>

            {/* About */}
            <div className="mb-4">
              <label htmlFor="about" className="block mb-1 font-medium">
                About
              </label>
              <Field
                as="textarea"
                id="about"
                name="about"
                rows={3}
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="about" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block mb-1 font-medium">
                Description
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={5}
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Syllabus */}
            <div className="mb-4">
              <label htmlFor="syllabus" className="block mb-1 font-medium">
                Syllabus (one topic per line)
              </label>
              <Field
                as="textarea"
                id="syllabus"
                name="syllabus"
                rows={5}
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="syllabus" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <label htmlFor="requirements" className="block mb-1 font-medium">
                Requirements (one requirement per line)
              </label>
              <Field
                as="textarea"
                id="requirements"
                name="requirements"
                rows={5}
                className="w-full border rounded p-2"
              />
              <ErrorMessage name="requirements" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Video Source */}
            <div className="mb-4">
              <label htmlFor="videoSource" className="block mb-1 font-medium">
                Introduction Video Source
              </label>
              <Field
                as="select"
                id="videoSource"
                name="videoSource"
                className="w-full border rounded p-2"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFieldValue("videoSource", e.target.value);
                  if (e.target.value !== "youtube" && e.target.value !== "vimeo") {
                    setFieldValue("videoUrl", "");
                  }
                }}
              >
                <option value="">Select Source</option>
                <option value="local">Local</option>
                <option value="s3">S3</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </Field>
              <ErrorMessage
                name="videoSource"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Video URL */}
            {(values.videoSource === "youtube" || values.videoSource === "vimeo") && (
              <div className="mb-4">
                <label htmlFor="videoUrl" className="block mb-1 font-medium">
                  Video URL
                </label>
                <Field
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  placeholder="https://..."
                  className="w-full border rounded p-2"
                />
                <ErrorMessage name="videoUrl" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            )}

            {/* Introduction File */}
            {(values.videoSource === "local" || values.videoSource === "s3") && (
              <div className="mb-4">
                <label htmlFor="introductionFile" className="block mb-1 font-medium">
                  Introduction Video File
                </label>
                <input
                  id="introductionFile"
                  name="introductionFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.currentTarget.files && e.currentTarget.files[0]) {
                      setFieldValue("introductionFile", e.currentTarget.files[0]);
                    } else {
                      setFieldValue("introductionFile", null);
                    }
                  }}
                  className="w-full border rounded p-2"
                />
                <ErrorMessage
                  name="introductionFile"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            {/* Guidelines File */}
            <div className="mb-4">
              <label htmlFor="guidelinesFile" className="block mb-1 font-medium">
                Guidelines File (PDF or DOC)
              </label>
              <input
                id="guidelinesFile"
                name="guidelinesFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.currentTarget.files && e.currentTarget.files[0]) {
                    setFieldValue("guidelinesFile", e.currentTarget.files[0]);
                  } else {
                    setFieldValue("guidelinesFile", null);
                  }
                }}
                className="w-full border rounded p-2"
              />
              <ErrorMessage
                name="guidelinesFile"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Thumbnail File */}
            <div className="mb-6">
              <label htmlFor="thumbnailFile" className="block mb-1 font-medium">
                Thumbnail Image
              </label>
              <input
                id="thumbnailFile"
                name="thumbnailFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.currentTarget.files && e.currentTarget.files[0]) {
                    setFieldValue("thumbnailFile", e.currentTarget.files[0]);
                  } else {
                    setFieldValue("thumbnailFile", null);
                  }
                }}
                className="w-full border rounded p-2"
              />
              <ErrorMessage
                name="thumbnailFile"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
            >
              {isSubmitting ? "Updating..." : "Update Course"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditCourseForm;
