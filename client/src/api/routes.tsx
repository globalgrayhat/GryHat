import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorElement from "../components/common/error-element";
import { Student, Admin } from "../App";
import { Instructor } from "../App";
import InstructorDashboard from "@/pages/instructors/instructor-dash-board";
import StripeContainer from "@/pages/payment-stripe/stripe-container";
import AddCategory from "@/pages/categories/add-category";
import EditCategory from "@/pages/categories/edit-category";
import ListCategories from "@/pages/categories/list-category";
// import AdminCoursesPage from "@/pages/admin/admin-courses-page";
// import AdminProfilePage from "@/pages/admin/admin-profile-page";
import DashHome from "@/pages/students/student-dash/dash-home";
import InstructorChannels from "@/pages/instructors/channel/instructor-channels";

const LazyListCourse = lazy(() => import("@/pages/course/list-course"));

const LazyInstructorsListing = lazy(
  () => import("@/pages/instructors/list-all-instructors")
);

const LazyStudentDash = lazy(
  () => import("@/pages/students/student-dash/user-dashboard")
);

const LazyInstructorIndex = lazy(
  () =>
    import("@/pages/instructors/instructor-management/view-instructors-index")
);

const LazyStudents = lazy(
  () => import("@/pages/students/student-management/students-tab")
);
const LazyAdminCoursesPage = lazy(
  () => import("@/pages/admin/admin-courses-page")
);
const LazyAdminProfilePage = lazy(
  () => import("@/pages/admin/admin-profile-page")
);
const LazySiteSettingsPage = lazy(
  () => import("@/pages/admin/site-settings-page")
);

const LazyCategories = lazy(() => import("@/pages/categories/category-page"));

const LazyViewCourse = lazy(() => import("@/pages/course/view-course"));

const LazyWatchLesson = lazy(() => import("@/pages/course/watch-lesson"));

const LazyAddCourse = lazy(
  () => import("@/pages/course/add-course/add-course-form")
);

const LazyViewLesson = lazy(
  () => import("@/pages/course/add-lesson/view-lessons")
);

const LazyListCourseInstructors = lazy(
  () => import("@/pages/course/add-lesson/list-course-for-instructors")
);

const LazyEditLesson = lazy(
  () => import("@/pages/course/add-lesson/edit-lesson")
);

const LazyEditCourse = lazy(
  () => import("@/pages/course/add-course/edit-course")
);

const LazyMyStudents = lazy(() => import("@/pages/instructors/my-students"));

const LazyInstructorProfile = lazy(
  () => import("@/pages/instructors/insructor-profile")
);

const LazyViewInstructor = lazy(
  () => import("@/pages/instructors/view-instructor")
);

const LazyStudentProfile = lazy(
  () => import("@/pages/students/student-dash/my-profile")
);

const LazyStudentCourses = lazy(
  () => import("@/pages/students/student-dash/my-courses")
);

const LazyStudentHomePage = lazy(
  () => import("@/pages/students/student-home-page")
);

const LazyStudentLogin = lazy(
  () => import("@/pages/students/StudentLoginModal")
);
const LazyStudentRegister = lazy(
  () => import("@/pages/students/StudentRegisterModal")
);
const LazyInstructorLogin = lazy(
  () => import("@/pages/instructors/instructor-login-modal")
);
const LazyInstructorRegister = lazy(
  () => import("@/pages/instructors/instructor-register-modal")
);
const LazyAdminHome = lazy(() => import("@/pages/admin/admin-home-page"));
const LazyInstructorRequests = lazy(
  () =>
    import("@/pages/instructors/instructor-management/viewInstructor-requests")
);
const LazyViewMoreInstructorRequest = lazy(
  () =>
    import(
      "@/pages/instructors/instructor-management/view-more-instructor-request"
    )
);
const LazyViewBlockedInstructors = lazy(
  () =>
    import("@/pages/instructors/instructor-management/view-blocked-instructors")
);

const LazyCommunity = lazy(
  () => import("@/pages/sections/community/community-home")
);

const LazyAboutUs = lazy(() => import("@/pages/sections/about/about-us"));

const LazyContactPage = lazy(
  () => import("@/pages/sections/contact/contact-us")
);

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Student />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyStudentHomePage />
          </Suspense>
        ),
      },
      {
        path: "/courses",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyListCourse />
          </Suspense>
        ),
      },
      {
        path: "/courses/:courseId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyViewCourse />
          </Suspense>
        ),
      },
      {
        path: "/courses/:courseId/watch-lessons/:lessonId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyWatchLesson />
          </Suspense>
        ),
      },
      {
        path: "/tutors",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyInstructorsListing />
          </Suspense>
        ),
      },
      {
        path: "/tutors/:tutorId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyViewInstructor />
          </Suspense>
        ),
      },
      {
        path: "/community",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyCommunity />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyAboutUs />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyContactPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyStudentDash />
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <DashHome />,
      },
      {
        path: "my-courses",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyStudentCourses />
          </Suspense>
        ),
      },
      {
        path: "my-profile",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyStudentProfile />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "courses/:courseId/payment",
    element: <StripeContainer />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyStudentLogin
          isOpen={false}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          onSwitchToRegister={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyStudentRegister
          isOpen={false}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          onSwitchToLogin={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Suspense>
    ),
  },
  {
    path: "/instructors/login",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyInstructorLogin
          isOpen={false}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          onSwitchToRegister={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Suspense>
    ),
  },
  {
    path: "/instructors/register",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyInstructorRegister
          isOpen={false}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          onSwitchToLogin={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Suspense>
    ),
  },
  {
    path: "admin",
    element: <Admin />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <LazyAdminHome />
          </Suspense>
        ),
      },
      {
        path: "courses",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyAdminCoursesPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyAdminProfilePage />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazySiteSettingsPage />
          </Suspense>
        ),
      },
      {
        path: "instructors",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <LazyInstructorIndex />
          </Suspense>
        ),
        children: [
          {
            path: "requests",
            element: (
              <Suspense fallback={<div>loading...</div>}>
                <LazyInstructorRequests />
              </Suspense>
            ),
          },
          {
            path: "requests/:id",
            element: (
              <Suspense fallback={<div>loading...</div>}>
                <LazyViewMoreInstructorRequest />
              </Suspense>
            ),
          },
          {
            path: "blocked",
            element: (
              <Suspense fallback={<div>loading...</div>}>
                <LazyViewBlockedInstructors />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "students",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyStudents />
          </Suspense>
        ),
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyCategories />
          </Suspense>
        ),
        children: [
          {
            path: "",
            element: <ListCategories />,
          },
          {
            path: "add-category",
            element: <AddCategory />,
          },
          {
            path: "edit-category/:categoryId",
            element: <EditCategory />,
          },
        ],
      },
      {
        path: "courses",
        element: (
          <Suspense fallback={<div>{"Loading..."}</div>}>
            <LazyAdminCoursesPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<div>{"Loading..."}</div>}>
            <LazyAdminProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "instructors",
    element: <Instructor />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "/instructors",
        element: <InstructorDashboard />,
      },
      {
        path: "add-course",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyAddCourse />
          </Suspense>
        ),
      },
      {
        path: "view-course",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyListCourseInstructors />
          </Suspense>
        ),
      },
      {
        path: "edit-course/:courseId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyEditCourse />
          </Suspense>
        ),
      },
      {
        path: "view-lessons/:courseId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyViewLesson />
          </Suspense>
        ),
      },
      {
        path: "view-lessons/:courseId/edit-lesson/:lessonId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyEditLesson />
          </Suspense>
        ),
      },
      {
        path: "view-students",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyMyStudents />
          </Suspense>
        ),
      },
      {
        path: "view-profile",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyInstructorProfile />
          </Suspense>
        ),
      },
      {
        path: "view-channels",
        element: <InstructorChannels />,
      },
    ],
  },
]);
export default AppRouter;
