import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginStudent } from "../../../api/endpoints/auth/student-auth";
import { studentLoginValidationSchema } from "../../../validations/auth/studentLoginValidation";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthComponent from "../../common/google-auth-component";
<<<<<<< HEAD
import { useDispatch, useSelector } from "react-redux";
import { setToken, selectIsLoggedIn, selectUserType } from "../../../redux/reducers/authSlice";
import { APP_LOGO } from "../../../constants/common";

const StudentLoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get the current user type (e.g., "student", "admin", etc.)
  const userType = useSelector(selectUserType);

  // Check if the user is already logged in
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Form submission handler
  const handleSubmit = async (studentInfo: any) => {
    try {
      const response = await loginStudent(studentInfo);

      // Extract access and refresh tokens from the response payload
      const {
        accessToken,
        refreshToken,
      }: { accessToken: string; refreshToken: string } = response.data.data;

      // Dispatch tokens and user type to Redux
      dispatch(setToken({ accessToken, refreshToken, userType: "student" }));

      // Navigate to home page on success
      if (response?.data?.status === "success") {
        navigate("/");
      }
    } catch (error: any) {
      // Handle server or network errors
      toast.error(error?.response?.data?.message || "Login failed", {
=======
import { useDispatch } from "react-redux";
import { setToken } from "../../../redux/reducers/authSlice";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../../redux/reducers/authSlice";
import { APP_LOGO } from "../../../constants/common";
import { selectUserType } from "../../../redux/reducers/authSlice";
const StudentLoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUserType)
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const handleSubmit = async (studentInfo: any) => {
    try {
      const response = await loginStudent(studentInfo);
      const {
        accessToken,
        refreshToken,
      }: { accessToken: string; refreshToken: string } = response.data;
      dispatch(setToken({ accessToken, refreshToken,userType:"student" }));
      response?.data?.status === "success" && navigate("/");
    } catch (error: any) {
      toast.error(error?.data?.message, {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

<<<<<<< HEAD
  // Redirect if already logged in as a student
  useEffect(() => {
    if (isLoggedIn && userType === "student") {
      navigate("/");
    }
  }, [isLoggedIn, userType, navigate]);

  return (
    <div className="m-5">
      <div className="flex justify-center items-center mt-16 text-customFontColorBlack">
        <div className="bg-white rounded-lg mx-4 shadow-xl border p-8 w-full max-w-md md:mx-auto md:p-10 lg:p-12">
          
          {/* App logo */}
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img className="mx-auto h-10 w-auto" src={APP_LOGO} alt="Your Company" />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          {/* Formik form */}
=======
  useEffect(() => {
    if (isLoggedIn&&user==="student") {  
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="m-5 ">
      <div className='flex justify-center items-center mt-16  text-customFontColorBlack'>
        <div className='bg-white rounded-lg mx-4 shadow-xl border p-8 w-full max-w-md md:mx-auto md:p-10 lg:p-12'>
          <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
            <img
              className='mx-auto h-10 w-auto'
              src={APP_LOGO}
              alt='Your Company'
            />
            <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
              Sign in to your account
            </h2>
          </div>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={studentLoginValidationSchema}
            onSubmit={handleSubmit}
          >
<<<<<<< HEAD
            <Form className="mt-10 space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 focus-visible:outline-none sm:text-sm sm:leading-6"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  <div className="text-sm">
                    <a href="/" className="font-semibold text-blue-600 hover:text-indigo-500">
=======
            <Form className='mt-10 space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Email address
                </label>
                <div className='mt-2'>
                  <Field
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    className=' pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 focus-visible:outline-none focus-visible:ring-blue-600 sm:text-sm sm:leading-6'
                  />
                  <ErrorMessage
                    name='email'
                    component='div'
                    className='text-red-500 text-sm'
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Password
                  </label>
                  <div className='text-sm'>
                    <a
                      href='/'
                      className='font-semibold text-blue-600 hover:text-indigo-500'
                    >
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
                      Forgot password?
                    </a>
                  </div>
                </div>
<<<<<<< HEAD
                <div className="mt-2">
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-700 focus-visible:outline-none sm:text-sm sm:leading-6"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                </div>
              </div>

              {/* Google Auth & Submit Button */}
              <div>
                <div className="m-5">
                  <GoogleAuthComponent />
                </div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
=======
                <div className='mt-2'>
                  <Field
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    className='pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-700 focus-visible:outline-none focus-visible:ring-blue-600 sm:text-sm sm:leading-6'
                  />
                  <ErrorMessage
                    name='password'
                    component='div'
                    className='text-red-500 text-sm'
                  />
                </div>
              </div>

              <div>
                <div className="m-5">
                <GoogleAuthComponent />
                </div>
                <button
                  type='submit'
                  className='flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
                >
                  Sign in
                </button>
              </div>
            </Form>
          </Formik>

<<<<<<< HEAD
          {/* Signup Link */}
          <p className="mt-10 text-center text-sm text-gray-500">
            Don’t have an account?
            <Link to="/register" className="font-semibold text-blue-600 hover:text-indigo-500">
              &nbsp;Sign up
=======
          <p className='mt-10 text-center text-sm text-gray-500'>
            Do not have an account?
            <Link
              to='/register'
              className='font-semibold leading-6 text-blue-600 hover:text-indigo-500'
            >
              &nbsp; Sign up
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
