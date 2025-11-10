/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { submitResponse } from "../../../api/endpoints/contact";
import { useLanguage } from "../../../contexts/LanguageContext";

type Values = {
  name: string;
  email: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };
  const isArabic = lang === "ar";

  const lbl = {
    title: t("contact.title") || "Contact Us",
    subtitle:
      t("contact.subtitle") ||
      "We’d love to hear from you. Send us a message and we’ll respond soon.",
    name: t("contact.name") || "Your Name",
    email: t("contact.email") || "Your Email",
    message: t("contact.message") || "Your Message",
    submit: t("contact.submit") || "Send Message",
    sending: t("contact.sending") || "Sending...",
    success: t("contact.success") || "Message sent successfully!",
    error: t("contact.error") || "Failed to send message. Please try again.",
    required: t("form.required") || "Required",
    invalidEmail: t("form.invalidEmail") || "Invalid email format",
  };

  const initialValues: Values = { name: "", email: "", message: "" };

  const validationSchema = Yup.object({
    name: Yup.string().required(lbl.required),
    email: Yup.string().email(lbl.invalidEmail).required(lbl.required),
    message: Yup.string().required(lbl.required),
  });

  const onSubmit = async (values: Values, helpers: FormikHelpers<Values>) => {
    try {
      const response: any = await submitResponse(values);
      if (response?.status === "success") {
        toast.success(response?.message || lbl.success);
        helpers.resetForm();
      } else throw new Error("failed");
    } catch {
      toast.error(lbl.error);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      className="text-gray-900 transition-colors bg-white dark:bg-gray-900 dark:text-gray-100"
    >
      <div className="container px-4 py-10 mx-auto md:py-14">
        <div
          className="
            mx-auto max-w-3xl
            rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm
            dark:ring-gray-700 dark:bg-[#111827]
            p-6 md:p-8 lg:p-10
          "
        >
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
            {lbl.title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            {lbl.subtitle}
          </p>

          {/* Contact Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mt-6 space-y-5" noValidate>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {lbl.name}
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder={lbl.name}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-xs font-medium text-rose-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {lbl.email}
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    dir="ltr"
                    placeholder={lbl.email}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-xs font-medium text-rose-600"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {lbl.message}
                  </label>
                  <Field
                    as="textarea"
                    id="message"
                    name="message"
                    rows={5}
                    placeholder={lbl.message}
                    className="
                      w-full rounded-lg border px-3 py-2 text-sm
                      bg-white text-gray-900 placeholder:text-gray-500 border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                      dark:bg-[#0e1625] dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-700
                    "
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="mt-1 text-xs font-medium text-rose-600"
                  />
                </div>

                {/* Submit */}
                <div className={`${isArabic ? "text-left" : "text-right"} pt-2`}>
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
                    {isSubmitting ? lbl.sending : lbl.submit}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
