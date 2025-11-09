/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { AdminLoginInfo } from "../../api/types/admin/auth-interface";
import { loginAdmin } from "../../api/endpoints/auth/auth";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/reducers/authSlice";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (adminInfo: AdminLoginInfo) => {
    try {
      const response = await loginAdmin(adminInfo);
      const data = response?.data?.data || response?.data || {};
      const accessToken: string = data.accessToken;
      const refreshToken: string = data.refreshToken;

      if (!accessToken) throw new Error("Access token missing from response");

      dispatch(
        setToken({
          accessToken,
          refreshToken,
          userType: "admin",
        })
      );

      toast.success(response?.data?.message || "Successfully logged in", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });

      navigate("/admin/");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Login failed";
      toast.error(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-blue-gray-50/70">
      <div className="w-full max-w-md p-6 bg-white border shadow-lg rounded-2xl border-blue-gray-50 sm:p-8">
        <div className="mb-6 text-center">
          <img
            className="w-10 h-10 mx-auto rounded-lg"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Logo"
          />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">
            Admin Sign In
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Access your administration dashboard
          </p>
        </div>

        <Formik initialValues={{ email: "", password: "" }} onSubmit={handleSubmit}>
          <Form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <Field
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 shadow-sm outline-none rounded-xl focus:border-indigo-600 focus:ring-indigo-600"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-[10px] text-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700"
                >
                  Password
                </label>
                <a
                  href="/"
                  className="text-[10px] font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
              <div className="mt-1">
                <Field
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 shadow-sm outline-none rounded-xl focus:border-indigo-600 focus:ring-indigo-600"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-[10px] text-red-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex justify-center w-full px-3 py-2 text-sm font-semibold text-white transition-colors bg-indigo-600 shadow-md rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default AdminLoginPage;
