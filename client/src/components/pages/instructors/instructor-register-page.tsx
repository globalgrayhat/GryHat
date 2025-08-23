import React, { useState, ChangeEvent } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { registerInstructor } from '../../../api/endpoints/auth/instructor-auth';
import { instructorRegistrationValidationSchema } from '../../../validations/auth/InstructorRegisterValidation';
import { InstructorRegisterDataInterface } from '../../../api/types/instructor/auth-interface';
import SpinnerDialog from '../../common/spinner-page';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../contexts/LanguageContext';

/*
 * InstructorRegistrationPage presents a simple registration form for instructors.
 * It uses the global header to provide theme and language toggles; this page
 * focuses solely on capturing instructor details. The form collects personal
 * details, professional qualifications, and account credentials. Uploading of
 * profile picture and certificates is supported via file inputs. Upon
 * submission, a FormData payload is sent to the server. All labels are
 * translated using the LanguageContext.
 */

const initialValues: InstructorRegisterDataInterface = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  qualification: '',
  subjects: '',
  experience: '',
  skills: '',
  about: '',
  password: '',
  confirmPassword: '',
};

const InstructorRegistrationPage: React.FC = () => {
  // Local state for file inputs
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [certificateOne, setCertificateOne] = useState<File | null>(null);
  const [certificateTwo, setCertificateTwo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Translation hook
  const { t } = useLanguage();

  // Handle file selection for different fields
  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setter(file);
    };

  // Submit handler
  const handleSubmit = async (
    instructorInfo: InstructorRegisterDataInterface,
    { resetForm }: FormikHelpers<InstructorRegisterDataInterface>
  ) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      // Append uploaded images
      if (profilePhoto) formData.append('images', profilePhoto, 'profilePic');
      if (certificateOne) formData.append('images', certificateOne, 'certificateOne');
      if (certificateTwo) formData.append('images', certificateTwo, 'certificateTwo');
      // Append other fields
      Object.keys(instructorInfo).forEach((key) => {
        const value = (instructorInfo as any)[key];
        formData.append(key, value);
      });
      const response = await registerInstructor(formData);
      toast.success(response.data.message, { position: toast.POSITION.BOTTOM_RIGHT });
      // Reset form and files
      resetForm();
      setProfilePhoto(null);
      setCertificateOne(null);
      setCertificateTwo(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="py-10 px-4 md:px-20 lg:px-40 bg-gray-50 dark:bg-[#2e3440] text-customFontColorBlack dark:text-[#e5e9f0]">
      {isUploading && <SpinnerDialog isUploading={isUploading} />}
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#3b4252] border border-gray-200 dark:border-[#4c566a] rounded-lg shadow p-8">
        <div className="text-center mb-6">
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Logo"
          />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-[#e5e9f0]">
            {t('auth.registerTitle') || 'Register as Instructor'}
          </h2>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={instructorRegistrationValidationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-md mb-2">
                  {t('auth.personalInfo') || 'Personal Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium">
                      {t('auth.firstName') || 'First Name'}
                    </label>
                    <Field
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium">
                      {t('auth.lastName') || 'Last Name'}
                    </label>
                    <Field
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                      {t('auth.email') || 'Email'}
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium">
                      {t('auth.mobile') || 'Mobile'}
                    </label>
                    <Field
                      id="mobile"
                      name="mobile"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="mobile" component="div" className="text-red-500 text-xs" />
                  </div>
                </div>
              </div>
              {/* Qualifications and Experience */}
              <div>
                <h3 className="font-semibold text-md mb-2">
                  {t('auth.qualifications') || 'Qualifications and Experience'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium">
                      {t('auth.qualification') || 'Qualification'}
                    </label>
                    <Field
                      id="qualification"
                      name="qualification"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="qualification" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="subjects" className="block text-sm font-medium">
                      {t('auth.subjects') || 'Subjects'}
                    </label>
                    <Field
                      id="subjects"
                      name="subjects"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="subjects" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium">
                      {t('auth.experience') || 'Experience'}
                    </label>
                    <Field
                      id="experience"
                      name="experience"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="experience" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium">
                      {t('auth.skills') || 'Skills'}
                    </label>
                    <Field
                      id="skills"
                      name="skills"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="skills" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="about" className="block text-sm font-medium">
                      {t('auth.about') || 'About'}
                    </label>
                    <Field
                      as="textarea"
                      id="about"
                      name="about"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="about" component="div" className="text-red-500 text-xs" />
                  </div>
                </div>
              </div>
              {/* Profile Photo and Certificates */}
              <div>
                <h3 className="font-semibold text-md mb-2">
                  {t('auth.photo') || 'Photo'} & {t('auth.certificate1') || 'Certificates'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="profilePhoto" className="block text-sm font-medium">
                      {t('auth.photo') || 'Photo'}
                    </label>
                    <input
                      id="profilePhoto"
                      name="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange(setProfilePhoto)}
                      className="mt-1 block w-full text-sm text-gray-900 dark:text-[#e5e9f0] border border-gray-300 dark:border-[#4c566a] rounded-md cursor-pointer bg-white dark:bg-[#434c5e]"
                    />
                  </div>
                  <div>
                    <label htmlFor="certificateOne" className="block text-sm font-medium">
                      {t('auth.certificate1') || 'Certificate 1'}
                    </label>
                    <input
                      id="certificateOne"
                      name="certificateOne"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange(setCertificateOne)}
                      className="mt-1 block w-full text-sm text-gray-900 dark:text-[#e5e9f0] border border-gray-300 dark:border-[#4c566a] rounded-md cursor-pointer bg-white dark:bg-[#434c5e]"
                    />
                  </div>
                  <div>
                    <label htmlFor="certificateTwo" className="block text-sm font-medium">
                      {t('auth.certificate2') || 'Certificate 2'}
                    </label>
                    <input
                      id="certificateTwo"
                      name="certificateTwo"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange(setCertificateTwo)}
                      className="mt-1 block w-full text-sm text-gray-900 dark:text-[#e5e9f0] border border-gray-300 dark:border-[#4c566a] rounded-md cursor-pointer bg-white dark:bg-[#434c5e]"
                    />
                  </div>
                </div>
              </div>
              {/* Account Information */}
              <div>
                <h3 className="font-semibold text-md mb-2">
                  {t('auth.accountInfo') || 'Account information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                      {t('auth.password') || 'Password'}
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      {t('auth.confirmPassword') || 'Confirm Password'}
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#4c566a] dark:bg-[#434c5e] dark:text-[#e5e9f0] focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs" />
                  </div>
                </div>
              </div>
              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center rounded-full bg-blue-600 dark:bg-blue-500 py-2 px-4 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('auth.signUp') || 'Sign up'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default InstructorRegistrationPage;