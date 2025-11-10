/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { submitResponse } from "../../api/endpoints/contact";
import { useLanguage } from "../../contexts/LanguageContext";
import SubmitButton from "./SubmitButton";
import FormField from "./FormField";

// ✅ Define the type of form values
type Values = {
  name: string;
  email: string;
  message: string;
};

// ✅ Define the props expected by this component
type Props = {
  isArabic: boolean;
};

const ContactForm: React.FC<Props> = ({ isArabic }) => {
  const { t } = useLanguage() as { t: (k: string) => string };

  // 🏷️ All labels and messages (with i18n fallbacks)
  const labels = {
    name: t("contact.name") || "Your Name",
    email: t("contact.email") || "Your Email",
    message: t("contact.message") || "Your Message",
    submit: t("contact.submit") || "Submit",
    sending: t("contact.sending") || "Sending...",
    success: t("contact.success") || "Message sent successfully!",
    error: t("contact.error") || "Failed to send message.",
    required: t("form.required") || "Required",
    invalidEmail: t("form.invalidEmail") || "Invalid email format",
  };

  // 🧱 Initial form values
  const initialValues: Values = {
    name: "",
    email: "",
    message: "",
  };

  // ✅ Yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required(labels.required),
    email: Yup.string().email(labels.invalidEmail).required(labels.required),
    message: Yup.string().required(labels.required),
  });

  // 🚀 Handle form submission
  const onSubmit = async (values: Values, helpers: FormikHelpers<Values>) => {
    try {
      // Send data to backend API
      const response: any = await submitResponse(values);

      if (response?.status === "success") {
        toast.success(response?.message || labels.success, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        helpers.resetForm(); // Reset form on success
      } else {
        throw new Error("failed");
      }
    } catch (error) {
      // Show error toast message
      toast.error(labels.error, { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        // noValidate disables browser native validation messages
        <Form className="mt-8 space-y-6" noValidate>
          {/* 👤 Name field */}
          <FormField
            name="name"
            label={labels.name}
            type="text"
            placeholder={labels.name}
          />

          {/* 📧 Email field */}
          <FormField
            name="email"
            label={labels.email}
            type="email"
            dir="ltr"
            placeholder={labels.email}
          />

          {/* 💬 Message textarea */}
          <FormField
            name="message"
            label={labels.message}
            as="textarea"
            rows={5}
            placeholder={labels.message}
          />

          {/* 🚀 Submit button */}
          <div className={isArabic ? "text-left" : "text-right"}>
            <SubmitButton isSubmitting={isSubmitting} labels={labels} />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContactForm;
