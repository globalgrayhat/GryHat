import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import { AddCourseValidationSchema } from "../../../validations/course/AddCourse";
import { Switch } from "@material-tailwind/react";
import { addCourse } from "../../../api/endpoints/course/course";
import { toast } from "react-toastify";
import { getAllCategories } from "../../../api/endpoints/category";
import { ApiResponseCategory } from "../../../api/types/apiResponses/api-response-category";
import { PhotoIcon, VideoCameraIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface CourseFormValues {
  title: string;
  duration: string;
  category: string;
  level: string;
  tags: string;
  about: string;
  description: string;
  syllabus: string;
  requirements: string;
  price: string;
  [key: string]: string;
}

const initialValues = {
  title: "",
  duration: "",
  category: "",
  level: "",
  tags: "",
  about: "",
  description: "",
  syllabus: "",
  requirements: "",
  price: "",
};

const CombinedForm: React.FC = () => {
  const [paid, setPaid] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [guidelines, setGuidelines] = useState<File | null>(null);
  const [introduction, setIntroduction] = useState<File | null>(null);
  const [categories, setCategories] = useState<ApiResponseCategory[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (
    values: CourseFormValues,
    { resetForm }: FormikHelpers<CourseFormValues>
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();
      guidelines && formData.append("guidelines", guidelines);
      thumbnail && formData.append("thumbnail", thumbnail);
      introduction && formData.append("introduction", introduction);
      Object.keys(values).forEach((key) => formData.append(key, values[key]));
      const response = await addCourse(formData);
      toast.success(response.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      resetForm();
      setGuidelines(null);
      setThumbnail(null);
      setIntroduction(null);
    } catch (error: any) {
      toast.error(error.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handlePaid = () => {
    setPaid(!paid);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mb-20">
      <div className="ml-12 pl-20">
        <h1 className="font-bold text-2xl text-gray-800">Create Course</h1>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={AddCourseValidationSchema}
        onSubmit={handleFormSubmit}
      >
        <Form>
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 mx-auto mt-10">
            <div className="space-y-6">
              {/* Title and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Title
                  </label>
                  <Field
                    type="text"
                    id="title"
                    name="title"
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Duration (in weeks)
                  </label>
                  <Field
                    type="number"
                    id="duration"
                    name="duration"
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="duration"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Category
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories?.map(({ _id, name }) => (
                      <option key={_id} value={_id}>
                        {name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Level
                  </label>
                  <Field
                    as="select"
                    id="level"
                    name="level"
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Field>
                  <ErrorMessage
                    name="level"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Tags, Price & Switch for Paid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Tags
                  </label>
                  <Field
                    type="text"
                    id="tags"
                    name="tags"
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="tags"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <Switch id="auto-update" onClick={handlePaid} label="Paid" />
                  </div>
                  {paid && (
                    <div className="mt-3">
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Price
                      </label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* About, Description, Syllabus, and Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-gray-900"
                  >
                    About
                  </label>
                  <Field
                    as="textarea"
                    id="about"
                    name="about"
                    rows={4}
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="about"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Description
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              {/* File Uploads: Guidelines, Thumbnail, Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="guidelines"
                    className="block text-sm font-medium text-gray-900"
                  >
                    <DocumentArrowUpIcon className="h-5 w-5 text-gray-500 inline" />
                    Upload Guidelines (PDF)
                  </label>
                  <input
                    type="file"
                    id="guidelines"
                    name="guidelines"
                    accept="application/pdf"
                    onChange={(event) => setGuidelines(event.target.files?.[0] || null)}
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="guidelines"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="thumbnail"
                    className="block text-sm font-medium text-gray-900"
                  >
                    <PhotoIcon className="h-5 w-5 text-gray-500 inline" />
                    Upload Thumbnail (Image)
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
                    className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="thumbnail"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Introduction Video Upload */}
              <div>
                <label
                  htmlFor="introduction-video"
                  className="block text-sm font-medium text-gray-900"
                >
                  <VideoCameraIcon className="h-5 w-5 text-gray-500 inline" />
                  Upload Introduction Video (MP4, MOV)
                </label>
                <input
                  type="file"
                  id="introduction-video"
                  name="introduction-video"
                  accept="video/*"
                  onChange={(event) => setIntroduction(event.target.files?.[0] || null)}
                  className="block w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="introduction-video"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default CombinedForm;
