import React from "react";

const AboutUs: React.FC = () => {
  return (
    <section className="text-gray-900 transition-colors bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="container px-4 py-10 mx-auto md:py-14">
        <div
          className="
            mx-auto grid max-w-6xl gap-8 md:grid-cols-2
            rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm
            dark:ring-gray-700 dark:bg-[#111827]
          "
        >
          {/* Left: Image */}
          <div className="p-4 md:p-6">
            <div
              className="relative overflow-hidden bg-gray-100  rounded-xl ring-1 ring-gray-200 dark:ring-gray-700 dark:bg-gray-800"
            >
              <img
                src="https://res.cloudinary.com/dwucedjmy/image/upload/v1691134082/photo-1524178232363-1fb2b075b655_enawoh.avif"
                alt="About grayhat"
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent dark:from-black/10" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
                About grayhat
              </h1>
              <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                Learn. Connect. Grow.
              </p>

              <p className="mt-5 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                Welcome to grayhat, your destination for online learning and growth.
                We connect passionate teachers with eager learners around the world.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                Explore a diverse range of free and paid courses. From mastering new
                skills to advancing your career, grayhat fits your schedule with a
                dynamic learning experience.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                Join lively discussions, collaborate on projects, and exchange insights
                in our community. For interactive sessions, our live channels enable
                real-time communication with instructors and peers.
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  Quality Courses
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  Active Community
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  Live Sessions
                </span>
              </div>
            </div>

            {/* Divider + copyright */}
            <div className="mt-8">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
              <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} grayhat. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
