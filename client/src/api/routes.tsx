import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import ErrorElement from "../components/common/error-element";
import { Student, Admin, Instructor } from "../App";

// Shared Suspense fallback
const LoadingFallback = <div>Loading...</div>;

// Helper to wrap lazy components with Suspense
const withSuspense = (element: JSX.Element) => (
  <Suspense fallback={LoadingFallback}>{element}</Suspense>
);

/* =========================
 * Lazy Imports – Student
 * ========================= */

const StudentHomePage = lazy(
  () => import("@/pages/students/student-home-page")
);
const ListCourse = lazy(() => import("@/pages/course/list-course"));
const ViewCourse = lazy(() => import("@/pages/course/view-course"));
const WatchLesson = lazy(
  () => import("@/pages/course/watch-lesson")
);
const InstructorsListing = lazy(
  () => import("@/pages/instructors/list-all-instructors")
);
const ViewInstructor = lazy(
  () => import("@/pages/instructors/view-instructor")
);
const Community = lazy(
  () => import("@/pages/sections/community/community-home")
);
const AboutUs = lazy(
  () => import("@/pages/sections/about/about-us")
);
const ContactPage = lazy(
  () => import("@/pages/sections/contact/contact-us")
);

const StudentDashboard = lazy(
  () => import("@/pages/students/student-dash/user-dashboard")
);
const StudentDashHome = lazy(
  () => import("@/pages/students/student-dash/dash-home")
);
const StudentProfile = lazy(
  () => import("@/pages/students/student-dash/my-profile")
);
const StudentCourses = lazy(
  () => import("@/pages/students/student-dash/my-courses")
);

/* =========================
 * Lazy Imports – Auth Modals
 * ========================= */

const StudentLoginModal = lazy(
  () => import("@/pages/students/StudentLoginModal")
);
const StudentRegisterModal = lazy(
  () => import("@/pages/students/StudentRegisterModal")
);
const InstructorLoginModal = lazy(
  () => import("@/pages/instructors/instructor-login-modal")
);
const InstructorRegisterModal = lazy(
  () => import("@/pages/instructors/instructor-register-modal")
);

/* =========================
 * Lazy Imports – Instructor
 * ========================= */

const InstructorDashboardPage = lazy(
  () => import("@/pages/instructors/instructor-dash-board")
);
const AddCourse = lazy(
  () => import("@/pages/course/add-course/add-course-form")
);
const EditCourse = lazy(
  () => import("@/pages/course/add-course/edit-course")
);
const ListCourseForInstructors = lazy(
  () => import("@/pages/course/add-lesson/list-course-for-instructors")
);
const ViewLessons = lazy(
  () => import("@/pages/course/add-lesson/view-lessons")
);
const EditLesson = lazy(
  () => import("@/pages/course/add-lesson/edit-lesson")
);
const MyStudents = lazy(
  () => import("@/pages/instructors/my-students")
);
const InstructorProfile = lazy(
  () => import("@/pages/instructors/insructor-profile")
);
const InstructorChannels = lazy(
  () => import("@/pages/instructors/channel/instructor-channels")
);

/* =========================
 * Lazy Imports – Admin
 * ========================= */

const AdminHomePage = lazy(
  () => import("@/pages/admin/admin-home-page")
);
const AdminCoursesPage = lazy(
  () => import("@/pages/admin/admin-courses-page")
);
const AdminProfilePage = lazy(
  () => import("@/pages/admin/admin-profile-page")
);

const AdminArticlesPage = lazy(
  () => import("@/pages/admin/admin-articles-page")
);

const SiteSettingsPage = lazy(
  () => import("@/pages/admin/site-settings-page")
);

const InstructorIndex = lazy(
  () =>
    import("@/pages/admin/instructor-management/view-instructors-index")
);
const InstructorRequests = lazy(
  () =>
    import(
      "@/pages/admin/instructor-management/viewInstructor-requests"
    )
);
const ViewMoreInstructorRequest = lazy(
  () =>
    import(
      "@/pages/admin/instructor-management/view-more-instructor-request"
    )
);
const ViewBlockedInstructors = lazy(
  () =>
    import(
      "@/pages/admin/instructor-management/view-blocked-instructors"
    )
);

const StudentsTab = lazy(
  () => import("@/pages/admin/student-management/students-tab")
);

const CategoriesPage = lazy(
  () => import("@/pages/categories/category-page")
);
const ListCategories = lazy(
  () => import("@/pages/categories/list-category")
);
const AddCategory = lazy(
  () => import("@/pages/categories/add-category")
);
const EditCategory = lazy(
  () => import("@/pages/categories/edit-category")
);

/* =========================
 * Payment
 * ========================= */

const StripeContainer = lazy(
  () => import("@/pages/payment-stripe/stripe-container")
);

/* =========================
 * Router Definition
 * ========================= */

const AppRouter = createBrowserRouter([
  /* ===========
   * Public + Student Shell
   * Uses <Student /> as the layout wrapper
   * =========== */
  {
    path: "/",
    element: <Student />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: withSuspense(<StudentHomePage />),
      },
      {
        path: "courses",
        element: withSuspense(<ListCourse />),
      },
      {
        path: "courses/:courseId",
        element: withSuspense(<ViewCourse />),
      },
      {
        path: "courses/:courseId/watch-lessons/:lessonId",
        element: withSuspense(<WatchLesson />),
      },
      {
        path: "tutors",
        element: withSuspense(<InstructorsListing />),
      },
      {
        path: "tutors/:tutorId",
        element: withSuspense(<ViewInstructor />),
      },
      {
        path: "community",
        element: withSuspense(<Community />),
      },
      {
        path: "about",
        element: withSuspense(<AboutUs />),
      },
      {
        path: "contact",
        element: withSuspense(<ContactPage />),
      },
    ],
  },

  /* ===========
   * Student Dashboard
   * =========== */
  {
    path: "/dashboard",
    element: withSuspense(<StudentDashboard />),
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: withSuspense(<StudentDashHome />),
      },
      {
        path: "my-courses",
        element: withSuspense(<StudentCourses />),
      },
      {
        path: "my-profile",
        element: withSuspense(<StudentProfile />),
      },
    ],
  },

  /* ===========
   * Payment
   * =========== */
  {
    path: "/courses/:courseId/payment",
    element: withSuspense(<StripeContainer />),
  },

  /* ===========
   * Auth Routes
   * =========== */
  {
    path: "/login",
    element: withSuspense(
      <StudentLoginModal
        isOpen={true}
        onClose={() => undefined}
        onSwitchToRegister={() => undefined}
      />
    ),
  },
  {
    path: "/register",
    element: withSuspense(
      <StudentRegisterModal
        isOpen={true}
        onClose={() => undefined}
        onSwitchToLogin={() => undefined}
      />
    ),
  },
  {
    path: "/instructors/login",
    element: withSuspense(
      <InstructorLoginModal
        isOpen={true}
        onClose={() => undefined}
        onSwitchToRegister={() => undefined}
      />
    ),
  },
  {
    path: "/instructors/register",
    element: withSuspense(
      <InstructorRegisterModal
        isOpen={true}
        onClose={() => undefined}
        onSwitchToLogin={() => undefined}
      />
    ),
  },

  /* ===========
   * Admin Area
   * Uses <Admin /> as layout, children are admin pages
   * =========== */
  {
    path: "/admin",
    element: <Admin />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: withSuspense(<AdminHomePage />),
      },
      {
        path: "courses",
        element: withSuspense(<AdminCoursesPage />),
      },
      {
        path: "profile",
        element: withSuspense(<AdminProfilePage />),
      },
      {
        path: "settings",
        element: withSuspense(<SiteSettingsPage />),
      },
      {
        path: "articles",
        element: withSuspense(<AdminArticlesPage/>)
      },
      {
        path: "students",
        element: withSuspense(<StudentsTab />),
      },
      {
        path: "instructors",
        element: withSuspense(<InstructorIndex />),
        children: [
          {
            path: "requests",
            element: withSuspense(<InstructorRequests />),
          },
          {
            path: "requests/:id",
            element: withSuspense(<ViewMoreInstructorRequest />),
          },
          {
            path: "blocked",
            element: withSuspense(<ViewBlockedInstructors />),
          },
        ],
      },
      {
        path: "categories",
        element: withSuspense(<CategoriesPage />),
        children: [
          {
            index: true,
            element: withSuspense(<ListCategories />),
          },
          {
            path: "add-category",
            element: withSuspense(<AddCategory />),
          },
          {
            path: "edit-category/:categoryId",
            element: withSuspense(<EditCategory />),
          },
        ],
      },
    ],
  },

  /* ===========
   * Instructor Area
   * Uses <Instructor /> as layout, children are instructor pages
   * =========== */
  {
    path: "/instructors",
    element: <Instructor />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: withSuspense(<InstructorDashboardPage />),
      },
      {
        path: "add-course",
        element: withSuspense(<AddCourse />),
      },
      {
        path: "view-course",
        element: withSuspense(<ListCourseForInstructors />),
      },
      {
        path: "edit-course/:courseId",
        element: withSuspense(<EditCourse />),
      },
      {
        path: "view-lessons/:courseId",
        element: withSuspense(<ViewLessons />),
      },
      {
        path: "view-lessons/:courseId/edit-lesson/:lessonId",
        element: withSuspense(<EditLesson />),
      },
      {
        path: "view-students",
        element: withSuspense(<MyStudents />),
      },
      {
        path: "view-profile",
        element: withSuspense(<InstructorProfile />),
      },
      {
        path: "view-channels",
        element: withSuspense(<InstructorChannels />),
      },
    ],
  },
]);

export default AppRouter;
