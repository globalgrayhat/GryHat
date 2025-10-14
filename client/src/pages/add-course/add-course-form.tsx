import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { addCourse } from "../../api/endpoints/course/course";
import { getAllCategories } from "../../api/endpoints/category";
import { ApiResponseCategory } from "../../api/types/apiResponses/api-response-category";

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
  videoSource: string;
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
  tags: Yup.string(),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .when("isPaid", {
      is: true,
      then: (schema) => schema.required("Price is required for paid courses"),
      otherwise: (schema) => schema.notRequired(),
    }),
  isPaid: Yup.boolean(),
  about: Yup.string(),
  description: Yup.string(),
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
        .required("Introduction video file is required for local/S3")
        .test(
          "fileType",
          "Unsupported File Format",
          (value) =>
            !value ||
            (value &&
              ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"].includes(
                (value as File).type
              ))
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  guidelinesFile: Yup.mixed().notRequired(),
  thumbnailFile: Yup.mixed().notRequired(),
});

const AddCourseForm: React.FC = () => {
  const [categories, setCategories] = useState<ApiResponseCategory[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
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
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Create Course
      </h1>
      <Formik
        initialValues={initialValues}
        validationSchema={AddCourseValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                  Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Course title"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-900">
                  Duration (weeks)
                </label>
                <Field
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="e.g., 8"
                  min={1}
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="duration"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-900">
                  Category
                </label>
                <Field
                  as="select"
                  id="categoryId"
                  name="categoryId"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories?.map(({ _id, name }) => (
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
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-900">
                  Level
                </label>
                <Field
                  as="select"
                  id="level"
                  name="level"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Field>
                <ErrorMessage
                  name="level"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-900">
                  Tags (comma separated)
                </label>
                <Field
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="e.g., React, JavaScript, Web"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="tags"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Is Paid */}
              <div className="flex items-center space-x-3 md:col-span-2">
                <Field
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="isPaid" className="text-sm font-medium text-gray-900">
                  Paid Course?
                </label>
              </div>

              {/* Price */}
              {values.isPaid && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                    Price ($)
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min={0}
                    className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              {/* About */}
              <div className="md:col-span-2">
                <label htmlFor="about" className="block text-sm font-medium text-gray-900">
                  About
                </label>
                <Field
                  as="textarea"
                  id="about"
                  name="about"
                  rows={3}
                  placeholder="Brief about the course"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="about"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Detailed description"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Syllabus */}
              <div className="md:col-span-2">
                <label htmlFor="syllabus" className="block text-sm font-medium text-gray-900">
                  Syllabus (one topic per line)
                </label>
                <Field
                  as="textarea"
                  id="syllabus"
                  name="syllabus"
                  rows={4}
                  placeholder="Write syllabus topics each on a new line"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="syllabus"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Requirements */}
              <div className="md:col-span-2">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-900">
                  Requirements (one per line)
                </label>
                <Field
                  as="textarea"
                  id="requirements"
                  name="requirements"
                  rows={3}
                  placeholder="Write requirements each on a new line"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="requirements"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Video Source */}
              <div>
                <label htmlFor="videoSource" className="block text-sm font-medium text-gray-900">
                  Video Source
                </label>
                <Field
                  as="select"
                  id="videoSource"
                  name="videoSource"
                  className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="local">Local Upload</option>
                  <option value="s3">S3 Upload</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </Field>
                <ErrorMessage
                  name="videoSource"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Introduction File Upload (only for local or s3) */}
              {(values.videoSource === "local" || values.videoSource === "s3") && (
                <div>
                  <label
                    htmlFor="introductionFile"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Introduction Video File
                  </label>
                  <input
                    id="introductionFile"
                    name="introductionFile"
                    type="file"
                    accept="video/*"
                    onChange={(event) => {
                      if (event.currentTarget.files) {
                        setFieldValue("introductionFile", event.currentTarget.files[0]);
                      }
                    }}
                    className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="introductionFile"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              {/* Video URL Input (only for YouTube/Vimeo) */}
              {(values.videoSource === "youtube" || values.videoSource === "vimeo") && (
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-900">
                    Video URL
                  </label>
                  <Field
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    placeholder={`Enter ${values.videoSource} video URL`}
                    className="mt-2 block w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="videoUrl"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              {/* Guidelines File Upload */}
              <div className="md:col-span-2">
                <label
                  htmlFor="guidelinesFile"
                  className="block text-sm font-medium text-gray-900"
                >
                  Guidelines File (optional)
                </label>
                <input
                  id="guidelinesFile"
                  name="guidelinesFile"
                  type="file"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue("guidelinesFile", event.currentTarget.files[0]);
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="guidelinesFile"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Thumbnail File Upload */}
              <div className="md:col-span-2">
                <label
                  htmlFor="thumbnailFile"
                  className="block text-sm font-medium text-gray-900"
                >
                  Thumbnail Image (optional)
                </label>
                <input
                  id="thumbnailFile"
                  name="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue("thumbnailFile", event.currentTarget.files[0]);
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="thumbnailFile"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="mt-8 w-full rounded bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading || isSubmitting ? "Submitting..." : "Add Course"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCourseForm;
