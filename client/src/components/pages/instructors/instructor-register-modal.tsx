import React, { useState, ChangeEvent, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { registerInstructor } from '../../../api/endpoints/auth/instructor-auth';
import { InstructorRegisterDataInterface } from '../../../api/types/instructor/auth-interface';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../contexts/LanguageContext';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon, EyeIcon, EyeSlashIcon, SparklesIcon, PlusIcon } from '@heroicons/react/24/outline';

// --- Component Props & Initial Data ---
interface InstructorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const initialValues: InstructorRegisterDataInterface = {
  firstName: '', lastName: '', email: '', mobile: '',
  qualification: '', subjects: '', experience: '', skills: '', about: '',
  password: '', confirmPassword: '',
};

// --- Reusable Styles ---
const inputFieldStyle = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors";
const primaryButtonStyle = "w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center";
const secondaryButtonStyle = "w-full sm:w-auto rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors";

// --- Step-specific Validation Schemas ---
const stepSchemas = [
  Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    mobile: Yup.string().required('Mobile number is required'),
  }),
  Yup.object({
    qualification: Yup.string().required('Qualification is required'),
    subjects: Yup.string().required('Subjects are required'),
    experience: Yup.string().required('Experience is required'),
    skills: Yup.string().required('Skills are required'),
    about: Yup.string().min(20, 'About section must be at least 20 characters').required('About section is required'),
  }),
  Yup.object({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
  }),
];

// --- Step 3 Component Definition ---
const Step3_AccountSecurity = ({ t, showPassword, setShowPassword }: { t: (key: string) => string; showPassword: boolean; setShowPassword: (show: boolean) => void; }) => (
    <div className="space-y-4">
        <div>
            <label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</label>
            <div className="relative">
                <Field id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={inputFieldStyle}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Toggle password visibility</span>
                    {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
            </div>
            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
        </div>
        <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">{t('auth.confirmPassword')}</label>
            <Field id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={inputFieldStyle}/>
            <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
        </div>
    </div>
);


// --- Main Modal Component ---
const InstructorRegisterModal: React.FC<InstructorRegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const steps = [
    { title: t('auth.personalInfo') || 'Personal Info' },
    { title: t('auth.qualifications') || 'Professional Details' },
    { title: t('auth.accountInfo') || 'Account Security' }
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentStep(0);
      setProfilePhoto(null);
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
      setProfilePhotoPreview(null);
      setCertificates([]);
      setShowPassword(false);
    }
  }, [isOpen, profilePhotoPreview]);

  const handleFinalSubmit = async (values: InstructorRegisterDataInterface, helpers: FormikHelpers<InstructorRegisterDataInterface>) => {
    setIsUploading(true);
    const formData = new FormData();
    
    if (profilePhoto) formData.append('profilePic', profilePhoto);

    certificates.forEach((file) => {
      if (file) formData.append('certificates', file);
    });

    (Object.keys(values) as Array<keyof InstructorRegisterDataInterface>).forEach(key => {
        const value = values[key];
        if (value !== null && value !== undefined) {
            formData.append(key as string, String(value));
        }
    });
    
    try {
      const response = await registerInstructor(formData);
      toast.success(response.data.message || "Registration successful!");
      helpers.resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCertificate = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && certificates.length < 4) {
      setCertificates(prev => [...prev, file]);
    }
  };

  const handleRemoveCertificate = (indexToRemove: number) => {
    setCertificates(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const currentValidationSchema = stepSchemas[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-20"><XMarkIcon className="w-6 h-6" /></button>
            
            <div className="hidden md:flex md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-8 flex-col justify-center items-center">
                <div className="text-center">
                    <SparklesIcon className="w-16 h-16 text-indigo-500 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Join Our Team</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Share your knowledge and inspire students around the world.</p>
                </div>
            </div>

            <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col overflow-y-auto">
                <Formik 
                    initialValues={initialValues} 
                    validationSchema={currentValidationSchema} 
                    onSubmit={async (values, helpers) => {
                        if (isLastStep) {
                            await handleFinalSubmit(values, helpers);
                        } else {
                            setCurrentStep(s => s + 1);
                            helpers.setTouched({});
                        }
                    }}
                >
                  {() => (
                    <Form className="flex flex-col flex-grow h-full">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[currentStep].title}</h2>
                        <div className="flex items-center space-x-2 mt-2">
                          {steps.map((step, stepIdx) => (
                            <div key={step.title} className={`h-1.5 rounded-full flex-1 ${currentStep >= stepIdx ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-grow space-y-4 mt-8">
                        {currentStep === 0 && (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-inner">
                                        {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" /> : <PhotoIcon className="w-10 h-10 text-gray-400" />}
                                    </div>
                                    <label htmlFor="profilePhoto" className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                        Upload Profile Photo
                                        <input id="profilePhoto" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0] || null; setProfilePhoto(file); setProfilePhotoPreview(file ? URL.createObjectURL(file) : null); }} className="hidden" />
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label htmlFor="firstName" className="text-sm font-medium">{t('auth.firstName')}</label><Field id="firstName" name="firstName" placeholder="e.g., John" className={inputFieldStyle}/><ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div><label htmlFor="lastName" className="text-sm font-medium">{t('auth.lastName')}</label><Field id="lastName" name="lastName" placeholder="e.g., Doe" className={inputFieldStyle}/><ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div className="sm:col-span-2"><label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</label><Field id="email" name="email" type="email" placeholder="you@example.com" className={inputFieldStyle}/><ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div className="sm:col-span-2"><label htmlFor="mobile" className="text-sm font-medium">{t('auth.mobile')}</label><Field id="mobile" name="mobile" placeholder="+123456789" className={inputFieldStyle}/><ErrorMessage name="mobile" component="div" className="text-red-500 text-xs mt-1" /></div>
                                </div>
                            </>
                        )}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label htmlFor="qualification" className="text-sm font-medium">{t('auth.qualification')}</label><Field id="qualification" name="qualification" placeholder="MSc Computer Science" className={inputFieldStyle}/><ErrorMessage name="qualification" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div><label htmlFor="experience" className="text-sm font-medium">{t('auth.experience')}</label><Field id="experience" name="experience" placeholder="5 years" className={inputFieldStyle}/><ErrorMessage name="experience" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div className="sm:col-span-2"><label htmlFor="subjects" className="text-sm font-medium">{t('auth.subjects')}</label><Field id="subjects" name="subjects" placeholder="Programming, Data Science" className={inputFieldStyle}/><ErrorMessage name="subjects" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div className="sm:col-span-2"><label htmlFor="skills" className="text-sm font-medium">{t('auth.skills')}</label><Field id="skills" name="skills" placeholder="JavaScript, Node.js, Python" className={inputFieldStyle}/><ErrorMessage name="skills" component="div" className="text-red-500 text-xs mt-1" /></div>
                                    <div className="sm:col-span-2"><label htmlFor="about" className="text-sm font-medium">{t('auth.about')}</label><Field as="textarea" id="about" name="about" rows={3} placeholder={t('auth.aboutPlaceholder')} className={inputFieldStyle}/><ErrorMessage name="about" component="div" className="text-red-500 text-xs mt-1" /></div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{t('auth.certificatesLabel') || 'Certificates (Max 4)'}</label>
                                    <div className="mt-2 space-y-3">
                                        {certificates.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                                <button type="button" onClick={() => handleRemoveCertificate(index)} className="p-1 text-gray-400 hover:text-red-500"><XMarkIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        {certificates.length < 4 && (
                                            <label htmlFor="certificate-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                                                <PlusIcon className="w-5 h-5 mr-2" />
                                                {t('auth.addCertificate') || 'Add Certificate'}
                                            </label>
                                        )}
                                        <input id="certificate-upload" type="file" accept="image/*,application/pdf" onChange={handleAddCertificate} className="hidden" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                             <Step3_AccountSecurity t={t} showPassword={showPassword} setShowPassword={setShowPassword} />
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className={`flex flex-col-reverse sm:flex-row items-center ${currentStep > 0 ? 'justify-between' : 'justify-end'} gap-4`}>
                            {currentStep > 0 && (
                               <button type="button" onClick={() => setCurrentStep(s => s - 1)} className={secondaryButtonStyle}>Back</button>
                            )}
                            <button type="submit" className={primaryButtonStyle} disabled={isUploading}>
                                {isUploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isUploading ? 'Submitting...' : (isLastStep ? 'Create Account' : 'Next')}
                            </button>
                        </div>
                        <p className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
                            {t('auth.haveAccount')}
                            <button type="button" onClick={onSwitchToLogin} className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">
                                {t('auth.signIn')}
                            </button>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
            </div>
        </div>
    </div>
  );
};

export default InstructorRegisterModal;

