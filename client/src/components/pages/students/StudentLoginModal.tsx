import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { loginStudent } from "../../../api/endpoints/auth/student-auth";
import { studentLoginValidationSchema } from "../../../validations/auth/studentLoginValidation";
import { toast } from "react-toastify";
import GoogleAuthComponent from "../../common/google-auth-component";
import { useDispatch, useSelector } from "react-redux";
import { setToken, selectIsLoggedIn, selectUserType } from "../../../redux/reducers/authSlice";
import { EyeIcon, EyeSlashIcon, XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../contexts/LanguageContext";

// --- Reusable Styles ---
const inputFieldStyle = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors";
const primaryButtonStyle = "w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center";

// --- Component Props ---
interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const userType = useSelector(selectUserType);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (studentInfo: any, { resetForm }: FormikHelpers<any>) => {
    setIsSubmitting(true);
    try {
      const response = await loginStudent(studentInfo);
      const { accessToken, refreshToken } = response.data.data;
      dispatch(setToken({ accessToken, refreshToken, userType: "student" }));
      toast.success(response.data.message || t('toast.loginSuccess'));
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('toast.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && isLoggedIn && userType === "student") {
      onClose();
    }
  }, [isOpen, isLoggedIn, userType, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-20"><XMarkIcon className="w-6 h-6" /></button>
            
            <div className="hidden md:flex md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-8 flex-col justify-center items-center">
                <div className="text-center">
                    <AcademicCapIcon className="w-16 h-16 text-indigo-500 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">{t('auth.studentWelcome')}</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('auth.studentSubtitle')}</p>
                </div>
            </div>

            <div className="w-full md:w-2/3 p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
                <Formik 
                    initialValues={{ email: "", password: "" }}
                    validationSchema={studentLoginValidationSchema} 
                    onSubmit={handleSubmit}
                >
                  {() => (
                    <Form className="w-full max-w-md mx-auto">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.studentLogin')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.accessAccount')}</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                            <label htmlFor="email_student" className="text-sm font-medium">{t('auth.email')}</label>
                            <Field id="email_student" name="email" type="email" placeholder="you@example.com" className={inputFieldStyle}/>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        
                        <div>
                            <label htmlFor="password_student" className="text-sm font-medium">{t('auth.password')}</label>
                            <div className="relative">
                                <Field id="password_student" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={inputFieldStyle}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">{t('auth.togglePassword')}</span>
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      <div className="text-right mt-4">
                        <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">
                            {t('auth.forgotPassword')}
                        </button>
                      </div>

                      <div className="mt-8">
                          <button type="submit" className={primaryButtonStyle} disabled={isSubmitting}>
                              {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                              {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
                          </button>
                      </div>
                      
                      <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="mx-4 text-xs text-gray-500 dark:text-gray-400">OR</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      
                      <GoogleAuthComponent />
                      
                      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                          {t('auth.haveAccount')}
                          <button type="button" onClick={onSwitchToRegister} className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">
                              {t('auth.signUp')}
                          </button>
                      </p>
                    </Form>
                  )}
                </Formik>
            </div>
        </div>
    </div>
  );
};

export default StudentLoginModal;

