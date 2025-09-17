import React from "react";
<<<<<<< HEAD
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
// Use a relative import (avoids alias issues)
import { submitResponse } from "../../../api/endpoints/contact";
import { useLanguage } from "../../../contexts/LanguageContext";

type Values = {
  name: string;
  email: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };

  // i18n labels with safe English fallbacks
  const lblTitle = t("contact.title") || "Contact Us";
  const lblSubtitle =
    t("contact.subtitle") ||
    "We’d love to hear from you. Send us a message and we’ll respond soon.";
  const phName = t("contact.placeholders.name") || "Your name";
  const phEmail = t("contact.placeholders.email") || "Your email";
  const phMessage = t("contact.placeholders.message") || "Write your message...";
  const btnSubmit = t("contact.submit") || "Submit";
  const btnSending = t("contact.sending") || "Sending...";
  const errRequired = t("form.required") || "Required";
  const errInvalidEmail = t("form.invalidEmail") || "Invalid email format";
  const toastOk = t("contact.success") || "Message sent successfully!";
  const toastErr = t("contact.error") || "Failed to submit your response.";

  const initialValues: Values = { name: "", email: "", message: "" };

  const validationSchema = Yup.object({
    name: Yup.string().required(errRequired),
    email: Yup.string().email(errInvalidEmail).required(errRequired),
    message: Yup.string().required(errRequired),
  });

  const onSubmit = async (values: Values, helpers: FormikHelpers<Values>) => {
    try {
      const response: any = await submitResponse(values);
      if (response?.status === "success") {
        toast.success(response?.message || toastOk, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        helpers.resetForm();
      } else {
        throw new Error("failed");
      }
    } catch {
      toast.error(toastErr, { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      helpers.setSubmitting(false);
=======
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { submitResponse } from "api/endpoints/contact";

const ContactUs: React.FC = () => {
  const initialValues = {
    name: "",
    email: "",
    message: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email format").required("Required"),
    message: Yup.string().required("Required"),
  });

  const onSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    try {
      const response = await submitResponse(values);
      response.status === "success" &&
        toast.success(response?.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      resetForm();
    } catch (error) {
      toast.error("Failed to submitted your response..!", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    }
  };

  return (
<<<<<<< HEAD
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-[70vh] bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 py-10 md:py-14 transition-colors"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm p-6 md:p-8 dark:ring-gray-700 dark:bg-[#111827]">
          <h1 className="text-2xl md:text-3xl font-bold">{lblTitle}</h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{lblSubtitle}</p>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting, errors, touched }) => (
              // noValidate avoids native browser messages overlapping with i18n
              <Form className="mt-6 space-y-5" noValidate>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    {t("contact.name") || "Your Name"}
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={touched.name && !!errors.name}
                    placeholder={phName}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage name="name" component="div" className="mt-1 text-xs font-medium text-rose-600" />
                </div>

                {/* Email (force LTR inside RTL for readability) */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    {t("contact.email") || "Your Email"}
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    aria-invalid={touched.email && !!errors.email}
                    placeholder={phEmail}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-xs font-medium text-rose-600" />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                    {t("contact.message") || "Your Message"}
                  </label>
                  <Field
                    as="textarea"
                    id="message"
                    name="message"
                    rows={5}
                    aria-invalid={touched.message && !!errors.message}
                    placeholder={phMessage}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage name="message" component="div" className="mt-1 text-xs font-medium text-rose-600" />
                </div>

                {/* Actions */}
                <div className={lang === "ar" ? "text-left" : "text-right"}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
                      hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      disabled:cursor-not-allowed disabled:opacity-60
                      dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900
                    "
                  >
                    {isSubmitting ? btnSending : btnSubmit}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
=======
    <div className='flex justify-center items-center md:p-10'>
      <div className='px-4 py-8 w-3/4'>
        <h1 className='text-3xl font-semibold mb-4'>Contact Us</h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className='mb-4'>
                <label
                  htmlFor='name'
                  className='block text-gray-700 font-medium mb-2'
                >
                  Your Name
                </label>
                <Field
                  type='text'
                  id='name'
                  name='name'
                  className='w-full border rounded px-3 py-2 ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-inset focus:ring-indigo-700 focus-visible:outline-none focus-visible:ring-blue-600 sm:text-sm sm:leading-6'
                />
                <ErrorMessage
                  name='name'
                  component='div'
                  className='text-red-500'
                />
              </div>
              <div className='mb-4'>
                <label
                  htmlFor='email'
                  className='block text-gray-700 font-medium mb-2'
                >
                  Your Email
                </label>
                <Field
                  type='email'
                  id='email'
                  name='email'
                  className='w-full border rounded px-3 py-2 ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-inset focus:ring-indigo-700 focus-visible:outline-none focus-visible:ring-blue-600 sm:text-sm sm:leading-6'
                />
                <ErrorMessage
                  name='email'
                  component='div'
                  className='text-red-500'
                />
              </div>
              <div className='mb-4'>
                <label
                  htmlFor='message'
                  className='block text-gray-700 font-medium mb-2'
                >
                  Your Message
                </label>
                <Field
                  as='textarea'
                  id='message'
                  name='message'
                  className='w-full border rounded px-3 py-2 ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-inset focus:ring-indigo-700 focus-visible:outline-none focus-visible:ring-blue-600 sm:text-sm sm:leading-6'
                  rows={4}
                />
                <ErrorMessage
                  name='message'
                  component='div'
                  className='text-red-500'
                />
              </div>
              <button
                type='submit'
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                disabled={isSubmitting}
              >
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
};

export default ContactUs;
