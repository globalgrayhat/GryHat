/* eslint-disable no-dupe-keys */
/**
 * English translations as a TypeScript module.
 */

const en = {
  welcomeBack: "Welcome Back",
  signInContinue: "Sign in to continue",
  createAccount: "Create your account",
  registerStart: "Register to start learning",
  becomeInstructor: "Become an instructor",
  instructorTagline: "Share your knowledge with the world",
  adminSignIn: "Admin Sign In",
  adminTagline: "Administrative access",
  becomeInstructorTagline: "Join us and start teaching today",

  nav: {
    home: "Home",
    courses: "Courses",
    tutors: "Tutors",
    community: "Community",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    instructorLogin: "Instructor Login",
    settings: "Settings",
    students: "Students",
    instructors: "Instructors",
    categories: "Categories",
    coursesNav: "Courses",
    admin: "Admin",
    adminLogin: "Admin Login",
  },

  home: {
    trendingCourses: "Trending Courses",
    recommendedCourses: "Recommended for you",
    viewMore: "View More",
    viewAll: "View All",
    browseAll: "Browse all courses",
    empty: {
      trending: "No trending courses at the moment.",
      recommended: "No recommendations for you yet.",
    },
    errors: {
      trendingFail: "Unable to load trending courses right now.",
      recommendedFail: "Unable to load your recommendations right now.",
    },
  },

  footer: {
    explore: "Explore",
    support: "Support",
    courses: "Courses",
    instructors: "Instructors",
    community: "Community",
    articles: "Articles",
    contact: "Contact",
    helpCenter: "Help Center",
    platformName: "Academic Platform",
  },

  auth: {
    registerTitle: "Create an account",
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    mobile: "Mobile",
    qualifications: "Qualifications",
    qualification: "Qualification",
    subjects: "Subjects",
    experience: "Experience",
    skills: "Skills",
    about: "About",
    photo: "Photo",
    certificate: "Certificate",
    certificates: "Certificates",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    uploadFile: "Upload File",
    uploadPhoto: "Upload Photo",
    uploadCertificate: "Upload Certificate",
    dragOrDrop: "or drag and drop",
    fileTypeInfo: "PNG, JPG, GIF up to 10MB",
    signUp: "Sign Up",
    signIn: "Sign In",
    cancel: "Cancel",
    studentLogin: "Student Login",
    accessAccount: "Access Account",
    haveAccount: "Already have an account?",
    blockedTitle: "Account Blocked",
    blockedMessage:
      "Your account has been blocked. Please contact support for assistance.",
  },

  tutors: {
    title: "Our Instructors",
    subtitle: "Meet Gray Hat Subject Experts",
    searchPlaceholder: "Search for instructors...",
    noResults: "No instructors found.",
  },

  adminCourses: {
    title: "Courses",
    course: "Course",
    category: "Category",
    instructor: "Instructor",
    price: "Price",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
  },

  admin: {
    courses: "Courses",
    coursesDescription: "Manage all courses in the platform",
    noCourses: "No courses found.",
    search: "Search",
    settings: "Settings",
    siteSettings: "Site Settings",
    profileSaved: "Profile saved",
    name: "Name",
    email: "Email",
    save: "Save",
  },

  settings: {
    adminSettings: "Admin Settings",
    profileSettings: "Profile Settings",
    siteSettings: "Site Settings",
    platformName: "Platform Name",
    platformNamePlaceholder: "Enter the platform name",
    loginOptions: "Login Options",
    enableStudentLogin: "Enable Student Login/Registration",
    enableInstructorLogin: "Enable Instructor Login/Registration",
    enableGoogleLogin: "Enable Google Login",
    saveSettings: "Save Settings",
    saving: "Saving...",
    editProfileInfo: "Edit profile info",
    profileSubtitle: "Manage your personal information and password",
    accountInfo: "Account Info",
    changePassword: "Change password",
    errors: {
      platformNameRequired: "Platform name cannot be empty",
    },
    successfullyUpdated: "Settings updated successfully",
    updateFailed: "Failed to update settings",
  },

  course: {
    title: "Title",
    category: "Category",
    price: "Price",
    level: "Level",
    createdAt: "Created",
    status: "Status",
    active: "Active",
    pending: "Pending",
    duration: "Duration",
    free: "Free",
  },

  pagination: {
    previous: "Previous",
    next: "Next",
  },

  profile: {
    loading: "Loading profile...",
    noChanges: "No changes to update",
    updatedSuccessfully: "Profile updated successfully",
    updateFailed: "Failed to update profile",
    edit: "Edit profile",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    mobile: "Mobile",
    changeAvatar: "Profile picture",
  },

  toast: {
    genericError: "Something went wrong. Please try again.",
  },

  common: {
    edit: "Edit",
    delete: "Delete",
  },
};

export type EnTranslations = typeof en;
export default en;
